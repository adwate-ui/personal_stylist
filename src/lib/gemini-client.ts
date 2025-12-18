import { GoogleGenerativeAI } from "@google/generative-ai";
import { WardrobeItemAnalysis } from "@/types/wardrobe";
import { ShopAnalysis } from "@/types/shop";

export async function analyzeImageWithGemini(file: File, apiKey: string): Promise<WardrobeItemAnalysis> {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-1.5-flash-latest or gemini-1.5-flash which is stable
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Convert file to base64
        const base64Data = await fileToBase64(file);

        const prompt = `Analyze this clothing item for a personal stylist app. Return ONLY a valid JSON object (no markdown, no backticks) with these fields:
    - category: string (Top, Bottom, Outerwear, Shoes, Accessory, Dress, Bag, Other)
    - sub_category: string (e.g., T-Shirt, Jeans, Blazer, Sneakers)
    - primary_color: string (generic color name)
    - style_tags: string[] (e.g., ["casual", "streetwear", "minimalist", "vintage"])
    - description: string (short, engaging description)
    - price_estimate: string (e.g., "$$", "$$$", "$")
    - style_score: number (1-100, purely objective style rating based on versatility and trend)
    - branding: string (brand name if visible, else empty)
    - styling_tips: string[] (3 short tips)
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();
        const cleanJson = cleanJsonString(text);

        return JSON.parse(cleanJson);
    } catch (error) {
        throw handleGeminiError(error);
    }
}

export async function rateImageWithGemini(file: File, apiKey: string): Promise<ShopAnalysis> {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const base64Data = await fileToBase64(file);

        const prompt = `Act as a world-class fashion stylist. Rate this item/outfit on a scale of 1-10.
        Return ONLY a valid JSON object (no markdown) with:
        - score: number (1-10)
        - critique: string (honest, constructive feedback, max 2 sentences)
        - alternatives: string[] (3 better alternative item names or styles)
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                },
            },
        ]);

        const response = await result.response;
        const cleanJson = cleanJsonString(response.text());
        return JSON.parse(cleanJson);
    } catch (error) {
        throw handleGeminiError(error);
    }
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
        if (error.message.includes("404")) message = "Gemini Model not found. Please check model name.";
        if (error.message.includes("API key")) message = "Invalid API Key. Please check your settings.";
    }
    return new Error(message);
}
