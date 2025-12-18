import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeImageWithGemini(file: File, apiKey: string): Promise<any> {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Convert file to base64
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const prompt = `Analyze this clothing item for a personal stylist app. Return ONLY a valid JSON object (no markdown, no backticks) with these fields:
    - category: string (Top, Bottom, Outerwear, Shoes, Accessory, Dress, Bag, Other)
    - sub_category: string (e.g., T-Shirt, Jeans, Blazer, Sneakers)
    - primary_color: string (generic color name)
    - style_tags: string[] (e.g., ["casual", "streetwear", "minimalist", "vintage"])
    - description: string (short, engaging description)
    - price_estimate: string (e.g., "$$", "$$$", "$")
    - style_score: number (1-100, purely objective style rating based on versatility and trend)
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

        // Clean code fences if present
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        throw new Error("Failed to analyze image. Please checks your API key.");
    }
}
