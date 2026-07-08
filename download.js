import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Missing download token.");
  }

  const docRef = db.collection("downloadTokens").doc(token);
  const doc = await docRef.get();

  if (!doc.exists) {
    return res
      .status(404)
      .send("This download link is invalid. If you just purchased, please check your email or contact support.");
  }

  const data = doc.data();

  if (data.used) {
    return res
      .status(410)
      .send("This download link has already been used. Contact support if you need the file again.");
  }

  await docRef.update({ used: true, usedAt: new Date().toISOString() });

  const filePath = path.join(process.cwd(), "public", data.fileName);
  const fileBuffer = fs.readFileSync(filePath);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${data.fileName}"`
  );
  res.status(200).send(fileBuffer);
}
