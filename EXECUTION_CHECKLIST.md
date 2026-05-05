# BuildOS Execution Checklist

Last updated: 2026-05-05

## Phase Status
- [x] Phase 1: Static frontend (Next.js + TS + Carbon) in `frontend/`
- [x] Phase 2: FastAPI + SQLite backend CRUD in `backend/`
- [x] Phase 3: Frontend-backend integration (live API wiring)
- [~] Phase 4: AI project-context generator (starter endpoint added; provider integration pending)
- [~] Phase 5: Search and filters polish (Deployments filters + CRUD wired)
- [ ] Phase 6: Docker deployment finalization and compose

## Active Runtime Status
- [x] Frontend container target port `4211`
- [x] Backend container target port `8012`
- [x] Dashboard includes Service Routing Snapshot
- [x] `/deployments` route active
- [x] Deployments CRUD UI (add/edit/delete) wired to backend

## Open Items
- [x] Project Finder: discover and import preexisting folders from configured project roots
- [x] Add auth/user module and enforce login across app routes (basic session gate)
- [ ] Move backend to requested `8011` if existing service is reassigned/stopped
- [ ] Add persisted Docker volume for backend DB
- [ ] Add Phase 4 provider-backed AI generation (LiteLLM/OpenAI-compatible)

## Reverse Sync
- [x] Reverse sync context file added: `REVERSE_SYNC_PLAN.md`
- [x] Protocol defined for every upcoming change
