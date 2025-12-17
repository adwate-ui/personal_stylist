import { createMiddlewareClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    // Create an unmodified response first
    const res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    });

    const supabase = createMiddlewareClient(req, res);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected Routes
    const protectedRoutes = ['/wardrobe', '/add-item', '/preferences', '/shop', '/onboarding'];
    const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

    if (!user && isProtectedRoute) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/auth/login';
        redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    return res;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
