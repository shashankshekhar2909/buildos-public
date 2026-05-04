# CODEX.md

## Role

You are the main coding agent for BuildOS.

## First Instruction

Before coding, inspect the current repository.

Look for:

```txt
ai-tools-dir
```

This folder is the UI reference.

BuildOS frontend should follow the same visual language and Carbon-based UI approach.

## Required Stack

Frontend:

```txt
Next.js
TypeScript
Carbon Design System
Carbon icons if needed
```

Backend:

```txt
Python
FastAPI
SQLite
SQLModel or SQLAlchemy
Pydantic
```

## Do Not Use

Do not use shadcn/ui for this version.

Do not replace the Carbon visual direction.

Do not invent a new design system.

## Build Phases

### Phase 1

Static frontend only.

### Phase 2

FastAPI backend only.

### Phase 3

Frontend-backend integration.

### Phase 4

AI project context generator.

### Phase 5

Search/filter/export polish.

### Phase 6

Docker Compose deployment.

## Phase 1 Frontend Instructions

Create frontend in:

```txt
frontend/
```

Use routes:

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

Use mock data from `SEED_DATA.md`.

Create components like:

```txt
AppShell
Sidebar
PageHeader
DashboardMetricCard
ProjectCard
StatusTag
PriorityTag
SearchFilterBar
EntityTable
EmptyState
```

Use Carbon components wherever useful:

- Button
- Tile
- Tag
- DataTable
- TextInput
- Select
- Tabs
- Grid
- Column
- Modal later
- Breadcrumb
- OverflowMenu

## Phase 2 Backend Instructions

Create backend in:

```txt
backend/
```

Use:

- FastAPI
- SQLite
- SQLModel or SQLAlchemy
- Pydantic schemas

Create CRUD for:

- Projects
- Prompts
- Content Items
- AI Sessions
- Tasks
- Knowledge Notes
- Settings

Add:

- `/health`
- `/api/projects`
- `/api/prompts`
- `/api/content`
- `/api/ai-sessions`
- `/api/tasks`
- `/api/knowledge`
- `/api/settings`

## Phase 4 AI Feature Priority

The first AI feature is:

```txt
Generate Project Context Files
```

This should generate:

```txt
AGENTS.md
CLAUDE.md
CODEX.md
PLAN.md
ARCHITECTURE.md
UI_SPEC.md
API_SPEC.md
DATA_MODEL.md
```

for a selected project.

## Completion Rules

After every phase:

- Run install/build/lint if applicable
- Fix errors
- Summarize changed files
- Explain how to run
- Mention what remains for next phase
