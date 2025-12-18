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
