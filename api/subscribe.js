import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, name, source } = req.body || {};

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  try {
    // One doc per email (not auto-ID) so re-signups just update instead of
    // creating duplicate contacts in the list.
    await db.collection("freeGuideSignups").doc(email.toLowerCase().trim()).set(
      {
        email: email.toLowerCase().trim(),
        name: name || null,
        source: source || "free-guide-page",
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Signup save error:", err.message);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
