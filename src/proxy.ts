import { createMiddlewareClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// NOTE: In Next.js 16, proxy always runs on Node.js runtime by design.
// Route segment config (like 'export const runtime = edge') is not allowed in proxy files.
// See: https://nextjs.org/docs/messages/middleware-to-proxy

export async function proxy(req: NextRequest) {
    // Skip middleware for RSC (React Server Components) requests
    // These are internal Next.js requests and should not be intercepted
    if (req.nextUrl.searchParams.has('_rsc')) {
        return NextResponse.next();
    }

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
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
