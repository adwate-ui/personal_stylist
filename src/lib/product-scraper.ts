// Product scraping utility for getting real product URLs from brand websites
// Uses Google Shopping as the primary source for product links

export interface ProductSearchResult {
    url: string;
    imageUrl?: string;
    title: string;
    price?: string;
}

/**
 * Searches for a product using Google Shopping and returns the first result URL
 * @param searchQuery - Brand and product description (e.g., "Zara White Oxford Shirt Men")
 * @returns Google Shopping search URL (can be upgraded to scrape first result later)
 */
export async function getProductUrl(searchQuery: string): Promise<string> {
    // For now, return Google Shopping search URL
    // This can be upgraded to actual scraping using a backend API
    const encodedQuery = encodeURIComponent(searchQuery);
    return `https://www.google.com/search?tbm=shop&q=${encodedQuery}`;
}

/**
 * Gets product image URL using Cloudflare worker
 * @param productUrl - URL of the product page
 * @param workerUrl - Cloudflare worker endpoint
 * @returns Image URL or placeholder
 */
export async function getProductImage(productUrl: string, workerUrl: string): Promise<string> {
    try {
        const response = await fetch(`${workerUrl}/extract-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: productUrl })
        });

        if (!response.ok) {
            console.error('Worker extraction failed:', response.statusText);
            return '';
        }

        const data = await response.json();
        return data.imageUrl || '';
    } catch (error) {
        console.error('Error fetching product image:', error);
        return '';
    }
}

/**
 * Enriches wardrobe essentials with product URLs and images
 * @param essentials - Wardrobe essentials structure from Style DNA
 * @param workerUrl - Cloudflare worker URL
 * @returns Enriched essentials with URLs and images
 */
export async function enrichWardrobeEssentials(
    essentials: any,
    workerUrl?: string
): Promise<any> {
    const enriched: any = {};

    for (const [category, productTypes] of Object.entries(essentials)) {
        enriched[category] = {};

        for (const [type, items] of Object.entries(productTypes as Record<string, any[]>)) {
            enriched[category][type] = await Promise.all(
                items.map(async (item: any) => {
                    const productUrl = await getProductUrl(item.search_query || `${item.brand} ${item.item}`);
                    let imageUrl = '';

                    // Only fetch image if worker URL is provided
                    if (workerUrl && productUrl) {
                        imageUrl = await getProductImage(productUrl, workerUrl);
                    }

                    return {
                        ...item,
                        product_url: productUrl,
                        image_url: imageUrl || undefined
                    };
                })
            );
        }
    }

    return enriched;
}
