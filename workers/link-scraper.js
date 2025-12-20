/**
 * Cloudflare Worker: Link Scraper for Personal Stylist App
 * Fetches product metadata and images from e-commerce URLs
 */

export default {
    async fetch(request, env, ctx) {
        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle OPTIONS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            const url = new URL(request.url);

            // NEW: Product search endpoint - searches Google Shopping using Serper API
            if (url.pathname === '/search-product') {
                if (request.method !== 'POST') {
                    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
                }

                const { query } = await request.json();

                if (!query) {
                    return new Response(
                        JSON.stringify({ error: 'Query required' }),
                        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );
                }

                const searchResult = await searchGoogleForProduct(query, env);

                return new Response(
                    JSON.stringify(searchResult),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // EXISTING: Image extraction endpoint for wardrobe essentials
            if (url.pathname === '/extract-image') {
                if (request.method !== 'POST') {
                    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
                }

                const { url: targetUrl } = await request.json();

                if (!targetUrl) {
                    return new Response(
                        JSON.stringify({ error: 'URL required' }),
                        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );
                }

                const imageUrl = await extractProductImage(targetUrl);

                return new Response(
                    JSON.stringify({ imageUrl: imageUrl || '' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // EXISTING: Link scraper functionality
            const targetUrl = url.searchParams.get('url');

            if (!targetUrl) {
                return new Response(
                    JSON.stringify({ error: 'Missing url parameter' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // Fetch the target URL
            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch URL: ${response.status}`);
            }

            const html = await response.text();

            // Parse Open Graph and meta tags
            const metadata = parseMetadata(html);

            // Fetch product image if found
            let imageBase64 = null;
            if (metadata.image) {
                try {
                    // Resolve relative URLs
                    const imageUrl = new URL(metadata.image, targetUrl).href;

                    const imageResponse = await fetch(imageUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Referer': targetUrl,
                        },
                    });

                    if (imageResponse.ok) {
                        const imageBuffer = await imageResponse.arrayBuffer();
                        const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
                        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
                        imageBase64 = `data:${contentType};base64,${base64}`;
                    }
                } catch (imgError) {
                    console.error('Image fetch failed:', imgError);
                    // Continue without image
                }
            }

            return new Response(
                JSON.stringify({
                    title: metadata.title,
                    description: metadata.description,
                    image: metadata.image,
                    imageBase64: imageBase64,
                    price: metadata.price,
                    brand: metadata.brand,
                }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );

        } catch (error) {
            return new Response(
                JSON.stringify({ error: error.message }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }
    },
};

/**
 * Search Google Shopping using Serper API and return the first result URL + image
 * Serper API provides clean JSON results without HTML scraping
 */
async function searchGoogleForProduct(query, env) {
    try {
        // Remove duplicate color mentions from query
        // e.g., "Zara white shirt white" -> "Zara white shirt"
        const words = query.toLowerCase().split(' ');
        const uniqueWords = [];
        const seenWords = new Set();

        for (const word of words) {
            if (!seenWords.has(word)) {
                uniqueWords.push(word);
                seenWords.add(word);
            }
        }
        const cleanQuery = uniqueWords.join(' ');

        console.log(`[Worker] Searching Serper for: "${cleanQuery}" (original: "${query}")`);

        // Get API key from environment
        const apiKey = env.SERPER_API_KEY;
        if (!apiKey) {
            console.error('[Worker] SERPER_API_KEY not configured!');
            throw new Error('Serper API key not configured');
        }

        // Call Serper regular Google Search API (not shopping mode)
        // Regular search with shopping query often provides better direct links
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: `${cleanQuery} buy online`, // Add "buy online" to get shopping results
                gl: 'in',          // India location
                hl: 'en',          // English language
                num: 10            // Get top 10 results
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Worker] Serper API error: ${response.status}`, errorText);
            throw new Error(`Serper API failed: ${response.status}`);
        }

        const data = await response.json();

        // Regular search returns 'organic' results instead of 'shopping'
        const results = data.organic || [];
        console.log(`[Worker] Serper returned ${results.length} search results`);

        // DEBUG: Log full first result to understand structure
        if (results.length > 0) {
            console.log('[Worker] First result structure:', JSON.stringify(results[0], null, 2));
        }

        // Extract first result that looks like a product page
        if (results.length > 0) {
            // Filter for shopping/e-commerce URLs
            const shoppingSites = [
                'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'tatacliq', 'shoppers', 'westside',
                'zara.com', 'hm.com', 'uniqlo.com', 'nike.com', 'adidas.co', 'mango.com'
            ];

            let productResult = null;
            for (const result of results) {
                const url = result.link || '';
                const isShoppingSite = shoppingSites.some(site => url.toLowerCase().includes(site));
                const isProductPage = url.includes('/product') || url.includes('/p/') ||
                    url.includes('/item') || url.includes('-p-') ||
                    isShoppingSite; // Any shopping site URL is likely a product

                if (isProductPage && !url.includes('google.com')) {
                    productResult = result;
                    console.log(`[Worker] Found product URL: ${url}`);
                    break;
                }
            }

            if (productResult) {
                return {
                    url: productResult.link,
                    imageUrl: productResult.image || null,
                    title: productResult.title,
                    price: productResult.price || null,
                    source: productResult.source || new URL(productResult.link).hostname
                };
            }
        }

        // No results found
        console.log('[Worker] No shopping results found in Serper response');
        return {
            url: `https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}&tbm=shop`,
            imageUrl: null
        };
    } catch (error) {
        console.error('[Worker] Serper search error:', error);
        return {
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`,
            imageUrl: null,
            error: error.message
        };
    }
}

/**
 * Extract product image URL from a webpage
 */
async function extractProductImage(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)'
            }
        });

        if (!response.ok) {
            return null;
        }

        const html = await response.text();

        // Extract Open Graph image (most reliable for products)
        const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
        if (ogImageMatch) {
            return ogImageMatch[1];
        }

        // Fallback: Try Twitter card image
        const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
        if (twitterImageMatch) {
            return twitterImageMatch[1];
        }

        // Fallback: Try to find first large image
        const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
        if (imgMatch) {
            return imgMatch[1];
        }

        return null;
    } catch (error) {
        console.error('Image extraction error:', error);
        return null;
    }
}

/**
 * Parse HTML for Open Graph and meta tags
 */
function parseMetadata(html) {
    const metadata = {
        title: '',
        description: '',
        image: '',
        price: '',
        brand: '',
    };

    // Extract Open Graph tags
    const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    const ogDescription = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    const ogPrice = html.match(/<meta\s+property=["']og:price:amount["']\s+content=["']([^"']+)["']/i);
    const ogBrand = html.match(/<meta\s+property=["']og:brand["']\s+content=["']([^"']+)["']/i);

    // Fallback to standard meta tags
    const metaTitle = html.match(/<title>([^<]+)<\/title>/i);
    const metaDescription = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

    metadata.title = (ogTitle?.[1] || metaTitle?.[1] || '').trim();
    metadata.description = (ogDescription?.[1] || metaDescription?.[1] || '').trim();
    metadata.image = (ogImage?.[1] || '').trim();
    metadata.price = (ogPrice?.[1] || '').trim();
    metadata.brand = (ogBrand?.[1] || '').trim();

    return metadata;
}
