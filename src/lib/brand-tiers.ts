// Brand tier classification and similar brand recommendations
// This helps find similar products from comparable manufacturers

type BrandTier = 'luxury' | 'contemporary' | 'high-street' | 'budget' | 'unknown';

const BRAND_TIERS: Record<BrandTier, string[]> = {
    luxury: ['Gucci', 'Prada', 'Louis Vuitton', 'Hermès', 'Chanel', 'Dior', 'Versace', 'Balenciaga', 'Saint Laurent', 'Givenchy'],
    contemporary: ['Massimo Dutti', 'COS', 'Sandro', 'Maje', 'Reiss', '& Other Stories', 'Everlane', 'Theory', 'Vince'],
    'high-street': ['Zara', 'H&M', 'Mango', 'Uniqlo', 'Gap', 'Marks & Spencer', 'Banana Republic', 'J.Crew'],
    budget: ['Primark', 'Forever 21', 'Old Navy', 'Target', 'Walmart', 'Shein', 'Boohoo'],
    unknown: []
};

export function getBrandTier(brand: string): BrandTier {
    if (!brand) return 'unknown';

    const normalizedBrand = brand.toLowerCase().trim();

    for (const [tier, brands] of Object.entries(BRAND_TIERS)) {
        if (brands.some(b => b.toLowerCase() === normalizedBrand || normalizedBrand.includes(b.toLowerCase()))) {
            return tier as BrandTier;
        }
    }

    return 'unknown';
}

export function getSimilarBrands(brand: string, tier?: BrandTier): string[] {
    const actualTier = tier || getBrandTier(brand);

    if (actualTier === 'unknown') {
        // Return a mix of popular brands
        return ['Zara', 'H&M', 'Uniqlo', 'Mango'];
    }

    // Return brands from the same tier, excluding the current brand
    return BRAND_TIERS[actualTier]
        .filter(b => b.toLowerCase() !== brand.toLowerCase())
        .slice(0, 5); // Limit to 5 similar brands
}
