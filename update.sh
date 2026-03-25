#!/bin/bash
set -e

# SYNTAXTERROR Update & Start Script
# Verwendung:
#   ./update.sh          - Pull, Install, Restart
#   ./update.sh start    - Nur starten
#   ./update.sh stop     - Nur stoppen
#   ./update.sh status   - Status anzeigen
#   ./update.sh logs     - Live Logs anzeigen
#   ./update.sh dev      - Dev-Modus (ohne systemd, direkt im Terminal)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVICE_NAME="syntaxterror"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

banner() {
    echo -e "${CYAN}"
    echo "  ╔═══════════════════════════════════════╗"
    echo "  ║   SYNTAXTERROR - Update & Control     ║"
    echo "  ╚═══════════════════════════════════════╝"
    echo -e "${NC}"
}

log() { echo -e "${GREEN}[+]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[x]${NC} $1"; }

cmd_update() {
    banner
    cd "$SCRIPT_DIR"

    log "Pulling latest changes..."
    git pull origin dev 2>/dev/null || git pull 2>/dev/null || warn "Git pull fehlgeschlagen (kein Git-Repo?)"

    log "Installing dependencies..."
    npm install --production

    if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
        log "Restarting service..."
        sudo systemctl restart "$SERVICE_NAME"
        log "Service restarted!"
    else
        warn "Systemd service nicht aktiv. Starte manuell mit: ./update.sh dev"
    fi

    log "Done! SYNTAXTERROR ist bereit."
}

cmd_start() {
    log "Starting $SERVICE_NAME..."
    sudo systemctl start "$SERVICE_NAME"
    log "Started!"
}

cmd_stop() {
    log "Stopping $SERVICE_NAME..."
    sudo systemctl stop "$SERVICE_NAME"
    log "Stopped!"
}

cmd_status() {
    sudo systemctl status "$SERVICE_NAME" --no-pager
}

cmd_logs() {
    journalctl -u "$SERVICE_NAME" -f
}

cmd_dev() {
    banner
    cd "$SCRIPT_DIR"
    log "Starting in dev mode (Ctrl+C to stop)..."
    echo ""
    node server.js
}

case "${1:-update}" in
    update)  cmd_update ;;
    start)   cmd_start ;;
    stop)    cmd_stop ;;
    status)  cmd_status ;;
    logs)    cmd_logs ;;
    dev)     cmd_dev ;;
    *)
        echo "Usage: $0 {update|start|stop|status|logs|dev}"
        exit 1
        ;;
esac
