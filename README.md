# ACE CLUB Live Leaderboard — Complete Setup Guide

A dark, Spider-Man inspired **live esports leaderboard** built with React + TypeScript + Vite + Supabase.

---

## 🕷️ Quick Start (Demo / Local Mode)

The app works **immediately out of the box** with localStorage sync (no Supabase needed).

```bash
npm install
npm run dev
```

Open **http://localhost:5173** for the leaderboard.  
Open **http://localhost:5173/#admin** or click **Admin Portal** → enter passcode `aceclub2026`.

---

## 🗄️ Database Setup (Supabase — Recommended for Production)

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a region close to your audience

### Step 2: Run the SQL Schema
1. In your Supabase dashboard → **SQL Editor**
2. Paste and run the entire contents of [`supabase_schema.sql`](./supabase_schema.sql)

This creates:
- `teams` table with `captain_id`, `Team_name`, `round1_score`, `round2_score`
- `final_points` as a **GENERATED ALWAYS** database column (`round1_score + round2_score`) — automatically computed, never editable manually
- Row Level Security: public read, authenticated write
- Realtime publication on `teams`

### Step 3: Get Your API Keys
1. Supabase Dashboard → **Project Settings** → **API**
2. Copy **Project URL** and **anon public** key

### Step 4: Configure Environment Variables

**For local development** — edit `.env`:
```env
VITE_SUPABASE_URL=https://your-actual-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ADMIN_PASSWORD=your-secure-passcode
```

**For Vercel** — set the same three variables in **Project Settings → Environment Variables**.

---

## 🚀 Vercel Deployment

```bash
npm install -g vercel
vercel --prod
```

Or use the Vercel Dashboard → Import GitHub repository.

The [`vercel.json`](./vercel.json) already handles SPA routing (including `/admin`).

---

## 🔐 Security Architecture

| Layer | Mechanism |
|---|---|
| Public leaderboard | Supabase RLS `SELECT` open to `anon` role |
| Admin score editing | Supabase RLS restricts `INSERT`, `UPDATE`, `DELETE` to `authenticated` role |
| Admin login | Session-based passcode via `sessionStorage` |
| API keys | `VITE_` prefix — bundled into frontend (anon key only, never service key) |

> **Important:** Never put your Supabase `service_role` key in frontend code.

---

## 📊 Data Model

```sql
CREATE TABLE teams (
    captain_id    TEXT PRIMARY KEY,
    "Team_name"   TEXT NOT NULL,
    round1_score  NUMERIC DEFAULT 0 CHECK (round1_score >= 0),
    round2_score  NUMERIC DEFAULT 0 CHECK (round2_score >= 0),
    final_points  NUMERIC GENERATED ALWAYS AS (round1_score + round2_score) STORED,
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);
```

`final_points` is a **database-generated column** — it can never be set manually; Postgres always keeps it as `round1_score + round2_score`.

---

## 🎮 Features

| Feature | Status |
|---|---|
| Real-time leaderboard sync | ✅ Supabase Realtime + multi-tab BroadcastChannel |
| Automatic final_points | ✅ PostgreSQL GENERATED ALWAYS column |
| Competition ranking (1,2,2,4) | ✅ Client-side computed |
| Gold/Silver/Bronze accents | ✅ |
| Search filter | ✅ |
| Admin: Add/Edit/Delete teams | ✅ |
| Admin: Score entry with live preview | ✅ |
| Non-negative score validation | ✅ |
| Duplicate captain ID prevention | ✅ |
| Projector / Big Screen mode | ✅ |
| Sound effects (Web Audio API) | ✅ |
| Confetti on leaderboard changes | ✅ |
| Responsive: mobile/tablet/desktop | ✅ |
| Works offline (localStorage fallback) | ✅ |
| Vercel SPA routing | ✅ |

---

## 🕸️ Admin Dashboard

- URL: `/#admin` or `/admin`
- Default passcode: `aceclub2026` (change via `VITE_ADMIN_PASSWORD` env var)
- Change organizer passcode: update `VITE_ADMIN_PASSWORD` in `.env` or Vercel settings

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AdminDashboard.tsx   # Full organizer control panel
│   ├── Footer.tsx           # ACE CLUB motto footer
│   ├── Header.tsx           # Title, subtitle, stats strip
│   ├── LeaderboardTable.tsx # Live ranked table
│   ├── Navbar.tsx           # Navigation + search + mode toggles
│   ├── SpiderLogo.tsx       # Spider-Man SVG emblem
│   └── SpiderWebBackground.tsx  # Animated canvas web
├── lib/
│   └── supabase.ts          # DB client, CRUD ops, realtime subscription
├── types/
│   └── leaderboard.ts       # TypeScript interfaces
├── utils/
│   ├── ranking.ts           # Competition ranking algorithm
│   └── sound.ts             # Web Audio API SFX
├── App.tsx                  # Root application & routing
├── index.css                # Spider-Man design system
└── main.tsx
supabase_schema.sql          # Paste this into Supabase SQL Editor
vercel.json                  # SPA route config
.env.example                 # Copy → .env and fill in your keys
```

---

## 📝 Scoring Rules

- **Final Points = Round 1 + Round 2** (always auto-calculated)
- Rankings are sorted by Final Points descending
- Ties use **competition ranking**: 1, 2, 2, 4
- Scores must be non-negative numbers
- Organizer never enters Final Points manually
