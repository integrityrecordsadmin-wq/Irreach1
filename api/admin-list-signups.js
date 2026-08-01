import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Reuses the same admin secret as the download-link tool — one password
  // to remember for both admin pages.
  const providedSecret = req.headers["x-admin-secret"];
  if (!providedSecret || providedSecret !== process.env.ADMIN_DOWNLOAD_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const snapshot = await db
      .collection("freeGuideSignups")
      .orderBy("createdAt", "desc")
      .get();

    const signups = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        email: data.email,
        name: data.name || null,
        source: data.source || null,
        createdAt: data.createdAt,
      };
    });

    return res.status(200).json({ signups, count: signups.length });
  } catch (err) {
    console.error("List signups error:", err.message);
    return res.status(500).json({ error: "Something went wrong loading the list." });
  }
}
