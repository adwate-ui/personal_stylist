import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { supabaseUrl, supabaseKey, isSupabaseConfigured } from './supabase-config';

// Warn only once during server initialization if Supabase is not configured
// This is suppressed during build to avoid confusion in build logs
if (!isSupabaseConfigured && typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Supabase environment variables not configured in production. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

// Utility for Server Components and API Routes
export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

// Utility for Middleware - Edge Runtime Compatible
// This implementation uses NextRequest/NextResponse cookies which work in Edge runtime
// Unlike cookies() from next/headers, this approach is compatible with Cloudflare Pages
export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
    return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );
}
