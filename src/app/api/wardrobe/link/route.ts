import { NextRequest, NextResponse } from "next/server";
import { analyzeProductLink } from "@/lib/gemini";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "No URL provided" }, { status: 400 });
        }

        const analysis = await analyzeProductLink(url);

        if (analysis.error) {
            return NextResponse.json({ error: analysis.error }, { status: 500 });
        }

        return NextResponse.json(analysis);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Link analysis failed" }, { status: 500 });
    }
}
