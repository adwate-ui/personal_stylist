# Personal Stylist - Architecture Overview

## System Architecture

This is a **serverless, edge-first Next.js application** optimized for deployment on Cloudflare Pages.

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Pages                         │
│                    (Global Edge Network)                     │
└─────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
   │  Proxy  │         │   API   │         │  Pages  │
   │  (Edge) │         │ Routes  │         │  (SSR)  │
   │         │         │ (Edge)  │         │         │
   └────┬────┘         └────┬────┘         └────┬────┘
        │                   │                    │
        └───────────────────┼────────────────────┘
                            │
        ┌───────────────────┴────────────────────┐
        │                                        │
   ┌────▼────────┐                     ┌────────▼─────┐
   │   Supabase  │                     │  Google AI   │
   │             │                     │    (Gemini)  │
   │ - Auth      │                     │              │
   │ - Database  │                     │ - Analysis   │
   │ - Storage   │                     │ - Scoring    │
   └─────────────┘                     └──────────────┘
```

## Core Components

### 1. Proxy (Middleware) - `src/proxy.ts`

**Purpose**: Request interception, authentication, and routing protection

**Runtime**: Node.js (enforced by Next.js 16 - proxy files cannot specify runtime config)

**Key Features**:
- Checks user authentication state before page access
- Redirects unauthenticated users from protected routes
- Runs on every request globally at the edge
- Extremely fast (< 1ms latency)

**Protected Routes**:
- `/wardrobe` - User's digital wardrobe
- `/add-item` - Add new wardrobe items
- `/preferences` - User preferences
- `/shop` - Shopping assistant
- `/onboarding` - Profile setup

**Code Pattern**:
```typescript
export const runtime = 'edge'; // CRITICAL!

export async function proxy(req: NextRequest) {
  const supabase = createMiddlewareClient(req, res);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user && isProtectedRoute) {
    return NextResponse.redirect('/auth/login');
  }
  
  return res;
}
```

### 2. API Routes - `src/app/api/**/route.ts`

**Runtime**: Edge (REQUIRED for Cloudflare Pages)

**Endpoints**:

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/api/health` | Health check | No |
| `/api/profile` | Get/update user profile | Yes |
| `/api/style-dna/generate` | Generate Style DNA from questionnaire | Yes |
| `/api/wardrobe/add` | Add item via image/link | Yes |
| `/api/wardrobe/list` | List all wardrobe items | Yes |
| `/api/wardrobe/analyze` | Analyze item with AI | Yes |
| `/api/wardrobe/link` | Process product link | Yes |
| `/api/shop/rate` | Rate shopping item with AI | Yes |
| `/auth/callback` | Supabase auth callback | No |

**Common Pattern**:
```typescript
export const runtime = 'edge'; // CRITICAL!

export async function GET(request: Request) {
  const supabase = await createClient();
  // ... API logic
}
```

### 3. Supabase Integration - `src/lib/`

**Architecture**: SSR-first with Edge compatibility

**Client Types**:

1. **Browser Client** (`src/lib/supabase.ts`)
   - For client-side React components
   - Uses `createBrowserClient` from `@supabase/ssr`
   - Handles cookies automatically in browser

2. **Server Client** (`src/lib/supabase-server.ts`)
   - Two variants:
     - **Middleware Client**: Edge-compatible (uses NextRequest/NextResponse)
     - **Server Component Client**: For server components (uses cookies() from next/headers)

**Edge Compatibility Strategy**:
```typescript
// For Proxy/Middleware (Edge Runtime)
export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookies) { 
        cookies.forEach(c => response.cookies.set(c.name, c.value, c.options));
      },
    },
  });
}

// For Server Components (Can use Node.js Runtime)
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookies) { /* ... */ },
    },
  });
}
```

### 4. Google Gemini AI Integration - `src/lib/gemini.ts`

**Purpose**: AI-powered style analysis and recommendations

**Features**:
- Style DNA generation from user questionnaire
- Wardrobe item analysis (category, color, brand, price)
- Style compatibility scoring (1-10 scale)
- Shopping recommendations with reasoning

**Models Used**:
- Primary: `gemini-3-pro-preview` (or `gemini-2.5-pro`)
- Fallback: `gemini-2.5-flash` (faster, lower cost)

### 5. Database Schema

**Tables**:

1. **profiles** - User profiles and Style DNA
   ```sql
   - id (uuid, references auth.users)
   - measurements (jsonb)
   - lifestyle (jsonb)
   - aesthetics (jsonb)
   - style_dna (text)
   - created_at, updated_at
   ```

2. **wardrobe_items** - User's wardrobe
   ```sql
   - id (uuid)
   - user_id (uuid, references profiles)
   - image_url (text)
   - category, brand, color, price
   - style_score (integer, 1-10)
   - analysis_result (jsonb)
   - created_at, updated_at
   ```

3. **shopping_items** - Shopping history
   ```sql
   - id (uuid)
   - user_id (uuid, references profiles)
   - image_url, category, brand, color, price
   - rating (integer, 1-10)
   - reasoning (text)
   - alternatives (jsonb)
   - created_at
   ```

