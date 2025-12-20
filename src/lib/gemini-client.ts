import { GoogleGenerativeAI } from "@google/generative-ai";
import { WardrobeItemAnalysis } from "@/types/wardrobe";
import { ShopAnalysis } from "@/types/shop";

// Model priority: Premium models first, free tier as fallback
const MODELS = {
    premium_primary: "gemini-3-pro-preview", // Best, requires quota
    premium_secondary: "gemini-2.5-flash", // Good balance, paid
    free_primary: "gemini-1.5-pro-latest", // Free tier - most capable
    free_secondary: "gemini-1.5-flash-latest" // Free tier - fastest
};

async function createModelWithFallback(genAI: GoogleGenerativeAI) {
    const modelsToTry = [
        MODELS.premium_primary,
        MODELS.premium_secondary,
        MODELS.free_primary,
        MODELS.free_secondary
    ];

    for (let i = 0; i < modelsToTry.length; i++) {
        const modelName = modelsToTry[i];
        const isLastModel = i === modelsToTry.length - 1;

        try {
            return genAI.getGenerativeModel({ model: modelName });
        } catch (e: any) {
            // Check if it's a quota error (429)
            const isQuotaError = e?.message?.includes("429") || e?.message?.includes("quota");

            if (isQuotaError) {
                console.warn(`Model ${modelName} quota exceeded, trying next model...`);
                if (!isLastModel) continue;
            }

            // For other errors, try next model
            console.warn(`Model ${modelName} unavailable: ${e?.message}`);
            if (!isLastModel) continue;

            // If it's the last model, throw the error
            throw e;
        }
    }

    // Fallback (should never reach here, but TypeScript needs it)
    return genAI.getGenerativeModel({ model: MODELS.free_secondary });
}

export async function analyzeImageWithGemini(
    file: File,
    apiKey: string,
    userLocation?: string,
    wardrobeItems?: Array<{ name: string; category: string; color?: string }>
): Promise<WardrobeItemAnalysis> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const base64Data = await fileToBase64(file);

    // Import currency utility inline to avoid circular deps
    const currencySymbol = userLocation && userLocation.toLowerCase().includes('india') ? '₹' : '$';

    // Build wardrobe context for complementary items
    const wardrobeContext = wardrobeItems && wardrobeItems.length > 0
        ? `\n\nUser's Current Wardrobe:\n${wardrobeItems.map((item, i) => `${i + 1}. ${item.name || item.category} (${item.color || 'color N/A'})`).join('\n')}\n\nFor complementary_items, ONLY suggest items from the above wardrobe list by their exact names.`
        : '\n\nUser has no wardrobe items yet. For complementary_items, suggest 5 general item types (e.g., "White sneakers", "Navy chinos") that would pair well.';

    const prompt = `Analyze this clothing item for a personal stylist app. Return ONLY a valid JSON object (no markdown, no backticks) with these fields:
    - category: string (Top, Bottom, Outerwear, Shoes, Accessory, Dress, Bag, Other)
    - sub_category: string (e.g., T-Shirt, Jeans, Blazer, Sneakers)
    - primary_color: string (precise color name AND hex code, e.g., "Navy Blue #1A2B3C", "Charcoal Gray #36454F", "Crimson Red #DC143C")
    - style_tags: string[] (e.g., ["casual", "streetwear", "minimalist", "vintage"])
    - description: string (short, engaging description)
    - price_estimate: string (e.g., "${currencySymbol} 1500", "${currencySymbol} 2000-5000") - use numeric values with currency symbol. Do NOT use abstract signs like $$$.
    - style_score: number (1-100, purely objective style rating based on versatility and trend)
    - style_reasoning: string (2-3 sentences explaining the style score and how this item fits into a wardrobe)
    - brand: string (brand name if visible, else empty)
    - styling_tips: string[] (3 short tips on how to style this item)
    - complementary_items: string[] (5 items that would pair well with this piece${wardrobeItems && wardrobeItems.length > 0 ? ' - ONLY from the user\'s wardrobe list above' : ''})
    ${wardrobeContext}`;

    const modelsToTry = [
        MODELS.premium_primary,
        MODELS.premium_secondary,
        MODELS.free_primary,
        MODELS.free_secondary
    ];

    for (let i = 0; i < modelsToTry.length; i++) {
        const modelName = modelsToTry[i];
        const isLastModel = i === modelsToTry.length - 1;

        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type,
                    },
                },
            ]);

            // Extract text from response - Gemini SDK structure
            const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (!text) {
                throw new Error('No text content in Gemini response');
            }
            const cleanJson = cleanJsonString(text);

            return JSON.parse(cleanJson);
        } catch (error: any) {
            const isQuotaError = error?.message?.includes("429") || error?.message?.includes("quota");

            if (isQuotaError && !isLastModel) {
                console.warn(`Model ${modelName} quota exceeded, trying next model...`);
                continue; // Try next model
            }

            // If it's the last model or not a quota error, throw
            if (isLastModel) {
                throw handleGeminiError(error);
            }

            // For other errors on non-last models, try next
            console.warn(`Model ${modelName} failed: ${error?.message}`);
            continue;
        }
    }

    throw new Error("All models failed");
}

