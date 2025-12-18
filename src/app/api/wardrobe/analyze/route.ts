import { NextRequest, NextResponse } from "next/server";
import { identifyWardrobeItem } from "@/lib/gemini";
import { createErrorResponse } from "@/lib/errorMessages";
import { createClient } from "@/lib/supabase-server";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        // Environment Check
        if (!process.env.GEMINI_API_KEY) {
            return createErrorResponse("CONFIG_ERROR", "GEMINI_API_KEY is not set in environment variables.", 500);
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return createErrorResponse("UNAUTHORIZED", "Must be logged in to analyze.", 401);
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        // Fetch user's Style DNA from database
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('style_dna')
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            console.error("Profile fetch error:", profileError);
            // Continue without style DNA rather than failing
        }

        const styleDNA = profile?.style_dna || null;

        if (!file) {
            return createErrorResponse("VALIDATION_ERROR", "No file provided in form data.", 400);
        }

        const bytes = await file.arrayBuffer();

        // 1. Upload to Supabase Storage
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('wardrobe_items')
            .upload(fileName, bytes, { contentType: file.type || 'image/jpeg' });

        if (uploadError) {
            console.error("Storage Upload Error:", uploadError);
            return createErrorResponse("STORAGE_ERROR", uploadError.message, 500);
        }

        const publicUrlBase = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const imageUrl = uploadData?.path && publicUrlBase
            ? `${publicUrlBase}/storage/v1/object/public/wardrobe_items/${uploadData.path}`
            : "";

        // 2. Analyze with Gemini
        let analysis;
        try {
            analysis = await identifyWardrobeItem(bytes, styleDNA);
        } catch (geminiError: any) {
            console.error("Gemini Analysis Exception:", geminiError);
            return createErrorResponse("GEMINI_ERROR", geminiError.message || String(geminiError), 500);
        }

        if (!analysis) {
            return createErrorResponse("AI_FAILURE", "Gemini returned no analysis.", 500);
        }

        if (analysis.error) {
            return createErrorResponse("AI_FAILURE", analysis.error, 500);
        }

        // Return combined result
        return NextResponse.json({
            success: true,
            ...analysis,
            image_url: imageUrl
        });

    } catch (error: any) {
        console.error("CRITICAL API Error:", error);
        return createErrorResponse("UNKNOWN_ERROR", error.message || String(error), 500);
    }
}
