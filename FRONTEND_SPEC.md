# FRONTEND_SPEC.md

## Frontend Stack

Use:

```txt
Next.js
TypeScript
Carbon Design System
```

## UI Reference

Inspect:

```txt
ai-tools-dir
```

BuildOS should use the same Carbon design direction.

## Folder Structure

```txt
frontend/
  app/
    layout.tsx
    page.tsx
    projects/
      page.tsx
      [slug]/
        page.tsx
    prompts/
      page.tsx
    content/
      page.tsx
    ai-sessions/
      page.tsx
    tasks/
      page.tsx
    knowledge/
      page.tsx
    settings/
      page.tsx
  components/
    shell/
    dashboard/
    projects/
    prompts/
    content/
    ai-sessions/
    tasks/
    knowledge/
    settings/
    shared/
  lib/
    mock-data.ts
    types.ts
    api.ts
    utils.ts
  styles/
    globals.scss
```

## Carbon Setup

Use Carbon packages consistent with the existing `ai-tools-dir`.

Likely packages:

```txt
@carbon/react
@carbon/icons-react
```

Use SCSS setup if `ai-tools-dir` already uses it.

Do not introduce a conflicting styling approach.

## Routes

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

## Key Components

```txt
AppShell
SideNavigation
PageHeader
MetricTile
ActionTile
StatusTag
PriorityTag
EntityTable
SearchToolbar
ProjectCard
EmptyState
ContextFilePreview
```

## Phase 1 Mock Data

Use realistic seed data from `SEED_DATA.md`.

No backend calls in Phase 1.

## Phase 3 API Client

Later create:

```txt
lib/api.ts
```

It should call FastAPI at:

```txt
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Do not expose secrets.
