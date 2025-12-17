import { NextRequest, NextResponse } from "next/server";
import { identifyWardrobeItem } from "@/lib/gemini";
import { createClient } from "@supabase/supabase-js";

export const runtime = 'edge';

// Initialize Supabase Client lazily to avoid build-time errors if env vars are missing
const getSupabase = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase Environment Variables");
    }
    return createClient(supabaseUrl, supabaseKey);
};

export async function POST(req: NextRequest) {
    try {
        const supabase = getSupabase();
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const styleProfileStr = formData.get("style_profile") as string;
        const styleProfile = styleProfileStr ? JSON.parse(styleProfileStr) : null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 1. Upload to Supabase Storage
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('wardrobe_items')
            .upload(fileName, buffer, { contentType: file.type || 'image/jpeg' });

        if (uploadError) {
            console.error("Storage Upload Error:", uploadError);
        }

        // Use process.env directly for URL construction since it's compatible with Edge Runtime access patterns
        const publicUrlBase = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const imageUrl = uploadData?.path && publicUrlBase
            ? `${publicUrlBase}/storage/v1/object/public/wardrobe_items/${uploadData.path}`
            : "";

        // 2. Analyze with Gemini (passing style profile)
        const analysis = await identifyWardrobeItem(buffer, styleProfile);

        if (!analysis) {
            return NextResponse.json({ error: "AI Analysis failed" }, { status: 500 });
        }

        // 3. Save to Database - MOVED TO /api/wardrobe/add
        // We now return the analysis and the image URL, and let the client call 'save' after review.

        // Return combined result
        return NextResponse.json({
            ...analysis,
            image_url: imageUrl
        });

        // Return combined result
        return NextResponse.json({
            ...analysis,
            image_url: imageUrl
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Analysis failed", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
