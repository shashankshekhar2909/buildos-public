# DEPLOYMENT.md

## Target

Run BuildOS on Proxmox using Docker Compose.

## Folder

```txt
/srv/buildos/
  frontend/
  backend/
  data/
  backups/
  docker-compose.yml
  .env
```

## Environment

```env
APP_ENV=production

FRONTEND_PORT=3000
BACKEND_PORT=8000

DATABASE_URL=sqlite:///./data/buildos.db

NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

LITELLM_BASE_URL=http://litellm:4000/v1
LITELLM_API_KEY=change-me
DEFAULT_AI_MODEL=groq/llama-3.3-70b-versatile
```

## First Docker Compose Target

Services:

```txt
frontend
backend
```

Do not add Postgres in V1 unless needed.

SQLite is enough.

## Access

LAN:

```txt
http://192.168.0.55:3000
```

Remote private:

```txt
Tailscale
```

Public later:

```txt
Cloudflare Tunnel + Access
```

## Warning

Do not expose BuildOS publicly before auth or Cloudflare Access is configured.

## Backup

SQLite backup:

```bash
mkdir -p /srv/buildos/backups
cp /srv/buildos/data/buildos.db /srv/buildos/backups/buildos-$(date +%F-%H%M).db
```
