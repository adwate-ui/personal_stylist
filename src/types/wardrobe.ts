export interface WardrobeItemAnalysis {
    category: string;
    sub_category: string;
    primary_color: string;
    style_tags: string[];
    description: string;
    price_estimate: string;
    style_score: number;
    brand?: string;
    item_name?: string;
    price?: string;
    color?: string;
    tags?: string[];
    style_reasoning?: string;
    image_url?: string;
    styling_tips?: string[];
    error?: string;
    message?: string;
}

export interface WardrobeItem {
    id: string;
    created_at: string;
    user_id: string;
    image_url: string;
    category: string;
    sub_category?: string;
    brand?: string;
    size?: string;
    color?: string;
    material?: string;
    season?: string;
    occasions?: string[];
    style_tags?: string[];
    description?: string;
    ai_analysis?: WardrobeItemAnalysis;
    style_score?: number;
    critique?: string;
    name?: string;
    price?: number;
    link?: string;
}
