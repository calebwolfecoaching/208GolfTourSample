# 208 Golf Tour — Proof of Concept

A mobile-first web app for Idaho's premier recreational golf tour.

## Quick Deploy to Vercel (easiest — ~2 minutes)

### Option A: Deploy from GitHub
1. Go to [github.com/new](https://github.com/new) and create a new repository (e.g. `208-golf-tour`)
2. Upload all these files to the repo (drag and drop works)
3. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account (free)
4. Click **"Add New Project"**
5. Select your `208-golf-tour` repo
6. Vercel auto-detects Vite — just click **"Deploy"**
7. Done! You'll get a URL like `208-golf-tour.vercel.app`

### Option B: Deploy with Vercel CLI
```bash
npm install -g vercel
cd 208-golf-tour-deploy
npm install
vercel
```
Follow the prompts — it'll give you a live URL in about 30 seconds.

## Run Locally
```bash
npm install
npm run dev
```
Opens at `http://localhost:5173`

## Demo Accounts
- **Any email + password** → logs in as a sample player (Jake Morrison)
- **Type "admin" as email** → opens the admin panel

## What's Included
- Landing page with branding
- Sign up (combined with player registration)
- Login / forgot password
- Player dashboard with wallet summary
- Tournament schedule with status badges
- Tournament registration with payment flow
- Score submission (net + gross, partner dropdown, screenshot upload)
- Leaderboards (hidden until admin reveals)
- Rules page (accordion sections)
- Notifications with unread badges
- Wallet with transaction history
- Full admin panel (manage tournaments, verify scores, calculate payouts)
- Mobile-first responsive design

## Tech
- React 18 + Vite
- No external UI libraries — all custom components
- Fonts: Outfit (headings) + DM Sans (body) via Google Fonts
- Zero backend — all data is in-memory for demo purposes
