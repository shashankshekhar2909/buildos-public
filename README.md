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

### What's inside

| Module | Purpose |
| --- | --- |
| **Projects** | Track every initiative, its goal, stack, and live URLs |
| **Prompts** | Save, rate, and reuse the prompts that actually worked |
| **Content** | Draft to schedule to ship across platforms |
| **AI Sessions** | Log notable runs across Codex, Claude, Aider, and more |
| **Tasks** | Lightweight execution tracking - no Jira tax |
| **Knowledge** | Personal notes that survive the next context window |
| **Deployments** | Internal/public URLs, Cloudflare routes, env at a glance |
| **Docker** | Live host container visibility via read-only socket mount |
| **Users** | Admin / Viewer roles for showcasing the tool |

## Portable Run (Any Machine)

### Prerequisites

- Docker + Docker Compose plugin

### Quick Start

```bash
git clone <your-repo-url>
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

## Enable Live Docker Visibility (Optional)

If you want BuildOS to read host Docker containers:

```bash
docker compose -f docker-compose.yml -f docker-compose.docker.yml up -d --build
```

This mounts Docker socket as read-only:

- `/var/run/docker.sock:/var/run/docker.sock:ro`

If not mounted, Docker pages still load but show a safe "Docker access not configured" state.

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

Stop:

```bash
docker compose down
```

## Notes

- This project is intended for private/trusted environments.
- Do not expose internal/admin services publicly without proper access control.
