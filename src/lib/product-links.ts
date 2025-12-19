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
export async function getFirstSearchResultUrl(brand: string, itemName: string, color?: string): Promise<{ url: string; imageUrl?: string }> {
    try {
        // Build search query with brand, product, and color
        const searchQuery = [brand, itemName, color].filter(Boolean).join(' ');

        // Use Cloudflare worker to search Google and extract product data
        const workerResponse = await fetch('https://link-scraper.adwate.workers.dev/search-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: searchQuery })
        });

        if (workerResponse.ok) {
            const { url, imageUrl } = await workerResponse.json();
            // CRITICAL: Return actual product URL or '#', NO Google search fallback
            return {
                url: url || '#',
                imageUrl: imageUrl || undefined
            };
        }

        // Worker failed - return '#' instead of Google search
        console.warn(`Worker failed for: ${searchQuery}`);
        return { url: '#' };
    } catch (error) {
        console.error('Error fetching product data:', error);
        // Error - return '#' instead of Google search
        return { url: '#' };
    }
}
