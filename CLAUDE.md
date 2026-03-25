# SYNTAXTERROR - Claude Code Context

## Projektbeschreibung
IT Quiz (Multiplayer) + Lernkarten (Singleplayer). Node.js + Socket.IO Backend, Vanilla Frontend.

## Architektur
- `server.js` - Express-Server, Socket.IO Events, Quiz-Logik
- `questions.js` - Quiz-Fragen kategorisiert (it, fisi, allgemein), exportiert als CommonJS
- `public/index.html` - Alle Screens als hidden divs, screen-switching via JS
- `public/style.css` - Dark-Theme UI, responsive für Mobile + Desktop
- `public/game.js` - Client: Quiz-Multiplayer + Lernkarten-Singleplayer
- `public/flashcards-fisi.json` - 212 FISI AP2 Lernkarten (aus u-form PDF extrahiert)
- `public/flashcards-wiso.json` - 255 WiSo Lernkarten (aus u-form PDF extrahiert)

## Konventionen
- Sprache im Code: Englisch (Variablen, Funktionen)
- Sprache im UI/Content: Deutsch
- Keine Frameworks - alles Vanilla JS
- Socket Events: `quiz-question`, `quiz-result`, `submit-answer`, `game-over` etc.
- Fragen-Format in questions.js: `{ q, answers[], correct (index), roast }`
- Lernkarten-Format: `{ q, a }` als JSON-Array

## Wichtige Patterns
- Rooms als Map, Room-Code als Key
- Quiz-Flow: start -> send -> collect answers -> reveal -> next/end
- Server hat authoritative Timer, Client zeigt visuellen Timer
- Lernkarten sind rein client-side (fetch JSON, kein Socket nötig)
- Kategorie-System: Quiz-Fragen nach Kategorie (it/fisi/allgemein) gruppiert

## Deployment
- `npm start` startet auf Port 3000 (oder PORT env var)
- `update.sh` für Debian-Server: pull, install, restart systemd service
- Produktiv-Setup: systemd service + optional nginx reverse proxy (siehe README.md)
