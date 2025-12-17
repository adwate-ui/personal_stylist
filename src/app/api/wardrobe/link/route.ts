import { NextRequest, NextResponse } from "next/server";
import { analyzeProductLink } from "@/lib/gemini";
import { Buffer } from "buffer"; // Edge requires explicit buffer import often, though Next sometimes polyfills it globally



export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "No URL provided" }, { status: 400 });
        }

        console.log("Analyzing URL:", url);

        // 1. Fetch the HTML
        const htmlRes = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        if (!htmlRes.ok) {
            throw new Error(`Failed to fetch URL: ${htmlRes.statusText}`);
        }

        const html = await htmlRes.text();

        // 2. Extract Metadata using Regex
        const getMeta = (prop: string) => {
            const match = html.match(new RegExp(`<meta property="${prop}" content="([^"]+)"`, "i")) ||
                html.match(new RegExp(`<meta name="${prop}" content="([^"]+)"`, "i"));
            return match ? match[1] : null;
        };

        const title = getMeta("og:title") || getMeta("twitter:title") || html.match(/<title>([^<]+)<\/title>/i)?.[1];
        const description = getMeta("og:description") || getMeta("description") || getMeta("twitter:description");
        const imageUrl = getMeta("og:image") || getMeta("twitter:image");

        let imageBuffer: Buffer | undefined;

        // 3. Download the Image
        if (imageUrl) {
            try {
                const imageRes = await fetch(imageUrl);
                const arrayBuffer = await imageRes.arrayBuffer();
                imageBuffer = Buffer.from(arrayBuffer);
            } catch (imgError) {
                console.warn("Failed to download image:", imgError);
            }
        }

        // 4. Analyze with Gemini
        const analysis = await analyzeProductLink(url, imageBuffer, { title, description, image: imageUrl });

        if (analysis.error) {
            return NextResponse.json({ error: analysis.error }, { status: 500 });
        }

        return NextResponse.json({
            ...analysis,
            image_url: imageUrl || analysis.image_url // Prefer scraped image or fallback to analysis guess
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Link analysis failed", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
