import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

/**
 * API route to get the first search result URL for a product
 * Searches Google and returns the URL of the first organic result
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const brand = searchParams.get('brand') || '';
    const product = searchParams.get('product') || '';
    const color = searchParams.get('color') || '';

    if (!product) {
        return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    try {
        // Build search query
        const parts = [brand, product, color].filter(Boolean);
        const query = parts.join(' ');

        // Use Google search to find the product
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch search results');
        }

        const html = await response.text();

        // Extract first organic result URL using regex
        const urlPattern = /<a href="\/url\?q=([^"&]+)&amp;/g;
        const match = urlPattern.exec(html);

        if (match && match[1]) {
            const decodedUrl = decodeURIComponent(match[1]);

            // Filter out non-product sites
            const excludePatterns = [
                'google.com', 'youtube.com', 'wikipedia.org',
                'facebook.com', 'instagram.com', 'twitter.com', 'pinterest.com'
            ];

            const isExcluded = excludePatterns.some(pattern => decodedUrl.includes(pattern));

            if (!isExcluded) {
                return NextResponse.json({ url: decodedUrl, query });
            }
        }

        // Fallback to Google Shopping
        const fallbackUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;
        return NextResponse.json({ url: fallbackUrl, query, fallback: true });

    } catch (error) {
        console.error('Error fetching product URL:', error);
        const parts = [brand, product, color].filter(Boolean);
        const query = parts.join(' ');
        const fallbackUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;
        return NextResponse.json({ url: fallbackUrl, query, error: true });
    }
}
