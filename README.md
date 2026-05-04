# BuildOS

BuildOS is a private AI-native work and content operating dashboard.

It helps manage:

- Projects
- Prompts
- Content pipeline
- AI sessions
- Tasks
- Knowledge notes
- Project context generation for Codex, Claude, and Aider

## Core Goal

BuildOS should help Shashank stop losing useful AI work across chats, markdown files, Codex sessions, Claude conversations, homelab notes, and project folders.

The first version should be practical, small, and usable within 7–10 days.

## Stack

Frontend:

- Next.js
- TypeScript
- Carbon Design System
- Carbon-style UI reference from existing folder: `ai-tools-dir`
- Existing UI patterns should be reused where possible

Backend:

- Python
- FastAPI
- SQLite for V1
- SQLModel or SQLAlchemy
- Pydantic
- LiteLLM integration later

Deployment:

- Docker Compose
- Proxmox LXC/VM
- LAN-first
- Cloudflare Tunnel or Tailscale later

## Important UI Requirement

There is already an app/folder named:

```txt
ai-tools-dir
```

Use it as the UI reference.

Do not invent a completely new design.

Borrow:

- Layout style
- Carbon components
- Spacing style
- Navigation pattern
- Card patterns
- Table/list style
- Typography direction
- Empty-state style
- Overall visual feel

BuildOS should feel like the next internal product in the same ecosystem.

## V1 Scope

Build only:

1. Dashboard
2. Projects
3. Prompt Library
4. Content Lab
5. AI Sessions
6. Tasks
7. Knowledge Notes
8. Settings

## V1 AI Priority

The first useful AI feature should be:

```txt
Generate project context files for Codex / Claude / Aider
```

This is more important than content generation because it directly improves project execution.

## Local URLs

```txt
Frontend: http://localhost:3000
Backend:  http://localhost:8000
API Docs: http://localhost:8000/docs
```
