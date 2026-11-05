const express = require("express");
const path = require("path");
const admin = require("firebase-admin");

const app = express();
app.use(express.json({ limit: "10kb" }));

// Firebase Admin: Service-Account entweder als Umgebungsvariable FIREBASE_SERVICE_ACCOUNT
// (kompletter JSON-Inhalt, empfohlen auf Render) oder lokal als serviceAccountKey.json.
let adminBereit = false;
try {
  // Der Schlüssel kommt aus einer Variable beim Hoster (Railway): der komplette Inhalt der JSON-Datei.
  // Erlaubte Namen: FIREBASE_SERVICE_ACCOUNT, FIREBASE_KEY oder REF. Lokal geht weiterhin serviceAccountKey.json.
  const roh = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_KEY || process.env.REF;
  let key;
  if (roh) {
    const text = roh.trim().startsWith("{") ? roh : Buffer.from(roh, "base64").toString("utf8"); // auch Base64 möglich
    key = JSON.parse(text);
  } else {
    key = require("./serviceAccountKey.json");
  }
  if (typeof key.private_key === "string") key.private_key = key.private_key.replace(/\\n/g, "\n");
  admin.initializeApp({ credential: admin.credential.cert(key) });
  adminBereit = true;
} catch (e) {
  console.warn("Firebase Admin nicht eingerichtet – Passwort-Änderung durch Admins ist deaktiviert. Grund:", e.message);
}

// Admin setzt das Passwort eines anderen Mitglieds
app.post("/api/admin/passwort", async (req, res) => {
  if (!adminBereit) {
    return res.status(503).json({ fehler: "Der Server ist dafür noch nicht eingerichtet (Service-Account fehlt)." });
  }
  try {
    const token = (req.headers.authorization || "").replace(/^Bearer /, "");
    if (!token) return res.status(401).json({ fehler: "Nicht angemeldet." });
    const decoded = await admin.auth().verifyIdToken(token);

    const db = admin.firestore();
    const ich = await db.doc(`users/${decoded.uid}`).get();
    if (!ich.exists || ich.data().active !== true || ich.data().role !== "admin") {
      return res.status(403).json({ fehler: "Dafür fehlt dir die Berechtigung." });
    }

    const { uid, password } = req.body || {};
    if (typeof uid !== "string" || !/^[A-Za-z0-9]{1,128}$/.test(uid)) {
      return res.status(400).json({ fehler: "Ungültiges Mitglied." });
    }
    if (typeof password !== "string" || password.length < 6 || password.length > 128) {
      return res.status(400).json({ fehler: "Das Passwort braucht mindestens 6 Zeichen." });
    }
    if (!(await db.doc(`users/${uid}`).get()).exists) {
      return res.status(404).json({ fehler: "Mitglied nicht gefunden." });
    }

    await admin.auth().updateUser(uid, { password });
    await admin.auth().revokeRefreshTokens(uid); // bestehende Sitzungen der Person beenden
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ fehler: "Das hat nicht geklappt. Bitte versuche es nochmal." });
  }
});

// Web-Config für die Seite (nicht geheim, kommt aber aus Variablen beim Hoster statt aus der index.html).
// Entweder FIREBASE_CONFIG = JSON mit apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId
// oder einzeln: FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET,
// FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID.
function webConfig() {
  if (process.env.FIREBASE_CONFIG) {
    try { return JSON.parse(process.env.FIREBASE_CONFIG); } catch (e) { console.warn("FIREBASE_CONFIG ist kein gültiges JSON."); }
  }
  const e = process.env;
  if (e.FIREBASE_API_KEY && e.FIREBASE_PROJECT_ID) {
    return {
      apiKey: e.FIREBASE_API_KEY,
      authDomain: e.FIREBASE_AUTH_DOMAIN || `${e.FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: e.FIREBASE_PROJECT_ID,
      storageBucket: e.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: e.FIREBASE_MESSAGING_SENDER_ID,
      appId: e.FIREBASE_APP_ID,
    };
  }
  // Kein Fallback mehr: Die Config kommt ausschließlich aus den Railway-Variablen.
  return null;
}
app.get("/api/firebase-config", (req, res) => {
  const cfg = webConfig();
  res.set("Cache-Control", "no-store");
  if (!cfg || !cfg.apiKey || !cfg.projectId) return res.status(503).json({ fehler: "Firebase-Config fehlt auf dem Server." });
  res.json(cfg);
});

app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Portal läuft auf Port ${PORT}`));