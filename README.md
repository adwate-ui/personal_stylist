# AI-Powered Personal Stylist

A Next.js application that analyzes your style preferences, digitizes your wardrobe, and provides personalized fashion recommendations using Google Gemini AI and Supabase.

## Key Features

- **Onboarding Flow**: 6-step wizard to capture measurements, lifestyle, aesthetics, and create a "Style DNA".
- **Wardrobe Digitization**: Upload photos or paste product links to create a digital wardrobe.
- **AI-Powered Analysis**: Gemini AI extracts item details (category, brand, color, price) and scores items against your Style DNA.
- **Shopping Assistant**: Rate potential purchases (1-10) with reasoning and alternative suggestions.
- **Smart Fashion Glossary**: Interactive definitions for fashion terms.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.com/) (Auth, Database, Storage)
- **AI**: [Google Gemini AI](https://ai.google.dev/) (gemini-3-pro-preview / gemini-2.5-pro)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)

---

## Prerequisites

- **Node.js 18+** or **Bun** installed
- **Supabase Account**: Create a new project
- **Google AI Studio Account**: Get an [API Key](https://aistudio.google.com/app/apikey)
- **Cloudflare Account**: For deployment

---

## Local Development Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd personal_stylist

# Install dependencies
npm install
# or
bun install
```

### 2. Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your credentials in `.env.local`:
   - Get Supabase URL & Anon Key from **Settings → API**.
   - Get Gemini API Key from **Google AI Studio**.
   - (Optional) Service Role Key for admin tasks (keep secret!).

### 3. Database Setup

1. Go to your Supabase Project Dashboard → **SQL Editor**.
2. Run the migration script located at `supabase/migrations/001_unified_schema.sql` in this repo.
3. Verify the following are created:
   - **Tables**: `profiles`, `wardrobe_items`, `shopping_items`.
   - **Storage Buckets**: `wardrobe_items`, `user_uploads`, `avatars` (create manually if script didn't create them).
   - **Policies**: Row Level Security (RLS) policies should be enabled.

### 4. Run Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Environment Variables Reference

| Variable | Required | Description | Where to Get |
|----------|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous/public key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ Optional | Admin key for server operations | Supabase Dashboard → Settings → API |
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `GEMINI_MODEL` | ❌ Optional | AI Model (default: `gemini-3-pro-preview`) | `gemini-2.5-pro`, `gemini-2.5-flash` |

> [!IMPORTANT]
> Never commit `.env.local` to version control.
> `SUPABASE_SERVICE_ROLE_KEY` should ONLY be used in secure server-side contexts.

---

## Cloudflare Pages Deployment

> [!WARNING]
> **🚨 GETTING 404 ERRORS FOR STATIC ASSETS?**
> 
> If you see 404 errors for CSS, JS, or fonts with "turbopack" in the file names:
> 
> **👉 ACTION REQUIRED:** [ACTION_REQUIRED.md](./ACTION_REQUIRED.md)
> 
> **Quick Fix (5 min):** [QUICK_FIX_404_ERRORS.md](./QUICK_FIX_404_ERRORS.md)
>
> Your code is correct, but Cloudflare Pages needs to rebuild with cleared cache.

This project uses the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare) for deployment, which replaces the deprecated `@cloudflare/next-on-pages` package.

> [!IMPORTANT]
> **Environment variables MUST be set in Cloudflare Pages BEFORE building.** If you see warnings about "Missing Supabase environment variables" in the browser console, your build was done without proper configuration.

> [!IMPORTANT]
> **This application is built for Cloudflare Pages compatibility using Next.js 16.** API routes use Edge runtime when possible. Note: In Next.js 16, the proxy (formerly middleware) always runs on Node.js runtime. See [EDGE_RUNTIME_GUIDE.md](./EDGE_RUNTIME_GUIDE.md) for technical details.

### Quick Start

1. **Verify your build configuration**: Run `npm run verify:config` to ensure everything is set up correctly
2. Set environment variables in Cloudflare Pages (see below)
3. Configure build settings (Framework: Next.js, Build command: `npm run build:cloudflare`, Output: `.open-next`)
4. Add your Cloudflare Pages URL to Supabase Auth redirect URLs
5. Deploy!

📖 **For detailed step-by-step instructions, see [CLOUDFLARE_DEPLOYMENT_GUIDE.md](./CLOUDFLARE_DEPLOYMENT_GUIDE.md)**

### Required Environment Variables

Set these in **Cloudflare Pages → Settings → Environment Variables** (both Production and Preview):

| Variable | Source | Required |
|----------|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | ✅ |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) | ✅ |
| `NODE_VERSION` | Set to `18` or `20` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard (mark as Secret) | Optional |

### Build Configuration

| Setting | Value |
|---------|-------|
| Framework preset | `Next.js` |
| Build command | `npm run build:cloudflare` |
| Build output directory | `.open-next` |

> [!NOTE]
> The `build:cloudflare` command uses Webpack instead of Turbopack. This is required because `@opennextjs/cloudflare` currently only supports Webpack builds. See [NEXTJS_16_WEBPACK_FIX.md](./NEXTJS_16_WEBPACK_FIX.md) for details.

### Post-Deployment Verification

- [ ] No "Missing Supabase environment variables" warnings in browser console
- [ ] Environment variables are set in Cloudflare
- [ ] Supabase migrations applied
- [ ] User authentication works
- [ ] AI analysis works

---

## Troubleshooting

### Common Issues

**404 errors for static assets (CSS, JS, fonts) - STILL HAPPENING AFTER FIX?**
- **Cause**: Next.js 16 defaulted to Turbopack, which is incompatible with `@opennextjs/cloudflare`
- **Fix**: The build configuration has been fixed, but you need to trigger a clean rebuild
- **SOLUTION**: See [CLOUDFLARE_PAGES_REBUILD_GUIDE.md](./CLOUDFLARE_PAGES_REBUILD_GUIDE.md) for step-by-step instructions to:
  - Clear Cloudflare Pages build cache
  - Purge CDN cache
  - Force a fresh deployment with webpack
- **Quick check**: Run `npm run verify:config` to verify your local configuration is correct
- **Technical details**: See [NEXTJS_16_WEBPACK_FIX.md](./NEXTJS_16_WEBPACK_FIX.md)

**"Node.js middleware is not currently supported" error**
- **Cause**: Incompatibility between Next.js 16's proxy.ts convention and @opennextjs/cloudflare
- **Fix**: Use `middleware.ts` (in project root) with `export const runtime = 'edge';` instead of proxy.ts
- **Details**: See [NEXTJS_16_CLOUDFLARE_FIX.md](./NEXTJS_16_CLOUDFLARE_FIX.md) for the complete solution

**"Missing Supabase environment variables" in browser console**
- **Cause**: Build ran without environment variables set
- **Fix**: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Cloudflare Pages, then trigger a new deployment

**404 errors for `/auth/login` or other pages**
- **Cause**: Incorrect build output directory or build failure
- **Fix**: Verify build output directory is `.open-next` and check build logs for errors

**Auth Redirects fail**
- **Fix**: Add your Cloudflare URL (e.g., `https://your-project.pages.dev/auth/callback`) to **Supabase Auth → URL Configuration**

**Image Uploads fail**
- **Fix**: Check Supabase Storage policies and CORS settings

**AI features don't work**
- **Fix**: Verify `GEMINI_API_KEY` is set and valid in Cloudflare environment variables

For more detailed troubleshooting, see [CLOUDFLARE_DEPLOYMENT_GUIDE.md](./CLOUDFLARE_DEPLOYMENT_GUIDE.md).

---

## Project Structure

- `src/app/`: Next.js App Router pages & API routes.
- `src/components/`: Reusable UI components.
- `src/lib/`: Core libraries (Gemini, Supabase clients).
- `src/hooks/`: Custom hooks (useProfile).
- `supabase/`: Database migrations and types.
