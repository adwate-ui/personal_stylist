import { NextRequest, NextResponse } from "next/server";
import { ratePurchase } from "@/lib/gemini";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const result = await ratePurchase(file);
        return NextResponse.json(result);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Rating failed" }, { status: 500 });
    }
}
