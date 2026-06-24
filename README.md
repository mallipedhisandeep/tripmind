# TripMind 🗺️
### India's First Travel Intelligence System

AI-powered trip planning with hyperlocal India knowledge — real train numbers, temple darshan tips, live availability, and personalized itineraries in seconds.

---

## Tech Stack

- **Frontend + Backend**: Next.js 14 (App Router)
- **Database + Auth**: Supabase
- **AI**: Anthropic Claude (Haiku 4.5)
- **Payments**: Razorpay
- **WhatsApp alerts**: Twilio (default) or Meta Cloud API
- **PDF export**: Puppeteer + @sparticuz/chromium
- **Hosting**: Vercel
- **Styling**: Tailwind CSS + Framer Motion
- **i18n**: English, Hindi, Telugu

---

## Setup Instructions

### 1. Push to GitHub
Push all files to your GitHub repository.

### 2. Set Up Supabase Database
1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Run the base schema first, then the Phase 2/3/4 additions, in order:
   - `supabase-schema.sql` (core tables: profiles, trips)
   - `supabase-schema-phase234.sql` (watchlist, payments, trip_members, sharing, invite-acceptance policies)
4. You should see "Success" after each — all tables are created

### 3. Enable Google Auth in Supabase
1. Go to **Authentication → Providers**
2. Enable **Google**
3. Add your Google OAuth credentials (from Google Cloud Console)
4. Add callback URL: `https://your-vercel-url.vercel.app/auth/callback`

### 4. Deploy to Vercel
1. Go to vercel.com → **New Project**
2. Import your `tripmind` GitHub repository
3. Add the **Environment Variables** listed in `.env.example`:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY     # server-only, used by the watchlist cron — never expose to the client
   NEXT_PUBLIC_APP_URL
   ANTHROPIC_API_KEY
   RAZORPAY_KEY_ID
   RAZORPAY_KEY_SECRET
   WHATSAPP_PROVIDER              # "twilio" (default) or "meta"
   TWILIO_ACCOUNT_SID
   TWILIO_AUTH_TOKEN
   TWILIO_WHATSAPP_FROM
   META_WHATSAPP_TOKEN            # only if WHATSAPP_PROVIDER=meta
   META_PHONE_NUMBER_ID           # only if WHATSAPP_PROVIDER=meta
   CRON_SECRET
   AVAILABILITY_CHECK_ENABLED     # "true" to enable real availability checks; defaults to off
   ```
4. Click **Deploy**

### 5. Add Vercel URL to Supabase
1. Go to Supabase → **Authentication → URL Configuration**
2. Add your Vercel URL to **Site URL**
3. Add `https://your-vercel-url.vercel.app/auth/callback` to **Redirect URLs**

### 6. Set Up the Watchlist Alert Cron
`vercel.json` schedules `GET /api/alerts/check`. This route requires the
`x-cron-secret` header to match `CRON_SECRET`, and uses
`SUPABASE_SERVICE_ROLE_KEY` server-side to read/update the `watchlist` table
across all users (Row Level Security otherwise scopes reads to the calling
user, which a cron job has none of).

---

## Project Structure

```
tripmind/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── login/page.tsx            # Login (Google)
│   ├── onboarding/page.tsx       # First-time setup
│   ├── dashboard/                # Home after login
│   ├── plan/
│   │   ├── new/page.tsx          # Trip planning form
│   │   └── [id]/                 # Generated plan view, share + group panels
│   ├── invite/[token]/page.tsx   # Group trip invite acceptance
│   ├── share/[token]/page.tsx    # Public read-only shared trip view
│   ├── watchlist/                # WhatsApp availability/price alerts
│   ├── upgrade/page.tsx          # Razorpay Pro checkout
│   ├── auth/callback/            # OAuth callback
│   └── api/
│       ├── generate-plan/        # AI generation API
│       ├── plan/export/          # PDF export
│       ├── group/invite/         # Group invite CRUD
│       ├── watchlist/            # Watchlist CRUD
│       ├── alerts/check/         # Cron: checks watchlist, sends WhatsApp alerts
│       └── razorpay/             # Order creation + payment verification
├── lib/
│   ├── supabase/                 # Supabase clients (browser, server, admin/service-role)
│   ├── ai.ts                     # Claude-based plan generation
│   ├── whatsapp.ts                # Twilio / Meta WhatsApp senders
│   └── i18n.tsx                  # Language context (en/hi/te)
├── locales/                      # en.ts, hi.ts, te.ts
├── types/index.ts                # TypeScript types
├── supabase-schema.sql           # Core database schema (profiles, trips)
└── supabase-schema-phase234.sql  # Phase 2/3/4 additions — run after the core schema
```

---

## Phase Roadmap

- **Phase 1**: Auth, onboarding, AI plan generation, beautiful UI
- **Phase 2**: Watchlist alerts via WhatsApp (Twilio/Meta), live availability cron
- **Phase 3**: Pro subscription (Razorpay), offline PDF download, shareable links
- **Phase 4**: Group planning with email invites, language support (en/hi/te)

All four phases are implemented. `AVAILABILITY_CHECK_ENABLED` gates the
real train/hotel/flight availability lookups in `/api/alerts/check` — these
are stubbed (return `false`) until real provider integrations are wired in.

---

## Important Notes

- **Never push `.env.local` to GitHub** — it contains your API keys
- Add all environment variables in Vercel dashboard instead
- The `.gitignore` already excludes `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security — it is only ever
  used server-side (`lib/supabase/admin.ts`) and must never be exposed with
  a `NEXT_PUBLIC_` prefix or sent to the browser

---

Built by Sandeep · TripMind 2026

for indian travellers...
