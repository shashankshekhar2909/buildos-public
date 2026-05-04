# AGENTS.md

## Product

BuildOS

## Mission

BuildOS is Shashank's private AI-native operating dashboard for projects, prompts, content, AI sessions, tasks, and reusable project context.

It should help Shashank execute faster across:

- BuildWithShashank
- AI Stack Lab
- KnowMy Homelab
- GhostPilot
- Cascade UI
- Portfolio
- Resume/job search
- Content creation
- Homelab workflows
- FastAPI/Next.js projects
- AI-assisted coding with Codex, Claude, Aider, and Groq

## Main Rule

Do not build a generic SaaS dashboard.

Build a practical personal execution system.

## UI Rule

The frontend must use:

```txt
Next.js + TypeScript + Carbon Design System
```

There is an existing folder/app:

```txt
ai-tools-dir
```

Use that as the visual and structural UI reference.

Agents must inspect `ai-tools-dir` before building the frontend.

Reuse or mirror:

- App shell
- Navigation style
- Carbon layout patterns
- Page header style
- Data cards
- Tables/lists
- Spacing
- Typography
- Button hierarchy
- Empty states
- Overall visual personality

Do not create a completely different Tailwind/shadcn-looking UI.

## Backend Rule

The backend must use:

```txt
Python + FastAPI
```

Use SQLite for V1.

Use SQLModel or SQLAlchemy.

Keep backend simple and clean.

## Build Strategy

Build in phases:

1. Static frontend using Carbon and mock data
2. FastAPI backend with SQLite CRUD
3. Frontend-backend integration
4. AI project-context generator
5. Search and filters
6. Docker deployment

## Do Not Build Yet

Do not build in V1 unless explicitly requested:

- Complex auth
- Multi-tenant roles
- Social media auto-posting
- Payment system
- Vector DB
- RAG
- Browser extension
- Mobile app
- Plugin marketplace
- Full agent orchestration

## Quality Bar

Every page should feel useful.

Every module should have:

- Clear page title
- Short description
- Search/filter where relevant
- Add/create action
- List or cards
- Empty state
- Status badges
- Sensible actions

## Agent Behavior

Before implementation:

1. Read this file
2. Read `PLAN.md`
3. Read `ARCHITECTURE.md`
4. Read `UI_SPEC.md`
5. Read `DATA_MODEL.md`
6. Read `API_SPEC.md`
7. Inspect `ai-tools-dir`
8. Implement only the requested phase

After implementation:

- Run build/lint where possible
- Fix errors
- Summarize changed files
- Mention how to run
