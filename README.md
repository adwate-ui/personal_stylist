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

This project uses the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare) for deployment, which replaces the deprecated `@cloudflare/next-on-pages` package.

### 1. Configure Build Settings

In the Cloudflare Pages dashboard, set:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build:cloudflare` (or `npx opennextjs-cloudflare build`)
- **Build Output Directory**: `.open-next/assets`
- **Node Version**: Set to `18` or higher in **Settings → Environment Variables** (`NODE_VERSION`).

### 2. Set Production Environment Variables

Go to **Cloudflare Pages → Your Project → Settings → Environment Variables**.

Add the following (Production & Preview):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (Mark as **Secret**)
- `SUPABASE_SERVICE_ROLE_KEY` (Mark as **Secret**, Optional)

### 3. Deploy

Push your changes to the `main` branch. Cloudflare will automatically trigger a deployment.

### 4. Post-Deployment Verification

- [ ] Environment variables are set in Cloudflare
- [ ] Supabase migrations applied
- [ ] Storage buckets created and accessible
- [ ] User authentication works (check Redirect URLs in Supabase Auth settings)
- [ ] AI analysis works (Gemini key is valid)

---

## Troubleshooting

- **Gemini API Key missing**: Check `.env.local` or Cloudflare secrets. Ensure no extra spaces.
- **Auth Redirects fail**: Add your Cloudflare URL (e.g., `https://your-project.pages.dev/auth/callback`) to **Supabase Auth → URL Configuration**.
- **Image Uploads fail**: Check Supabase Storage policies and CORS settings.
- **Build fails**: Ensure `nodejs_compat` is set in compatibility flags if using Edge features.

---

## Project Structure

- `src/app/`: Next.js App Router pages & API routes.
- `src/components/`: Reusable UI components.
- `src/lib/`: Core libraries (Gemini, Supabase clients).
- `src/hooks/`: Custom hooks (useProfile).
- `supabase/`: Database migrations and types.
