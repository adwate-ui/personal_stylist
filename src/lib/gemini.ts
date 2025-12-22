import { GoogleGenerativeAI } from '@google/generative-ai';


const apiKey = process.env.GEMINI_API_KEY;

// Lazy initialization or safe check
let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
} else {
    console.error("GEMINI_API_KEY is not set in environment variables!");
}

const generationConfig = {
    temperature: 0.4,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
};

async function retryWithExponentialBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    timeoutMs: number = 30000
): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const timeoutPromise = new Promise<T>((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out")), timeoutMs)
            );
            return await Promise.race([fn(), timeoutPromise]);
        } catch (error: any) {
            const isLastAttempt = attempt === maxRetries;
            const msg = typeof error?.message === 'string' ? error.message.toLowerCase() : '';
            const isRetryable =
                msg === "request timed out" ||
                msg.includes("429") ||
                msg.includes("503") ||
                msg.includes("network") ||
                msg.includes("fetch failed");

            if (isLastAttempt || !isRetryable) throw error;

            const delay = baseDelay * Math.pow(2, attempt);
            const jitter = delay * (0.5 + Math.random() * 0.5);
            console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(jitter)}ms due to: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, jitter));
        }
    }
    throw new Error("Max retries exceeded");
}

async function generateWithFallback(promptParts: any[]): Promise<{ result: any; modelName: string }> {
    const preferredModel = process.env.GEMINI_MODEL;
    // Latest models as of December 2025
    const defaultModels = [
        "gemini-3-pro-preview",     // Premium primary - most capable
        "gemini-2.5-pro",           // Premium secondary - advanced reasoning
        "gemini-3-flash-preview",   // Free primary - fast and intelligent
        "gemini-2.5-flash"          // Free secondary - price-performance
    ];

    // Create a unique list of models, prioritizing the env var if set
    const models = preferredModel ? [preferredModel, ...defaultModels] : defaultModels;
    // Deduplicate
    const uniqueModels = [...new Set(models)];

    for (const modelName of uniqueModels) {
        try {
            console.log(`Using model: ${modelName}`);
            if (!genAI) throw new Error("Gemini Client not initialized (Missing API Key)");
            const model = genAI.getGenerativeModel({ model: modelName, generationConfig });

            // Wrap generation with retry logic
            const response = await retryWithExponentialBackoff(async () => {
                const result = await model.generateContent(promptParts);
                return await result.response;
            });

            const result = JSON.parse(response.text());
            return { result, modelName };
        } catch (error: any) {
            console.warn(`Model ${modelName} failed:`, error.message);
            // If it's the last model, throw the error to the caller
            if (modelName === uniqueModels[uniqueModels.length - 1]) throw error;
            // Otherwise, continue to the next model
            continue;
        }
    }
    throw new Error("All models failed");
}

