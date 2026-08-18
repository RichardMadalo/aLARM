# aLARM Dashboard

Prop-firm style web dashboard for the aLARM MT5 EA. Same stack as RentTrack: Next.js (App Router) + Prisma + Neon Postgres, deployed on Vercel — all free tier.

**No broker credentials ever touch this app.** It only talks to a random "Pairing Key" that links your MT5 terminal (running the EA) to this website. Your actual login stays only between your MT5 terminal and your broker.

## Deploy (same flow as RentTrack)

1. **Database**: create a free Neon Postgres project → copy the connection string.
2. **Local setup**:
   ```bash
   npm install
   cp .env.example .env      # paste your Neon DATABASE_URL in, set NEXTAUTH_SECRET/NEXTAUTH_URL
   npx prisma migrate dev --name init
   npm run dev                # http://localhost:3000
   ```
3. **Deploy to Vercel**:
   - Push this folder to a GitHub repo
   - Import it in Vercel
   - Add the `DATABASE_URL`, `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`), and `NEXTAUTH_URL` (your production URL) environment variables in Vercel's project settings
   - Deploy — Vercel runs `prisma generate` automatically via the `postinstall` script
4. Open the deployed URL, sign up with an email/password, and log in. Each account gets its own paired `RiskAccount` with a **Pairing Key** shown on the dashboard — copy that into the EA's `InpPairingKey` input in MT5, and put this site's URL into `InpApiUrl`.
5. In MT5: **Tools → Options → Expert Advisors → Allow WebRequest for listed URL** → add your deployed URL. Required or MT5 blocks the sync calls (its own security gate, not something the EA can skip).

## What it does
- `/login`, `/signup` — email/password auth (NextAuth, credentials provider). Each user gets their own `RiskAccount`.
- `/api/account` — serves the current state+settings for the logged-in user's account, and accepts settings updates from the Settings modal. Identifies the caller via session, not the pairing key.
- `/api/sync` — the endpoint the EA calls every ~10s: pushes live balance/equity/P&L/lock state, and receives back whatever limits you've set on the website. Identifies the account purely via `pairingKey` in the request body — the EA has no browser session, so this endpoint is intentionally separate from the login system.
- The dashboard polls `/api/account` every 4s so the numbers stay live without a manual refresh.
- The **Emergency Lock** button sets a flag the EA picks up on its next sync and immediately flattens the account.

## Notes
- Multi-user: each signed-up account gets exactly one `RiskAccount` (1:1), created at signup.
- The Pairing Key still gates the EA sync endpoint — don't share it publicly, since anyone with it could change your limits or trigger the lock via `/api/sync` directly. It's no longer the browser-side auth, though; that's now your email/password.
