<div align="center">

# BuildOS

**Your private AI-native operating dashboard.**

*One surface for every moving part of how you build with AI.*

[![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20FastAPI%20%7C%20Docker-black?style=flat-square)]()
[![UI](https://img.shields.io/badge/UI-Carbon%20Design%20System-0f62fe?style=flat-square)]()
[![Mode](https://img.shields.io/badge/mode-private%20%7C%20LAN--first-success?style=flat-square)]()

</div>

---

BuildOS is a private, self-hosted command center that unifies the scattered surface area of AI-native work: **projects, prompts, content, AI sessions, tasks, knowledge, deployments, and live Docker/container mapping**.

It's not a chatbot. It's the dashboard you wish you had open next to the chatbot.

### What's inside

| Module | Purpose |
| --- | --- |
| **Projects** | Track every initiative, its goal, stack, and live URLs |
| **Prompts** | Save, rate, and reuse the prompts that actually worked |
| **Content** | Draft to schedule to ship across platforms |
| **AI Sessions** | Log notable runs across Codex, Claude, Aider, and more |
| **Tasks** | Lightweight execution tracking — no Jira tax |
| **Knowledge** | Personal notes that survive the next context window |
| **Deployments** | Internal/public URLs, Cloudflare routes, env at a glance |
| **Docker** | Live host container visibility via read-only socket mount |
| **Users** | Admin / Viewer roles for showcasing the tool |


## Portable Run (Any Machine)

### Prerequisites

- Docker + Docker Compose plugin

### Quick Start

```bash
git clone git@github.com:shashankshekhar2909/buildos.git
cd buildos
cp .env.example .env
./scripts/bootstrap.sh
```

Open:

- Frontend: `http://localhost:4211`
- Backend: `http://localhost:8012`
- API Docs: `http://localhost:8012/docs`

Default login:

- Username: `admin`
- Password: `change-me`

Auth mode is switchable:

- `AUTH_MODE=local` for local DB users + backend JWT
- `AUTH_MODE=auth0` for Auth0 login + Auth0 JWT validation

Change these in `.env`:

- `DEFAULT_ADMIN_USERNAME`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`

## Enable Live Docker Visibility (Optional)

If you want BuildOS to read host Docker containers:

```bash
docker compose -f docker-compose.yml -f docker-compose.docker.yml up -d --build
```

This mounts Docker socket as read-only:

- `/var/run/docker.sock:/var/run/docker.sock:ro`

If not mounted, Docker pages still load but show a safe "Docker access not configured" state.

## Discover Existing Projects On This Machine

If you want BuildOS to import existing project folders from this host, use the host-projects override:

```bash
docker compose -f docker-compose.yml -f docker-compose.host-projects.yml up -d --build
```

This mounts common local project roots read-only and auto-imports them into BuildOS.

## LAN Access

Set host ports in `.env`:

- `FRONTEND_PORT=4211`
- `BACKEND_PORT=8012`

Then access from LAN using your host IP:

- `http://<your-host-ip>:4211`

## Key Environment Variables

- `PROJECTS_ROOT` (default `/app/projects`)
- `PROJECTS_DISCOVERY_ROOTS` (comma-separated roots for finder/import)
- `DATABASE_URL` (default sqlite in `/app/data/buildos.db`)
- `SEED_PROFILE` (`generic` by default)
- `NEXT_PUBLIC_API_BASE_URL` (optional explicit frontend API base)
- `NEXT_PUBLIC_API_PORT` (default `8012`, used for dynamic hostname mode)
- `NEXT_PUBLIC_AUTH_MODE` (`local` or `auth0`)
- `APP_BASE_URL` (frontend external URL, required for Auth0 callbacks)
- `AUTH_ENABLED` (`true`/`false`)
- `AUTH_MODE` (`local`/`auth0`)
- `AUTH_JWT_SECRET` (local mode)
- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_AUDIENCE` (auth0 mode)
- `AI_CONTEXT_PROVIDER_URL` (OpenAI-compatible base URL, e.g. LiteLLM)
- `AI_CONTEXT_MODEL` (model id for project context generation)
- `AI_CONTEXT_API_KEY` (token for provider endpoint)
- `AI_CONTEXT_TIMEOUT_SECONDS` (default `60`)

## Authentication Notes

- Local/manual auth is token-based (`POST /api/auth/token`).
- Users page supports active/inactive toggle and password change in local mode.
- In Auth0 mode, password lifecycle is managed in Auth0.
- `NEXT_PUBLIC_AUTH_MODE` should match backend `AUTH_MODE`.

For LAN HTTP deployments, set:

- `APP_BASE_URL=http://<your-host-ip>:4211`

This ensures auth cookies are issued correctly for non-HTTPS local/LAN access.

## Troubleshooting Login/CORS

- If login seems to do nothing, clear cookies and log in again.
- If APIs show CORS errors, ensure backend is running latest image with auth middleware that allows `OPTIONS` preflight.
- If Users page shows API error, re-login to refresh `buildos_access_token` cookie.

## Manual Compose Commands

```bash
docker compose up -d --build
```

Check status:

```bash
./scripts/status.sh
```

Enable live Docker visibility:

```bash
docker compose -f docker-compose.yml -f docker-compose.docker.yml up -d --build
```

Enable host project discovery:

```bash
docker compose -f docker-compose.yml -f docker-compose.host-projects.yml up -d --build
```

Stop:

```bash
docker compose down
```

## Dual Repo (Private + Public)

Keep this repo private as source-of-truth, and publish a sanitized public snapshot to another repo.

1. Add public remote:

```bash
git remote add public git@github.com:shashankshekhar2909/buildos-public.git
```

2. Publish public snapshot:

```bash
./scripts/publish-public.sh
```

The exporter uses `public-manifest.txt` as an allowlist and force-pushes only that curated snapshot to the public repo branch (`main` by default).

## Production Hardening

See [docs/PROD_READINESS.md](docs/PROD_READINESS.md) for production checklist, strict env validation, root-import safety, and readiness checks.
