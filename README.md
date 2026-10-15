<<<<<<< HEAD
# ASFINAG – Mitgliederportal
=======
# Feuerwehr Wien – Mitgliederportal
>>>>>>> 77e245b5127057057d78ba1b6d65ae0255ca4007

Login, Einsatzberichte, Beförderungen, Arbeitsunfälle, Lehrgänge, Verwarnungen, Telefonbuch,
Mitgliederprofile und Verwaltung (Firebase Auth + Firestore).

<<<<<<< HEAD
1. **Neues** Firebase-Projekt für die ASFINAG anlegen (Authentication: E-Mail/Passwort aktivieren, Firestore erstellen) und die Web-App-Config in `public/index.html` eintragen (`firebaseConfig`).
=======
1. Firebase-Config in `public/index.html` eintragen (`firebaseConfig`).
>>>>>>> 77e245b5127057057d78ba1b6d65ae0255ca4007
2. Inhalt von `firestore.rules` in der Firestore-Konsole unter "Regeln" einfügen und veröffentlichen.
3. Service-Account für das Zurücksetzen fremder Passwörter einrichten:
   Firebase-Konsole → Projekteinstellungen → Dienstkonten → "Neuen privaten Schlüssel generieren".
   - Lokal: Datei als `serviceAccountKey.json` neben `server.js` legen (steht in der `.gitignore`).
   - Auf Render: Umgebungsvariable `FIREBASE_SERVICE_ACCOUNT` mit dem **kompletten JSON-Inhalt** anlegen.
4. Lokal starten: `npm install && npm start` → http://localhost:3000
5. Auf Render: Repo verbinden, `render.yaml` wird automatisch erkannt.
6. Deine Render-Domain unter Firebase → Authentication → Einstellungen → Autorisierte Domains eintragen.