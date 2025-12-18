// Currency mapping based on location
const CURRENCY_MAP: { [key: string]: { symbol: string; code: string } } = {
    'India': { symbol: '₹', code: 'INR' },
    'United States': { symbol: '$', code: 'USD' },
    'United Kingdom': { symbol: '£', code: 'GBP' },
    'Europe': { symbol: '€', code: 'EUR' },
    'UAE': { symbol: 'AED', code: 'AED' },
    'Singapore': { symbol: 'S$', code: 'SGD' },
    'Australia': { symbol: 'A$', code: 'AUD' },
    'Canada': { symbol: 'C$', code: 'CAD' },
    'Japan': { symbol: '¥', code: 'JPY' },
    'China': { symbol: '¥', code: 'CNY' },
};

export function getCurrencyByLocation(location?: string): { symbol: string; code: string } {
    if (!location) return { symbol: '$', code: 'USD' }; // Default

    // Check for exact match
    if (CURRENCY_MAP[location]) {
        return CURRENCY_MAP[location];
    }

    // Check for partial match (e.g., "New Delhi, India" -> India)
    for (const [country, currency] of Object.entries(CURRENCY_MAP)) {
        if (location.includes(country)) {
            return currency;
        }
    }

    // Default to USD
    return { symbol: '$', code: 'USD' };
}

export function formatPrice(price: number | string, location?: string): string {
    const currency = getCurrencyByLocation(location);

    if (typeof price === 'string') {
        // If it's already formatted (e.g., "$$"), return as is
        if (price.includes('$') || price.includes('₹')) {
            return price.replace(/\$/g, currency.symbol);
        }
        // Try to parse as number
        const parsed = parseFloat(price.replace(/[^0-9.]/g, ''));
        if (isNaN(parsed)) return price;
        price = parsed;
    }

    return `${currency.symbol}${price.toLocaleString()}`;
}
