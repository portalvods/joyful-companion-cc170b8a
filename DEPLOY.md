# M3U Sync — Deploy Guide

Sistema completo de gerenciamento de downloads a partir de listas M3U.
Frontend rodando no Lovable, backend em uma VPS Ubuntu 24.04.

## O que você precisa

- VPS Ubuntu 24.04 (você tem: 2GB RAM, 1TB disco, Dallas TX)
- Acesso root via SSH
- URL da sua lista M3U

---

## Passo 1 — Preparar a VPS

Conecte via SSH:

```bash
ssh root@SEU_IP_DA_VPS
```

## Passo 2 — Enviar o código do backend

Do seu computador local (fora da VPS), envie a pasta `backend/` + `install.sh`:

**Opção A — via git (recomendado):**
```bash
# Na VPS:
apt update && apt install -y git
git clone <URL_DO_SEU_REPO_LOVABLE> /root/m3u-sync-src
cd /root/m3u-sync-src
```

**Opção B — via scp:**
```bash
# No seu computador:
scp -r backend install.sh root@SEU_IP:/root/m3u-sync-src/
```

## Passo 3 — Rodar o instalador

```bash
cd /root/m3u-sync-src
bash install.sh
```

O script vai:
- Instalar Node.js 20, ffmpeg, dependências
- Criar usuário `m3usync` e diretórios `/opt/m3u-sync`, `/var/lib/m3u-sync`, `/mnt/media`
- Gerar `.env` com **senha aleatória do admin** (mostrada no fim)
- Instalar como serviço systemd (inicia sozinho, reinicia se cair)
- Abrir a porta 3001 no firewall

**Anote a senha exibida no fim!** Ela também fica em `/opt/m3u-sync/.env`.

## Passo 4 — Conferir se está rodando

```bash
systemctl status m3u-sync
curl http://localhost:3001/api/stats
# Deve retornar: {"error":"unauthorized"}  ← isso é OK, significa que a API respondeu
```

Ver logs ao vivo:
```bash
journalctl -u m3u-sync -f
```

## Passo 5 — Conectar o painel Lovable

Abra o painel publicado, vá em **Configurações** e informe:

- **API URL:** `http://SEU_IP:3001`
- **Usuário:** `admin`
- **Senha:** (a que o instalador mostrou)

Pronto. Os mocks somem e você começa a ver dados reais da máquina.

---

## Comandos úteis

```bash
# Reiniciar
systemctl restart m3u-sync

# Ver últimos logs
journalctl -u m3u-sync -n 100

# Editar config (troca de senha, portas, concorrência)
nano /opt/m3u-sync/.env
systemctl restart m3u-sync

# Espaço em disco
df -h /mnt/media

# Downloads em andamento (ffmpeg)
pgrep -a ffmpeg
```

## Trocar IP por domínio depois

1. Aponte um `A record` do seu domínio para o IP da VPS.
2. Instale Caddy: `apt install -y caddy`
3. Edite `/etc/caddy/Caddyfile`:
   ```
   painel.meudominio.com {
     reverse_proxy localhost:3001
   }
   ```
4. `systemctl restart caddy` — HTTPS automático via Let's Encrypt.
5. Atualize a **API URL** no painel para `https://painel.meudominio.com`.

## Modo aluguel (streaming)

Depois que tudo estiver funcionando:

1. Aponte outro subdomínio (ex.: `stream.meudominio.com`) para o IP da VPS.
2. Adicione ao Caddyfile:
   ```
   stream.meudominio.com {
     reverse_proxy localhost:3001
   }
   ```
3. No `.env`, defina: `STREAM_PUBLIC_URL=https://stream.meudominio.com`
4. Reinicie: `systemctl restart m3u-sync`
5. Ative "Modo Aluguel" no painel. As URLs de streaming ficam em `https://stream.meudominio.com/media/movies/...`

## Segurança recomendada (opcional)

- Troque a porta SSH e desabilite login root com senha.
- Configure fail2ban: `apt install -y fail2ban`
- Se a VPS não precisa expor a porta 3001, deixe **só** o Caddy (443) exposto e feche a 3001 no firewall.
