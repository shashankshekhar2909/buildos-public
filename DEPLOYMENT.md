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

## Cloudflare Tunnel Example (Optional, V1 Registry Support)

```yaml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel run
    restart: unless-stopped
    networks:
      - app
```

Route concept (tracked in BuildOS Deployments UI):

```txt
buildos.example.com -> http://frontend:3000
buildos-api.example.com -> http://backend:8000
```

Important:

- Do not automate DNS/API changes in V1
- Do not require Cloudflare API token in BuildOS frontend
- Keep secret material only in trusted server runtime/env

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

Do not expose admin/internal services publicly without Cloudflare Access or Tailscale.

## Backup

SQLite backup:

```bash
mkdir -p /srv/buildos/backups
cp /srv/buildos/data/buildos.db /srv/buildos/backups/buildos-$(date +%F-%H%M).db
```
