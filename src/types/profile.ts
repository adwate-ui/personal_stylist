export interface ProfileData {
    name: string;
    gender: string;
    age: string;
    location: string;
    height: string;
    weight: string;
    bodyShape: string;
    fitPreference: string;
    skinTone: string;
    eyeColor: string;
    hairColor: string;
    lifestyle: {
        work: boolean;
        casual: boolean;
        event: boolean;
        active: boolean;
    };
    archetypes: string[];
    brands: string[];
    priceRange: string;
    styleDNA?: any;
    styleReport?: any;
    avatar_url?: string;
    avatar?: string; // Legacy field for backward compatibility
}

export interface DatabaseProfile {
    id: string;
    full_name: string;
    gender: string;
    age: number | null;
    location: string;
    height_cm: number | null;
    weight_kg: number | null;
    body_shape: string;
    fit_preference: string;
    skin_tone: string;
    eye_color: string;
    hair_color: string;
    lifestyle: any;
    archetypes: string[];
    brands: string[];
    price_range: string;
    style_dna: any;
    style_report: any;
    created_at: string;
    avatar_url: string | null;
}
