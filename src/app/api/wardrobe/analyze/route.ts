import { NextRequest, NextResponse } from "next/server";
import { identifyWardrobeItem } from "@/lib/gemini";
import { createClient } from "@/lib/supabase-server";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        // Environment Check
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ success: false, error: "CONFIG_ERROR", details: "GEMINI_API_KEY is not set in environment variables." });
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ success: false, error: "UNAUTHORIZED", details: "Must be logged in to analyze." }, { status: 401 });
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
            return NextResponse.json({ success: false, error: "BAD_REQUEST", details: "No file provided in form data." });
        }

        const bytes = await file.arrayBuffer();

        // 1. Upload to Supabase Storage
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('wardrobe_items')
            .upload(fileName, bytes, { contentType: file.type || 'image/jpeg' });

        if (uploadError) {
            console.error("Storage Upload Error:", uploadError);
            return NextResponse.json({
                success: false,
                error: "STORAGE_ERROR",
                details: uploadError.message
            }, { status: 500 });
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
            return NextResponse.json({ success: false, error: "GEMINI_ERROR", details: geminiError.message || String(geminiError) });
        }

        if (!analysis) {
            return NextResponse.json({ success: false, error: "AI_FAILURE", details: "Gemini returned no analysis." });
        }

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
        console.error("CRITICAL API Error:", error);
        return NextResponse.json({ success: false, error: "CRITICAL_FAILURE", details: error.message || String(error) });
    }
}
