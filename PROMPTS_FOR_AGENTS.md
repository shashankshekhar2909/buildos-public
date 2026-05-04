# PROMPTS_FOR_AGENTS.md

## Prompt 1: Codex Phase 1 Frontend

```txt
Read AGENTS.md, CODEX.md, PLAN.md, ARCHITECTURE.md, UI_SPEC.md, FRONTEND_SPEC.md, and SEED_DATA.md.

Before coding, inspect the existing folder/app named ai-tools-dir.

Use ai-tools-dir as the UI reference.

Implement Phase 1 only:
- Create frontend in /frontend
- Use Next.js + TypeScript
- Use Carbon Design System
- Match the visual direction of ai-tools-dir
- Use mock data from SEED_DATA.md
- Create routes:
  - /
  - /projects
  - /projects/[slug]
  - /prompts
  - /content
  - /ai-sessions
  - /tasks
  - /knowledge
  - /settings

Create:
- App shell
- Sidebar navigation
- Page headers
- Dashboard metric tiles
- Quick action tiles
- Entity tables/cards
- Status and priority tags
- Search/filter toolbar
- Empty states

Do not build backend yet.
Do not add auth.
Do not add AI calls yet.
Do not use shadcn/ui.
Do not invent a new UI style.

Run install/build/lint where possible and fix errors.

Summarize:
- What was built
- Files changed
- How to run
- What remains for Phase 2
```

## Prompt 2: Claude Review After Phase 1

```txt
Review the BuildOS Phase 1 frontend.

Check:
- Does it follow ai-tools-dir visual style?
- Does it use Carbon properly?
- Is the dashboard useful?
- Are pages practical or too generic?
- Are components reusable?
- Is anything overbuilt?
- What should be fixed before backend?

Return:
1. Must-fix issues
2. Nice-to-have polish
3. Exact Codex prompt to fix the UI
4. Phase 2 backend prompt
```

## Prompt 3: Codex Phase 2 FastAPI Backend

```txt
Read AGENTS.md, CODEX.md, PLAN.md, ARCHITECTURE.md, DATA_MODEL.md, API_SPEC.md, BACKEND_SPEC.md, and SEED_DATA.md.

Implement Phase 2 only:
- Create backend in /backend
- Use Python + FastAPI
- Use SQLite
- Use SQLModel or SQLAlchemy
- Add Pydantic schemas
- Add CRUD routes for:
  - Projects
  - Prompts
  - Content Items
  - AI Sessions
  - Tasks
  - Knowledge Notes
  - Settings
- Add /health
- Add seed data
- Use consistent API response shape from API_SPEC.md

Do not connect frontend yet.
Do not add AI workflows yet.
Do not add auth yet.

Run backend locally if possible.
Verify /docs works.
Summarize files changed and how to run.
```

## Prompt 4: Codex Phase 3 Integration

```txt
Read AGENTS.md, CODEX.md, PLAN.md, API_SPEC.md, FRONTEND_SPEC.md, and existing frontend/backend code.

Implement Phase 3 only:
- Add frontend API client
- Connect list pages to FastAPI
- Add loading states
- Add error states
- Add empty states
- Add create/edit/delete where practical
- Keep Carbon UI style consistent with ai-tools-dir

Do not add AI workflows yet.
Do not add auth yet.

Run frontend and backend checks.
Fix errors.
Summarize files changed.
```

## Prompt 5: Codex Phase 4 Project Context Generator

```txt
Read AGENTS.md, CODEX.md, PLAN.md, API_SPEC.md, AI_WORKFLOWS.md, and existing code.

Implement Phase 4 only:
- Add backend AI service using LiteLLM OpenAI-compatible endpoint
- Add POST /api/ai/generate-project-context
- Use selected project data to generate markdown context files
- Add frontend UI under Project Detail > Context Generator
- Let user choose target agent and output files
- Show generated markdown files for review
- Allow copying generated files
- Allow saving output as AI Session

Do not auto-write to disk unless explicitly requested.
Do not expose API keys in frontend.
Do not add social posting APIs.

Run checks and summarize files changed.
```
