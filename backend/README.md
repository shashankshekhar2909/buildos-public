# BuildOS Backend (Phase 2)

## Run

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Routes

- `GET /health`
- `POST /api/auth/token` (local mode only)
- CRUD: `/api/projects`
- CRUD: `/api/prompts`
- CRUD: `/api/content`
- CRUD: `/api/ai-sessions`
- CRUD: `/api/tasks`
- CRUD: `/api/knowledge`
- Settings: `GET /api/settings`, `GET /api/settings/{key}`, `PATCH /api/settings/{key}`

## Auth Modes

- `AUTH_MODE=local`: BuildOS validates username/password from `user` table and issues JWT access tokens.
- `AUTH_MODE=auth0`: frontend gets Auth0 access token; backend validates JWT signature/issuer/audience using Auth0 JWKS.

Required env:

- `AUTH_ENABLED` (`true`/`false`)
- `AUTH_MODE` (`local` or `auth0`)
- `AUTH_JWT_SECRET` (local mode)
- `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, optional `AUTH0_ISSUER` (auth0 mode)
