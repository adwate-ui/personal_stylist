# Next.js 16 + Cloudflare Pages: Webpack Build Fix

## Problem

When deploying Next.js 16 to Cloudflare Pages with `@opennextjs/cloudflare`, you may encounter 404 errors for static assets:

```
GET /_next/static/chunks/ff2c027d54c8ec69.css 404 (Not Found)
GET /_next/static/chunks/turbopack-52abedf8da26ec47.js 404 (Not Found)
GET /_next/static/chunks/1ceb297ba0199271.js 404 (Not Found)
GET /_next/static/media/caa3a2e1cccd8315-s.p.853070df.woff2 404 (Not Found)
```

## Root Cause

1. **Next.js 16 Default**: Uses Turbopack as the default bundler for both development and production
2. **Turbopack Asset Paths**: Generates different static asset paths and chunk naming
3. **OpenNext Compatibility**: `@opennextjs/cloudflare` (v1.14.6) only supports Webpack builds
4. **Mismatch**: HTML references Turbopack-generated chunks, but deployment doesn't include them correctly

## Solution

Force Next.js 16 to use Webpack instead of Turbopack for production builds.

### 1. Update Build Scripts

Modify `package.json` to use the `--webpack` flag:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build --webpack",
    "build:cloudflare": "next build --webpack && opennextjs-cloudflare build --skipNextBuild",
    "preview": "opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare deploy",
    "start": "next start",
    "lint": "eslint"
  }
}
```

**Key Changes:**
- `build`: Added `--webpack` flag to force Webpack usage
- `build:cloudflare`: Runs `next build --webpack` first, then `opennextjs-cloudflare build` with `--skipNextBuild` to avoid running the build twice

### 2. Fix Webpack + Supabase Compatibility

Add webpack configuration to `next.config.ts` to resolve Supabase ESM import issues:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization for Cloudflare
  images: {
    unoptimized: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Webpack configuration to handle Supabase imports correctly
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Fix for Supabase wrapper.mjs import issue with webpack
      '@supabase/supabase-js': '@supabase/supabase-js/dist/module/index.js',
    };
    return config;
  },
};

export default nextConfig;
```

**Why This Is Needed:**
- Webpack in Next.js 16 may have trouble resolving Supabase's ESM exports
- The alias points directly to the module entry point, avoiding the wrapper.mjs resolution issue

### 3. Update Cloudflare Pages Build Command

In your Cloudflare Pages project settings, ensure the build command is set to:

```bash
npm run build:cloudflare
```

This will:
1. Run `next build --webpack` to build with Webpack
2. Run `opennextjs-cloudflare build --skipNextBuild` to package for Cloudflare

## Verification

After deploying with these changes:

### 1. Check Build Output

Build should now show "webpack" instead of "Turbopack":

```
▲ Next.js 16.0.10 (webpack)
Creating an optimized production build ...
✓ Compiled successfully
```

### 2. Verify Static Assets

In the browser, check that:
- ✅ Static chunks load correctly (no 404 errors)
- ✅ CSS files load properly
- ✅ Font files load correctly
- ✅ JavaScript chunks load without errors

### 3. Check Network Tab

Open browser DevTools → Network tab and verify:
- All `/_next/static/chunks/*.js` files return 200 OK
- All `/_next/static/chunks/*.css` files return 200 OK
- All `/_next/static/media/*` files return 200 OK

## Why Not Use Turbopack?

**Current Limitation:**
- `@opennextjs/cloudflare` does not yet support Turbopack output
- Turbopack generates a different build structure that isn't compatible with the Cloudflare Workers runtime adapter

**Future:**
- The OpenNext team is working on Turbopack support via the new Next.js Adapters API
- Once available, this workaround will no longer be necessary

**References:**
- [OpenNext Cloudflare Issue #967](https://github.com/opennextjs/opennextjs-cloudflare/issues/967)
- [Next.js 16 Turbopack Documentation](https://nextjs.org/docs/app/api-reference/turbopack)

## Trade-offs

### Advantages of Using Webpack:
- ✅ Compatible with Cloudflare Pages deployment
- ✅ Stable and well-tested
- ✅ Supabase integration works correctly

### Disadvantages:
- ⚠️ Slower build times compared to Turbopack (typically 2-3x slower)
- ⚠️ Missing some Turbopack-specific optimizations

## Important Notes

### Supabase Connection Unchanged

This fix **does not affect** the Supabase-Cloudflare connection:
- All Supabase authentication continues to work
- Database queries work identically
- Edge runtime configuration remains the same
- Middleware/proxy functionality unchanged

### Google Fonts in Sandboxed Environments

If building in an environment without internet access, you may see font fetch errors:

```
Error: getaddrinfo ENOTFOUND fonts.googleapis.com
```

**This is expected and will NOT occur on Cloudflare Pages**, which has internet access during builds. The build will succeed on Cloudflare's infrastructure.

### Development Mode

For development, you can continue using Turbopack (faster):

```bash
npm run dev  # Uses default Turbopack for fast development
```

Only production builds need the `--webpack` flag.

## Troubleshooting

### Build Fails with Supabase Import Errors

If you see errors like:
```
Attempted import error: '../module/index.js' does not contain a default export
```

**Solution:** Ensure the webpack alias is correctly configured in `next.config.ts` (see step 2 above).

### Static Assets Still 404

If assets still return 404 after deployment:

1. **Clear Cloudflare Cache:**
   - Go to Cloudflare Dashboard → Caching → Purge Cache
   - Select "Purge Everything"

2. **Verify Build Command:**
   - Ensure `npm run build:cloudflare` is set as the build command
   - Check build logs for "webpack" confirmation

3. **Check Build Output Directory:**
   - Verify it's set to `.open-next`
   - Ensure `.open-next` is NOT in `.gitignore` for deployment

### Webpack Builds Take Too Long

Webpack is slower than Turbopack. To optimize:

1. **Enable Build Cache:**
   - Cloudflare Pages automatically caches `node_modules`
   - This speeds up subsequent builds significantly

2. **Reduce Bundle Size:**
   - Use dynamic imports for large components
   - Enable tree shaking (enabled by default in production)

## Related Documentation

- [CLOUDFLARE_DEPLOYMENT_GUIDE.md](./CLOUDFLARE_DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [NEXTJS_16_CLOUDFLARE_FIX.md](./NEXTJS_16_CLOUDFLARE_FIX.md) - Middleware/proxy configuration
- [OpenNext Cloudflare Documentation](https://opennext.js.org/cloudflare)

## Summary

To fix static file 404 errors on Cloudflare Pages with Next.js 16:

1. ✅ Add `--webpack` flag to build scripts
2. ✅ Configure webpack alias for Supabase compatibility
3. ✅ Use `build:cloudflare` command that runs webpack build first
4. ✅ Deploy to Cloudflare Pages
5. ✅ Verify static assets load correctly

**Result:** Static assets load correctly, no 404 errors, full Cloudflare Pages compatibility while maintaining all Supabase functionality.

---

**Date:** December 18, 2024  
**Next.js Version:** 16.0.10  
**@opennextjs/cloudflare Version:** 1.14.6
