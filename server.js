const express = require("express");
const path = require("path");
const admin = require("firebase-admin");

const app = express();
app.use(express.json({ limit: "10kb" }));

// Firebase Admin: Service-Account entweder als Umgebungsvariable FIREBASE_SERVICE_ACCOUNT
// (kompletter JSON-Inhalt, empfohlen auf Render) oder lokal als serviceAccountKey.json.
let adminBereit = false;
try {
  const roh = process.env.FIREBASE_SERVICE_ACCOUNT;
  const key = roh ? JSON.parse(roh) : require("./serviceAccountKey.json");
  admin.initializeApp({ credential: admin.credential.cert(key) });
  adminBereit = true;
} catch (e) {
  console.warn("Firebase Admin nicht eingerichtet – Passwort-Änderung durch Admins ist deaktiviert.");
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

app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Portal läuft auf Port ${PORT}`));