#!/usr/bin/env bash
# M3U Sync — instalador para Ubuntu 24.04
# Uso: sudo bash install.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_USER="m3usync"
APP_HOME="/opt/m3u-sync"
DATA_DIR="/var/lib/m3u-sync"
MEDIA_DIR="/mnt/media"
PORT="${PORT:-3001}"

echo "==> M3U Sync — instalação"

if [[ $EUID -ne 0 ]]; then echo "Rode como root: sudo bash install.sh"; exit 1; fi

echo "==> Pacotes do sistema (ffmpeg, node, build tools)"
apt-get update -y
apt-get install -y curl ca-certificates gnupg ffmpeg build-essential python3 ufw

if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -c2- | cut -d. -f1)" -lt 20 ]]; then
  echo "==> Instalando Node.js 20 LTS"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "==> Usuário e diretórios"
id -u "$APP_USER" &>/dev/null || useradd --system --home "$APP_HOME" --shell /usr/sbin/nologin "$APP_USER"
mkdir -p "$APP_HOME" "$DATA_DIR" "$MEDIA_DIR/movies" "$MEDIA_DIR/series"
cp -r "$REPO_DIR/"* "$APP_HOME/"
chown -R "$APP_USER":"$APP_USER" "$APP_HOME" "$DATA_DIR" "$MEDIA_DIR"

echo "==> npm install"
cd "$APP_HOME"
sudo -u "$APP_USER" npm install --omit=dev --no-audit --no-fund

# Config .env
ENV_FILE="$APP_HOME/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  ADMIN_PASSWORD="$(openssl rand -base64 24 | tr -d '=+/' | cut -c1-20)"
  JWT_SECRET="$(openssl rand -hex 32)"
  cat > "$ENV_FILE" <<EOF
PORT=$PORT
HOST=0.0.0.0
DATA_DIR=$DATA_DIR
MEDIA_DIR=$MEDIA_DIR
ADMIN_USER=admin
ADMIN_PASSWORD=$ADMIN_PASSWORD
JWT_SECRET=$JWT_SECRET
MAX_CONCURRENT=2
FFMPEG_PATH=/usr/bin/ffmpeg
STREAM_PUBLIC_URL=
EOF
  chown "$APP_USER":"$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo ""
  echo "================================================================"
  echo "  Credenciais geradas em $ENV_FILE"
  echo "  Usuário: admin"
  echo "  Senha:   $ADMIN_PASSWORD"
  echo "================================================================"
  echo ""
fi

echo "==> systemd service"
cat > /etc/systemd/system/m3u-sync.service <<EOF
[Unit]
Description=M3U Sync backend
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_HOME
EnvironmentFile=$APP_HOME/.env
ExecStart=/usr/bin/node $APP_HOME/src/index.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now m3u-sync

echo "==> Firewall (UFW)"
ufw allow OpenSSH || true
ufw allow "$PORT"/tcp || true
ufw --force enable || true

IP=$(curl -s https://api.ipify.org || echo "SEU_IP")
echo ""
echo "==> Instalação concluída"
echo "API rodando em: http://$IP:$PORT"
echo "Teste:  curl http://$IP:$PORT/api/stats  (deve retornar 401)"
echo "Logs:   journalctl -u m3u-sync -f"
echo ""
echo "Configure o painel Lovable → Config → API URL: http://$IP:$PORT"
