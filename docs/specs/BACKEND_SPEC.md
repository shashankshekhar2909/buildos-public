# BACKEND_SPEC.md

## Backend Stack

Use:

```txt
Python 3.11+
FastAPI
SQLite
SQLModel or SQLAlchemy
Pydantic
Uvicorn
```

## Folder Structure

```txt
backend/
  app/
    main.py
    core/
      config.py
      database.py
    models/
      project.py
      prompt.py
      content.py
      ai_session.py
      task.py
      knowledge.py
      setting.py
    schemas/
      project.py
      prompt.py
      content.py
      ai_session.py
      task.py
      knowledge.py
      setting.py
    api/
      routes/
        projects.py
        prompts.py
        content.py
        ai_sessions.py
        tasks.py
        knowledge.py
        settings.py
        ai.py
    services/
      ai_service.py
      export_service.py
    seed/
      seed_data.py
  data/
  requirements.txt
```

## Main App

`main.py` should include:

- FastAPI app
- CORS middleware
- Router registration
- `/health`

## Database

SQLite path:

```txt
backend/data/buildos.db
```

Use env override:

```env
DATABASE_URL=sqlite:///./data/buildos.db
```

## CORS

For local dev allow:

```txt
http://localhost:3000
```

Do not use wildcard in production later.

## Seed Data

Use `SEED_DATA.md` as the source for seed examples.

## API Docs

FastAPI docs should be available at:

```txt
http://localhost:8000/docs
```

## Run Command

Development:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