export async function analyzeLinkWithGemini(
    url: string,
    metadata: { title?: string; brand?: string; price?: string; description?: string },
    file: File | null,
    apiKey: string,
    userLocation?: string,
    wardrobeItems?: Array<{ name: string; category: string; color?: string }>
): Promise<WardrobeItemAnalysis> {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Build context strings
    const currencySymbol = userLocation && userLocation.toLowerCase().includes('india') ? '₹' : '$';
    const wardrobeContext = wardrobeItems && wardrobeItems.length > 0
        ? `\n\nUser's Current Wardrobe:\n${wardrobeItems.map((item, i) => `${i + 1}. ${item.name || item.category} (${item.color || 'color N/A'})`).join('\n')}\n\nFor complementary_items, ONLY suggest items from the above wardrobe list by their exact names.`
        : '';

    const linkContext = `
    CONTEXT FROM LINK METADATA (Use as ground truth if available):
    URL: ${url}
    Title: "${metadata.title || ''}"
    Brand: "${metadata.brand || ''}"
    Price: "${metadata.price || ''}"
    Description: "${metadata.description || ''}"
    `;

    const prompt = `Analyze this product from a URL store link. 
    ${linkContext}
    
    Return ONLY a valid JSON object (no markdown, no backticks) with these fields:
    - category: string (Top, Bottom, Outerwear, Shoes, Accessory, Dress, Bag, Other)
    - sub_category: string (e.g., T-Shirt, Jeans, Blazer, Sneakers)
    - primary_color: string (precise color name AND hex code, e.g., "Navy Blue #1A2B3C")
    - style_tags: string[] (e.g., ["casual", "streetwear", "minimalist", "vintage"])
    - description: string (short, engaging description based on the link info)
    - price_estimate: string (Use the metadata price if available, else estimate: "${currencySymbol} 1500", "${currencySymbol} 2000-5000")
    - style_score: number (1-100, purely objective style rating)
    - style_reasoning: string (2-3 sentences explaining the style score)
    - brand: string (Use metadata brand if available - "${metadata.brand || ''}")
    - styling_tips: string[] (3 short tips)
    - complementary_items: string[] (5 items that would pair well - ${wardrobeItems && wardrobeItems.length > 0 ? 'ONLY from user wardrobe' : 'generics'})
    ${wardrobeContext}`;

    const modelsToTry = [
        MODELS.premium_primary,
        MODELS.premium_secondary,
        MODELS.free_primary,
        MODELS.free_secondary
    ];

    for (let i = 0; i < modelsToTry.length; i++) {
        const modelName = modelsToTry[i];

        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            // Construct parts: Prompt + Image (if available)
            const parts: any[] = [prompt];
            if (file) {
                const base64Data = await fileToBase64(file);
                parts.push({
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type,
                    },
                });
            }

            const result = await model.generateContent(parts);
            const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (!text) throw new Error('No text content');

            return JSON.parse(cleanJsonString(text));

        } catch (error: any) {
            console.warn(`Model ${modelName} failed for Link Analysis: ${error?.message}`);
            if (i === modelsToTry.length - 1) throw handleGeminiError(error);
        }
    }
    throw new Error("All models failed");
}

