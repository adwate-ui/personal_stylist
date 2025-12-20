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

            // EXISTING: Extract image from a product URL (for add-item page)
            // This endpoint works with direct product URLs, not search queries
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

                try {
                    // Mimic a real browser to avoid 403 blocks
                    const response = await fetch(targetUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                            'Sec-Ch-Ua-Mobile': '?0',
                            'Sec-Ch-Ua-Platform': '"Windows"',
                            'Sec-Fetch-Dest': 'document',
                            'Sec-Fetch-Mode': 'navigate',
                            'Sec-Fetch-Site': 'none',
                            'Sec-Fetch-User': '?1',
                            'Upgrade-Insecure-Requests': '1'
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch URL: ${response.status}`);
                    }

                    const html = await response.text();
                    const metadata = { imageBase64: null, title: null, price: null, brand: null };

                    // Extract Open Graph image
                    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
                    if (ogImageMatch) {
                        const imageUrl = ogImageMatch[1];
                        try {
                            const imgResponse = await fetch(imageUrl);
                            if (imgResponse.ok) {
                                const blob = await imgResponse.blob();
                                const arrayBuffer = await blob.arrayBuffer();
                                const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
                                metadata.imageBase64 = `data:${blob.type};base64,${base64}`;
                            }
                        } catch (imgError) {
                            console.error('[Worker] Failed to fetch og:image:', imgError);
                        }
                    }

                    // Extract title
                    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
                    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
                    metadata.title = ogTitleMatch ? ogTitleMatch[1] : (titleMatch ? titleMatch[1] : null);

                    // Extract price
                    const priceMatch = html.match(/["']price["']:\s*["']?(\d+(?:\.\d{2})?)/i);
                    if (priceMatch) {
                        metadata.price = priceMatch[1];
                    }

                    // Extract brand from meta tags or domain
                    const brandMatch = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i);
                    if (brandMatch) {
                        metadata.brand = brandMatch[1];
                    } else {
                        const domain = new URL(targetUrl).hostname;
                        metadata.brand = domain.replace(/^www\./, '').split('.')[0];
                    }

                    console.log('[Worker] Metadata extracted:', metadata);

                    return new Response(
                        JSON.stringify(metadata),
                        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );
                } catch (error) {
                    console.error('[Worker] Error extracting metadata:', error);
                    return new Response(
                        JSON.stringify({
                            error: 'Failed to extract metadata',
                            message: error.message,
                            url: targetUrl
                        }),
                        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );
                }
            }

            // Default GET endpoint for legacy link scraping
            const targetUrl = url.searchParams.get('url');
            if (!targetUrl) {
                return new Response(
                    JSON.stringify({ error: 'URL parameter required' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // Scrape the target URL
            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                    'Sec-Ch-Ua-Mobile': '?0',
                    'Sec-Ch-Ua-Platform': '"Windows"',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Upgrade-Insecure-Requests': '1'
                },
            });

            if (!response.ok) {
                return new Response(
                    JSON.stringify({ error: `Failed to fetch URL: ${response.status}` }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            const html = await response.text();

            // Helper to extract meta content flexibly (handles any attribute order)
            const getMetaContent = (property) => {
                // Matches <meta ... property="og:image" ... content="url" ... > OR content first
                const regex = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i');
                const match1 = html.match(regex);
                if (match1) return match1[1];

                // Try reverse order: content="..." property="..."
                const regex2 = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i');
                const match2 = html.match(regex2);
                return match2 ? match2[1] : null;
            };

            const metadata = { imageUrl: null, imageBase64: null, title: null, price: null, brand: null };

            // Extract Open Graph image
            const imageUrl = getMetaContent('og:image');

            if (imageUrl) {
                metadata.imageUrl = imageUrl; // Always include the URL

                // Try to fetch and convert to base64 (may fail due to CORS)
                try {
                    const imgResponse = await fetch(imageUrl);
                    if (imgResponse.ok) {
                        const blob = await imgResponse.blob();
                        const arrayBuffer = await blob.arrayBuffer();
                        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
                        metadata.imageBase64 = `data:${blob.type};base64,${base64}`;
                    }
                } catch (imgError) {
                    console.error('[Worker] Failed to fetch og:image for base64 conversion:', imgError);
                    // imageUrl is still available for client-side fetch
                }
            }

            // Extract metadata
            const ogTitle = getMetaContent('og:title');
            const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
            metadata.title = ogTitle || (titleMatch ? titleMatch[1] : null);

            // Extract price using various patterns
            const priceMatch = html.match(/["']price["']:\s*["']?(\d+(?:\.\d{2})?)/i) ||
                html.match(/price\s*=\s*["'](\d+(?:\.\d{2})?)["']/i);
            if (priceMatch) {
                metadata.price = priceMatch[1];
            }

            const brandName = getMetaContent('og:site_name');
            if (brandName) {
                metadata.brand = brandName;
            } else {
                const domain = new URL(targetUrl).hostname;
                metadata.brand = domain.replace(/^www\./, '').split('.')[0];
            }

            return new Response(
                JSON.stringify(metadata),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );

        } catch (error) {
            console.error('[Worker] Unhandled error:', error);
            return new Response(
                JSON.stringify({
                    error: 'Worker error',
                    message: error.message || 'Unknown error occurred',
                    stack: error.stack
                }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
            // Comprehensive shopping site detection (50+ sites) - EXCLUDING RESELLERS
            const shoppingSites = [
                // India e-commerce
                'amazon.in', 'flipkart.com', 'myntra.com', 'ajio.com', 'nykaa.com', 'tatacliq',
                'shoppers', 'westside.com', 'lifestyle.com', 'centralbrand', 'pantaloons',
                // International e-commerce
                'amazon.com', 'amazon', '6pm.com', 'asos.com', 'zalando',
                // Fashion brands
                'zara.com', 'hm.com', 'h&m', 'uniqlo.com', 'nike.com', 'adidas.co', 'adidas.com',
                'mango.com', 'massimodutti', 'cosstores', 'marksandspencer', 'gap.com', 'gapinc',
                'levi.com', 'levis.', 'tommy', 'ralphlauren', 'calvinklein', 'puma.com',
                'reebok.', 'vans.com', 'converse.', 'newbalance.', 'fila.', 'skechers.',
                // Luxury
                'gucci', 'louisvuitton', 'prada', 'hermes', 'dior', 'versace', 'armani',
                // Activewear
                'lululemon', 'athleta', 'underarmour', 'gymshark', 'fabletics',
                // Premium retailers
                'nordstrom.', 'saks', 'bloomingdales', 'neimanmarcus', 'ssense.', 'farfetch.',
                'net-a-porter', 'mrporter.', 'harrods.', 'selfridges.',
                'nordstrom', 'macys', 'kohls', 'target.com', 'walmart.com', 'jcpenney'
            ];

            // CRITICAL: Exclude reseller and secondary market sites
            const excludePatterns = [
                'ebay.', 'mercari.', 'poshmark.', 'depop.', 'vinted.', 'thredup.',
                'vestiairecollective.', 'grailed.', 'therealreal.', 'rebag.',
                '/blog', '/news', '/review', '/article', '/guide', '/how-to', '/tips',
                'pinterest.', 'facebook.', 'instagram.', 'twitter.', 'reddit.',
                'youtube.', 'tiktok.', 'wiki', 'quora.'
            ];

            // Product page indicators
            const productIndicators = [
                '/product', '/p/', '/item', '-p-', '/pd/', '/products/',
                '/dp/', '/buy/', '/shop/', '/clothing/', '/shoes/', '/accessories/'
            ];

            let productResult = null;
            let bestScore = 0;

            for (const result of results.slice(0, 10)) { // Check top 10 results
                const url = result.link || '';
                const lowerUrl = url.toLowerCase();
                const title = (result.title || '').toLowerCase();

                // Skip excluded domains
                if (excludePatterns.some(pattern => lowerUrl.includes(pattern))) {
                    continue;
                }

                // Skip Google domains
                if (lowerUrl.includes('google.com') || lowerUrl.includes('youtube.com')) {
                    continue;
                }

                // Calculate relevance score
                let score = 0;

                // Brand categorization for scoring
                const brandSites = [
                    'zara.com', 'hm.com', 'uniqlo.com', 'nike.com', 'adidas.', 'mango.com',
                    'tommy', 'ralphlauren', 'calvinklein', 'gucci', 'prada', 'hermes',
                    'dior', 'versace', 'armani', 'levi', 'gap.com', 'vans.com', 'converse.'
                ];
                const premiumRetailers = [
                    'nordstrom.', 'saks', 'bloomingdales', 'neimanmarcus', 'ssense.',
                    'farfetch.', 'net-a-porter', 'mrporter.', 'harrods.', 'selfridges.'
                ];

                // +15 points for official brand websites (highest priority)
                const isBrandSite = brandSites.some(site => lowerUrl.includes(site));
                if (isBrandSite) score += 15;

                // +10 points for premium retailers
                const isPremiumRetailer = premiumRetailers.some(site => lowerUrl.includes(site));
                if (isPremiumRetailer) score += 10;

                // +5 points for other known shopping sites
                const isShoppingSite = shoppingSites.some(site => lowerUrl.includes(site));
                if (isShoppingSite && !isBrandSite && !isPremiumRetailer) score += 5;

                // +5 points for product page indicators in URL
                const hasProductIndicator = productIndicators.some(indicator => lowerUrl.includes(indicator));
                if (hasProductIndicator) score += 5;

                // +3 points for "buy" or "shop" in title
                if (title.includes('buy') || title.includes('shop')) score += 3;

                // -5 points for review/blog keywords in URL or title
                if (lowerUrl.includes('review') || title.includes('review') ||
                    lowerUrl.includes('blog') || title.includes('guide')) {
                    score -= 5;
                }

                // Accept if score >= 10 (shopping site) or score >= 8 (high confidence product page)
                if (score >= 8) {
                    if (score > bestScore) {
                        bestScore = score;
                        productResult = result;
                        console.log(`[Worker] Found product URL (score: ${score}): ${url}`);
                    }
                }
            }

            // Fallback image strategy:
            // Regardless of whether we found a "high score" product URL, we should try to return an image
            // This is critical for the "Add Item" fallback flow
            let fallbackImage = null;
            if (data.images && data.images.length > 0) {
                fallbackImage = data.images[0].imageUrl;
            } else if (data.inlineImages && data.inlineImages.length > 0) {
                fallbackImage = data.inlineImages[0].imageUrl;
            }

            if (productResult) {
                return {
                    url: productResult.link,
                    imageUrl: productResult.image || productResult.thumbnail || fallbackImage || null,
                    title: productResult.title,
                    price: productResult.price || null,
                    source: productResult.source || new URL(productResult.link).hostname
                };
            }
        }

        // No product results found, but maybe we found an image?
        // Return Google Shopping URL as fallback product URL
        console.log('[Worker] No high-confidence product results found');

        let fallbackImage = null;
        if (data && (data.images || data.inlineImages)) {
            if (data.images && data.images.length > 0) fallbackImage = data.images[0].imageUrl;
            else if (data.inlineImages && data.inlineImages.length > 0) fallbackImage = data.inlineImages[0].imageUrl;
        }

        return {
            url: `https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}&tbm=shop`,
            imageUrl: fallbackImage,
            title: `Search Result: ${cleanQuery}`
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
