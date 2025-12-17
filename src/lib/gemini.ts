import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
    temperature: 0.4,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
};

async function generateWithFallback(promptParts: any[]) {
    const preferredModel = process.env.GEMINI_MODEL;
    const defaultModels = ["gemini-1.5-pro-latest", "gemini-1.5-pro", "gemini-exp-1206", "gemini-1.5-flash"];

    // Create a unique list of models, prioritizing the env var if set
    const models = preferredModel ? [preferredModel, ...defaultModels] : defaultModels;
    // Deduplicate
    const uniqueModels = [...new Set(models)];

    for (const modelName of uniqueModels) {
        try {
            console.log(`Using model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName, generationConfig });
            const result = await model.generateContent(promptParts);
            const response = await result.response;
            return JSON.parse(response.text());
        } catch (error: any) {
            console.warn(`Model ${modelName} failed:`, error.message);
            // If it's the last model, throw
            if (modelName === uniqueModels[uniqueModels.length - 1]) throw error;
            // Continue to next model
        }
    }
}

export async function analyzeProductLink(url: string, imageBuffer?: Buffer, metadata?: any) {
    if (!genAI) return null;

    const prompt = `
    You are the world's greatest fashion stylist and expert. Detailed Analysis Required.
    
    Item Context:
    URL: ${url}
    Title: ${metadata?.title || 'Unknown'}
    Description: ${metadata?.description || 'Unknown'}
    
    Analyze the accompanying image (if provided) and the context to extract details with EXTREME precision.
    
    1. Category & Sub-category (Be specific: "Cashmere Turtleneck" not just "Sweater")
    2. Color (Precise fashion terminology: "Chartreuse", "Burgundy", "Navy", "Ecru")
    3. Brand (Identify from metadata or visual logo if possible)
    4. Price (Estimate range if not in metadata)
    5. Description: A sophisticated, editorial-style 1-sentence summary.
    6. Style Tags: [Old Money, Y2K, Minimalist, Avant-Garde, etc.]
    
    Return JSON: { "category": "", "sub_category": "", "color": "", "brand": "", "price": "", "description": "", "image_url": "${metadata?.image || ''}" }
    `;

    const parts: any[] = [prompt];
    if (imageBuffer) {
        parts.push({
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: "image/jpeg",
            },
        });
    }

    try {
        return await generateWithFallback(parts);
    } catch (error) {
        console.error("Gemini Link Analysis Error:", error);
        return { error: `Gemini Error: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function identifyWardrobeItem(imageBuffer: Buffer) {
    if (!genAI) return null;

    const prompt = `
    You are the world's most renowned fashion curator. Perform a detailed stylistic analysis of this item.
    
    Identify with HIGH PRECISION:
    - Detailed Category & Specific Silhouette (e.g. "Double-Breasted Blazer" vs "Jacket")
    - Precise Color (e.g. "Crimson", "Slate", "Taupe")
    - Material / Fabric appearance (e.g. "Ribbed Knit", "Silk Satin")
    - Brand Aesthetic (e.g. "Minimalist Scandinavian", "Italian Luxury", "Streetwear")
    - Specific Occasions (e.g. "Boardroom", "Gallery Opening", "Weekend Brunch")
    
    Return JSON: { "item_name": "Concise Name", "category": "", "sub_category": "", "color": "", "occasion": "", "tags": [], "description": "Editorial summary" }
    `;

    const imagePart = {
        inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType: "image/jpeg",
        },
    };

    try {
        return await generateWithFallback([prompt, imagePart]);
    } catch (error) {
        console.error("Gemini Identification Error:", error);
        return null;
    }
}

export async function ratePurchase(imageBuffer: Buffer, wardrobeContext: any[] = []) {
    if (!genAI) return null;

    const contextString = wardrobeContext.length > 0
        ? `User's current wardrobe includes: ${wardrobeContext.map(i => i.name || i.category).join(', ')}.`
        : "User is building their wardrobe from scratch.";

    const prompt = `
    ${contextString}
    A user is considering buying the item in this image. 
    As a world - class stylist, provide a brutally honest but constructive rating(1 - 10).
        consider:
    1. Versatility with current wardrobe(if known).
    2. Timelessness vs Trendiness.
    3. Quality perception.
    
    Return JSON: { "rating": 0, "verdict": "Buy/Pass", "reasoning": "Expert explanation..." }
    `;

    const imagePart = {
        inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType: "image/jpeg",
        },
    };

    try {
        return await generateWithFallback([prompt, imagePart]);
    } catch (error) {
        console.error("Gemini Rating Error:", error);
        return { rating: 0, verdict: "Error", reasoning: "Could not generate rating." };
    }
}
