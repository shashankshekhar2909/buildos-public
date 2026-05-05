# Reverse Sync Plan

Last updated: 2026-05-05

## Purpose
Maintain a single, always-current operational context so every new change can be implemented with full app awareness.

## Current App Context
- Product: BuildOS (private execution dashboard)
- Frontend: Next.js + TypeScript + Carbon (`frontend/`)
- Backend: FastAPI + SQLite (`backend/`)
- Runtime ports:
  - UI: `4211`
  - API: `8012` (8011 currently occupied)
- Docker mode: local containers on shared network `buildos-net`

## Active Modules
- Dashboard
- Projects
- Deployments
- Prompts
- Content
- AI Sessions
- Tasks
- Knowledge
- Settings

## Latest Increment (2026-05-05)
- Deployments moved from mock-only to live backend integration.
- Added Deployments CRUD UI:
  - create deployment
  - edit deployment
  - delete deployment
- Project Deployments tab and Dashboard routing snapshot continue to use live deployment data with fallback handling.
- New scope in progress: Project Finder for importing existing local project folders into BuildOS DB.
- Completed:
  - Auto project folder mapping on project create/update (`/home/shashank/app/projects/<slug>`)
  - Project file browser endpoint and UI
  - Project Finder endpoints/UI for discover + import preexisting folders
  - Backend container now runs with host volume mount for projects root
  - App-wide login gate added via Next middleware + login/logout routes
  - `/login` page added, shell hidden on auth screen, logout added in header

## Data and Routing Context
- Deployments module tracks:
  - project ↔ service ↔ container ↔ internal URL ↔ public domain ↔ Cloudflare route
- V1 policy:
  - No Cloudflare API automation
  - No DNS auto-creation
  - No secret/token handling in frontend

## Security Constraints
- No dangerous Docker mutations in UI
- No shell execution from app UI
- No public exposure of internal/admin services without Cloudflare Access or Tailscale

## Mandatory Update Protocol (for upcoming changes)
For each new feature request:
1. Update `EXECUTION_CHECKLIST.md` status lines first.
2. Update this file (`REVERSE_SYNC_PLAN.md`) with:
   - new module scope
   - changed ports/services
   - security impact
3. Implement code changes.
4. Run validation commands.
5. Redeploy affected containers.
6. Record final runtime state in both files.

## Quick Validation Commands
- Frontend:
  - `cd frontend && npm run lint && npm run build`
- Backend syntax:
  - `python3 -m py_compile backend/app/main.py`
- Container state:
  - `docker ps --filter name=buildos-`
