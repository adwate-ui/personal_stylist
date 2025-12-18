import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { ProfileData } from '@/types/profile';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error);
            return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
        }

        if (!data) {
            // Return empty structure or just null. But based on usage, might be better to return null or default if client handles it.
            // The plan says "Return empty profile structure". 
            // But the client side hook 'databaseToProfile' handles the transformation.
            // Let's return null and let client handle, or return null data.
            // The plan says "Handle PGRST116 error (row not found) by returning empty profile structure".
            // UseProfile hook expects database format.
            return NextResponse.json({}, { status: 200 });
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: ProfileData = await request.json();

        // Validation
        if (!body.name || !body.gender) {
            return NextResponse.json({ error: 'Name and gender are required' }, { status: 400 });
        }

        // Transform data
        const profileData = {
            id: user.id,
            full_name: body.name,
            gender: body.gender,
            age: body.age ? parseInt(body.age) : null,
            location: body.location,
            height_cm: body.height ? parseInt(body.height) : null,
            weight_kg: body.weight ? parseInt(body.weight) : null,
            body_shape: body.bodyShape,
            fit_preference: body.fitPreference,
            skin_tone: body.skinTone,
            eye_color: body.eyeColor,
            hair_color: body.hairColor,
            lifestyle: body.lifestyle,
            archetypes: body.archetypes,
            brands: body.brands,
            price_range: body.priceRange,
            style_dna: body.styleDNA,
            style_report: body.styleReport,
            avatar_url: body.avatar_url || body.avatar
        };

        const { data, error } = await supabase
            .from('profiles')
            .upsert(profileData, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('Error saving profile:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
