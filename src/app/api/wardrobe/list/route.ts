import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // Validate limit to be within reasonable bounds
        const safeLimit = Math.min(Math.max(limit, 1), 100);
        const from = (page - 1) * safeLimit;
        const to = from + safeLimit - 1;

        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch items with pagination
        const { data, error, count } = await supabase
            .from('wardrobe_items')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch wardrobe items' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            items: data || [],
            total: count || 0,
            page,
            hasMore: (count || 0) > to + 1
        });

    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
