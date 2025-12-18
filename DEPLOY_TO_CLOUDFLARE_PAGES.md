# Deploy to Cloudflare Pages - Step by Step Guide

## Current Status

✅ **Your code is already configured correctly** for Cloudflare Pages deployment.

The 404 error you're experiencing is due to a **cached build** on Cloudflare Pages, not a code issue.

## Quick Summary

The issue: `ERR_HTTP_RESPONSE_CODE_FAILURE 404 (Not Found)` at https://personal-stylist.pages.dev/

The fix: Clear Cloudflare's build cache and trigger a clean deployment.

## Prerequisites

Before you begin, ensure you have:

- [x] A Cloudflare account with Pages enabled
- [x] A Supabase project set up
- [x] Google Gemini API key
- [x] This repository pushed to GitHub

## Step-by-Step Deployment

### 1. Verify Your Local Configuration ✅

Run this command to confirm everything is set up correctly:

```bash
npm run verify:config
```

Expected output:
```
✅ Configuration check PASSED
   Your build configuration is correct for Cloudflare Pages deployment
```

If you see errors, fix them before proceeding.

### 2. Set Up Cloudflare Pages Environment Variables

**IMPORTANT**: These must be set BEFORE the build runs, or your app will not work.

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Workers & Pages** → **personal-stylist**
3. Click **Settings** → **Environment variables**
4. Add these variables for **BOTH Production and Preview**:

