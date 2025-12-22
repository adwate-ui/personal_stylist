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
/**
 * Generates the best possible product link based on available item data.
 * 
 * Logic:
 * 1. If the product has a direct 'link' (or 'source_url' from scrape), return that.
 * 2. If added via image (no link), return the URL of the first Google Search result.
 *    - Search Query: Brand + Name + Color (deduplicated)
 *    - To get the "first link of google search page", we realistically have to use 
 *      Google's "I'm Feeling Lucky" behavior or a robust search API.
 *    - Since we don't have a reliable "I'm Feeling Lucky" API without redirects, 
 *      we will construct a smart Google Search URL that mimics a direct finding or
 *      use the existing worker if it can resolve to a direct product page.
 */
export async function getProductLink(item: {
    link?: string;
    source_url?: string;
    brand?: string;
    name?: string;
    item_name?: string;
    sub_category?: string;
    color?: string;
    primary_color?: string;
}): Promise<{ url: string; imageUrl?: string; title?: string; price?: string; brand?: string }> {
    // 1. Check for direct link
    if (item.link && item.link.startsWith('http')) return { url: item.link };
    if (item.source_url && item.source_url.startsWith('http')) return { url: item.source_url };

    // 2. Construct Search Query
    const brand = item.brand || '';
    const name = item.name || item.item_name || item.sub_category || '';
    const color = item.color || item.primary_color || '';

    let queryParts = [brand];

    // Add name (avoiding brand duplication)
    if (brand && name.toLowerCase().includes(brand.toLowerCase())) {
        queryParts.push(name);
    } else {
        queryParts.push(name);
    }

    // Add color (if not already in name)
    if (color && !name.toLowerCase().includes(color.toLowerCase())) {
        queryParts.push(color);
    }

    const query = queryParts.filter(Boolean).join(' ').trim();

    // Default fallback if query is empty
    if (!query) return { url: '#' };

    // 3. Get First Result URL via Worker
    // The user wants "the URL of the first link of the google search page".
    // We use our scraper worker to mimic this "I'm Feeling Lucky" behavior
    // and also grab metadata (image) if possible.
    try {
        const workerUrl = 'https://link-scraper.adwate.workers.dev/search-product';
        // Optimization: Add 'site:brand.com' if we can map the brand to a domain to improve worker precision
        // For now, we trust the worker's own heuristics, but we ensure the query is specific.
        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query, limit: 1 })
        });

        if (response.ok) {
            const data = await response.json();
            // Handle various likely response shapes
            const candidate = data.url ? data : (data.results?.[0] || data.items?.[0]);

            if (candidate && candidate.url && candidate.url.startsWith('http')) {
                return {
                    url: candidate.url,
                    imageUrl: candidate.imageUrl || candidate.image, // Normalizing fields
                    title: candidate.title,
                    price: candidate.price,
                    brand: candidate.brand || brand
                };
            }
        }
    } catch (e) {
        console.warn('Failed to fetch first link from worker, falling back to search query', e);
    }

    // 4. Fallback: Brand-Specific Search (Result Page on Brand Site)
    // This is safer than a generic "I'm Feeling Lucky" because it guarantees the user lands on the correct website.
    // E.g. If the item is "Zara White Shirt", redirecting to "zara.com/search?q=White+Shirt" is 
    // better than a random blog post about white shirts.
    const normalizedBrand = Object.keys(BRAND_SEARCH_URLS).find(
        b => b.toLowerCase() === brand.toLowerCase()
    );

    if (normalizedBrand && BRAND_SEARCH_URLS[normalizedBrand]) {
        return {
            url: BRAND_SEARCH_URLS[normalizedBrand](query.replace(brand, '').trim()) // Remove brand from query as we are on the brand site
        };
    }

    // 5. Final Fallback: DuckDuckGo "!ducky"
    // If we don't know the brand site, we try the "exclusive first result" trick.
    // We add "buy online" to hint that we want a shop page.
    return {
        url: `https://duckduckgo.com/?q=!ducky+${encodeURIComponent(query + " buy online")}`
    };
}

// Backward compatibility shim
// This allows existing code calling this with (brand, name, color) args to work
export const getFirstSearchResultUrl = async (brand: string, itemName: string, color?: string) => {
    return await getProductLink({ brand, name: itemName, color });
};
