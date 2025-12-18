# Cloudflare Pages Setup Instructions

## Problem

The Cloudflare Pages build was failing with the following error:

```
npm error code ECONNRESET
npm error network aborted
```

This was caused by the build command being set to `npx @cloudflare/next-on-pages@1`, which is now **deprecated** and no longer recommended.

## Solution

This project has been migrated to use the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare), which is the modern, officially recommended way to deploy Next.js applications to Cloudflare Pages.

## Required Changes in Cloudflare Pages Dashboard

To fix the build failure, you need to update the build settings in your Cloudflare Pages dashboard:

### Step 1: Go to Build Settings

1. Log in to your Cloudflare dashboard
2. Go to **Pages** → Select your project (`personal-stylist`)
3. Click on **Settings** → **Builds & deployments**

### Step 2: Update Build Configuration

Change the following settings:

| Setting | Old Value | New Value |
|---------|-----------|-----------|
| **Build command** | `npx @cloudflare/next-on-pages@1` | `npm run build:cloudflare` |
| **Build output directory** | `.vercel/output/static` | `.open-next` |
| **Root directory** | (no change) | (no change) |

### Step 3: Verify Environment Variables

Make sure the following environment variables are set in **Settings → Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (as Secret)
- `SUPABASE_SERVICE_ROLE_KEY` (as Secret, optional)
- `NODE_VERSION` (set to `18` or higher)

### Step 4: Trigger a New Build

1. Go to **Deployments**
2. Click **Retry deployment** on the latest failed deployment, or
3. Push a new commit to trigger an automatic deployment

## What Was Changed in the Repository

1. **Installed packages**:
   - `@opennextjs/cloudflare@latest` (dev dependency)
   - `wrangler@latest` (dev dependency)

2. **Updated `package.json`**:
   - Added `build:cloudflare` script: `opennextjs-cloudflare build`
   - Added `preview` script: `opennextjs-cloudflare preview`
   - Added `deploy` script: `opennextjs-cloudflare deploy`

3. **Updated `wrangler.toml`**:
   - Changed `pages_build_output_dir` to use OpenNext structure
   - Added `main = ".open-next/worker.js"`
   - Added `[assets]` configuration

4. **Created `open-next.config.ts`**:
   - Default configuration for OpenNext Cloudflare adapter
   - Enabled R2 incremental cache support

5. **Updated `.gitignore`**:
   - Added `.open-next/` directory (build artifacts)
   - Added log files and test outputs

6. **Updated `README.md`**:
   - Updated Cloudflare Pages deployment instructions
   - Clarified the use of OpenNext adapter

## Local Development

No changes required for local development. You can still use:

```bash
npm run dev
```

## Testing the Build Locally

To test the Cloudflare build locally:

```bash
# Build for Cloudflare
npm run build:cloudflare

# Preview locally (requires wrangler)
npm run preview
```

## Deployment

To deploy directly from command line (alternative to Cloudflare Pages auto-deploy):

```bash
npm run deploy
```

## References

- [OpenNext Cloudflare Documentation](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
