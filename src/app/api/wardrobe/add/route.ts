import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = 'edge';

// Initialize Supabase Client lazily
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
        const item = await req.json();

        if (!item || !item.image_url) {
            return NextResponse.json({ error: "Invalid item data" }, { status: 400 });
        }

        const supabase = getSupabase();

        // Save to Database
        const { data, error: dbError } = await supabase
            .from('wardrobe_items')
            .insert({
                image_url: item.image_url,
                category: item.category,
                sub_category: item.sub_category,
                brand: item.brand,
                primary_color: item.color,
                price_estimate: item.price_estimate, // New Field
                description: item.description,
                style_tags: item.tags,
                style_score: item.style_score,
                ai_analysis: item
            })
            .select()
            .single();

        if (dbError) {
            console.error("DB Insert Error:", dbError);
            return NextResponse.json({ error: "Database save failed", details: dbError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, item: data });

    } catch (error) {
        console.error("API Add Error:", error);
        return NextResponse.json({ error: "Add Item failed", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
