## System Architecture

```txt
Browser
  ↓
Next.js Frontend using Carbon
  ↓
FastAPI Backend
  ↓
SQLite Database
  ↓
LiteLLM AI Gateway later
```

## Internet Routing (Planned)

```txt
Internet
  ↓
Cloudflare DNS
  ↓
Cloudflare Tunnel
  ↓
cloudflared container
  ↓
Docker network
  ↓
BuildOS frontend/backend services
```

## Frontend

Path:

```txt
frontend/
```

Stack:

- Next.js
- TypeScript
- Carbon Design System

Reference app:

```txt
ai-tools-dir
```

The BuildOS frontend should look like it belongs to the same product ecosystem as `ai-tools-dir`.

## Backend

Path:

```txt
backend/
```

Stack:

- Python
- FastAPI
- SQLite
- SQLModel or SQLAlchemy
- Pydantic

## Database

V1 database:

```txt
backend/data/buildos.db
```

SQLite is enough for V1.

Keep models migration-friendly for PostgreSQL later.

## AI Gateway

AI features should use LiteLLM later.

```txt
BuildOS Backend
  ↓
LiteLLM OpenAI-compatible API
  ↓
Groq / Ollama / OpenAI / Claude-compatible providers
```

## Module Relationships

Project is the center.

```txt
Project
  → Prompts
  → Content Items
  → AI Sessions
  → Tasks
  → Knowledge Notes
  → Deployments
```

Routing mapping model:

```txt
Project → ContainerMapping → Docker live data → Deployment → Cloudflare route
```

## Main Data Flow: Deployments

```txt
User opens Deployments
  ↓
BuildOS shows internal host/port/url and public domain/url metadata
  ↓
User links deployment records to project and container metadata
  ↓
BuildOS warns for public exposure without Access/Tailscale
```

## Security Notes

V1 can be LAN-only.

Do not expose publicly until:

- Authentication exists
- CORS is restricted
- API keys are backend-only
- Cloudflare Access or Tailscale is configured
- Backups exist

## Why This Architecture

This architecture is deliberately boring:

- Easy to build
- Easy to deploy
- Easy to debug
- Easy to run on Proxmox
- Easy to extend later
