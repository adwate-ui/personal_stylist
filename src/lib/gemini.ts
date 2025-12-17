import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: 'gemini-exp-1206' });

const generationConfig = {
    temperature: 0.4,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
};

export async function analyzeProductLink(url: string) {
    if (!genAI) return null;
    const model = genAI.getGenerativeModel({ model: "gemini-exp-1206", generationConfig });

    const prompt = `
    You are the world's greatest fashion stylist and expert. Analyze this product URL: ${url}
    
    Extract the following details with high precision:
    1. Category (e.g., Tops, Bottoms, Outerwear)
    2. Sub-category (e.g., Cashmere Sweater, Wide-leg Trousers)
    3. Color (precise shade name, e.g., 'Midnight Blue' not just 'Blue')
    4. Brand (if identifiable)
    5. Price (estimate if not explicit)
    6. Description: A chic, expert 1-sentence summary of the item avoiding marketing fluff.
    7. Style Tags: [Old Money, Minimalist, Avant-Garde, etc.]
    
    Return JSON: { "category": "", "sub_category": "", "color": "", "brand": "", "price": "", "description": "", "image_url": "placeholder" }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());
    } catch (error) {
        console.error("Gemini Link Analysis Error:", error);
        return null;
    }
}

export async function identifyWardrobeItem(imageBuffer: Buffer) {
    if (!genAI) return null;
    const model = genAI.getGenerativeModel({ model: "gemini-exp-1206", generationConfig });

    const prompt = `
    You are the world's most renonwed fashion curator. Analyze this image of a clothing item.
    Identify:
    - Detailed Category & Sub-category
    - Precise Color & Material (visual guess)
    - Brand aesthetic (e.g., "Minimalist Scandinavian", "Italian Luxury")
    - Occasion (Work, Gala, Casual)
    
    Return JSON: { "item_name": "", "category": "", "color": "", "occasion": "", "tags": [] }
    `;

    const imagePart = {
        inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType: "image/jpeg",
        },
    };

    try {
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        return JSON.parse(response.text());
    } catch (error) {
        console.error("Gemini Identification Error:", error);
        return null;
    }
}

export async function ratePurchase(imageBuffer: Buffer, wardrobeContext: any[] = []) {
    if (!genAI) return null;
    const model = genAI.getGenerativeModel({ model: "gemini-exp-1206", generationConfig });

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
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        return JSON.parse(response.text());
    } catch (error) {
        console.error("Gemini Rating Error:", error);
        return { rating: 0, verdict: "Error", reasoning: "Could not generate rating." };
    }
}
