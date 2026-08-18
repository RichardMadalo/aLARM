# aLARM Dashboard

Prop-firm style web dashboard for the aLARM MT5 EA. Same stack as RentTrack: Next.js (App Router) + Prisma + Neon Postgres, deployed on Vercel — all free tier.

**No broker credentials ever touch this app.** It only talks to a random "Pairing Key" that links your MT5 terminal (running the EA) to this website. Your actual login stays only between your MT5 terminal and your broker.

## Deploy (same flow as RentTrack)

1. **Database**: create a free Neon Postgres project → copy the connection string.
2. **Local setup**:
   ```bash
   npm install
   cp .env.example .env      # paste your Neon DATABASE_URL in
   npx prisma migrate dev --name init
   npm run dev                # http://localhost:3000
   ```
3. **Deploy to Vercel**:
   - Push this folder to a GitHub repo
   - Import it in Vercel
   - Add the `DATABASE_URL` environment variable in Vercel's project settings
   - Deploy — Vercel runs `prisma generate` automatically via the `postinstall` script
4. Open the deployed URL once in a browser. It auto-generates a **Pairing Key** and displays it with setup instructions — copy that into the EA's `InpPairingKey` input in MT5, and put this site's URL into `InpApiUrl`.
5. In MT5: **Tools → Options → Expert Advisors → Allow WebRequest for listed URL** → add your deployed URL. Required or MT5 blocks the sync calls (its own security gate, not something the EA can skip).

## What it does
- `/api/account` — creates the paired account, serves current state+settings to the dashboard, and accepts settings updates from the Settings modal.
- `/api/sync` — the endpoint the EA calls every ~10s: pushes live balance/equity/P&L/lock state, and receives back whatever limits you've set on the website.
- The dashboard polls `/api/account` every 4s so the numbers stay live without a manual refresh.
- The **Emergency Lock** button sets a flag the EA picks up on its next sync and immediately flattens the account.

## Notes
- This is single-account by design (matches "my own live account risk manager"). If you ever want to manage multiple accounts from one dashboard, the schema already supports multiple `RiskAccount` rows — it would just need a picker UI, which I can add if you want it.
- There's no login page — the Pairing Key in `localStorage` is the only "auth." That's fine for a personal tool you're not sharing publicly, but don't post your deployed URL + pairing key anywhere public, since anyone with the key could change your limits or trigger the lock from the API directly.
