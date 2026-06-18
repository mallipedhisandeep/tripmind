# TripMind 🗺️
### India's First Travel Intelligence System

AI-powered trip planning with hyperlocal India knowledge — real train numbers, temple darshan tips, live availability, and personalized itineraries in seconds.

---

## Tech Stack

- **Frontend + Backend**: Next.js 14 (App Router)
- **Database + Auth**: Supabase
- **AI**: Google Gemini 1.5 Flash
- **Hosting**: Vercel
- **Styling**: Tailwind CSS + Framer Motion

---

## Setup Instructions

### 1. Push to GitHub
Push all files to your GitHub repository.

### 2. Set Up Supabase Database
1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Copy the entire contents of `supabase-schema.sql`
4. Paste and click **Run**
5. You should see "Success" — all tables are created

### 3. Enable Google Auth in Supabase
1. Go to **Authentication → Providers**
2. Enable **Google**
3. Add your Google OAuth credentials (from Google Cloud Console)
4. Add callback URL: `https://your-vercel-url.vercel.app/auth/callback`

### 4. Deploy to Vercel
1. Go to vercel.com → **New Project**
2. Import your `tripmind` GitHub repository
3. Add these **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xorbwmzdfyhcsmlkzprb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   GEMINI_API_KEY=your_gemini_key
   NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
   ```
4. Click **Deploy**

### 5. Add Vercel URL to Supabase
1. Go to Supabase → **Authentication → URL Configuration**
2. Add your Vercel URL to **Site URL**
3. Add `https://your-vercel-url.vercel.app/auth/callback` to **Redirect URLs**

---

## Project Structure

```
tripmind/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Login (Google + Email)
│   ├── onboarding/page.tsx   # First-time setup
│   ├── dashboard/            # Home after login
│   ├── plan/
│   │   ├── new/page.tsx      # Trip planning form
│   │   └── [id]/             # Generated plan view
│   ├── auth/callback/        # OAuth callback
│   └── api/generate-plan/    # AI generation API
├── lib/
│   ├── supabase/             # Supabase clients
│   └── gemini.ts             # AI plan generation
├── types/index.ts            # TypeScript types
└── supabase-schema.sql       # Database schema
```

---

## Phase Roadmap

- **Phase 1** (Current): Auth, onboarding, AI plan generation, beautiful UI
- **Phase 2**: Live train data, temple scraper, watchlist alerts, WhatsApp notifications
- **Phase 3**: Pro subscription (Razorpay), offline download, shareable links
- **Phase 4**: Group planning, language support, national expansion

---

## Important Notes

- **Never push `.env.local` to GitHub** — it contains your API keys
- Add all environment variables in Vercel dashboard instead
- The `.gitignore` already excludes `.env.local`

---

Built by Sandeep · TripMind 2026

for indian travellers...
