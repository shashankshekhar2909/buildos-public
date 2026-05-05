# UI_SPEC.md

## UI Stack

Use:

```txt
Next.js + TypeScript + Carbon Design System
```

## UI Reference

Before building UI, inspect:

```txt
ai-tools-dir
```

BuildOS should use the same or very similar:

- Layout style
- Carbon component usage
- Page density
- Navigation feel
- Cards
- Tables
- Spacing
- Header sections
- Tags and badges
- Empty states

## Do Not Do

- Do not use shadcn/ui.
- Do not use random Tailwind dashboard templates.
- Do not make it look like a consumer AI chatbot.
- Do not overuse gradients.
- Do not overuse emojis.
- Do not make the UI playful.

## Product Feel

The app should feel like:

```txt
A serious private command center for building, publishing, and managing AI-assisted work.
```

## App Shell

Use a persistent shell:

```txt
Left navigation
Top page header
Main content area
```

Sidebar items:

```txt
Dashboard
Projects
Prompts
Content Lab
AI Sessions
Tasks
Knowledge
Settings
```

## Dashboard

Route:

```txt
/
```

Sections:

1. Operating Snapshot
2. Quick Actions
3. Active Projects
4. Current Tasks
5. Content Pipeline
6. Recent AI Sessions
7. Saved Prompts

Metrics:

```txt
Active Projects
Open Tasks
Content Drafts
Saved Prompts
AI Sessions
Knowledge Notes
```

Quick actions:

```txt
New Project
New Prompt
New Content Idea
Save AI Session
Generate Project Context
Add Task
```

## Projects Page

Route:

```txt
/projects
```

Use Carbon cards or table.

Fields:

```txt
Name
Description
Status
Category
Priority
Tech Stack
Updated Date
Actions
```

Filters:

```txt
Status
Category
Priority
Search
```

## Project Detail Page

Route:

```txt
/projects/[slug]
```

Use Carbon tabs.

Tabs:

```txt
Overview
Tasks
Prompts
Content
AI Sessions
Knowledge
Context Generator
```

Important action:

```txt
Generate Context Files
```

## Prompt Library

Route:

```txt
/prompts
```

Fields:

```txt
Title
Category
Recommended Tool
Recommended Model
Tags
Rating
Project
```

Actions:

```txt
Copy
Edit
Improve Later
Attach to Project
```

## Content Lab

Route:

```txt
/content
```

Fields:

```txt
Title
Platform
Content Type
Status
Hook
Project
Scheduled Date
```

Statuses:

```txt
Idea
Draft
Review
Ready
Published
Repurpose
```

## AI Sessions

Route:

```txt
/ai-sessions
```

Fields:

```txt
Title
Tool
Model
Source Module
Project
Tags
Rating
Created Date
```

Actions:

```txt
Open
Copy Input
Copy Output
Attach to Project
```

## Tasks

Route:

```txt
/tasks
```

Fields:

```txt
Title
Status
Priority
Project
Due Date
```

Use Carbon tags for status and priority.

## Knowledge

Route:

```txt
/knowledge
```

Fields:

```txt
Title
Source Type
Project
Tags
Updated Date
```

V1 editor can be a simple textarea.

## Settings

Route:

```txt
/settings
 /deployments
```

Sections:

1. App Settings
2. AI Settings
3. Backup Settings
4. Deployment Notes

AI Settings fields:

```txt
LiteLLM Base URL
Default Model
Temperature
Max Tokens
```

Do not expose API keys in frontend.

## Component Suggestions

```txt
AppShell
SideNav
PageHeader
MetricTile
ActionTile
StatusTag
PriorityTag
ProjectTile
EntityDataTable
SearchToolbar
EmptyState
ContextFilePreview
```

## Copy Style

Use practical copy.

Good:

```txt
Save useful AI work before it disappears.
Generate context files for Codex and Claude.
Turn projects into reusable build instructions.
```

Bad:

```txt
Unleash revolutionary AI synergy.
```


## Deployments

Route:

```txt
/deployments
```

Track service routing metadata:

- Project
- Environment
- Service name/type
- Docker compose project/service
- Container
- Internal URL
- Public domain/URL
- Cloudflare tunnel + route hostname
- Cloudflare Access enabled
- Health check URL
- Status
- Notes

Safety copy:

```txt
Do not expose admin/internal services publicly without Cloudflare Access or Tailscale.
```
