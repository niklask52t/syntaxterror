# SYNTAXTERROR

> IT Quiz & Lernkarten - Kein Erbarmen.

Multiplayer IT-Quiz und Lernkarten-App. Gebaut für LAN-Partys, Azubi-Abende und IHK-Prüfungsvorbereitung.

![Node.js](https://img.shields.io/badge/Node.js-22+-green)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-blue)
![License](https://img.shields.io/badge/License-ISC-yellow)

## Modi

| Modus | Beschreibung | Spieler |
|-------|-------------|---------|
| **IT Quiz** | Kahoot-Style Quiz mit brutalen Roasts, Kategorien (IT, FISI/IHK, Allgemeinwissen), Streak-System | 2-20 |
| **Lernkarten** | Karteikarten mit Flip-Animation, 212 FISI AP2 + 255 WiSo Karten (u-form) | Solo |

## Features

- Echtzeit-Multiplayer via Socket.IO
- Room-System mit 5-stelligem Code
- 100+ Quiz-Fragen mit brutalen Roasts bei falschen Antworten
- 467 Lernkarten (FISI Abschlussprüfung Teil 2 + Wirtschafts- & Sozialkunde)
- Streak-System, Statistik nach dem Spiel
- Dark Mode UI mit Glitch-Animationen
- Keyboard-Shortcuts (1-4/A-D im Quiz, Space/Pfeiltasten bei Lernkarten)
- Responsive Design (Desktop + Mobile)

## Schnellstart (Lokal)

```bash
git clone https://github.com/niklask52t/syntaxterror.git
cd syntaxterror
npm install
npm start
```

Browser: `http://localhost:3000`

## Produktiv-Deployment (Debian/Ubuntu)

### 1. Node.js installieren

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs git
```

### 2. App installieren

```bash
cd /opt
sudo git clone https://github.com/niklask52t/syntaxterror.git
sudo chown -R www-data:www-data /opt/syntaxterror
cd /opt/syntaxterror
npm install --production
```

### 3. Systemd Service einrichten

```bash
sudo tee /etc/systemd/system/syntaxterror.service > /dev/null << 'EOF'
[Unit]
Description=SYNTAXTERROR
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/syntaxterror
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
Environment=PORT=3000
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable syntaxterror
sudo systemctl start syntaxterror
```

### 4. Nginx Reverse Proxy (optional, für Port 80/443)

```bash
sudo apt install -y nginx
sudo tee /etc/nginx/sites-available/syntaxterror > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/syntaxterror /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Updates einspielen

```bash
cd /opt/syntaxterror
./update.sh
```

## Tech Stack

- **Backend:** Node.js + Express + Socket.IO
- **Frontend:** Vanilla HTML/CSS/JS
- **Fonts:** Inter + JetBrains Mono (Google Fonts)

## Projektstruktur

```
syntaxterror/
  server.js                    # Express + Socket.IO Server
  questions.js                 # Quiz-Fragen (kategorisiert)
  public/
    index.html                 # Alle Screens
    style.css                  # Dark Mode UI
    game.js                    # Client Logic
    flashcards-fisi.json       # 212 FISI AP2 Lernkarten
    flashcards-wiso.json       # 255 WiSo Lernkarten
```

## Lizenz

ISC
