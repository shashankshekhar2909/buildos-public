# SEED_DATA.md

## Projects

### BuildOS

```txt
name: BuildOS
slug: buildos
category: product
status: active
priority: critical
goal: Build a private AI-native operating dashboard for projects, prompts, content, AI sessions, tasks, and reusable project context.
tech_stack: Next.js, Carbon, FastAPI, SQLite, Docker
```

### AI Stack Lab

```txt
name: AI Stack Lab
slug: ai-stack-lab
category: portfolio
status: active
priority: high
goal: Curated AI tools and workflow platform for builders.
public_url: https://ai.example.com
tech_stack: Next.js, SQLite, Docker
```

### KnowMy Homelab

```txt
name: KnowMy Homelab
slug: knowmy-homelab
category: homelab
status: active
priority: high
goal: Public-safe homelab learning and architecture platform.
public_url: https://homelab.example.com
tech_stack: Proxmox, Docker, LiteLLM, Cloudflare, Next.js
```

### GhostPilot

```txt
name: GhostPilot
slug: ghostpilot
category: product
status: active
priority: medium
goal: AI-assisted editorial dashboard for Ghost publishers.
tech_stack: FastAPI, Ghost CMS, Docker
```

### Cascade UI

```txt
name: Cascade UI
slug: cascade-ui
category: product
status: paused
priority: medium
goal: Carbon/Tailwind-inspired reusable design system and component library.
tech_stack: React, Storybook, npm
```

## Prompts

### Codex Phase Builder

```txt
title: Codex Phase Builder
category: coding
recommended_tool: codex
body: Read AGENTS.md, CODEX.md, PLAN.md, ARCHITECTURE.md, UI_SPEC.md, API_SPEC.md, DATA_MODEL.md. Implement only the requested phase. Run build/lint and fix errors.
```

### Claude Architecture Review

```txt
title: Claude Architecture Review
category: architecture
recommended_tool: claude
body: Review this project architecture. Identify missing decisions, unnecessary complexity, risk areas, and the cleanest next implementation slice.
```

### Carbon UI Page Builder

```txt
title: Carbon UI Page Builder
category: coding
recommended_tool: codex
body: Inspect ai-tools-dir for Carbon UI reference. Build this page using the same visual language and Carbon components. Keep layout clean, responsive, and production-ready.
```

## Content Ideas

```txt
Why I am building BuildOS
How I use Codex, Claude, Aider, and Groq together
Why prompts should be saved like reusable assets
How my homelab became my AI product lab
How to turn scattered AI chats into a working system
```

## Tasks

```txt
Create BuildOS frontend shell using Carbon
Create dashboard with operating snapshot
Create projects page with Carbon table/cards
Create prompt library page
Create content lab page
Create AI sessions page
Create FastAPI backend skeleton
Add SQLite models
Add seed data
Connect frontend to backend
Build project context generator
Dockerize for Proxmox
```

## Knowledge Notes

```txt
BuildOS is not a chatbot.
BuildOS is an execution layer.
The first valuable AI feature is project context generation.
The UI must follow ai-tools-dir and Carbon.
FastAPI backend should stay simple in V1.
SQLite is enough for the first version.
```
