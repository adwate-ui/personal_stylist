# Cloudflare Pages Deployment Guide

This guide will help you properly deploy the Personal Stylist application to Cloudflare Pages, ensuring all environment variables and configurations are correctly set.

## Prerequisites

- A Cloudflare account with Pages enabled
- A Supabase project with the database schema applied
- A Google Gemini API key

## Critical: Environment Variables MUST Be Set Before Build

**IMPORTANT**: Cloudflare Pages builds your application on their servers. If environment variables are not set before the build runs, the application will be built with placeholder values, causing the following issues:

- ⚠️ "Missing Supabase environment variables" warnings in browser console
- 🚫 Authentication will not work
- 🚫 Database operations will fail
- 🚫 API calls will fail

## Step 1: Configure Environment Variables in Cloudflare Pages

### 1.1 Navigate to Environment Variables Settings

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Pages** → Select your project (e.g., `personal-stylist`)
3. Click on **Settings** → **Environment variables**

### 1.2 Add Required Environment Variables

Add the following environment variables for **both Production and Preview** environments:

| Variable Name | Value Source | Required | Secret? |
|--------------|--------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | ✅ Yes | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → Project API keys → anon/public | ✅ Yes | No |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) | ✅ Yes | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → Project API keys → service_role | ⚠️ Optional | ✅ Yes |
| `NODE_VERSION` | `18` or `20` | ✅ Yes | No |

**Notes:**
- `NEXT_PUBLIC_*` variables are embedded in the client-side bundle during build
- Variables marked as "Secret" should have the "Encrypt" option enabled in Cloudflare
- `SUPABASE_SERVICE_ROLE_KEY` is only needed for admin operations and should be kept secret

### 1.3 Verify Variables Are Set

After adding variables:
1. Click "Save and deploy" for each variable
2. Verify all variables appear in both "Production" and "Preview" sections
3. Check that sensitive keys are marked with 🔒 (encrypted)

## Step 2: Configure Build Settings

### 2.1 Update Build Configuration

1. Go to **Settings** → **Builds & deployments**
2. Set the following:

| Setting | Value |
|---------|-------|
| **Framework preset** | `Next.js` |
| **Build command** | `npm run build:cloudflare` |
| **Build output directory** | `.open-next` |
| **Root directory** | (leave empty unless your Next.js app is in a subdirectory) |

**Important:** The `build:cloudflare` command uses Webpack instead of Turbopack. This is required because `@opennextjs/cloudflare` currently only supports Webpack builds. See [NEXTJS_16_WEBPACK_FIX.md](./NEXTJS_16_WEBPACK_FIX.md) for details.

### 2.2 Verify Node.js Version

Ensure `NODE_VERSION` environment variable is set to `18` or higher (recommended: `20`)

## Step 3: Configure Supabase Authentication

### 3.1 Add Cloudflare Pages URL to Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Cloudflare Pages URLs to **Redirect URLs**:
   ```
   https://your-project.pages.dev/auth/callback
   https://your-custom-domain.com/auth/callback  # if using custom domain
   ```

### 3.2 Configure Site URL

Set the **Site URL** to your Cloudflare Pages URL:
```
https://your-project.pages.dev
```

## Step 4: Deploy

### 4.1 Trigger New Deployment

With all environment variables and settings configured:

1. Go to **Deployments** tab
2. Click **Retry deployment** on the latest deployment, OR
3. Push a new commit to your repository to trigger automatic deployment

### 4.2 Monitor Build Progress

1. Watch the build logs for any errors
2. Common issues:
   - Missing environment variables (check Step 1)
   - Node.js version too old (check Step 2.2)
   - Database schema not applied (check Supabase setup)

## Step 5: Verify Deployment

After deployment succeeds, verify the following:

### 5.1 Check Browser Console

1. Open your deployed site
2. Open browser Developer Tools (F12) → Console
3. **You should NOT see** warnings like:
   ```
   Missing Supabase environment variables - using placeholder values
   ```
