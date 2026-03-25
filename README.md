# SYNTAXTERROR

> Multiplayer Browser Arena - Kein Erbarmen.

Echtzeit-Multiplayer-Browserspiel mit 4 Game Modes. Gebaut fuer LAN-Partys, Azubi-Abende und alle die denken sie haetten IT-Wissen. Spoiler: haben sie nicht.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-blue)
![License](https://img.shields.io/badge/License-ISC-yellow)

## Game Modes

| Mode | Beschreibung | Spieler |
|------|-------------|---------|
| **IT Quiz** | Kahoot-Style Quiz mit brutalen Roasts. Kategorien: IT Allgemein, FISI/IHK, Allgemeinwissen | 2-20 |
| **Speed Typing** | Code-Snippets auf Zeit abtippen (JS, SQL, Docker, Bash...) | 2-20 |
| **Schaetz-Arena** | IT-Schaetzfragen - wer am naechsten dran ist gewinnt | 2-20 |
| **Emoji Roulette** | Reaktionstest - drueck wenn das richtige Emoji erscheint | 2-20 |

## Features

- Echtzeit-Multiplayer via Socket.IO
- Room-System mit 5-stelligem Code
- Host waehlt Game Mode, Kategorien und Einstellungen
- 70+ FISI/IHK-Pruefungsfragen (Netzwerk, Sicherheit, Datenbanken, Projektmanagement)
- Brutale Roasts bei falschen Antworten
- Streak-System mit Kill-Nachrichten
- Podium & Leaderboard
- Dark Mode UI mit Glitch-Animationen
- Keyboard-Shortcuts (1-4/A-D im Quiz, Space fuer Emoji-Tap)
- Responsive Design

## Schnellstart

```bash
git clone https://github.com/niklask52t/syntaxterror.git
cd syntaxterror
npm install
npm start
```

Dann im Browser: `http://localhost:3000`

## Deployment (Debian)

Siehe [DEPLOY.md](DEPLOY.md) fuer eine Anleitung zum Deployment auf Debian 13.

## Tech Stack

- **Backend:** Node.js + Express + Socket.IO
- **Frontend:** Vanilla HTML/CSS/JS (kein Framework-Bloat)
- **Fonts:** Inter + JetBrains Mono (via Google Fonts)

## Projektstruktur

```
syntaxterror/
  server.js          # Express + Socket.IO Server mit Game Logic
  questions.js       # Quiz-Fragen (kategorisiert)
  package.json
  public/
    index.html       # Alle Screens (Menu, Lobby, Games, Results)
    style.css        # Dark Mode UI
    game.js          # Client-Side Game Logic
```

## Lizenz

ISC
