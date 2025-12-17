import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { session } } = await supabase.auth.getSession();

    // If user is not signed in and trying to access protected routes
    if (!session && !req.nextUrl.pathname.startsWith('/auth') && !req.nextUrl.pathname.startsWith('/api') && req.nextUrl.pathname !== '/') {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    return res;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
