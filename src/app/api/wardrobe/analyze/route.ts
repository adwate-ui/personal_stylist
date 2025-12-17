import { NextRequest, NextResponse } from "next/server";
import { identifyWardrobeItem } from "@/lib/gemini";
import { createClient } from "@supabase/supabase-js";

export const runtime = 'edge';

// Initialize Supabase Client lazily to avoid build-time errors if env vars are missing
const getSupabase = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase Environment Variables");
    }
    return createClient(supabaseUrl, supabaseKey);
};

export async function POST(req: NextRequest) {
    // FAIL-SAFE WRAPPER: Catch absolutely everything and return JSON 200 with error details.
    // This ensures the client always gets a readable response instead of a 500 crash page.
    try {
        // Environment Check
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ success: false, error: "CONFIG_ERROR", details: "GEMINI_API_KEY is not set in environment variables." });
        }
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            return NextResponse.json({ success: false, error: "CONFIG_ERROR", details: "NEXT_PUBLIC_SUPABASE_URL is not set." });
        }

        const supabase = getSupabase();
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const styleProfileStr = formData.get("style_profile") as string;
        const styleProfile = styleProfileStr ? JSON.parse(styleProfileStr) : null;

        if (!file) {
            return NextResponse.json({ success: false, error: "BAD_REQUEST", details: "No file provided in form data." });
        }

        const bytes = await file.arrayBuffer();

        // 1. Upload to Supabase Storage
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('wardrobe_items')
            .upload(fileName, bytes, { contentType: file.type || 'image/jpeg' });

        if (uploadError) {
            console.error("Storage Upload Error:", uploadError);
            // Non-fatal: continue without image URL
        }

        const publicUrlBase = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const imageUrl = uploadData?.path && publicUrlBase
            ? `${publicUrlBase}/storage/v1/object/public/wardrobe_items/${uploadData.path}`
            : "";

        // 2. Analyze with Gemini
        let analysis;
        try {
            analysis = await identifyWardrobeItem(bytes, styleProfile);
        } catch (geminiError: any) {
            console.error("Gemini Analysis Exception:", geminiError);
            return NextResponse.json({ success: false, error: "GEMINI_ERROR", details: geminiError.message || String(geminiError) });
        }

        if (!analysis) {
            return NextResponse.json({ success: false, error: "AI_FAILURE", details: "Gemini returned no analysis." });
        }

        // Check if analysis itself is an error object from gemini.ts
        if (analysis.error) {
            return NextResponse.json({ success: false, error: "AI_FAILURE", details: analysis.error });
        }

        // Return combined result
        return NextResponse.json({
            success: true,
            ...analysis,
            image_url: imageUrl
        });

    } catch (error: any) {
        // CRITICAL CATCH-ALL: This should never be reached if internal catches work,
        // but this guarantees no 500 crash.
        console.error("CRITICAL API Error:", error);
        return NextResponse.json({ success: false, error: "CRITICAL_FAILURE", details: error.message || String(error) });
    }
}
