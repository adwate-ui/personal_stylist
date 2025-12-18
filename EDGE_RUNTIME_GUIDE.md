# Edge Runtime Guide for Cloudflare Pages

## Overview

This application is architected to run on Cloudflare Pages using the **Edge Runtime**. This guide explains the technical requirements and architecture decisions that ensure robust compatibility.

## Critical: Why Edge Runtime?

**Cloudflare Pages ONLY supports Edge Runtime for Next.js server-side code.**

If you see this error:
```
ERROR Node.js middleware is not currently supported. Consider switching to Edge Middleware.
```

This means a server-side file is missing the Edge runtime declaration.

## What is Edge Runtime?

Edge Runtime is a lightweight JavaScript runtime that:
- ✅ Runs on Cloudflare's global network (low latency)
- ✅ Supports Web Standard APIs (fetch, Request, Response, etc.)
- ✅ Does NOT support Node.js APIs (fs, path, process, etc.)
- ✅ Perfect for middleware, proxies, and API routes

### Edge vs Node.js Runtime

| Feature | Edge Runtime | Node.js Runtime |
|---------|--------------|-----------------|
| **Cloudflare Pages** | ✅ Supported | ❌ Not Supported |
| **Speed** | Faster (lightweight) | Slower (full runtime) |
| **APIs** | Web Standards only | Full Node.js APIs |
| **Use Cases** | Middleware, API routes, SSR | Build tools, scripts |

## Architecture: Edge-First Design

### 1. Proxy (Middleware) - `src/proxy.ts`

**Purpose**: Request interception, authentication checks, redirects

**Key Requirements**:
```typescript
// REQUIRED: Edge runtime declaration
export const runtime = 'edge';

// MUST use NextRequest/NextResponse (Edge-compatible)
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  // Your logic here
}
```

**Why Edge Runtime?**
- Runs on every request before page rendering
- Needs to be fast and globally distributed
- Perfect for auth checks and redirects
- Cloudflare Pages requires it

### 2. API Routes - `src/app/api/**/route.ts`

**All API routes in this project declare Edge runtime:**

```typescript
export const runtime = 'edge';
```

**Examples**:
- ✅ `src/app/api/health/route.ts`
- ✅ `src/app/api/profile/route.ts`
- ✅ `src/app/api/wardrobe/*/route.ts`
- ✅ `src/app/api/style-dna/generate/route.ts`
- ✅ `src/app/api/shop/rate/route.ts`
- ✅ `src/app/auth/callback/route.ts`

### 3. Supabase Client - Edge Compatible

**Implementation**: `src/lib/supabase-server.ts`

We use two different Supabase client creation patterns:

#### For Middleware (Edge Runtime)
```typescript
import { NextRequest, NextResponse } from "next/server";

export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
    return createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll(); // Edge-compatible
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    request.cookies.set(name, value);
                    response.cookies.set(name, value, options);
                });
            },
        },
    });
}
```

#### For Server Components/Actions (Can use Node.js)
```typescript
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies();
    return createServerClient(supabaseUrl, supabaseKey, {
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
                    // Ignore errors in Server Components
                }
            },
        },
    });
}
```

**Key Difference**: Middleware client uses `NextRequest/NextResponse` cookies (Edge-compatible), while Server Component client uses `cookies()` from `next/headers` (may use Node.js runtime).

## Common Pitfalls and Solutions

### ❌ Problem: Missing Runtime Declaration

**Error**: `Node.js middleware is not currently supported`

**Cause**: File is missing `export const runtime = 'edge';`

**Solution**: Add to ANY file that:
- Intercepts requests (proxy.ts, middleware.ts)
- Is an API route handler (route.ts)
- Needs to run on Cloudflare Pages

### ❌ Problem: Using Node.js APIs in Edge Runtime

**Error**: `ReferenceError: fs is not defined` or similar

**Cause**: Trying to use Node.js modules in Edge runtime

**Forbidden in Edge Runtime**:
```typescript
import fs from 'fs';              // ❌ No filesystem access
import path from 'path';          // ❌ No path module
import { exec } from 'child_process'; // ❌ No child processes
const buffer = Buffer.from('...');    // ❌ No Buffer (use Uint8Array)
```

**Allowed in Edge Runtime**:
```typescript
import { NextRequest, NextResponse } from "next/server"; // ✅
const response = await fetch('https://api.example.com'); // ✅
const text = await response.text();                      // ✅
const data = JSON.parse(text);                           // ✅
```

### ❌ Problem: Using cookies() from next/headers in Middleware

**Error**: Empty or undefined cookies

**Cause**: `cookies()` from `next/headers` is not reliable in Edge runtime

**Solution**: Use `request.cookies` and `response.cookies` directly in middleware/proxy

```typescript
// ❌ Don't do this in proxy/middleware:
import { cookies } from 'next/headers';
const cookieStore = await cookies();

// ✅ Do this instead:
export async function proxy(req: NextRequest) {
  const cookieValue = req.cookies.get('sessionId');
  const res = NextResponse.next();
  res.cookies.set('newCookie', 'value');
  return res;
}
```

## Future-Proofing Checklist

When adding new features, ensure:

- [ ] **New API routes** declare `export const runtime = 'edge';`
- [ ] **New middleware/proxy** uses NextRequest/NextResponse cookies
- [ ] **No Node.js APIs** in server-side code (fs, path, child_process, etc.)
- [ ] **Supabase clients** use appropriate creation pattern:
  - Middleware → `createMiddlewareClient(req, res)`
  - Server Components → `createClient()`
  - Client Components → `supabase` from `@/lib/supabase`
- [ ] **Environment variables** are set in Cloudflare Pages before build
- [ ] **Test locally** with `npm run build:cloudflare` before deploying

## Testing Edge Compatibility

### Local Testing
```bash
# Build for Cloudflare
npm run build:cloudflare

# Preview locally
npm run preview
```

### Production Deployment
```bash
# Deploy directly to Cloudflare
npm run deploy

# Or push to git for automatic deployment
git push origin main
```

## References

- [Next.js Edge Runtime Documentation](https://nextjs.org/docs/app/api-reference/edge)
- [Next.js Proxy (Middleware) Documentation](https://nextjs.org/docs/app/getting-started/proxy)
- [Cloudflare Pages Next.js Guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [OpenNext Cloudflare Documentation](https://opennext.js.org/cloudflare)
- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side)

## Summary

This application is **Edge-first** by design:
- ✅ All server-side code runs on Edge Runtime
- ✅ Supabase clients are Edge-compatible
- ✅ No Node.js dependencies in runtime code
- ✅ Optimized for Cloudflare Pages global network
- ✅ Future features must follow Edge runtime constraints

**The connection between Supabase and Cloudflare is robust because:**
1. Edge runtime ensures fast, globally distributed auth checks
2. Cookie handling uses Edge-compatible APIs
3. All API routes explicitly declare Edge runtime
4. No hidden Node.js dependencies that could break on deployment
