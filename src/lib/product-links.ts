// Brand website search URL generators
const BRAND_SEARCH_URLS: { [key: string]: (query: string) => string } = {
    'Zara': (q) => `https://www.zara.com/in/en/search?searchTerm=${encodeURIComponent(q)}`,
    'H&M': (q) => `https://www2.hm.com/en_in/search-results.html?q=${encodeURIComponent(q)}`,
    'Uniqlo': (q) => `https://www.uniqlo.com/in/en/search?q=${encodeURIComponent(q)}`,
    'Nike': (q) => `https://www.nike.com/in/w?q=${encodeURIComponent(q)}`,
    'Adidas': (q) => `https://www.adidas.co.in/search?q=${encodeURIComponent(q)}`,
    'Mango': (q) => `https://shop.mango.com/in/search?q=${encodeURIComponent(q)}`,
    'Massimo Dutti': (q) => `https://www.massimodutti.com/in/search?searchTerm=${encodeURIComponent(q)}`,
    'COS': (q) => `https://www.cosstores.com/en_inr/search.html?q=${encodeURIComponent(q)}`,
    'Marks & Spencer': (q) => `https://www.marksandspencer.in/search?q=${encodeURIComponent(q)}`,
    'Gap': (q) => `https://www.gap.in/search?query=${encodeURIComponent(q)}`,
    "Levi's": (q) => `https://www.levi.in/search?q=${encodeURIComponent(q)}`,
    'Tommy Hilfiger': (q) => `https://in.tommy.com/search?q=${encodeURIComponent(q)}`,
    'Ralph Lauren': (q) => `https://www.ralphlauren.co.in/search?q=${encodeURIComponent(q)}`,
    'Calvin Klein': (q) => `https://www.calvinklein.co.in/search?q=${encodeURIComponent(q)}`,
};

export function getBrandSearchUrl(brand: string, itemName: string): string {
    // Normalize brand name
    const normalizedBrand = Object.keys(BRAND_SEARCH_URLS).find(
        b => b.toLowerCase() === brand.toLowerCase()
    );

    if (normalizedBrand && BRAND_SEARCH_URLS[normalizedBrand]) {
        return BRAND_SEARCH_URLS[normalizedBrand](itemName);
    }

    // Fallback to Google Shopping search
    const query = `${brand} ${itemName}`.trim();
    return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;
}

export function getProductImagePlaceholder(itemName: string): string {
    // Use a generic clothing icon based on item type
    const item = itemName.toLowerCase();

    if (item.includes('shirt') || item.includes('top') || item.includes('blouse')) return '👔';
    if (item.includes('pant') || item.includes('jean') || item.includes('trouser')) return '👖';
    if (item.includes('dress') || item.includes('gown')) return '👗';
    if (item.includes('shoe') || item.includes('sneaker') || item.includes('boot')) return '👟';
    if (item.includes('jacket') || item.includes('coat') || item.includes('blazer')) return '🧥';
    if (item.includes('bag') || item.includes('purse') || item.includes('clutch')) return '👜';
    if (item.includes('watch') || item.includes('accessory')) return '⌚';
    if (item.includes('hat') || item.includes('cap')) return '🧢';
    if (item.includes('scarf')) return '🧣';
    if (item.includes('glasses') || item.includes('sunglasses')) return '🕶️';

    return '👕'; // Default
}

/**
 * Get the first search result URL and image for a product using Cloudflare Worker
 * Uses link-scraper.adwate.workers.dev to search and extract product data
 * Returns '#' if worker fails to ensure no Google search fallback
 */
export async function getFirstSearchResultUrl(brand: string, itemName: string, color?: string): Promise<{ url: string; imageUrl?: string; title?: string; price?: string; brand?: string }> {
    try {
        const searchQuery = [brand, itemName, color, 'official site'].filter(Boolean).join(' ');

        // Use link-scraper for URL discovery (User Request)
        const workerUrl = 'https://link-scraper.adwate.workers.dev';

        try {
            // Request multiple results to allow for fallback if images are missing
            const workerResponse = await fetch(`${workerUrl}/search-product`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery, limit: 5 })
            });

            if (workerResponse.ok) {
                const data = await workerResponse.json();

                // Normalize results: Handle if worker returns array in 'results', 'items', or just a single object
                let candidates: any[] = [];
                if (data.results && Array.isArray(data.results)) candidates = data.results;
                else if (data.items && Array.isArray(data.items)) candidates = data.items;
                else if (data.url) candidates = [data]; // Fallback to single result if API doesn't support list

                console.log(`[Product Search] Found ${candidates.length} candidates for "${searchQuery}"`);

                // AuthentiQC Worker for image validation
                const authWorkerUrl = 'https://authentiqc-worker.adwate.workers.dev/fetch-metadata';

                // Iterate through candidates to find one with a valid connected image
                for (const candidate of candidates) {
                    if (!candidate.url || !candidate.url.startsWith('http')) continue;

                    // Skip Google Search results to avoid loops/captchas
                    if (candidate.url.includes('google.com/search')) continue;

                    try {
                        console.log(`[Product Search] Checking image for: ${candidate.url}`);
                        const authResponse = await fetch(`${authWorkerUrl}?url=${encodeURIComponent(candidate.url)}`);

                        if (authResponse.ok) {
                            const authData = await authResponse.json();
                            const authImage = authData.image || (authData.images && authData.images.length > 0 ? authData.images[0] : null);

                            if (authImage) {
                                console.log(`[Product Search] ✅ Valid image found: ${authImage}`);
                                return {
                                    url: candidate.url,
                                    imageUrl: authImage,
                                    title: candidate.title || authData.title || itemName,
                                    price: candidate.price || authData.price,
                                    brand: candidate.brand || brand
                                };
                            }
                        }
                    } catch (e) {
                        console.warn(`[Product Search] Failed to check image for ${candidate.url}`, e);
                    }
                    // If no image, loop continues to next candidate
                }

                // If loop finishes with no images, fall back to the first valid URL (if any) without image
                if (candidates.length > 0 && candidates[0].url) {
                    console.log(`[Product Search] ⚠️ No images found, returning first result.`);
                    return {
                        url: candidates[0].url,
                        imageUrl: candidates[0].imageUrl, // Might be null
                        title: candidates[0].title,
                        price: candidates[0].price,
                        brand: candidates[0].brand
                    };
                }
            }
        } catch (workerError) {
            console.warn('Worker search failed, using fallback', workerError);
        }

        // Final Fallback: Google Search Page
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=shop`;

        return {
            url: googleSearchUrl,
            imageUrl: undefined
        };
    } catch (error) {
        console.error('Error fetching product data:', error);
        return { url: '#' };
    }
}
