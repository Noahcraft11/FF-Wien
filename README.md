# WerkstattNet – Mitgliederportal

Desktop-Oberfläche mit Login und Apps (Firebase Auth + Firestore).
Die klassische Ansicht liegt zusätzlich unter `/klassisch.html`.

## Einrichten
1. Firebase-Projekt anlegen: Authentication (E-Mail/Passwort aktivieren) und Firestore erstellen.
2. Inhalt von `firestore.rules` in der Firestore-Konsole unter "Regeln" einfügen und veröffentlichen.
3. Web-App in Firebase anlegen und deren Config als JSON kopieren.

## Railway
Variablen (Railway → Service → Variables):
- `FIREBASE_CONFIG` = JSON der Web-App-Config (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)
- `FIREBASE_SERVICE_ACCOUNT` = kompletter JSON-Inhalt des Service-Account-Schlüssels
  (Firebase → Projekteinstellungen → Dienstkonten → "Neuen privaten Schlüssel generieren").
  Nötig nur für "Passwort setzen (Admin)".

Danach die Railway-Domain in Firebase → Authentication → Einstellungen → Autorisierte Domains eintragen.
Start: `npm start` (Railway erkennt das automatisch).

## Lokal
`npm install && npm start` → http://localhost:3000
Lokal kann statt der Variablen `FIREBASE_CONFIG` gesetzt werden, z. B.
`FIREBASE_CONFIG='{"apiKey":"...","projectId":"..."}' npm start`.
Optional `serviceAccountKey.json` neben `server.js` (steht in der `.gitignore`).

## Hinweis
Der Login hängt an den Benutzernamen intern `@asfinag.portal` an (in `public/index.html`, Funktion `zuMail`).
