# API_SPEC.md

## Backend

Use FastAPI.

Base URL:

```txt
http://localhost:8000
```

Prefix:

```txt
/api
```

## Response Shape

Success:

```json
{
  "success": true,
  "data": {},
  "message": "OK"
}
```

List:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "page_size": 20
  },
  "message": "OK"
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Health

```txt
GET /health
```

## Projects

```txt
GET    /api/projects
POST   /api/projects
GET    /api/projects/{id}
PATCH  /api/projects/{id}
DELETE /api/projects/{id}
```

Query params:

```txt
search
status
category
priority
page
page_size
```

## Prompts

```txt
GET    /api/prompts
POST   /api/prompts
GET    /api/prompts/{id}
PATCH  /api/prompts/{id}
DELETE /api/prompts/{id}
```

Query params:

```txt
search
category
recommended_tool
project_id
page
page_size
```

## Content

```txt
GET    /api/content
POST   /api/content
GET    /api/content/{id}
PATCH  /api/content/{id}
DELETE /api/content/{id}
```

Query params:

```txt
search
platform
content_type
status
project_id
page
page_size
```

## AI Sessions

```txt
GET    /api/ai-sessions
POST   /api/ai-sessions
GET    /api/ai-sessions/{id}
PATCH  /api/ai-sessions/{id}
DELETE /api/ai-sessions/{id}
```

## Tasks

```txt
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/{id}
PATCH  /api/tasks/{id}
DELETE /api/tasks/{id}
```

## Knowledge

```txt
GET    /api/knowledge
POST   /api/knowledge
GET    /api/knowledge/{id}
PATCH  /api/knowledge/{id}
DELETE /api/knowledge/{id}
```

## Settings

```txt
GET   /api/settings
GET   /api/settings/{key}
PATCH /api/settings/{key}
```

## AI: Project Context Generator

First AI endpoint to build:

```txt
POST /api/ai/generate-project-context
```

Request:

```json
{
  "project_id": "string",
  "target_agent": "codex",
  "desired_files": [
    "AGENTS.md",
    "CLAUDE.md",
    "CODEX.md",
    "PLAN.md",
    "ARCHITECTURE.md",
    "UI_SPEC.md",
    "API_SPEC.md",
    "DATA_MODEL.md"
  ],
  "extra_context": "optional text"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "filename": "AGENTS.md",
        "content": "markdown content"
      }
    ]
  },
  "message": "Context files generated"
}
```

## Later AI Endpoints

Build later:

```txt
POST /api/ai/generate-content
POST /api/ai/improve-prompt
POST /api/ai/notes-to-tasks
```
