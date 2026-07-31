import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

// PDFs live here (repo root, NOT inside /public — so there's no direct web URL
// to them at all). See vercel.json for the includeFiles config that ships
// this folder with the serverless function.
const PRIVATE_FILES_DIR = path.join(process.cwd(), "ebooks-private");

function errorPage(res, status, message) {
  res.status(status).setHeader("Content-Type", "text/html");
  res.send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; padding: 60px 20px;">
        <h2>This link isn't working</h2>
        <p>${message}</p>
        <p style="color:#888; font-size: 14px;">
          If you believe this is a mistake, contact irrecruitingadmin@gmail.com.
        </p>
      </body>
    </html>
  `);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.query;
  if (!token) {
    return errorPage(res, 400, "No download token was provided.");
  }

  const docRef = db.collection("downloadTokens").doc(token);
  const doc = await docRef.get();

  if (!doc.exists) {
    return errorPage(res, 404, "This download link is invalid.");
  }

  const data = doc.data();

  if (data.used) {
    return errorPage(
      res,
      410,
      "This download link has already been used. Each link works once — contact us if you need it resent."
    );
  }

  const filePath = path.join(PRIVATE_FILES_DIR, data.fileName);

  // Guard against path traversal — fileName should only ever be one of our
  // known filenames from Firestore, but never trust it blindly.
  if (!filePath.startsWith(PRIVATE_FILES_DIR) || !fs.existsSync(filePath)) {
    console.error("Download file missing on disk:", data.fileName);
    return errorPage(
      res,
      500,
      "We couldn't locate this file. Please contact us and we'll resend it."
    );
  }

  // Mark used BEFORE streaming, so a race (two rapid requests with the same
  // token) can't both slip through.
  await docRef.update({ used: true, usedAt: new Date().toISOString() });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${data.fileName}"`);
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}

