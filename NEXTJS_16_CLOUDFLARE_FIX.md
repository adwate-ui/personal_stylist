# Next.js 16 + Cloudflare Pages: Middleware Fix

## Problem

When deploying to Cloudflare Pages with Next.js 16 and @opennextjs/cloudflare, the build fails with:

```
ERROR Node.js middleware is not currently supported. Consider switching to Edge Middleware.
```

## Root Cause

This is a compatibility issue between Next.js 16 and @opennextjs/cloudflare (v1.14.6):

1. **Next.js 16 Change**: Renamed `middleware.ts` to `proxy.ts` and prohibits `export const runtime = 'edge'` in proxy files
2. **Cloudflare Requirement**: Requires Edge runtime for middleware/proxy functionality
3. **OpenNext Limitation**: @opennextjs/cloudflare doesn't yet fully support Next.js 16's proxy.ts convention

## Solution

**Use the old middleware.ts convention with Edge runtime declaration:**

1. Keep the file named `middleware.ts` (in the project root, not in src/)
2. Add `export const runtime = 'edge';` declaration
3. Use `middleware` function name (not `proxy`)

### File Location

✅ **Correct**: `/middleware.ts` (project root)  
❌ **Incorrect**: `/src/middleware.ts` (treated as a page route by Next.js 16)

### Complete Implementation

```typescript
import { createMiddlewareClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// CRITICAL: This middleware MUST run on Edge runtime for Cloudflare Pages compatibility
// Cloudflare Pages does NOT support Node.js runtime for middleware
// Even though Next.js 16 renamed this to "proxy", we keep using middleware.ts
// because @opennextjs/cloudflare doesn't yet fully support the proxy.ts convention
export const runtime = 'edge';

export async function middleware(req: NextRequest) {
    // Skip middleware for RSC (React Server Components) requests
    if (req.nextUrl.searchParams.has('_rsc')) {
        return NextResponse.next();
    }

    const res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    });

    const supabase = createMiddlewareClient(req, res);
    const { data: { user } } = await supabase.auth.getUser();

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
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
```

## Why This Works

1. **Middleware File Location**: Next.js recognizes `middleware.ts` in the project root as middleware
2. **Edge Runtime**: `export const runtime = 'edge'` makes it compatible with Cloudflare
3. **OpenNext Compatibility**: @opennextjs/cloudflare works with the middleware.ts convention
4. **Function Name**: Using `middleware` instead of `proxy` is compatible with both Next.js and OpenNext

## Trade-offs

### Deprecation Warning
You will see this warning during build:
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**This warning can be ignored** because:
- It doesn't prevent the build from succeeding
- Using `proxy.ts` causes runtime errors on Cloudflare Pages
- This is a temporary workaround until @opennextjs/cloudflare adds full Next.js 16 support

### When to Migrate to proxy.ts

Wait for @opennextjs/cloudflare to release a version that:
1. Fully supports Next.js 16's proxy.ts convention
2. Allows Edge runtime without route segment config errors
3. Documents the migration path from middleware.ts

Check the [@opennextjs/cloudflare releases](https://github.com/opennextjs-cloudflare/opennextjs-cloudflare/releases) for updates.

## Verification

After applying this fix, the build should complete successfully:

```bash
npm run build:cloudflare
```

Expected output:
```
✓ Generating static pages using 3 workers (11/11)
ƒ Proxy (Middleware)
OpenNext build complete.
```

## API Routes Still Use Edge Runtime

All API routes should continue to declare Edge runtime explicitly:

```typescript
// In API route files (src/app/api/**/route.ts)
export const runtime = 'edge';
```

This is still required and works correctly in Next.js 16.

## Summary

- ✅ Use `middleware.ts` in project root
- ✅ Add `export const runtime = 'edge';`
- ✅ Use `middleware` function name
- ✅ Ignore deprecation warning about middleware → proxy
- ✅ API routes continue using Edge runtime normally
- ⏳ Wait for @opennextjs/cloudflare to support proxy.ts before migrating

## Related Files

- `/middleware.ts` - Main middleware file with Edge runtime
- All files in `src/app/api/**/route.ts` - API routes with Edge runtime
- `/src/lib/supabase-server.ts` - Supabase client creation for middleware

## Date

December 18, 2025
