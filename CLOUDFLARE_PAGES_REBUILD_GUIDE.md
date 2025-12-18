# Cloudflare Pages Rebuild Guide - Fix 404 Static Asset Errors

## Problem

You're experiencing 404 errors for static assets like:
```
GET /_next/static/chunks/ff2c027d54c8ec69.css 404 (Not Found)
GET /_next/static/media/caa3a2e1cccd8315-s.p.853070df.woff2 404 (Not Found)
GET /_next/static/chunks/turbopack-*.js 404 (Not Found)
```

The presence of "turbopack" in the file names indicates that your deployed site was built with Turbopack instead of Webpack.

## Root Cause

Despite having the `--webpack` flag in the build command, your Cloudflare Pages deployment may be using:
1. A cached build from before the webpack fix was applied
2. Outdated build configuration settings
3. A stale CDN cache serving old assets

## Solution: Force a Clean Rebuild

### Step 1: Verify Build Configuration in Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Workers & Pages** → Select your project (`personal-stylist`)
3. Click on **Settings** → **Builds & deployments**
4. Verify the following settings:

   | Setting | Required Value |
   |---------|----------------|
   | **Build command** | `npm run build:cloudflare` |
   | **Build output directory** | `.open-next` |
   | **Root directory** | (leave empty) |

5. If any settings are incorrect, update them and click **Save**

### Step 2: Verify Environment Variables

1. Still in **Settings**, click on **Environment variables**
2. Ensure these are set for **both Production and Preview**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `NODE_VERSION` (set to `20`)

3. If any are missing, add them and click **Save**

### Step 3: Clear Build Cache

This is the **CRITICAL** step to force a clean rebuild:

1. In Cloudflare Dashboard, go to **Workers & Pages** → Your project
2. Click on **Settings** → **Builds & deployments**
3. Scroll down to **Build cache**
4. Click **Clear build cache**
5. Confirm the action

### Step 4: Trigger a New Deployment

Option A: **Retry Latest Deployment** (Recommended)

1. Go to **Deployments** tab
2. Find the most recent deployment
3. Click the **•••** (three dots) menu
4. Select **Retry deployment**
5. This will trigger a fresh build with cleared cache

Option B: **Push a New Commit**

If retry doesn't work:
```bash
# Make a trivial change to force a rebuild
git commit --allow-empty -m "Force rebuild with webpack"
git push
```

### Step 5: Monitor the Build

1. Watch the build logs in real-time
2. **VERIFY** you see this in the build output:
   ```
   ▲ Next.js 16.0.10 (webpack)
   ```
   **NOT:**
   ```
   ▲ Next.js 16.0.10 (turbopack)
   ```

3. The build should take 2-3 minutes (Webpack builds are slower than Turbopack)
4. Wait for "Success: Deployment complete!"

### Step 6: Clear Cloudflare CDN Cache

Even after a successful rebuild, the old assets might be cached by Cloudflare's CDN:

1. In Cloudflare Dashboard, go to **Caching** → **Configuration**
2. Click **Purge Everything**
3. Confirm the action
4. Wait 30-60 seconds for the purge to complete

### Step 7: Verify the Fix

1. Open your deployed site in a **new incognito/private window**
2. Open Browser Developer Tools (F12)
3. Go to the **Network** tab
4. Refresh the page (Ctrl+Shift+R / Cmd+Shift+R)
5. **Check for 200 OK responses** for all static assets:
   ```
   ✅ /_next/static/chunks/*.css - 200 OK
   ✅ /_next/static/chunks/*.js - 200 OK
   ✅ /_next/static/media/*.woff2 - 200 OK
   ```
6. **Verify NO "turbopack" in file names** - Webpack-built assets have different naming patterns
7. Check the **Console** tab - should be no 404 errors

## Alternative: Deploy from Local Machine

If the above steps don't work, you can deploy directly from your local machine:

### Prerequisites
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
- Cloudflare account API token

### Steps

1. **Install Wrangler** (if not already installed):
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Build Locally**:
   ```bash
   npm install
   npm run build:cloudflare
   ```
   
   This will create the `.open-next` directory with the build output.

4. **Deploy**:
   ```bash
   npx wrangler pages deploy .open-next --project-name=personal-stylist
   ```

5. **Verify** the deployment as described in Step 7 above.

## Troubleshooting

### Build Still Shows Turbopack

**Check:**
1. Ensure the latest code is deployed (check git commit hash in Cloudflare deployment logs)
2. Verify `package.json` contains:
   ```json
   "build": "next build --webpack",
   "build:cloudflare": "next build --webpack && opennextjs-cloudflare build --skipNextBuild"
   ```
3. Clear build cache again and retry

### Static Assets Still Return 404

**Actions:**
1. **Verify build output directory** is `.open-next` (not `.next`)
2. **Check build logs** for errors during the `opennextjs-cloudflare build` step
3. **Inspect the .open-next directory structure** in build logs (should contain `_worker.js` and `static` folder)
4. **Double-check CDN cache** was purged

### Build Fails with Font Errors

If you see errors like:
```
Failed to fetch `Geist` from Google Fonts
```

This is a **network connectivity issue** during build, not related to the Turbopack problem. Options:

1. **Retry the build** - Cloudflare Pages has network access, local builds might not
2. **Use local fonts** instead of Google Fonts (if issue persists)

### Browser Still Shows Old Assets After Clearing Cache

**Try:**
1. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. Clear browser cache completely
3. Try a different browser
4. Wait 5-10 minutes for CDN propagation
5. Check from a different network/device

## Verification Checklist

Before considering the issue resolved, verify:

- [ ] Build logs show "Next.js 16.0.10 (webpack)" not Turbopack
- [ ] Build completes successfully with no errors
- [ ] Build cache was cleared in Cloudflare Pages
- [ ] CDN cache was purged
- [ ] Site opens without errors
- [ ] No 404 errors in browser Network tab
- [ ] No "turbopack" in static asset file names
- [ ] CSS styles load correctly
- [ ] Fonts display correctly
- [ ] JavaScript functionality works
- [ ] Tested in incognito/private window
- [ ] Tested on mobile device (if applicable)

## Support

If you've followed all steps and still experience issues:

1. Check [OpenNext Cloudflare Issues](https://github.com/opennextjs/opennextjs-cloudflare/issues)
2. Verify [Next.js 16 compatibility](https://nextjs.org/docs/messages/webpack-must-be-used-with-app-router)
3. Review [Cloudflare Pages Troubleshooting](https://developers.cloudflare.com/pages/platform/known-issues/)

## Summary

The key to fixing 404 errors for static assets is ensuring:
1. ✅ Build command uses `--webpack` flag
2. ✅ Build cache is cleared
3. ✅ CDN cache is purged
4. ✅ Fresh deployment is triggered
5. ✅ Build logs confirm webpack (not Turbopack) is used

After following these steps, your site should serve webpack-generated assets that are compatible with `@opennextjs/cloudflare`.
