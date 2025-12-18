(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__1f49a58c._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/lib/supabase-config.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared Supabase configuration utilities
 */ // Fallback values for build time when environment variables are not available
__turbopack_context__.s([
    "isBrowser",
    ()=>isBrowser,
    "isSupabaseConfigured",
    ()=>isSupabaseConfigured,
    "supabaseKey",
    ()=>supabaseKey,
    "supabaseUrl",
    ()=>supabaseUrl
]);
const supabaseUrl = ("TURBOPACK compile-time value", "https://cumlbufsdynpoarkaxaz.supabase.co") || 'https://placeholder.supabase.co';
const supabaseKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bWxidWZzZHlucG9hcmtheGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODc2MDMsImV4cCI6MjA4MTQ2MzYwM30.mM0Q9FgKWzI9Xnk8Ssm_7ZqR80jEqzWRgkcx2meRY_s") || 'placeholder-anon-key';
const isSupabaseConfigured = Boolean(("TURBOPACK compile-time value", "https://cumlbufsdynpoarkaxaz.supabase.co")) && Boolean(("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bWxidWZzZHlucG9hcmtheGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODc2MDMsImV4cCI6MjA4MTQ2MzYwM30.mM0Q9FgKWzI9Xnk8Ssm_7ZqR80jEqzWRgkcx2meRY_s")) && !supabaseUrl.includes('placeholder');
const isBrowser = ("TURBOPACK compile-time value", "undefined") !== 'undefined';
}),
"[project]/src/lib/supabase-server.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient,
    "createMiddlewareClient",
    ()=>createMiddlewareClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$headers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/headers.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$request$2f$cookies$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/request/cookies.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase-config.ts [middleware-edge] (ecmascript)");
;
;
;
// Warn only once during server initialization if Supabase is not configured
// This is suppressed during build to avoid confusion in build logs
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$request$2f$cookies$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["supabaseUrl"], __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["supabaseKey"], {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
                }
            }
        }
    });
}
function createMiddlewareClient(request, response) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["supabaseUrl"], __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["supabaseKey"], {
        cookies: {
            getAll () {
                return request.cookies.getAll();
            },
            setAll (cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options })=>{
                    request.cookies.set(name, value);
                    response.cookies.set(name, value, options);
                });
            }
        }
    });
}
}),
"[project]/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$server$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase-server.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
;
const runtime = 'edge';
async function middleware(req) {
    // Skip middleware for RSC (React Server Components) requests
    // These are internal Next.js requests and should not be intercepted
    if (req.nextUrl.searchParams.has('_rsc')) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Create an unmodified response first
    const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request: {
            headers: req.headers
        }
    });
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$server$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createMiddlewareClient"])(req, res);
    const { data: { user } } = await supabase.auth.getUser();
    // Protected Routes
    const protectedRoutes = [
        '/wardrobe',
        '/add-item',
        '/preferences',
        '/shop',
        '/onboarding'
    ];
    const isProtectedRoute = protectedRoutes.some((route)=>req.nextUrl.pathname.startsWith(route));
    if (!user && isProtectedRoute) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/auth/login';
        redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl);
    }
    return res;
}
const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */ '/((?!_next/static|_next/image|favicon.ico).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__1f49a58c._.js.map