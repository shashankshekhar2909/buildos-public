# BuildOS Execution Checklist

Last updated: 2026-05-04

## Phase Status
- [x] Phase 1: Static frontend (Next.js + TS + Carbon) in `frontend/`
- [x] Phase 2: FastAPI + SQLite backend CRUD in `backend/`
- [x] Phase 3: Frontend-backend integration (live API wiring)
- [~] Phase 4: AI project-context generator (starter endpoint added; provider integration pending)
- [ ] Phase 5: Search and filters polish
- [ ] Phase 6: Docker deployment finalization and compose

## Active Runtime Status
- [x] Frontend container running on `4211`
- [x] Backend container running on `8012` (8011 occupied by another service)
- [x] `/health` verified
- [x] `/api/prompts` 422 fixed and verified

## Open Items
- [ ] Add live system snapshot module (Docker + host metrics)
- [ ] Add auth/user module and enforce login across app routes
- [ ] Move backend to requested `8011` if existing service is reassigned/stopped
- [ ] Add persisted Docker volume for backend DB
- [ ] Add Phase 4 provider-backed AI generation (LiteLLM/OpenAI-compatible)

## Next Slice (Proposed)
- [ ] Implement `/api/system/snapshot`
- [ ] Collect Docker container stats + basic host metrics
- [ ] Show live system tiles on dashboard