| Variable | Value | Where to Get It | Encrypt? |
|----------|-------|----------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase Dashboard → Settings → API | No |
| `GEMINI_API_KEY` | Your Google Gemini API key | [Google AI Studio](https://aistudio.google.com/app/apikey) | ✅ Yes |
| `NODE_VERSION` | `20` | Just type `20` | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (optional) | Supabase Dashboard → Settings → API | ✅ Yes |

5. Click **Save** after adding each variable

### 3. Configure Build Settings

1. Go to **Settings** → **Builds & deployments**
2. Set these values:

| Setting | Value |
|---------|-------|
| **Framework preset** | Next.js |
| **Build command** | `npm run build:cloudflare` |
| **Build output directory** | `.open-next` |
| **Root directory** | (leave empty) |

3. Click **Save**

### 4. Clear Build Cache (CRITICAL!)

**This is the most important step to fix the 404 error.**

1. Still in **Settings** → **Builds & deployments**
2. Scroll down to **Build cache** section
3. Click **Clear build cache**
4. Confirm the action

### 5. Trigger a New Deployment

You have two options:

**Option A: Retry Latest Deployment (Recommended)**
1. Go to **Deployments** tab
2. Find the most recent deployment
3. Click **•••** (three dots)
4. Select **Retry deployment**

**Option B: Push New Code**
```bash
git commit --allow-empty -m "Trigger clean rebuild"
git push
```

### 6. Monitor the Build

Watch the build logs in real-time. **CRITICAL CHECK**:

✅ **SUCCESS** - You should see:
```
▲ Next.js 16.0.10 (webpack)
```

❌ **FAILURE** - If you see:
```
▲ Next.js 16.0.10 (turbopack)
```

This means the cache wasn't cleared properly. Go back to Step 4 and try again.

### 7. Wait for Build to Complete

The build will take 2-3 minutes (webpack is slower than turbopack, but necessary for Cloudflare Pages).

Watch for:
```
✓ Compiled successfully
✓ Build completed
✓ Deployment completed
```

### 8. Clear CDN Cache

After successful deployment:

1. In Cloudflare Dashboard, go to **Caching** → **Configuration**
2. Click **Purge Everything**
3. Confirm the action
4. Wait 30-60 seconds for propagation

### 9. Verify the Deployment

1. Open your site in an **incognito/private window**: https://personal-stylist.pages.dev/
2. Open DevTools (F12) → **Network** tab
3. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

**Check that:**
- ✅ Root URL returns **200 OK** (not 404)
- ✅ Page loads correctly
- ✅ All `/_next/static/*` files return **200 OK**
- ✅ NO "turbopack" in file names
- ✅ No errors in Console tab

### 10. Configure Supabase Authentication

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Cloudflare Pages URL to **Redirect URLs**:
   ```
   https://personal-stylist.pages.dev/auth/callback
   ```
4. Set **Site URL** to:
   ```
   https://personal-stylist.pages.dev
   ```
5. Click **Save**

## Troubleshooting

### Build Still Shows Turbopack

If the build logs still show turbopack:

1. Double-check that build cache was cleared (Step 4)
2. Wait a few minutes for the cache to fully clear
3. Try clearing cache again and retrying deployment
4. As a last resort, try disconnecting and reconnecting the GitHub repository

### Root URL Still Returns 404

1. **Check build logs** - Look for any errors during the build
2. **Verify environment variables** - Make sure all required variables are set
3. **Check build output directory** - Should be `.open-next`
4. **Try local build** to test:
   ```bash
   npm install
   npm run build:cloudflare
   npx wrangler pages dev .open-next
   ```
   Open http://localhost:8788 to test locally

### Static Assets Return 404

This usually happens if CDN cache wasn't cleared. Go back to Step 8.

### Authentication Doesn't Work

Make sure:
1. Environment variables are set in Cloudflare (Step 2)
2. Redirect URLs are configured in Supabase (Step 10)
3. Check browser console for "Missing Supabase environment variables" warning

## Additional Resources

### Documentation
- [ROOT_URL_404_FIX.md](./ROOT_URL_404_FIX.md) - Detailed troubleshooting for 404 errors
- [QUICK_FIX_404_ERRORS.md](./QUICK_FIX_404_ERRORS.md) - Quick reference guide
- [CLOUDFLARE_DEPLOYMENT_GUIDE.md](./CLOUDFLARE_DEPLOYMENT_GUIDE.md) - Comprehensive deployment guide
- [NEXTJS_16_WEBPACK_FIX.md](./NEXTJS_16_WEBPACK_FIX.md) - Technical details on webpack fix

### Verification
- Run `npm run verify:config` to check local configuration
- Review [ACTION_REQUIRED.md](./ACTION_REQUIRED.md) for action items

## Expected Timeline

| Task | Time |
|------|------|
| Set up environment variables | 5 minutes |
| Configure build settings | 2 minutes |
| Clear cache and trigger deployment | 1 minute |
| Build time | 2-3 minutes |
| CDN propagation | 1-2 minutes |
| **Total** | **~12 minutes** |

## Post-Deployment Checklist

After deployment, verify:

- [ ] Site loads at https://personal-stylist.pages.dev/
- [ ] No 404 errors for root URL
- [ ] No 404 errors for static assets
- [ ] Build logs show "webpack" not "turbopack"
- [ ] Environment variables are set in Cloudflare
- [ ] Supabase redirect URLs are configured
- [ ] Authentication works
- [ ] Database queries work
- [ ] AI features work (Gemini API)

## Success!

Once all checks pass, your Personal Stylist application is successfully deployed on Cloudflare Pages! 🎉

Your app should be:
- ✅ Fast and responsive
- ✅ Fully functional with authentication
- ✅ Connected to Supabase database
- ✅ Using Gemini AI for style recommendations

## Need Help?

If you encounter issues:

1. Review the troubleshooting section above
2. Check [ROOT_URL_404_FIX.md](./ROOT_URL_404_FIX.md) for detailed 404 troubleshooting
3. Review build logs in Cloudflare Pages dashboard
4. Check [OpenNext Cloudflare Issues](https://github.com/opennextjs/opennextjs-cloudflare/issues)

## Custom Domain (Optional)

To add a custom domain:

1. In Cloudflare Pages, go to **Custom domains**
2. Click **Set up a custom domain**
3. Follow the instructions to add DNS records
4. Update Supabase redirect URLs to include your custom domain
5. Wait for DNS propagation (can take up to 48 hours)

---

**Remember**: The configuration in this repository is already correct. You just need to deploy it with a clean cache on Cloudflare Pages.
