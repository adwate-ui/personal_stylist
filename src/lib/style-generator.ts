export interface StyleDNA {
    archetype: string;
    colorPalette: string;
    description: string;
}

export function generateStyleDNA(profile: any): StyleDNA {
    // Simple heuristic logic
    const { gender, lifestyle, brands, price_range } = profile;
    let archetype = "Modern Minimalist";
    let colorPalette = "Neutral & Earthy";
    let description = "You prefer clean lines and versatile pieces.";

    if (gender === 'Female') {
        if (lifestyle?.includes('Corporate')) {
            archetype = "Power Professional";
            colorPalette = "Deep Navy, Charcoal, White";
            description = "Commanding yet elegant, prioritizing structure.";
        } else if (lifestyle?.includes('Creative')) {
            archetype = "Eclectic Creative";
            colorPalette = "Vibrant & Contrasting";
            description = "Expressive and unique, mixing patterns and textures.";
        }
    }

    // Refine based on brands
    if (brands?.some((b: string) => ['Gucci', 'Versace'].includes(b))) {
        archetype = "Luxury Statement";
    }

    return { archetype, colorPalette, description };
}
