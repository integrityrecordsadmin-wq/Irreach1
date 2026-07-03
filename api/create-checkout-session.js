/**
 * create-checkout-session.js
 * ---------------------------------------------------------------------------
 * This is the ONE piece that has to live on a server, not in the app itself.
 * Your Stripe secret key must never be shipped to a browser — this function
 * is where it stays safe.
 *
 * WHAT THIS DOES
 * The app's checkout button sends your cart (title, price, type for each
 * item) to this function. This function creates a real Stripe Checkout
 * Session and hands back its URL. The app then redirects the customer to
 * that URL, where Stripe hosts the actual payment page.
 *
 * WHERE TO DEPLOY THIS
 * Any of these work well and have generous free tiers:
 *   - Vercel   (as an API route, e.g. /api/create-checkout-session.js)
 *   - Netlify  (as a serverless function)
 *   - Render / Railway (as a small Express server — see note at bottom)
 *
 * SETUP STEPS
 *   1. Create a Stripe account at https://dashboard.stripe.com/register
 *   2. Get your secret key from https://dashboard.stripe.com/apikeys
 *      (starts with sk_test_... while testing, sk_live_... when you're ready
 *      to accept real payments)
 *   3. Set it as an environment variable called STRIPE_SECRET_KEY on
 *      whichever platform you deploy to — never paste it directly in code.
 *   4. Deploy this file. Copy the URL it gives you.
 *   5. Paste that URL into STRIPE_CHECKOUT_ENDPOINT near the top of
 *      integrity-records.jsx.
 *   6. Set up a webhook (see note at the bottom) so subscriptions and
 *      purchases stay in sync even if the customer closes the tab.
 *
 * This file is written for Vercel/Netlify-style "one function per file"
 * hosting. If your platform expects a different export shape (e.g. a full
 * Express app), the Stripe logic in the middle stays the same — only the
 * top and bottom wiring changes.
 * ---------------------------------------------------------------------------
 */

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Subscription items use Stripe Prices (set up once in the Stripe Dashboard
// under Product Catalog) so Stripe can handle recurring billing correctly.
// Paste the Price IDs here after creating them.
const SUBSCRIPTION_PRICE_IDS = {
  "sub-monthly": "price_1TotlICWc6rJyyWeqybbEE8n",
  "sub-yearly": "price_1TotlICWc6rJyyWeaeTycZqo",
};

module.exports = async (req, res) => {
  // Basic CORS so the app (hosted on a different domain) can call this.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Split the cart: a subscription checkout can't be mixed with one-time
    // items in the same Stripe Checkout Session, so if a subscription is
    // present, it's charged alone and the one-time items are cleared from
    // the cart client-side after (handle that in the app if you allow mixing).
    const subscriptionItem = items.find((i) => i.type === "subscription");

    let session;

    if (subscriptionItem) {
      const priceId = SUBSCRIPTION_PRICE_IDS[subscriptionItem.id];
      if (!priceId || priceId.includes("REPLACE")) {
        return res.status(400).json({ error: "Subscription price not configured yet" });
      }
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${req.headers.origin}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}?checkout=cancelled`,
      });
    } else {
      // One-time items (ringtones, ebook, planner) are built as line items
      // directly, in cents, since Stripe works in the smallest currency unit.
      const line_items = items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.title },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
      }));

      session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items,
        success_url: `${req.headers.origin}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}?checkout=cancelled`,
      });
    }

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session error:", err);
    return res.status(500).json({ error: "Could not create checkout session" });
  }
};

/**
 * WEBHOOK NOTE
 * ---------------------------------------------------------------------------
 * This function starts checkout, but confirming that money actually landed
 * (and unlocking downloads / activating a subscription) should happen via a
 * Stripe webhook, not just the success_url redirect — a customer closing
 * their browser right after paying shouldn't cost them their purchase.
 *
 * Add a second function (e.g. stripe-webhook.js) that listens for the
 * checkout.session.completed event and, from there, marks the purchase or
 * subscription active in your own database. Stripe's docs walk through this
 * exact flow: https://stripe.com/docs/webhooks
 */
