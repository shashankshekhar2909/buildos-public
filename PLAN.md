## BuildOS Build Plan

This plan keeps the app focused and useful.

## Phase 0: Context Setup

Create markdown planning files.

Done when:

- All MD files exist
- Codex/Claude/Aider instructions are clear
- Stack is fixed:
  - Next.js + Carbon frontend
  - FastAPI backend

---

## Phase 1: Static Carbon Frontend

### Goal

Build a polished static frontend using mock data.

### Must Use

```txt
Next.js + TypeScript + Carbon Design System
```

### Must Reference

```txt
ai-tools-dir
```

Codex must inspect the existing `ai-tools-dir` folder and reuse its UI direction.

### Routes

```txt
/
 /projects
 /projects/[slug]
 /prompts
 /content
 /ai-sessions
 /tasks
 /knowledge
 /settings
```

### Pages

1. Dashboard
2. Projects
3. Project Detail
4. Prompt Library
5. Content Lab
6. AI Sessions
7. Tasks
8. Knowledge Notes
9. Settings

### Acceptance Criteria

- App shell exists
- Sidebar navigation works
- Carbon components are used
- UI matches the `ai-tools-dir` style direction
- Mock data is visible
- Lists/cards/tables are useful
- Empty states exist
- App builds

---

## Phase 2: FastAPI Backend

### Goal

Build backend CRUD.

### Must Use

```txt
Python + FastAPI + SQLite
```

### Entities

- Project
- Prompt
- ContentItem
- AISession
- Task
- KnowledgeNote
- Setting

### Acceptance Criteria

- `/health` works
- `/docs` works
- CRUD routes exist
- SQLite DB persists
- Seed data available
- API response shape is consistent

---

## Phase 3: Connect Frontend and Backend

### Goal

Replace mock data with API calls.

### Acceptance Criteria

- Frontend reads from FastAPI
- Create/edit/delete works where practical
- Loading states exist
- Error states exist
- Form validation exists

---

## Phase 4: Project Context Generator

### Goal

Add the most useful AI feature first.

Generate agent context files for any selected project.

### Inputs

- Project name
- Goal
- Current state
- Tech stack
- Target agent
- Desired output files

### Outputs

- AGENTS.md
- CLAUDE.md
- CODEX.md
- PLAN.md
- ARCHITECTURE.md
- UI_SPEC.md
- API_SPEC.md
- DATA_MODEL.md

### Acceptance Criteria

- Backend calls LiteLLM/OpenAI-compatible endpoint
- Frontend shows generated files for review
- User can copy or export markdown
- Generated session can be saved to AI Sessions

---

## Phase 5 (V1.5): Deployment Registry and Service Routing

### Goal

Track project to Docker/Cloudflare routing metadata in BuildOS (read/write metadata only, no automation).

### Scope

- Deployments module and `/deployments` page
- Project Detail Deployments tab
- Service routing snapshot on dashboard
- Model/API planning for deployment records
- Cloudflare Tunnel docker-compose documentation snippets

### Non-goals

- No Cloudflare API automation
- No DNS creation
- No token handling
- No mutation of running Docker services

---

## Phase 6: Search and Filters

Search across:

- Projects
- Prompts
- Content
- AI Sessions
- Tasks
- Knowledge Notes
- Deployments

Use simple SQL search first.

---

## Phase 7: Docker Deployment

Deploy through Docker Compose.

Target:

```txt
Proxmox LXC or VM
```

Services:

- frontend
- backend

Optional later:

- litellm
- postgres
- typesense
- cloudflared
