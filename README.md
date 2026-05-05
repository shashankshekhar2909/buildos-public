# BuildOS

BuildOS is a private AI-native operating dashboard for projects, prompts, content, AI sessions, tasks, knowledge, deployments, and live Docker/container mapping.

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

Without Docker socket mode:

```bash
docker compose up -d --build
```

With Docker socket mode:

```bash
docker compose -f docker-compose.yml -f docker-compose.docker.yml up -d --build
```

Stop:

```bash
docker compose down
```