**Storage Buckets**:
- `wardrobe_items` - Wardrobe item images
- `user_uploads` - Temporary uploads
- `avatars` - User profile pictures

## Key Design Decisions

### Why Edge Runtime?

1. **Cloudflare Pages Requirement**: Only supports Edge runtime for server-side code
2. **Global Performance**: Runs at edge locations worldwide (< 50ms latency)
3. **Cost Efficiency**: No cold starts, scales automatically
4. **Security**: Isolated execution environment

### Why Supabase?

1. **Built-in Auth**: Email/password, OAuth, magic links
2. **Row Level Security**: Database-enforced access control
3. **Real-time**: Potential for live wardrobe updates
4. **Storage**: Built-in file storage with CDN
5. **Edge Compatible**: Works with Edge runtime

### Why OpenNext Cloudflare?

1. **Modern**: Replaces deprecated `@cloudflare/next-on-pages`
2. **Full Feature Support**: Better Next.js compatibility
3. **ISR Support**: Incremental static regeneration with R2
4. **Active Development**: Regular updates and fixes

## Data Flow Examples

### User Authentication Flow

```
1. User visits /wardrobe
2. Proxy intercepts request
   └─> Checks Supabase session cookie
   └─> If no session: redirect to /auth/login
   └─> If session valid: allow access
3. Page renders with user's wardrobe items
```

### Wardrobe Item Addition Flow

```
1. User uploads image on /add-item
2. Image uploaded to Supabase Storage
3. POST /api/wardrobe/add
   └─> Gemini analyzes image
   └─> Extracts: category, brand, color, price
   └─> Scores against Style DNA (1-10)
4. Item saved to database
5. User redirected to /wardrobe
```

### Style DNA Generation Flow

```
1. User completes onboarding questionnaire
2. POST /api/style-dna/generate
   └─> Sends measurements, lifestyle, aesthetics to Gemini
   └─> Gemini generates comprehensive Style DNA
3. Style DNA saved to profile
4. Used for future item scoring
```

## Environment Configuration

### Build Time Variables (Client-Side)
These are embedded in the JavaScript bundle:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**CRITICAL**: Must be set in Cloudflare Pages BEFORE build!

### Runtime Variables (Server-Side)
These are accessed at runtime:
- `GEMINI_API_KEY` (secret)
- `SUPABASE_SERVICE_ROLE_KEY` (secret, optional)

**CRITICAL**: Must be marked as "secret" in Cloudflare Pages

## Performance Characteristics

### Edge Proxy
- Latency: < 1ms (runs at edge)
- Cold Start: None (always warm)
- Concurrency: Unlimited

### API Routes
- Latency: 50-200ms (depends on Supabase/Gemini)
- Cold Start: None (serverless but warm)
- Rate Limits: Per Supabase/Gemini tier

### AI Analysis
- Style DNA: 5-10 seconds (one-time)
- Item Analysis: 2-5 seconds per item
- Shopping Rating: 2-4 seconds per item

## Security Model

### Authentication
- Supabase Auth with JWT tokens
- HTTP-only cookies for session management
- Row Level Security on all tables

### Authorization
- Proxy checks auth before page access
- API routes validate JWT on every request
- Database enforces RLS policies

### Secrets Management
- Environment variables in Cloudflare Pages
- Never committed to git
- Service role key only used server-side

## Scalability

### Current Limits
- Users: Unlimited (Supabase free tier: 50k users)
- Storage: 1GB on Supabase free tier
- AI Calls: Based on Gemini API quota

### Scaling Strategy
1. **More Users**: Supabase scales automatically, upgrade tier if needed
2. **More Storage**: Upgrade Supabase or use Cloudflare R2
3. **More AI**: Upgrade Gemini quota or implement caching

## Monitoring & Debugging

### Available Tools
- Cloudflare Pages Logs (deployment & runtime)
- Supabase Dashboard (auth, database, storage)
- Google Cloud Console (Gemini usage)

### Debug Checklist
- ✅ Check Cloudflare build logs for errors
- ✅ Verify environment variables are set
- ✅ Check Supabase logs for auth issues
- ✅ Monitor Gemini API quota and errors
- ✅ Review browser console for client errors

## Future Enhancements

### Potential Features
- [ ] Real-time outfit suggestions
- [ ] Social sharing of Style DNA
- [ ] Shopping link aggregation
- [ ] Seasonal wardrobe analysis
- [ ] Outfit planning calendar
- [ ] Style inspiration feed

### Technical Improvements
- [ ] Implement caching for AI responses
- [ ] Add analytics/telemetry
- [ ] Set up monitoring alerts
- [ ] Implement A/B testing
- [ ] Add progressive image loading
- [ ] Optimize bundle size

## References

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Cloudflare Pages Guide](https://developers.cloudflare.com/pages/)
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side)
- [Google Gemini API](https://ai.google.dev/docs)
- [Edge Runtime Guide](./EDGE_RUNTIME_GUIDE.md)
- [Deployment Guide](./CLOUDFLARE_DEPLOYMENT_GUIDE.md)
