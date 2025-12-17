import fs from 'fs';
import path from 'path';

async function listModels() {
    // 1. Get API Key
    const envPath = path.resolve('.env.local');
    let apiKey = process.env.GEMINI_API_KEY;

    if (fs.existsSync(envPath) && !apiKey) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const match = content.match(/GEMINI_API_KEY=(.+)/);
        if (match) apiKey = match[1].trim();
    }

    if (!apiKey) {
        console.error("No API Key found");
        return;
    }

    console.log("Fetching models...");
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!res.ok) {
            console.error(`Error ${res.status}: ${res.statusText}`);
            const text = await res.text();
            console.error(text);
            return;
        }

        const data = await res.json();
        const models = data.models || [];

        console.log(`Found ${models.length} models.`);
        models.forEach(m => {
            console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
        });

    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

listModels();
