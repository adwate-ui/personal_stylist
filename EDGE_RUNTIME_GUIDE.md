# Runtime Guide for Cloudflare Pages with OpenNext

## Overview

This application is deployed to Cloudflare Pages using the **@opennextjs/cloudflare** adapter, which uses **Node.js runtime** (via `nodejs_compat` compatibility flag), NOT Edge runtime. This guide explains the technical requirements and architecture decisions.

**⚠️ CRITICAL: Do NOT Use Edge Runtime with OpenNext Cloudflare**

## Why Node.js Runtime?

**OpenNext Cloudflare adapter requires Node.js runtime for full Next.js compatibility.**

When using `@opennextjs/cloudflare`, API routes should **NOT** have `export const runtime = 'edge'` declarations.

If you see this error:
```
app/api/*/route cannot use the edge runtime.
OpenNext requires edge runtime function to be defined in a separate function.
```

This means you need to **remove** `export const runtime = 'edge'` from your API routes.

## Node.js vs Edge Runtime

| Feature | Node.js Runtime (OpenNext) | Edge Runtime (next-on-pages) |
|---------|----------------------------|------------------------------|
| **Adapter** | @opennextjs/cloudflare | @cloudflare/next-on-pages |
| **Node.js APIs** | ✅ Full Support | ❌ Limited |
| **Next.js Features** | ✅ SSR, ISR, Middleware, etc. | ⚠️ Reduced feature set |
| **API Routes** | ✅ All features | ⚠️ Limited APIs |
| **Configuration** | wrangler.toml with nodejs_compat | Different setup |

## Architecture: Node.js Runtime Design

### 1. Proxy (Middleware) - `src/proxy.ts`

**Purpose**: Request interception, authentication checks, redirects

**IMPORTANT - Next.js 16 Change**: 
In Next.js 16, middleware has been renamed to "proxy" and **proxy files cannot have route segment config**. The proxy always runs on Node.js runtime by design, and you cannot specify `export const runtime = 'edge';` in the proxy file.

**Key Requirements**:
```typescript
// NOTE: In Next.js 16, DO NOT add 'export const runtime = edge' here
// Proxy files cannot have route segment config
// See: https://nextjs.org/docs/messages/middleware-to-proxy

// MUST use NextRequest/NextResponse (Edge-compatible)
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  // Your logic here
}
```

**Why Proxy Uses Node.js Runtime in Next.js 16:**
- Next.js 16 enforces Node.js runtime for proxy to improve security and consistency
- Proxy still runs efficiently as a backend request interceptor
- API routes can still use Edge runtime if needed
- This is a deliberate design decision by the Next.js team

### 2. API Routes - `src/app/api/**/route.ts`

**IMPORTANT: API routes DO NOT declare runtime (defaults to Node.js):**

```typescript
// ❌ DO NOT DO THIS with OpenNext Cloudflare:
// export const runtime = 'edge';

// ✅ Correct - no runtime declaration (uses Node.js by default)
export async function GET(request: Request) {
  // Your handler code
}
```

**Examples**:
- ✅ `src/app/api/health/route.ts` - No runtime declaration
- ✅ `src/app/api/profile/route.ts` - No runtime declaration
- ✅ `src/app/api/wardrobe/*/route.ts` - No runtime declaration
- ✅ `src/app/api/style-dna/generate/route.ts` - No runtime declaration
- ✅ `src/app/api/shop/rate/route.ts` - No runtime declaration
- ✅ `src/app/auth/callback/route.ts` - No runtime declaration

### 3. Supabase Client - Node.js Compatible

**Implementation**: `src/lib/supabase-server.ts`

We use two different Supabase client creation patterns:

#### For Middleware (Uses NextRequest/NextResponse)
```typescript
import { NextRequest, NextResponse } from "next/server";

export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
    return createServerClient(supabaseUrl, supabaseKey, {
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
    });
}
```

#### For Server Components/Actions and API Routes
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

**Key Difference**: Middleware client uses `NextRequest/NextResponse` cookies for request interception, while Server Component/API client uses `cookies()` from `next/headers`.

## Common Pitfalls and Solutions

### ❌ Problem: Using Edge Runtime with OpenNext Cloudflare

**Error**: `app/api/*/route cannot use the edge runtime. OpenNext requires edge runtime function to be defined in a separate function.`

**Cause**: API routes have `export const runtime = 'edge';` declaration

**Solution**: **Remove** all `export const runtime = 'edge';` declarations from API routes. OpenNext Cloudflare uses Node.js runtime by default.

```typescript
// ❌ WRONG - Do NOT do this with OpenNext Cloudflare:
export const runtime = 'edge';
export async function GET(request: Request) { ... }

// ✅ CORRECT - No runtime declaration:
export async function GET(request: Request) { ... }
```

### ❌ Problem: Route Segment Config in Proxy File (Next.js 16)

**Error**: `Route segment config is not allowed in Proxy file at "./src/proxy.ts". Proxy always runs on Node.js runtime.`

**Cause**: Trying to use `export const runtime = 'edge';` in a proxy.ts file

**Solution**: Remove the runtime declaration from proxy.ts. In Next.js 16, proxy files cannot have route segment config. The proxy automatically runs on Node.js runtime.

### ✅ Node.js APIs Available with OpenNext Cloudflare

With Node.js runtime (nodejs_compat), you have access to many Node.js APIs:

```typescript
// ✅ Available in Node.js runtime:
import { Buffer } from 'buffer';              // ✅ Buffer available
import crypto from 'crypto';                  // ✅ Crypto available
import { NextRequest, NextResponse } from "next/server"; // ✅
const response = await fetch('https://api.example.com'); // ✅
const text = await response.text();           // ✅
const data = JSON.parse(text);                // ✅
```

**Note**: Some Node.js APIs like `fs` and `child_process` are still not available in Workers environment.

### ❌ Problem: Using cookies() from next/headers in Middleware

**Error**: Empty or undefined cookies

**Cause**: Middleware should use request/response cookies directly

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

- [ ] **New API routes** DO NOT declare `export const runtime = 'edge';` (use Node.js runtime by default)
- [ ] **New middleware/proxy** uses NextRequest/NextResponse cookies
- [ ] **Supabase clients** use appropriate creation pattern:
  - Middleware → `createMiddlewareClient(req, res)`
  - Server Components/API Routes → `createClient()`
  - Client Components → `supabase` from `@/lib/supabase`
- [ ] **Environment variables** are set in Cloudflare Pages before build
- [ ] **Test locally** with `npm run build:cloudflare` before deploying
- [ ] **wrangler.toml** has `nodejs_compat` in compatibility_flags

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

This application uses **OpenNext Cloudflare with Node.js runtime**:
- ✅ All server-side code runs on Node.js runtime (via nodejs_compat)
- ✅ No `export const runtime = 'edge'` declarations in API routes
- ✅ Full Next.js feature support (SSR, ISR, middleware, etc.)
- ✅ Optimized for Cloudflare Workers with Node.js compatibility
- ✅ Future features must follow OpenNext Cloudflare conventions

**The connection between Supabase and Cloudflare is robust because:**
1. Node.js runtime ensures full API compatibility
2. Cookie handling works reliably with Next.js patterns
3. All API routes use default Node.js runtime
4. OpenNext Cloudflare adapter handles the infrastructure
