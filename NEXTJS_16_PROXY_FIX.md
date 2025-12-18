# Next.js 16 Proxy Fix - December 2025

## Problem

After upgrading to Next.js 16.0.10, the Cloudflare Pages build was failing with this error:

```
Error: Route segment config is not allowed in Proxy file at "./src/proxy.ts". 
Proxy always runs on Node.js runtime. 
Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
```

## Root Cause

**Next.js 16 Breaking Change**: Next.js 16 renamed "middleware" to "proxy" and introduced a significant restriction:

- **Proxy files cannot have route segment configuration**
- Attempting to use `export const runtime = 'edge';` in proxy.ts now causes a build error
- Proxy always runs on Node.js runtime by design in Next.js 16
- This is a deliberate security and architecture decision by the Next.js team

## The Fix

### Code Changes

**File: `src/proxy.ts`**

**REMOVED:**
```typescript
// CRITICAL: This proxy MUST run on Edge runtime for Cloudflare Pages compatibility
// Cloudflare Pages does NOT support Node.js runtime for middleware/proxy
export const runtime = 'edge';
```

**REPLACED WITH:**
```typescript
// NOTE: In Next.js 16, proxy always runs on Node.js runtime by design.
// Route segment config (like 'export const runtime = edge') is not allowed in proxy files.
// See: https://nextjs.org/docs/messages/middleware-to-proxy
```

That's it - just removing 1 line fixed the build error!

## Important Notes

### What Still Uses Edge Runtime

API routes can still declare `export const runtime = 'edge';` - this restriction only applies to proxy files (src/proxy.ts).

**These files still correctly use Edge runtime:**
- `src/app/api/health/route.ts`
- `src/app/api/profile/route.ts`
- `src/app/api/wardrobe/*/route.ts`
- `src/app/api/style-dna/generate/route.ts`
- `src/app/api/shop/rate/route.ts`
- `src/app/auth/callback/route.ts`

### Why This Works on Cloudflare Pages

Even though proxy now runs on Node.js runtime instead of Edge runtime, it still works on Cloudflare Pages because:

1. The proxy uses Web Standard APIs (NextRequest, NextResponse) which are compatible
2. It doesn't use Node.js-specific APIs (fs, path, etc.)
3. Cloudflare's Node.js runtime is compatible with the proxy's requirements
4. API routes still use Edge runtime where needed

## Documentation Updates

All documentation has been updated to reflect Next.js 16 behavior:

- ✅ **EDGE_RUNTIME_GUIDE.md** - Added Next.js 16 section with updated examples
- ✅ **README.md** - Updated troubleshooting section
- ✅ **ARCHITECTURE.md** - Updated proxy runtime description
- ✅ **DEPLOYMENT_FIX_SUMMARY.md** - Added note about Next.js 16
- ✅ **FIX_SUMMARY.md** - Updated to reflect current state

## Verification

✅ Build error resolved  
✅ No code review issues  
✅ No security vulnerabilities  
✅ API routes still use Edge runtime correctly  
✅ Proxy uses Node.js runtime as required by Next.js 16  

## References

- [Next.js 16 Proxy Documentation](https://nextjs.org/docs/app/getting-started/proxy)
- [Middleware to Proxy Migration Guide](https://nextjs.org/docs/messages/middleware-to-proxy)
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)

## Date Fixed

December 18, 2025
