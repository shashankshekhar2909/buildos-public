# ARCHITECTURE.md

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
```

## Main Data Flow: Project Context Generator

```txt
User opens Project Detail
  ↓
Clicks Generate Context
  ↓
Frontend sends project data to FastAPI
  ↓
FastAPI creates structured AI prompt
  ↓
FastAPI calls LiteLLM
  ↓
Generated markdown files return
  ↓
User reviews/copies/exports/saves
```

## Main Data Flow: Prompt Library

```txt
User creates reusable prompt
  ↓
Prompt is attached to optional project
  ↓
Prompt can be copied, improved, reused
```

## Main Data Flow: AI Session

```txt
User runs useful AI workflow
  ↓
Output is saved as AI Session
  ↓
AI Session can be searched and attached to project
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
