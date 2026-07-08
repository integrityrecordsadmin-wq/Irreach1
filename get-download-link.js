import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: "Missing session_id" });
  }

  for (let attempt = 0; attempt < 6; attempt++) {
    const snapshot = await db
      .collection("downloadTokens")
      .where("stripeSessionId", "==", session_id)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const token = snapshot.docs[0].id;
      return res.status(200).json({ downloadUrl: `/api/download?token=${token}` });
    }

    await sleep(1500);
  }

  return res.status(202).json({ pending: true });
}
