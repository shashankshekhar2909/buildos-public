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

## Prompts

```txt
GET    /api/prompts
POST   /api/prompts
GET    /api/prompts/{id}
PATCH  /api/prompts/{id}
DELETE /api/prompts/{id}
```

## Content

```txt
GET    /api/content
POST   /api/content
GET    /api/content/{id}
PATCH  /api/content/{id}
DELETE /api/content/{id}
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

## Deployments (V1.5 Planning)

```txt
GET    /api/deployments
POST   /api/deployments
GET    /api/deployments/{id}
PATCH  /api/deployments/{id}
DELETE /api/deployments/{id}
```

Behavior notes:

- V1 registry only (metadata management)
- No Cloudflare API calls
- No DNS automation
- No secret/token exposure in frontend

## AI: Project Context Generator

```txt
POST /api/ai/generate-project-context
```

## Later AI Endpoints

```txt
POST /api/ai/generate-content
POST /api/ai/improve-prompt
POST /api/ai/notes-to-tasks
```
