import { NextRequest, NextResponse } from "next/server";
import { generateStyleDNA } from "@/lib/gemini";
import { createClient } from "@supabase/supabase-js";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Environment Check
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Configuration Error: API Key missing" }, { status: 500 });
        }

        const analysis = await generateStyleDNA(body);

        if (!analysis) {
            return NextResponse.json({ error: "Failed to generate DNA" }, { status: 500 });
        }

        if (analysis.error) {
            return NextResponse.json({ error: analysis.error }, { status: 500 });
        }

        return NextResponse.json(analysis);

    } catch (error) {
        console.error("Style DNA API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
