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

            // NEW: Product search endpoint - searches Google and returns first result + image
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

                const searchResult = await searchGoogleForProduct(query);

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
 * Search Google for a product and return the first result URL + image
 */
async function searchGoogleForProduct(query) {
    try {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`;

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });

        if (!response.ok) {
            throw new Error(`Google search failed: ${response.status}`);
        }

        const html = await response.text();

        // Extract first shopping result URL
        // Google Shopping results are in <a> tags with specific patterns
        const urlPatterns = [
            // Shopping result pattern
            /<a[^>]+href="(\/url\?q=([^&"]+)[^"]*)"[^>]*>/gi,
            // Direct link pattern
            /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>/gi
        ];

        let productUrl = null;

        for (const pattern of urlPatterns) {
            const matches = html.matchAll(pattern);
            for (const match of matches) {
                let url = match[2] || match[1];

                // Decode URL-encoded characters
                url = decodeURIComponent(url);

                // Skip Google's internal URLs
                if (url.includes('google.com') || url.startsWith('/')) {
                    continue;
                }

                // Check if it's a shopping site
                const shoppingSites = ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'tatacliq', 'shoppers', 'westside'];
                if (shoppingSites.some(site => url.toLowerCase().includes(site))) {
                    productUrl = url;
                    break;
                }
            }
            if (productUrl) break;
        }

        // If we found a product URL, try to extract its image
        let imageUrl = null;
        if (productUrl) {
            imageUrl = await extractProductImage(productUrl);
        }

        return {
            url: productUrl || `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`,
            imageUrl: imageUrl
        };
    } catch (error) {
        console.error('Google search error:', error);
        return {
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`,
            imageUrl: null
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
