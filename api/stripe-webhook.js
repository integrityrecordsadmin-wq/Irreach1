

import Stripe from "stripe";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

export const config = {
  api: { bodyParser: false },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on("data", (chunk) => chunks.push(chunk));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", reject);
  });
}

// Maps each ebook product id to its actual PDF filename in /public
const EBOOK_FILES = {
  "ebook-contract": "integrity-records-music-contract-guide.pdf",
  "ebook-kingdoms": "kingdoms-for-a-song.pdf",
  "ebook-wilderness": "the-wilderness-deal.pdf",
  "ebook-bowing": "bowing-for-the-beat.pdf",
  "ebook-glory": "causing-the-glory-to-fall.pdf",
  "ebook-undivided": "undivided.pdf",
  "ebook-asyourself": "as-yourself.pdf",
  "ebook-bondofpeace": "bond-of-peace.pdf",
  "ebook-overcomers": "the-overcomers.pdf",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let event;
  try {
    const rawBody = await buffer(req);
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerEmail = session.customer_details?.email || null;

    // Two possible sources for which item(s) were purchased:
    // 1. Cart checkout (create-checkout-session.js) sets metadata.itemIds as a JSON array.
    // 2. A one-click Stripe Payment Link sets metadata.itemId as a single string.
    let itemIds = [];
    try {
      if (session.metadata?.itemIds) {
        itemIds = JSON.parse(session.metadata.itemIds);
      } else if (session.metadata?.itemId) {
        itemIds = [session.metadata.itemId];
      }
    } catch {
      itemIds = [];
    }

    // Fallback: if no metadata present (e.g. older sessions/links), default to the
    // original contract guide so existing behavior doesn't silently break.
    if (itemIds.length === 0) {
      itemIds = ["ebook-contract"];
    }

    for (const id of itemIds) {
      const fileName = EBOOK_FILES[id];
      if (!fileName) continue; // not an ebook (e.g. ringtone, planner, subscription) — skip

      const token = crypto.randomBytes(24).toString("hex");
      await db.collection("downloadTokens").doc(token).set({
        productId: id,
        fileName,
        email: customerEmail,
        used: false,
        createdAt: new Date().toISOString(),
        stripeSessionId: session.id,
      });
    }
  }

  return res.status(200).json({ received: true });
}
