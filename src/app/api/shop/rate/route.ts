import { NextRequest, NextResponse } from "next/server";
import { ratePurchase } from "@/lib/gemini";
import { createErrorResponse } from "@/lib/errorMessages";
import { createClient } from "@/lib/supabase-server";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return createErrorResponse("UNAUTHORIZED", "Authentication required.", 401);
        }

        // Fetch user's Style DNA
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('style_dna, full_name')
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            console.error("Profile fetch error:", profileError);
        }

        const styleDNA = profile?.style_dna || null;

        // Fetch user's wardrobe for context
        const { data: wardrobeItems, error: wardrobeError } = await supabase
            .from('wardrobe_items')
            .select('category, sub_category, brand, primary_color, description, style_tags')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20); // Limit to recent items to avoid token overflow

        if (wardrobeError) {
            console.error("Wardrobe fetch error:", wardrobeError);
        }

        const wardrobeContext = wardrobeItems || [];

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return createErrorResponse("VALIDATION_ERROR", "No image file provided in request.", 400);
        }

        const bytes = await file.arrayBuffer();
        // Pass ArrayBuffer directly (Universal)
        const result = await ratePurchase(bytes, wardrobeContext, styleDNA);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error("API Error:", error);
        return createErrorResponse("GEMINI_ERROR", error.message || "Failed to analyze item", 500);
    }
}
