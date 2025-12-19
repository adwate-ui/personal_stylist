// Brand tier classification and similar brand recommendations
// This helps find similar products from comparable manufacturers

type BrandTier = 'luxury' | 'contemporary' | 'high-street' | 'budget' | 'unknown';
type PriceRange = 'budget' | 'mid' | 'luxury' | 'high_luxury';

const BRAND_TIERS: Record<BrandTier, string[]> = {
    luxury: [
        'Gucci', 'Prada', 'Louis Vuitton', 'Hermès', 'Chanel', 'Dior', 'Versace',
        'Balenciaga', 'Saint Laurent', 'Givenchy', 'Burberry', 'Fendi', 'Valentino',
        'Tom Ford', 'Bottega Veneta', 'Celine', 'Loewe', 'Alexander McQueen',
        'Manish Malhotra', 'Sabyasachi', 'Tarun Tahiliani'
    ],
    contemporary: [
        'Massimo Dutti', 'COS', 'Sandro', 'Maje', 'Reiss', '& Other Stories',
        'Everlane', 'Theory', 'Vince', 'Ted Baker', 'AllSaints', 'Whistles',
        'A.P.C.', 'Acne Studios', 'Equipment', 'Rag & Bone',
        'FabIndia', 'Nicobar', 'Good Earth', 'Anita Dongre'
    ],
    'high-street': [
        'Zara', 'H&M', 'Mango', 'Uniqlo', 'Gap', 'Marks & Spencer',
        'Banana Republic', 'J.Crew', 'Topshop', 'Urban Outfitters',
        'Westside', 'AND', 'Only', 'Vero Moda', 'Max Fashion'
    ],
    budget: [
        'Primark', 'Forever 21', 'Old Navy', 'Target', 'Walmart', 'Shein',
        'Boohoo', 'ASOS', 'Bershka', 'Pull&Bear',
        'Reliance Trends', 'Pantaloons', 'Lifestyle'
    ],
    unknown: []
};

// Map price ranges to brand tiers
const PRICE_RANGE_TO_TIERS: Record<PriceRange, BrandTier[]> = {
    'budget': ['high-street', 'budget'],
    'mid': ['contemporary'],
    'luxury': ['luxury'],
    'high_luxury': ['luxury'] // High-end luxury subset
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

/**
 * Get brands that match a given price range
 */
export function getBrandsByPriceRange(priceRange: string): string[] {
    const tiers = PRICE_RANGE_TO_TIERS[priceRange as PriceRange];

    if (!tiers || tiers.length === 0) {
        // Default to contemporary if unknown
        return BRAND_TIERS.contemporary;
    }

    // Combine all brands from matching tiers
    const brands: string[] = [];
    for (const tier of tiers) {
        brands.push(...BRAND_TIERS[tier]);
    }

    return brands;
}

/**
 * Check if a brand matches a price range
 */
export function isBrandInPriceRange(brand: string, priceRange: string): boolean {
    const tier = getBrandTier(brand);
    const allowedTiers = PRICE_RANGE_TO_TIERS[priceRange as PriceRange] || [];
    return allowedTiers.includes(tier);
}