export async function rateImageWithGemini(file: File, apiKey: string): Promise<ShopAnalysis> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const base64Data = await fileToBase64(file);

    const prompt = `Act as a world-class fashion stylist. Rate this item/outfit on a scale of 1-10.
        Return ONLY a valid JSON object (no markdown) with:
        - score: number (1-10)
        - critique: string (honest, constructive feedback, max 2 sentences)
        - alternatives: string[] (3 better alternative item names or styles)
        `;

    const modelsToTry = [
        MODELS.premium_primary,
        MODELS.premium_secondary,
        MODELS.free_primary,
        MODELS.free_secondary
    ];

    for (let i = 0; i < modelsToTry.length; i++) {
        const modelName = modelsToTry[i];
        const isLastModel = i === modelsToTry.length - 1;

        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type,
                    },
                },
            ]);

            // Extract text from response - Gemini SDK structure
            const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (!text) {
                throw new Error('No text content in Gemini response');
            }
            const cleanJson = cleanJsonString(text);
            return JSON.parse(cleanJson);
        } catch (error: any) {
            const isQuotaError = error?.message?.includes("429") || error?.message?.includes("quota");

            if (isQuotaError && !isLastModel) {
                console.warn(`Model ${modelName} quota exceeded, trying next model...`);
                continue;
            }

            if (isLastModel) {
                throw handleGeminiError(error);
            }

            console.warn(`Model ${modelName} failed: ${error?.message}`);
            continue;
        }
    }

    throw new Error("All models failed");
}

export async function generateOutfit(
    wardrobeItems: any[],
    occasion: string,
    timing: string,
    userLocation?: string,
    apiKey?: string,
    preSelectedIds?: string[]
): Promise<{
    top?: any;
    bottom?: any;
    shoes?: any;
    layering?: any;
    bag?: any;
    sunglasses?: any;
    jewelry?: any;
    headwear?: any;
    belt?: any;
    scarf?: any;
    gloves?: any;
    watch?: any;
    wallet?: any;
    reasoning: string;
    style_tips: string[];
}> {
    if (!apiKey) throw new Error("API Key required");
    const genAI = new GoogleGenerativeAI(apiKey);

    const instructions = preSelectedIds && preSelectedIds.length > 0
        ? `CRITICAL INSTRUCTION: You MUST include the following Item IDs in your outfit selection: ${preSelectedIds.join(', ')}. Build the rest of the outfit around these items.`
        : '';

    const wardrobeList = wardrobeItems.map(item =>
        `- ID: ${item.id}, ${item.name || item.sub_category} (${item.category}, ${item.primary_color || 'color N/A'})`
    ).join('\n');

    const prompt = `
    Act as the world's most prestigious and talented personal stylist, known for impeccable taste and attention to detail. 
    You are styling your most important client for a specific occasion. Your goal is perfection.

    OCCASION: ${occasion}
    TIMING: ${timing}
    LOCATION: ${userLocation || "Unknown"}
    
    WARDROBE ITEMS:
    ${wardrobeList}

    INSTRUCTIONS:
    1. Select the ABSOLUTE BEST combination of items from the provided WARDROBE ITEMS list.
    2. Ensure colors, textures, and styles harmonize perfectly.
    3. Respect the occasion deeply(e.g., ensure formal wear is truly formal).
    4. You MUST use the exact ID provided in the list.
    5. ${instructions}
    
    Return verified JSON only:
    {
        "top_id": "uuid",
        "bottom_id": "uuid",
        "shoes_id": "uuid",
        "layering_id": "uuid",
        "bag_id": "uuid",
        "sunglasses_id": "uuid",
        "jewelry_id": "uuid",
        "headwear_id": "uuid",
        "belt_id": "uuid",
        "scarf_id": "uuid",
        "gloves_id": "uuid",
        "watch_id": "uuid",
        "wallet_id": "uuid",
        "reasoning": "Sophisticated styling advice explaining why this specific combination works flawlessly for the occasion.",
        "style_tips": ["Professional styling tip 1", "Tip 2"]
    }
    `;

    const model = await createModelWithFallback(genAI);
    const result = await model.generateContent(prompt);
    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = cleanJsonString(text);
    const selection = JSON.parse(cleanJson);

    // Map back to actual objects
    const findItem = (id: string) => wardrobeItems.find(i => i.id === id);

    return {
        top: findItem(selection.top_id),
        bottom: findItem(selection.bottom_id),
        shoes: findItem(selection.shoes_id),
        layering: findItem(selection.layering_id),
        bag: findItem(selection.bag_id),
        sunglasses: findItem(selection.sunglasses_id),
        jewelry: findItem(selection.jewelry_id),
        headwear: findItem(selection.headwear_id),
        belt: findItem(selection.belt_id),
        scarf: findItem(selection.scarf_id),
        gloves: findItem(selection.gloves_id),
        watch: findItem(selection.watch_id),
        wallet: findItem(selection.wallet_id),
        reasoning: selection.reasoning,
        style_tips: selection.style_tips
    };
}