4. If you see this warning, environment variables were not set before build. Go back to Step 1.

### 5.2 Test Authentication

1. Navigate to `/auth/login`
2. Try to sign up or sign in
3. Verify no 404 errors in the Network tab
4. Confirm successful authentication redirects to `/onboarding`

### 5.3 Test Core Features

- [ ] User registration and login works
- [ ] Profile creation in onboarding works
- [ ] Image uploads work
- [ ] AI analysis features work (requires `GEMINI_API_KEY`)

## Troubleshooting

### Issue: "Missing Supabase environment variables" in Browser Console

**Cause**: Environment variables were not set before the build ran on Cloudflare Pages.

**Solution**:
1. Go to Settings → Environment variables
2. Add/verify all required `NEXT_PUBLIC_*` variables
3. Trigger a new deployment (the app must be rebuilt)

### Issue: 404 Errors for Static Assets (CSS, JS, Fonts)

**Error Messages:**
```
GET /_next/static/chunks/*.css 404 (Not Found)
GET /_next/static/chunks/turbopack-*.js 404 (Not Found)
GET /_next/static/media/*.woff2 404 (Not Found)
```

**Cause**: Next.js 16 defaulted to Turbopack, which is incompatible with `@opennextjs/cloudflare`.

**Solution**: This has been fixed in the current build configuration. The build now uses Webpack via the `--webpack` flag. See [NEXTJS_16_WEBPACK_FIX.md](./NEXTJS_16_WEBPACK_FIX.md) for technical details.

If you still see these errors:
1. Ensure you're using the latest code with the webpack fix
2. Trigger a fresh deployment to rebuild with webpack
3. Clear Cloudflare cache (Dashboard → Caching → Purge Everything)

### Issue: 404 Errors for /auth/login or Other Pages

**Possible causes**:
1. Build output directory is incorrect (should be `.open-next`)
2. Build failed but deployment shows as "success"
3. Routes not properly generated during build

**Solution**:
1. Check build logs for errors
2. Verify build command is `npm run build:cloudflare`
3. Ensure all dependencies are listed in `package.json`

### Issue: Authentication Redirects Fail

**Cause**: Cloudflare Pages URL not added to Supabase allowed redirect URLs.

**Solution**: See Step 3.1 above

### Issue: Image Uploads Don't Work

**Causes**:
1. Supabase Storage policies not set correctly
2. CORS configuration missing

**Solution**:
1. Run the schema migration (`supabase/migrations/001_unified_schema.sql`)
2. Verify storage buckets exist and have correct RLS policies
3. Check CORS configuration in Supabase Storage settings

### Issue: AI Features Don't Work

**Cause**: `GEMINI_API_KEY` not set or invalid

**Solution**:
1. Verify key is set in Cloudflare environment variables
2. Test key at [Google AI Studio](https://aistudio.google.com/)
3. Check API quotas haven't been exceeded

## Production Checklist

Before going live with your application:

- [ ] All environment variables are set in Cloudflare Pages (Production)
- [ ] Supabase URL is added to Redirect URLs
- [ ] Database schema is applied
- [ ] Storage buckets are created with correct policies
- [ ] Custom domain is configured (if applicable)
- [ ] HTTPS is working correctly
- [ ] All core features tested and working
- [ ] Error pages are styled (404, 500)
- [ ] Analytics/monitoring configured (if desired)

## Additional Resources

- [OpenNext Cloudflare Documentation](https://opennext.js.org/cloudflare)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Supabase Authentication Guides](https://supabase.com/docs/guides/auth)

## Need Help?

If you encounter issues not covered in this guide:

1. Check the [project README](./README.md)
2. Review [CLOUDFLARE_PAGES_SETUP.md](./CLOUDFLARE_PAGES_SETUP.md) for build configuration details
3. Check Cloudflare Pages build logs for specific error messages
4. Verify environment variables are correctly set and saved