// Helper to convert ArrayBuffer to Base64 (Universal)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export async function analyzeProductLink(url: string, imageBuffer?: ArrayBuffer, metadata?: any, styleProfile?: any) {
    if (!genAI) return { error: "Gemini API Key missing" };

    const profileContext = styleProfile
        ? `\nUser Style DNA: ${JSON.stringify(styleProfile)}\nAssess how well this item fits the user's Style DNA.`
        : "";

    const userNameInstruction = styleProfile?.name
        ? `Address the user as "${styleProfile.name}" instead of "user" or "they" in your output.`
        : "Avoid addressing the user as 'user'. Be direct.";

    const prompt = `
    You are the world's greatest fashion stylist and expert. Detailed Analysis Required.
    ${userNameInstruction}
    
    Item Context:
    URL: ${url}
    Title: ${metadata?.title || 'Unknown'}
    Description: ${metadata?.description || 'Unknown'}
    
    Analyze the accompanying image (if provided) and the context to extract details with EXTREME precision.
    ${profileContext}
    
    1. Category & Sub-category (Be specific: "Cashmere Turtleneck" not just "Sweater")
    2. Color (Precise fashion terminology: "Chartreuse", "Burgundy", "Navy", "Ecru")
    3. Brand (Identify from metadata or visual logo if possible)
    4. Price (Estimate range in "Rs. X - Y" format. Do NOT use abstract symbols like $$$)
    5. Description: A sophisticated, editorial-style 1-sentence summary.
    6. Style Tags: [Old Money, Y2K, Minimalist, Avant-Garde, etc.]
    7. SKU / Search Query for this item.
    
    If Style DNA is provided, provide a "style_score" (0-100) and "reasoning".
    If Style DNA is NOT provided, set "style_score" to null.
    
    Return JSON: { 
        "category": "", 
        "sub_category": "", 
        "color": "", 
        "brand": "", 
        "sku_query": "",
        "price_estimate": "", 
        "description": "", 
        "image_url": "${metadata?.image || ''}",
        "style_score": 0,
        "style_reasoning": ""
    }
    `;

    const parts: any[] = [prompt];
    if (imageBuffer) {
        parts.push({
            inlineData: {
                data: arrayBufferToBase64(imageBuffer),
                mimeType: "image/jpeg",
            },
        });
    }

    try {
        const { result, modelName } = await generateWithFallback(parts);
        return { ...result, generated_by_model: modelName };
    } catch (error) {
        console.error("Gemini Link Analysis Error:", error);
        return { error: `Gemini Error: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function identifyWardrobeItem(imageBuffer: ArrayBuffer, styleProfile?: any) {
    if (!genAI) return { error: "Gemini API Key missing" };

    const profileContext = styleProfile
        ? `\nUser Style DNA: ${JSON.stringify(styleProfile)}\nAssess how well this item fits the user's Style DNA.`
        : "";

    const userNameInstruction = styleProfile?.name
        ? `Address the user as "${styleProfile.name}" instead of "user" or "they" in your output.`
        : "Avoid addressing the user as 'user'. Be direct.";

    const prompt = `
    You are the world's most renowned fashion curator. Perform a detailed stylistic analysis of this item.
    ${userNameInstruction}
    ${profileContext}
    
    Identify with HIGH PRECISION:
    - Detailed Category & Specific Silhouette (e.g. "Double-Breasted Blazer" vs "Jacket")
    - Precise Color (e.g. "Crimson", "Slate", "Taupe")
    - Material / Fabric appearance (e.g. "Ribbed Knit", "Silk Satin")
    - Brand Aesthetic (e.g. "Minimalist Scandinavian", "Italian Luxury", "Streetwear")
    - Specific Occasions (e.g. "Boardroom", "Gallery Opening", "Weekend Brunch")
    - Brand Name (Prediction if logo visible or style is iconic)
    - SKU Search Query (Keywords to find this item online)
    - Estimated Price Range (e.g. "Rs. 1,500-5,000". Do NOT use $$$)
    
    If Style DNA is provided, provide a "style_score" (0-100) and "reasoning".
    If Style DNA is NOT provided, set "style_score" to null.

    Return JSON: { 
        "item_name": "Concise Name", 
        "category": "", 
        "sub_category": "", 
        "brand": "", 
        "sku_query": "",
        "color": "", 
        "occasion": "", 
        "tags": [], 
        "price_estimate": "Rs. 0",
        "description": "Editorial summary",
        "style_score": 0,
        "style_reasoning": ""
    }
    `;

    const imagePart = {
        inlineData: {
            data: arrayBufferToBase64(imageBuffer),
            mimeType: "image/jpeg",
        },
    };

    try {
        const { result, modelName } = await generateWithFallback([prompt, imagePart]);
        return { ...result, generated_by_model: modelName };
    } catch (error) {
        console.error("Gemini Identification Error:", error);
        return null;
    }
}

export async function ratePurchase(
    imageBuffer: ArrayBuffer,
    wardrobeContext: any[] = [],
    styleDNA?: any
) {
    if (!genAI) return { rating: 0, verdict: "Error", reasoning: "Gemini not initialized" };

    const styleDNAContext = styleDNA
        ? `\n\nUser's Style DNA:\n${JSON.stringify(styleDNA, null, 2)}\nEvaluate how this item aligns with their established aesthetic.`
        : "";

    const contextString = wardrobeContext.length > 0
        ? `User's current wardrobe includes: ${wardrobeContext.map(i =>
            `${i.category || 'Item'} (${i.brand || 'Unknown brand'}, ${i.primary_color || 'color N/A'})`
        ).join(', ')}.`
        : "User is building their wardrobe from scratch.";

    const prompt = `
    You are the world's best personal stylist, working for your most important client. Your expertise is unmatched and your recommendations must be exceptional.
    
    ${contextString}
    ${styleDNAContext}

    Your client is considering buying the item in this image. 
    Provide a brutally honest but constructive rating (1-10) based on your expert analysis.

    CRITICAL EVALUATION FACTORS:
    1. **Style DNA Alignment**: How well does this match their established aesthetic and color palette?
    2. **Wardrobe Integration**: Does this fill a gap or complement existing pieces?
    3. **Versatility**: Can this be styled multiple ways with their current wardrobe?
    4. **Quality & Timelessness**: Will this be a lasting investment?
    5. **Color Harmony**: Does it align with their neutrals/accents or is it in the "avoid" list?

    Return ONLY valid JSON: { 
        "rating": 0-10, 
        "verdict": "Buy/Pass/Consider", 
        "reasoning": "Expert analysis addressing Style DNA alignment, wardrobe gaps, and integration potential...",
        "alternatives": "Suggest better options if rating < 7 (include why they're better)"
    }
    `;

    const imagePart = {
        inlineData: {
            data: arrayBufferToBase64(imageBuffer),
            mimeType: "image/jpeg",
        },
    };

    try {
        const { result, modelName } = await generateWithFallback([prompt, imagePart]);
        return { ...result, generated_by_model: modelName };
    } catch (error) {
        console.error("Gemini Rating Error:", error);
        return { rating: 0, verdict: "Error", reasoning: "Could not generate rating." };
    }
}

export async function generateStyleDNA(profile: any) {
    if (!genAI) return { error: "Gemini API Key missing" };

    const prompt = `
    You are an elite personal stylist. Create a comprehensive "Style DNA" profile for this user based on their data.
    
    User Profile:
    - Name: ${profile.name}
    - Details: ${profile.gender}, ${profile.height}m, ${profile.weight}kg, ${profile.age || 'N/A'}
    - Body Shape: ${profile.bodyShape}
    - Coloring: Skin: ${profile.skinTone}, Hair: ${profile.hairColor}, Eyes: ${profile.eyeColor}
    - Lifestyle: ${JSON.stringify(profile.lifestyle)}
    - Archetypes: ${profile.archetypes.join(', ')}
    - Admired Brands: ${profile.brands.join(', ')}
    - Budget: ${profile.priceRange}
    - Location: ${profile.location}

    Generate a highly personalized JSON report:
    {
        "archetype_name": "Creative Title (e.g. 'The Urban Sophisticate')",
        "power_words": ["Adjective", "Adjective", "Adjective"],
        "summary": "2-3 sentences describing their core aesthetic.",
        "color_palette": {
            "neutrals": ["#hexcode"],
            "accents": ["#hexcode"],
            "seasonal_variations": {
                "spring_summer": ["#hexcode", "#hexcode"],
                "fall_winter": ["#hexcode", "#hexcode"]
            },
            "avoid": [
                { "color": "Color Name", "reason": "Brief why to avoid based on skin tone" }
            ],
            "color_theory": {
                "skin_undertone": "warm/cool/neutral",
                "best_metal": "gold/silver/rose gold",
                "complementary_colors": ["#hexcode"],
                "analogous_colors": ["#hexcode", "#hexcode"]
            }
        },
        "must_have_staples": {
            "tops": {
                "shirts": [{ "item": "White Oxford Shirt", "brand": "Specific brand from user preferences", "why": "Versatility reason", "search_query": "Brand Name White Oxford Shirt Men/Women" }],
                "t_shirts": [{ "item": "Plain White Tee", "brand": "...", "why": "...", "search_query": "..." }],
                "polos": [{ "item": "Navy Polo", "brand": "...", "why": "...", "search_query":  "..." }]
            },
            "bottoms": {
                "jeans": [{ "item": "Dark Wash Jeans", "brand": "...", "why": "...", "search_query": "..." }],
                "chinos": [{ "item": "Beige Chinos", "brand": "...", "why": "...", "search_query": "..." }],
                "trousers": [{ "item": "Black Dress Pants", "brand": "...", "why": "...", "search_query": "..." }]
            },
            "outerwear": {
                "jackets": [{ "item": "Denim Jacket", "brand": "...", "why": "...", "search_query": "..." }],
                "blazers": [{ "item": "Navy Blazer", "brand": "...", "why": "...", "search_query": "..." }]
            },
            "shoes": {
                "sneakers": [{ "item": "White Sneakers", "brand": "...", "why": "...", "search_query": "..." }],
                "dress_shoes": [{ "item": "Black Oxford Shoes", "brand": "...", "why": "...", "search_query": "..." }]
            },
            "accessories": {
                "bags": [{ "item": "Leather Tote", "brand": "...", "why": "...", "search_query": "..." }],
                "watches": [{ "item": "Minimal Watch", "brand": "...", "why": "...", "search_query": "..." }]
            }
        },
        "celebrity_style_twins": [
            { "name": "Celebrity/Icon", "why": "Style match reason" }
        ],
        "runway_inspiration": {
            "designers": ["Designer names"],
            "trends":  "Runway trends",
            "adapt": "How to wear"
        },
        "seasonal_tips": "Tips for each season",
        "occasion_outfits": {
            "work": "Office formula",
            "casual": "Weekend look",
            "evening": "Date outfit",
            "formal": "Event attire"
        },
        "recommended_brands": [
            { "name": "Brand in ${profile.location}", "tier": "${profile.priceRange}", "why": "Reason", "region": "${profile.location}", "gender": "${profile.gender}" }
        ],
        "shopping_strategy": {
            "invest": ["Priority pieces"],
            "save": ["Affordable items"],
            "timing": "When to shop"
        },
        "budget_allocation": "How to split ${profile.priceRange} budget",
        ],
        "styling_tips": [
            "Tip specific to body shape",
            "Tip specific to lifestyle"
        ]
    }
    
    IMPORTANT: Filter brands by location ${profile.location}, gender ${profile.gender}, budget ${profile.priceRange}. Use brands: ${profile.brands.join(', ')}.
    `;

    try {
        const { result, modelName } = await generateWithFallback([prompt]);
        return { ...result, generated_by_model: modelName };
    } catch (error) {
        console.error("Gemini Style DNA Error:", error);
        return { error: "Failed to generate Style DNA" };
    }
}
