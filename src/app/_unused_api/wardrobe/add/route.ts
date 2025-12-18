import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createErrorResponse } from "@/lib/errorMessages";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return createErrorResponse("UNAUTHORIZED", "Unauthorized", 401);
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
                    return createErrorResponse("UNAUTHORIZED", "Forbidden: Invalid image path", 403);
                }
            }
            // External URLs are allowed (e.g. from product pages)
        }

        if (!item || !item.image_url) {
            return createErrorResponse("VALIDATION_ERROR", "Invalid item data", 400);
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
            return createErrorResponse("DATABASE_ERROR", dbError.message, 500);
        }

        return NextResponse.json({ success: true, item: data });

    } catch (error: any) {
        console.error("API Add Error:", error);
        return createErrorResponse("UNKNOWN_ERROR", error.message || String(error), 500);
    }
}
