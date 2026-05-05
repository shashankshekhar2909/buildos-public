# BuildOS

BuildOS is a private AI-native operating dashboard for projects, prompts, content, AI sessions, tasks, knowledge, deployments, and live Docker/container mapping.

## Run

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

## Optional Docker Host Visibility

To enable live host Docker inventory:

```bash
docker compose -f docker-compose.yml -f docker-compose.docker.yml up -d --build
```

This uses read-only Docker socket mount.

## Notes

- This project is intended for private/trusted environments.
- Do not expose internal/admin services publicly without proper access control.