export async function generateWeeklyRecommendations(
    styleDNA: any,
    wardrobeItems: any[],
    apiKey: string
): Promise<any[]> {
    if (!apiKey) throw new Error("API Key required");
    const genAI = new GoogleGenerativeAI(apiKey);

    const wardrobeContext = wardrobeItems.map(item =>
        `- ${item.category} (${item.sub_category}): ${item.name} (${item.primary_color}, ${item.style_tags?.join(', ')})`
    ).join('\n');

    // truncate styleDNA if it's too large, but usually it's fine
    const styleContext = JSON.stringify(styleDNA, null, 2);

    const prompt = `
    Act as a world-class personal stylist. Analyze the user's Style DNA and current Wardrobe to identify the top 5-6 MISSING items (gaps) that would elevate their style.

    STYLE DNA:
    ${styleContext}

    CURRENT WARDROBE:
    ${wardrobeContext}

    TASK:
    1. Identify 5-6 key items missing from the wardrobe that are CRITICAL to fulfilling the Style DNA archetypes.
    2. Suggest SPECIFIC items (e.g. "Camel Wool Trench Coat" instead of just "Coat").
    3. For EACH recommendation, provide exactly 3 "Shopping Options" with varying price points or styles (e.g. one Classic, one Modern, one Budget/Premium).
    4. Ensure specific Brand names are real and relevant to the user's style.

    Return verified JSON only (Array of objects):
    [
      {
        "item_name": "Detailed Item Name",
        "priority": "High",
        "reason": "Explanation of why this is a critical gap based on their archetype...",
        "options": [
          { "brand": "Brand A", "color": "Specific Color", "price_range_text": "$100-200" },
          { "brand": "Brand B", "color": "Specific Color", "price_range_text": "$200-500" },
          { "brand": "Brand C", "color": "Specific Color", "price_range_text": "$50+" }
        ]
      }
    ]
    `;

    const model = await createModelWithFallback(genAI);
    const result = await model.generateContent(prompt);
    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = cleanJsonString(text);
    return JSON.parse(cleanJson);
}

export async function rateOutfit(
    outfitItems: any[],
    occasion: string,
    timing: string,
    apiKey: string
): Promise<{ score: number; rationale: string; issues: string[] }> {
    if (!apiKey) throw new Error("API Key required");
    const genAI = new GoogleGenerativeAI(apiKey);

    const context = outfitItems.map(item =>
        `- ${item.category} (${item.sub_category}): ${item.name} (${item.primary_color}, ${item.style_tags?.join(', ')})`
    ).join('\n');

    const prompt = `
    Act as the world's best personal stylist. You are reviewing an outfit combination created by your client.
    Be honest but constructive.Strict on style rules.

        OCCASION: ${occasion}
    TIMING: ${timing}
    
    OUTFIT ITEMS:
    ${context}

    Analyze this combination for:
        1. Color coordination.
    2. Style consistency(e.g.not mixing gym wear with formal wear unless intentional chic).
    3. Occasion appropriateness.

    Return verified JSON only:
    {
        "score": number(0 - 100),
            "rationale": "One sentence summary of the outfit's coherence.",
                "issues": ["Specific item X clashes with item Y because...", "Shoes are too casual for this occasion", etc.](Empty array if perfect)
    }
    `;

    const model = await createModelWithFallback(genAI);
    const result = await model.generateContent(prompt);
    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = cleanJsonString(text);
    return JSON.parse(cleanJson);
}

// Helpers
async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function cleanJsonString(text: string): string {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

function handleGeminiError(error: any): Error {
    console.error("Gemini Error:", error);
    let message = "Failed to analyze image. Please check your API key.";
    if (error instanceof Error) {
        if (error.message.includes("429") || error.message.includes("quota")) {
            message = "All Gemini models exhausted quota limits. Free tier has daily limits. Please wait or upgrade at https://ai.google.dev/pricing";
        } else if (error.message.includes("404") || error.message.includes("not found")) {
            message = "Gemini model unavailable. Please check your API key has access to the latest models.";
        } else if (error.message.includes("API key") || error.message.includes("API_KEY")) {
            message = "Invalid API Key. Please check your settings.";
        }
    }
    return new Error(message);
}
