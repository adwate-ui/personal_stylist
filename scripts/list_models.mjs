import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
let apiKey = process.env.GEMINI_API_KEY;

if (fs.existsSync(envPath) && !apiKey) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/GEMINI_API_KEY=(.+)/);
    if (match) {
        apiKey = match[1].trim();
    }
}

if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Unfortunately listModels is on the ModelManager not directly exposed easily in all versions, 
        // let's try via the generic way or just try to instantiate models.
        // Actually, SDK doesn't always have listModels exposed in the main client easily.
        // But verifying a simple prompt text with flash works.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Testing gemini-1.5-flash...");
        const res = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash");
    } catch (e) {
        console.error("gemini-1.5-flash failed:", e.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log("Testing gemini-pro...");
        const res = await model.generateContent("Hello");
        console.log("Success with gemini-pro");
    } catch (e) {
        console.error("gemini-pro failed:", e.message);
    }
    const variants = [
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro-latest",
        "gemini-pro-vision",
        "gemini-1.0-pro"
    ];

    for (const v of variants) {
        try {
            console.log(`Testing ${v}...`);
            // For vision models, we need text only test ensuring it fails or succeeds appropriately, 
            // but here we just test availability with text prompt (gemini-1.5 is fine).
            // gemini-pro-vision needs image, so it might fail with 400, but not 404 if it exists.
            const model = genAI.getGenerativeModel({ model: v });
            const res = await model.generateContent("Hello");
            console.log(`Success with ${v}`);
        } catch (e) {
            console.error(`${v} failed:`, e.message);
        }
    }
}

listModels();
