# Integrity Records — Deployment Guide

This folder is a real, working website project (not just a preview). Follow these
steps to put it on the internet for real, with working audio and Stripe checkout.

## What's in here
- `src/App.jsx` — the whole app (ringtones, subscription, shop, journal, cart, checkout)
- `public/audio/` — your 8 trimmed ringtone clips, served as normal files
- `api/create-checkout-session.js` — the Stripe backend piece (see STRIPE.md-style notes inside it)
- Everything else is standard project setup (Vite, Tailwind, React)

## Option A: Deploy with Vercel (recommended, free to start)

**1. Create accounts (if you don't have them)**
- GitHub: https://github.com/signup
- Vercel: https://vercel.com/signup (sign up using your GitHub account — it's one click)

**2. Get this project onto GitHub**
- Go to https://github.com/new, create a new repository named `integrity-records`
- On your computer, open a terminal in this folder and run:
  ```
  git init
  git add .
  git commit -m "Initial commit"
  git branch -M main
  git remote add origin https://github.com/YOUR-USERNAME/integrity-records.git
  git push -u origin main
  ```
  (Replace YOUR-USERNAME with your actual GitHub username)

**3. Import the project into Vercel**
- Go to https://vercel.com/new
- Click "Import" next to your `integrity-records` repository
- Vercel will auto-detect it's a Vite project — leave the default settings
- Click "Deploy"

**4. That's it — you'll get a live URL**
- Something like `integrity-records.vercel.app`
- Every time you push a change to GitHub, Vercel updates the live site automatically

## Testing locally first (optional, but recommended)

If you have Node.js installed on your computer (download at https://nodejs.org),
you can run this project on your own machine before deploying:
```
npm install
npm run dev
```
Then open the URL it gives you (usually `http://localhost:5173`) in your browser.
Ringtones should play immediately since these are real files being served normally.

## Connecting Stripe (once you're ready to accept real payments)

1. Create a Stripe account: https://dashboard.stripe.com/register
2. Get your secret key: https://dashboard.stripe.com/apikeys
3. In your Vercel project settings → Environment Variables, add:
   - Name: `STRIPE_SECRET_KEY`
   - Value: your Stripe secret key (starts with `sk_test_...` while testing)
4. In the Stripe Dashboard, create two recurring Prices under Product Catalog
   for the $4.99/month and $49.99/year subscription — copy their Price IDs
5. Open `api/create-checkout-session.js` and paste those Price IDs into the
   `SUBSCRIPTION_PRICE_IDS` object near the top
6. Open `src/App.jsx`, find `STRIPE_CHECKOUT_ENDPOINT` near the top, and set it to:
   ```
   const STRIPE_CHECKOUT_ENDPOINT = "/api/create-checkout-session";
   ```
7. Push your changes — checkout will now use real Stripe Checkout instead of demo mode

## Adding real artist names and photos

Open `src/App.jsx` and find the `TRACKS` array near the top. Fill in `artist`,
`photoUrl`, `gender`, and `culture` for each of the 8 tracks whenever you have
that information.

## A note on custom domains

Once deployed, Vercel lets you attach a real domain (like integrityrecords.com)
under Project Settings → Domains, if you own one or want to buy one.
