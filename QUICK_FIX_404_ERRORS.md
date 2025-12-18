# Quick Fix: 404 Errors for Static Assets

## 🚨 Symptoms

Your deployed site shows these errors in the browser console:
```
GET /_next/static/chunks/*.css 404 (Not Found)
GET /_next/static/chunks/turbopack-*.js 404 (Not Found)
GET /_next/static/media/*.woff2 404 (Not Found)
```

Notice the word "**turbopack**" in the file names - this confirms the issue.

## ✅ Quick Solution (5 minutes)

### 1. Clear Build Cache in Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to: **Workers & Pages** → **personal-stylist**
3. Click: **Settings** → **Builds & deployments**
4. Scroll down to: **Build cache**
5. Click: **Clear build cache** → Confirm

### 2. Trigger Fresh Deployment

Option A: Retry deployment
1. Go to: **Deployments** tab
2. Click: **•••** (three dots) on latest deployment
3. Select: **Retry deployment**

Option B: Push empty commit
```bash
git commit --allow-empty -m "Force rebuild with webpack"
git push
```

### 3. Verify Build Uses Webpack

Watch the build logs. You MUST see:
```
✅ ▲ Next.js 16.0.10 (webpack)
```

NOT:
```
❌ ▲ Next.js 16.0.10 (turbopack)
```

### 4. Clear CDN Cache

1. In Cloudflare Dashboard: **Caching** → **Configuration**
2. Click: **Purge Everything** → Confirm
3. Wait: 30-60 seconds

### 5. Test

1. Open site in **incognito/private window**
2. Open DevTools (F12) → **Network** tab
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. Verify: All `/_next/static/*` files show **200 OK**
5. Verify: NO "turbopack" in file names

## 🔍 Still Not Working?

### Verify Your Configuration

Run locally:
```bash
npm run verify:config
```

This checks:
- ✓ Build scripts use `--webpack` flag
- ✓ Dependencies are correct
- ✓ next.config.ts is configured properly
- ✓ wrangler.toml has correct output directory
- ✓ Node version is 18+

### Check Cloudflare Pages Settings

**Build Configuration:**
- Build command: `npm run build:cloudflare`
- Build output directory: `.open-next`
- Framework preset: `Next.js`

**Environment Variables** (Production & Preview):
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `GEMINI_API_KEY` ✅
- `NODE_VERSION` = `20` ✅

## 📚 Detailed Guides

- **Step-by-step instructions**: [CLOUDFLARE_PAGES_REBUILD_GUIDE.md](./CLOUDFLARE_PAGES_REBUILD_GUIDE.md)
- **Technical explanation**: [NEXTJS_16_WEBPACK_FIX.md](./NEXTJS_16_WEBPACK_FIX.md)
- **Full deployment guide**: [CLOUDFLARE_DEPLOYMENT_GUIDE.md](./CLOUDFLARE_DEPLOYMENT_GUIDE.md)

## 💡 Why This Happens

- Next.js 16 defaults to **Turbopack** bundler
- `@opennextjs/cloudflare` only supports **Webpack** bundler
- The fix is already in the code (`--webpack` flag)
- But Cloudflare Pages was using a **cached build** from before the fix
- Clearing cache + fresh deployment = problem solved ✅

## 🎯 Key Points

1. **Configuration is already fixed** in this repo
2. **You just need a clean rebuild** on Cloudflare Pages
3. **Clear build cache** before redeploying
4. **Clear CDN cache** after successful deployment
5. **Verify "webpack"** appears in build logs (not "turbopack")

---

**Status after following this guide:**
- [ ] Build cache cleared
- [ ] Fresh deployment triggered
- [ ] Build logs show "webpack"
- [ ] CDN cache purged
- [ ] Site loads without 404 errors
- [ ] No "turbopack" in asset names
