import { createServerClient } from "@/lib/supabase-server";
import { ratePurchase } from "@/lib/gemini";

export const runtime = 'edge';

export async function POST(request: Request) {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // 1. Fetch user's Style DNA
        const { data: profile } = await supabase
            .from('profiles')
            .select('style_dna:styleDNA')
            .eq('id', user.id)
            .single();

        const styleDNA = profile?.style_dna;

        // 2. Fetch all user's wardrobe items
        const { data: items, error: fetchError } = await supabase
            .from('wardrobe_items')
            .select('*')
            .eq('user_id', user.id);

        if (fetchError) throw fetchError;
        if (!items || items.length === 0) {
            return new Response(JSON.stringify({ error: 'No items to recalculate', count: 0 }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let updatedCount = 0;

        // 3. Re-analyze each item with Style DNA and wardrobe context
        for (const item of items) {
            try {
                // Skip if no image
                if (!item.image_url) continue;

                // Fetch image
                const imageResponse = await fetch(item.image_url);
                if (!imageResponse.ok) continue;

                const imageBuffer = await imageResponse.arrayBuffer();

                // Get other items for context (excluding current item)
                const contextItems = items
                    .filter(i => i.id !== item.id)
                    .map(i => ({
                        category: i.category,
                        brand: i.brand,
                        primary_color: i.color || i.ai_analysis?.primary_color
                    }));

                // Re-analyze with full context
                const analysis = await ratePurchase(imageBuffer, contextItems, styleDNA);

                if (analysis && analysis.rating) {
                    // Update the item with new score
                    const { error: updateError } = await supabase
                        .from('wardrobe_items')
                        .update({
                            style_score: analysis.rating,
                            ai_analysis: {
                                ...item.ai_analysis,
                                verdict: analysis.verdict,
                                reasoning: analysis.reasoning,
                                alternatives: analysis.alternatives,
                                recalculated_at: new Date().toISOString()
                            }
                        })
                        .eq('id', item.id);

                    if (!updateError) {
                        updatedCount++;
                    }
                }
            } catch (itemError) {
                console.error(`Failed to recalculate item ${item.id}:`, itemError);
                // Continue with next item
                continue;
            }
        }

        return new Response(JSON.stringify({
            success: true,
            count: updatedCount,
            total: items.length
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Recalculation error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to recalculate scores',
            message: (error as Error).message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
