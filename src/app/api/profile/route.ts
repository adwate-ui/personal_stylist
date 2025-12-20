import { supabase } from "@/lib/supabase";

export const runtime = 'edge';

export async function POST(request: Request) {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await request.json();

        // Update profile - specifically handling styleDNA field
        const updateData: any = {};

        // Map styleDNA to the correct database column name
        if ('styleDNA' in body) {
            updateData.style_dna = body.styleDNA;
        }

        // Update other fields if provided
        if ('name' in body) updateData.full_name = body.name;
        if ('avatar_url' in body) updateData.avatar_url = body.avatar_url;
        if ('gender' in body) updateData.gender = body.gender;
        if ('age' in body) updateData.age = body.age;
        if ('location' in body) updateData.location = body.location;
        if ('skin_tone' in body) updateData.skin_tone = body.skin_tone;
        if ('eye_color' in body) updateData.eye_color = body.eye_color;
        if ('hair_color' in body) updateData.hair_color = body.hair_color;
        if ('lifestyle' in body) updateData.lifestyle = body.lifestyle;
        if ('archetypes' in body) updateData.archetypes = body.archetypes;
        if ('brands' in body) updateData.brands = body.brands;
        if ('price_range' in body) updateData.price_range = body.price_range;
        if ('fit_preference' in body) updateData.fit_preference = body.fit_preference;
        if ('body_shape' in body) updateData.body_shape = body.body_shape;

        const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({
            success: true,
            message: 'Profile updated successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to update profile',
            message: (error as Error).message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function GET(request: Request) {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (fetchError) throw fetchError;

        // Map database columns to frontend format
        const profileData = {
            id: profile.id,
            email: user.email,
            name: profile.full_name,
            avatar_url: profile.avatar_url,
            gender: profile.gender,
            age: profile.age,
            location: profile.location,
            skin_tone: profile.skin_tone,
            eye_color: profile.eye_color,
            hair_color: profile.hair_color,
            lifestyle: profile.lifestyle,
            archetypes: profile.archetypes,
            brands: profile.brands,
            price_range: profile.price_range,
            fit_preference: profile.fit_preference,
            body_shape: profile.body_shape,
            styleDNA: profile.style_dna,
            created_at: profile.created_at
        };

        return new Response(JSON.stringify(profileData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to fetch profile',
            message: (error as Error).message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
