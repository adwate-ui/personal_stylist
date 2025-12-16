import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // Using 1.5 Pro as proxy for "Gemini 3" request if available, or update model name later. 

// Helper to convert File to GoogleGenerativeAI Part
async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve({
                inlineData: {
                    data: base64String,
                    mimeType: file.type,
                },
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export async function identifyWardrobeItem(file: File) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const imagePart = await fileToGenerativePart(file);
        const prompt = `Analyze this clothing item. Return a JSON object with:
    - category (e.g. 'Top', 'Bottom', 'Shoes')
    - sub_category (e.g. 'T-shirt', 'Jeans')
    - color (primary color)
    - season (array of适合 seasons)
    - brand (guess if visible, else null)
    - style_tags (array of style keywords like 'casual', 'boho')
    - description (short description)
    
    Return ONLY raw JSON, no markdown.`;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Cleanup markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        // Mock return for demo if API fails
        return {
            category: "Unknown",
            sub_category: "Unknown",
            color: "Unknown",
            description: "Could not analyze image. (Check API Key)"
        };
    }
}


export async function ratePurchase(file: File) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // Mock user profile context - in real app, fetch from Supabase
        const userContext = "User prefers minimalist style, loves neutral colors, body type is athletic.";

        const imagePart = await fileToGenerativePart(file);
        const prompt = `Act as a world-class personal stylist. I am considering buying this item. 
    My Profile: ${userContext}
    
    1. Score this item from 1-10 based on design and fit for my profile.
    2. Give a short, punchy critique.
    3. Suggest 3 alternative keywords or specific types of items that would look better if this score is low.
    
    Return JSON:
    {
      "score": number,
      "critique": "string",
      "alternatives": ["string", "string", "string"]
    }`;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini Rating Failed:", error);
        return {
            score: 0,
            critique: "Could not rate item. (Check API Key)",
            alternatives: []
        };
    }
}
