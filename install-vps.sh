#!/usr/bin/env bash
# Instalador tudo-em-um do M3U Sync numa VPS Debian/Ubuntu.
# Uso:
#   sudo DOMAIN=seudominio.com ADMIN_PASSWORD=trocar ./install-vps.sh
#
# Requisitos: rodar como root, VPS Debian 11/12 ou Ubuntu 22.04/24.04,
# porta 80 e 443 liberadas, DNS A do domínio já apontando pra esta VPS.

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/m3u-sync}"
DOMAIN="${DOMAIN:?Defina DOMAIN=seudominio.com}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:?Defina ADMIN_PASSWORD=algumaSenhaForte}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
DATA_DIR="${DATA_DIR:-/var/lib/m3u-sync}"
MEDIA_DIR="${MEDIA_DIR:-/mnt/media}"

echo "==> Diretório do app: $APP_DIR"
echo "==> Domínio: $DOMAIN"

if [ ! -f "$APP_DIR/package.json" ]; then
  echo "ERRO: $APP_DIR/package.json não existe."
  echo "Clone o projeto lá primeiro:  git clone <URL_DO_REPO> $APP_DIR"
  exit 1
fi

echo "==> Instalando dependências do sistema (node, ffmpeg, caddy)…"
apt-get update -y
apt-get install -y curl ca-certificates gnupg ffmpeg debian-keyring debian-archive-keyring apt-transport-https

# Node 20
if ! command -v node >/dev/null || [ "$(node -v | cut -c2-3)" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# Caddy
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
fi

mkdir -p "$DATA_DIR" "$MEDIA_DIR/movies" "$MEDIA_DIR/series"

echo "==> Instalando dependências do projeto e buildando…"
cd "$APP_DIR"
npm install
npm run build
cd "$APP_DIR/backend"
npm install
cd "$APP_DIR"

echo "==> Criando serviço systemd do backend…"
cat >/etc/systemd/system/m3u-backend.service <<EOF
[Unit]
Description=M3U Sync Backend
After=network.target

[Service]
WorkingDirectory=$APP_DIR/backend
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=HOST=127.0.0.1
Environment=ADMIN_USER=$ADMIN_USER
Environment=ADMIN_PASSWORD=$ADMIN_PASSWORD
Environment=JWT_SECRET=$JWT_SECRET
Environment=DATA_DIR=$DATA_DIR
Environment=MEDIA_DIR=$MEDIA_DIR
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

echo "==> Criando serviço systemd do frontend (SSR)…"
FRONT_ENTRY=""
for cand in ".output/server/index.mjs" ".vinxi/build/server/index.mjs" "dist/server/index.mjs"; do
  if [ -f "$APP_DIR/$cand" ]; then FRONT_ENTRY="$cand"; break; fi
done

if [ -n "$FRONT_ENTRY" ]; then
  cat >/etc/systemd/system/m3u-frontend.service <<EOF
[Unit]
Description=M3U Sync Frontend (SSR)
After=network.target

[Service]
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOST=127.0.0.1
ExecStart=/usr/bin/node $FRONT_ENTRY
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
  FRONTEND_MODE="ssr"
else
  echo "AVISO: build SSR não encontrado. Usando modo estático (backend serve o /dist)."
  FRONTEND_MODE="static"
fi

echo "==> Configurando Caddy para $DOMAIN…"
if [ "$FRONTEND_MODE" = "ssr" ]; then
  cat >/etc/caddy/Caddyfile <<EOF
$DOMAIN {
    encode zstd gzip
    handle /api/*   { reverse_proxy 127.0.0.1:3001 }
    handle /ws      { reverse_proxy 127.0.0.1:3001 }
    handle /media/* { reverse_proxy 127.0.0.1:3001 }
    handle          { reverse_proxy 127.0.0.1:3000 }
}
EOF
else
  cat >/etc/caddy/Caddyfile <<EOF
$DOMAIN {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3001
}
EOF
fi

systemctl daemon-reload
systemctl enable --now m3u-backend
if [ "$FRONTEND_MODE" = "ssr" ]; then
  systemctl enable --now m3u-frontend
fi
systemctl reload caddy || systemctl restart caddy

echo ""
echo "======================================================"
echo " Pronto!"
echo " Acesse:  https://$DOMAIN"
echo " Login:   $ADMIN_USER"
echo " Senha:   $ADMIN_PASSWORD"
echo " No painel, API URL: https://$DOMAIN"
echo "======================================================"
