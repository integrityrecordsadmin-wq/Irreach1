import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import crypto from "crypto";

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

// Same mapping used by the Stripe webhook — keep these in sync if you add ebooks.
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

  // Simple shared-secret check — only you (or anything you tell the secret to)
  // can mint download links. Set ADMIN_DOWNLOAD_SECRET in Vercel env vars.
  const providedSecret = req.headers["x-admin-secret"];
  if (!providedSecret || providedSecret !== process.env.ADMIN_DOWNLOAD_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { productId, email, note } = req.body || {};

  if (!productId || !email) {
    return res.status(400).json({ error: "productId and email are required" });
  }

  const fileName = EBOOK_FILES[productId];
  if (!fileName) {
    return res.status(400).json({
      error: `Unknown productId "${productId}". Valid options: ${Object.keys(EBOOK_FILES).join(", ")}`,
    });
  }

  const token = crypto.randomBytes(24).toString("hex");
  await db.collection("downloadTokens").doc(token).set({
    productId,
    fileName,
    email,
    used: false,
    createdAt: new Date().toISOString(),
    source: "manual", // distinguishes Cash App / manual grants from Stripe-created tokens
    note: note || null,
  });

  const link = `${process.env.SITE_URL || "https://integrityrecords.org"}/api/download?token=${token}`;

  return res.status(200).json({ token, link });
}
