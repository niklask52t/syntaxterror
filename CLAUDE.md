# SYNTAXTERROR - Claude Code Context

## Projektbeschreibung
Echtzeit-Multiplayer-Browserspiel mit 4 Game Modes (IT Quiz, Speed Typing, Schätz-Arena, Emoji Roulette). Node.js + Socket.IO Backend, Vanilla Frontend.

## Architektur
- `server.js` - Express-Server, Socket.IO Events, Game Logic für alle 4 Modi
- `questions.js` - Quiz-Fragen kategorisiert (it, fisi, allgemein), exportiert als CommonJS
- `public/index.html` - Alle Screens als hidden divs, screen-switching via JS
- `public/style.css` - Komplettes Dark-Theme UI
- `public/game.js` - Client-Side State, Socket Events, DOM Manipulation

## Konventionen
- Sprache im Code: Englisch (Variablen, Funktionen)
- Sprache im UI/Content: Deutsch
- Keine Frameworks - alles Vanilla JS
- Socket Events folgen dem Pattern: `noun-verb` (z.B. `quiz-question`, `typing-complete`)
- Fragen-Format in questions.js: `{ q, answers[], correct (index), roast }`

## Wichtige Patterns
- Rooms werden als Map gespeichert, Room-Code als Key
- Jeder Game Mode hat: start -> send round -> collect answers -> reveal -> next/end
- Timer-Management: Server hat authoritative Timer, Client zeigt visuellen Timer
- Kategorie-System: Quiz-Fragen sind nach Kategorie (it/fisi/allgemein) gruppiert

## Deployment
- `npm start` startet den Server auf Port 3000 (oder PORT env var)
- `update.sh` für Debian-Server: pulled, installiert, restartet systemd service
