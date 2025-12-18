import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const item = await req.json();

        // Security check: Ensure user is only saving their own images
        // Expected format: .../wardrobe_items/USER_ID/filename.jpg
        if (item?.image_url) {
            // Check if it's an internal storage path or an external URL
            const isInternalStorage = item.image_url.includes(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
                item.image_url.includes('supabase.co/storage');

            if (isInternalStorage) {
                const hasUserInPath = item.image_url.includes(`/${user.id}/`);
                if (!hasUserInPath) {
                    console.error("Security Alert: User attempted to save image from another path", {
                        attemptedUrl: item.image_url,
                        userId: user.id
                    });
                    return NextResponse.json({ error: "Forbidden: Invalid image path" }, { status: 403 });
                }
            }
            // External URLs are allowed (e.g. from product pages)
        }

        if (!item || !item.image_url) {
            return NextResponse.json({ error: "Invalid item data" }, { status: 400 });
        }

        // Save to Database
        const { data, error: dbError } = await supabase
            .from('wardrobe_items')
            .insert({
                image_url: item.image_url,
                category: item.category,
                sub_category: item.sub_category,
                brand: item.brand,
                primary_color: item.color,
                price_estimate: item.price_estimate,
                description: item.description,
                style_tags: item.tags,
                style_score: item.style_score,
                user_id: user.id, // Securely obtained from session
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
