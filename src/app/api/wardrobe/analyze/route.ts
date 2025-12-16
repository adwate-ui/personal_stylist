import { NextRequest, NextResponse } from "next/server";
import { identifyWardrobeItem } from "@/lib/gemini";

// Helper to handle formData in App Router
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const analysis = await identifyWardrobeItem(file);
        return NextResponse.json(analysis);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
    }
}
