# SYNTAXTERROR - Deployment auf Debian 13

## Schnell-Setup (Dev)

### 1. Node.js installieren

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs
```

### 2. Repo klonen und starten

```bash
cd /opt
sudo git clone https://github.com/niklask52t/syntaxterror.git
sudo chown -R $USER:$USER /opt/syntaxterror
cd /opt/syntaxterror
npm install
npm start
```

Laeuft jetzt auf `http://DEINE-IP:3000`

### 3. Systemd Service (laeuft dauerhaft)

```bash
sudo tee /etc/systemd/system/syntaxterror.service > /dev/null << 'EOF'
[Unit]
Description=SYNTAXTERROR Multiplayer Arena
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

sudo chown -R www-data:www-data /opt/syntaxterror
sudo systemctl daemon-reload
sudo systemctl enable syntaxterror
sudo systemctl start syntaxterror
```

### 4. Status pruefen

```bash
sudo systemctl status syntaxterror
# oder
journalctl -u syntaxterror -f
```

### 5. Firewall (falls ufw aktiv)

```bash
sudo ufw allow 3000/tcp
```

## Optional: Nginx Reverse Proxy (Port 80)

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
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/syntaxterror /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## Updates

```bash
cd /opt/syntaxterror
./update.sh
```
