# OpenNext Cloudflare Runtime Fix

## Problem

The build was failing on Cloudflare Pages with the error:

```
Error: 
--------------------------------------------------------------------------------
app/api/health/route cannot use the edge runtime.
OpenNext requires edge runtime function to be defined in a separate function.
See the docs for more information on how to bundle edge runtime functions.
--------------------------------------------------------------------------------
```

## Root Cause

The application was using `export const runtime = 'edge';` in all API routes, but **OpenNext Cloudflare adapter does NOT support Edge runtime declarations**. 

OpenNext Cloudflare is designed to use **Node.js runtime** (via the `nodejs_compat` compatibility flag in wrangler.toml), which provides:
- Full Node.js API compatibility
- Better support for Next.js features (SSR, ISR, middleware, etc.)
- More comprehensive API route functionality

## Solution

**Remove `export const runtime = 'edge';` from all API routes.**

### Before (Incorrect):
```typescript
// ❌ This causes build errors with OpenNext Cloudflare
export const runtime = 'edge';

export async function GET(request: Request) {
    // handler code
}
```

### After (Correct):
```typescript
// ✅ No runtime declaration - uses Node.js by default
export async function GET(request: Request) {
    // handler code
}
```

## Files Changed

Removed `export const runtime = 'edge';` from:

1. `src/app/api/health/route.ts`
2. `src/app/api/profile/route.ts`
3. `src/app/api/style-dna/generate/route.ts`
4. `src/app/api/wardrobe/add/route.ts`
5. `src/app/api/wardrobe/analyze/route.ts`
6. `src/app/api/wardrobe/link/route.ts`
7. `src/app/api/wardrobe/list/route.ts`
8. `src/app/api/shop/rate/route.ts`
9. `src/app/auth/callback/route.ts`

## Documentation Updated

- **EDGE_RUNTIME_GUIDE.md**: Now correctly titled "Runtime Guide for Cloudflare Pages with OpenNext" and explains Node.js runtime usage
- **NEXTJS_16_CLOUDFLARE_FIX.md**: Updated API routes section to clarify that runtime should NOT be declared

## Key Learnings

### OpenNext Cloudflare vs next-on-pages

| Feature | @opennextjs/cloudflare | @cloudflare/next-on-pages |
|---------|------------------------|---------------------------|
| **Runtime** | Node.js (nodejs_compat) | Edge Runtime |
| **API Routes** | No runtime declaration | Can use edge runtime |
| **Node.js APIs** | ✅ Available | ❌ Limited |
| **Next.js Features** | ✅ Full support | ⚠️ Limited |

### Configuration

Our `wrangler.toml` is correctly configured:

```toml
compatibility_flags = ["nodejs_compat"]
```

This enables Node.js runtime in Cloudflare Workers, which is what OpenNext Cloudflare requires.

## Verification

After this fix:
- ✅ The build progresses past the edge runtime error
- ✅ OpenNext bundling process can proceed
- ✅ API routes will run on Node.js runtime in Cloudflare Workers
- ✅ Full Next.js functionality is maintained

## Future Development

When adding new API routes:

1. **DO NOT** add `export const runtime = 'edge';`
2. Let the route use the default Node.js runtime
3. Refer to EDGE_RUNTIME_GUIDE.md for best practices
4. Test with `npm run build:cloudflare` before deploying

## References

- [OpenNext Cloudflare Documentation](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Node.js Compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
- [Next.js Runtime Options](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)

## Date

December 18, 2024
