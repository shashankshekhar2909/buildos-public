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
- CRUD: `/api/projects`
- CRUD: `/api/prompts`
- CRUD: `/api/content`
- CRUD: `/api/ai-sessions`
- CRUD: `/api/tasks`
- CRUD: `/api/knowledge`
- Settings: `GET /api/settings`, `GET /api/settings/{key}`, `PATCH /api/settings/{key}`
