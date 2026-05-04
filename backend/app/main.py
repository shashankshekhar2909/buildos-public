from datetime import datetime
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.db import get_session, init_db, engine
from app.models import AISession, ContentItem, KnowledgeNote, Project, Prompt, Setting, Task
from app.schemas import (
    AISessionCreate,
    AISessionUpdate,
    APIResponse,
    ContentCreate,
    ContentUpdate,
    KnowledgeCreate,
    KnowledgeUpdate,
    ListMeta,
    ListResponse,
    ProjectCreate,
    ProjectUpdate,
    PromptCreate,
    PromptUpdate,
    SettingUpdate,
    TaskCreate,
    TaskUpdate,
)

app = FastAPI(title="BuildOS API", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    with Session(engine) as session:
        if session.exec(select(Project)).first() is None:
            seed_projects = [
                Project(name="BuildOS", slug="buildos", category="product", status="active", priority="critical", goal="Build a private AI-native operating dashboard.", tech_stack="Next.js, Carbon, FastAPI, SQLite, Docker"),
                Project(name="AI Stack Lab", slug="ai-stack-lab", category="portfolio", status="active", priority="high", goal="Curated AI tools and workflow platform.", tech_stack="Next.js, SQLite, Docker", public_url="https://ai.buildwithshashank.com"),
                Project(name="KnowMy Homelab", slug="knowmy-homelab", category="homelab", status="active", priority="high", goal="Public-safe homelab learning platform.", tech_stack="Proxmox, Docker, LiteLLM, Cloudflare, Next.js"),
                Project(name="GhostPilot", slug="ghostpilot", category="product", status="active", priority="medium", goal="AI-assisted editorial dashboard.", tech_stack="FastAPI, Ghost CMS, Docker"),
                Project(name="Cascade UI", slug="cascade-ui", category="product", status="paused", priority="medium", goal="Reusable component library.", tech_stack="React, Storybook, npm"),
            ]
            session.add_all(seed_projects)
            session.add_all([
                Prompt(title="Codex Phase Builder", slug="codex-phase-builder", category="coding", body="Implement only requested phase.", recommended_tool="codex", recommended_model="gpt-5.5", rating=5),
                Prompt(title="Claude Architecture Review", slug="claude-architecture-review", category="architecture", body="Review architecture and risks.", recommended_tool="claude", recommended_model="claude-opus", rating=4),
                Prompt(title="Carbon UI Page Builder", slug="carbon-ui-page-builder", category="coding", body="Use ai-tools-dir as UI reference.", recommended_tool="codex", recommended_model="gpt-5.5", rating=5),
            ])
            session.add_all([
                ContentItem(title="Why I am building BuildOS", platform="linkedin", content_type="post", status="draft", hook="Execution beats scattered chats."),
                ContentItem(title="How I use Codex, Claude, Aider, and Groq together", platform="youtube", content_type="video", status="idea", hook="A practical multi-agent stack."),
                ContentItem(title="Why prompts should be saved like reusable assets", platform="blog", content_type="article", status="review", hook="Prompts are operating assets."),
            ])
            session.add_all([
                Task(title="Create BuildOS frontend shell using Carbon", status="in_progress", priority="critical"),
                Task(title="Create dashboard with operating snapshot", status="todo", priority="high"),
                Task(title="Connect frontend to backend", status="todo", priority="medium"),
            ])
            session.add_all([
                AISession(title="BuildOS Phase 1 frontend pass", tool="codex", model="gpt-5.5", source_module="manual", rating=5),
                AISession(title="Architecture risk review", tool="claude", model="claude-opus", source_module="manual", rating=4),
            ])
            session.add_all([
                KnowledgeNote(title="BuildOS product note", content="BuildOS is not a chatbot.", source_type="manual"),
                KnowledgeNote(title="Execution layer", content="BuildOS is an execution layer.", source_type="manual"),
            ])
            session.add_all([
                Setting(key="app.theme", value="g10", is_secret=False),
                Setting(key="ai.default_model", value="gpt-5.5", is_secret=False),
            ])
            session.commit()


def _list_response(items: list, total: int, page: int, page_size: int, message: str = "OK"):
    return ListResponse(success=True, data=items, meta=ListMeta(total=total, page=page, page_size=page_size), message=message)


def _one_response(item, message: str = "OK"):
    return APIResponse(success=True, data=item, message=message)


def _not_found(entity: str):
    raise HTTPException(status_code=404, detail=f"{entity} not found")


def _paginate(query, page: int, page_size: int):
    return query.offset((page - 1) * page_size).limit(page_size)


@app.get("/health")
def health():
    return APIResponse(success=True, data={"status": "ok"}, message="OK")


@app.get("/api/projects")
def list_projects(search: str | None = None, status: str | None = None, category: str | None = None, priority: str | None = None, page: int = Query(default=1, ge=1), page_size: int = Query(default=20, ge=1, le=100), session: Session = Depends(get_session)):
    query = select(Project)
    if search:
        query = query.where(Project.name.contains(search))
    if status:
        query = query.where(Project.status == status)
    if category:
        query = query.where(Project.category == category)
    if priority:
        query = query.where(Project.priority == priority)
    items = session.exec(_paginate(query, page, page_size)).all()
    total = len(session.exec(query).all())
    return _list_response(items, total, page, page_size)


@app.post("/api/projects")
def create_project(payload: ProjectCreate, session: Session = Depends(get_session)):
    obj = Project(**payload.model_dump())
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return _one_response(obj, "Project created")


@app.get("/api/projects/{item_id}")
def get_project(item_id: int, session: Session = Depends(get_session)):
    obj = session.get(Project, item_id)
    if not obj:
        _not_found("Project")
    return _one_response(obj)


@app.patch("/api/projects/{item_id}")
def patch_project(item_id: int, payload: ProjectUpdate, session: Session = Depends(get_session)):
    obj = session.get(Project, item_id)
    if not obj:
        _not_found("Project")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    obj.updated_at = datetime.utcnow()
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return _one_response(obj, "Project updated")


@app.delete("/api/projects/{item_id}")
def delete_project(item_id: int, session: Session = Depends(get_session)):
    obj = session.get(Project, item_id)
    if not obj:
        _not_found("Project")
    session.delete(obj)
    session.commit()
    return APIResponse(success=True, data={"id": item_id}, message="Project deleted")


def _register_crud_routes(base_path: str, model_cls, create_schema, update_schema, filters: list[str]):
    @app.get(base_path)
    def list_items(search: str | None = None, page: int = Query(default=1, ge=1), page_size: int = Query(default=20, ge=1, le=100), session: Session = Depends(get_session), **kwargs):
        query = select(model_cls)
        if search and hasattr(model_cls, "title"):
            query = query.where(model_cls.title.contains(search))
        for f in filters:
            value = kwargs.get(f)
            if value is not None:
                query = query.where(getattr(model_cls, f) == value)
        items = session.exec(_paginate(query, page, page_size)).all()
        total = len(session.exec(query).all())
        return _list_response(items, total, page, page_size)

    @app.post(base_path)
    def create_item(payload: create_schema, session: Session = Depends(get_session)):
        obj = model_cls(**payload.model_dump())
        session.add(obj)
        session.commit()
        session.refresh(obj)
        return _one_response(obj, f"{model_cls.__name__} created")

    @app.get(f"{base_path}" + "/{item_id}")
    def get_item(item_id: int, session: Session = Depends(get_session)):
        obj = session.get(model_cls, item_id)
        if not obj:
            _not_found(model_cls.__name__)
        return _one_response(obj)

    @app.patch(f"{base_path}" + "/{item_id}")
    def patch_item(item_id: int, payload: update_schema, session: Session = Depends(get_session)):
        obj = session.get(model_cls, item_id)
        if not obj:
            _not_found(model_cls.__name__)
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        obj.updated_at = datetime.utcnow()
        session.add(obj)
        session.commit()
        session.refresh(obj)
        return _one_response(obj, f"{model_cls.__name__} updated")

    @app.delete(f"{base_path}" + "/{item_id}")
    def delete_item(item_id: int, session: Session = Depends(get_session)):
        obj = session.get(model_cls, item_id)
        if not obj:
            _not_found(model_cls.__name__)
        session.delete(obj)
        session.commit()
        return APIResponse(success=True, data={"id": item_id}, message=f"{model_cls.__name__} deleted")


_register_crud_routes("/api/prompts", Prompt, PromptCreate, PromptUpdate, ["category", "recommended_tool", "project_id"])
_register_crud_routes("/api/content", ContentItem, ContentCreate, ContentUpdate, ["platform", "content_type", "status", "project_id"])
_register_crud_routes("/api/ai-sessions", AISession, AISessionCreate, AISessionUpdate, ["tool", "source_module", "project_id"])
_register_crud_routes("/api/tasks", Task, TaskCreate, TaskUpdate, ["status", "priority", "project_id"])
_register_crud_routes("/api/knowledge", KnowledgeNote, KnowledgeCreate, KnowledgeUpdate, ["source_type", "project_id"])


@app.get("/api/settings")
def list_settings(page: int = Query(default=1, ge=1), page_size: int = Query(default=20, ge=1, le=100), session: Session = Depends(get_session)):
    query = select(Setting)
    items = session.exec(_paginate(query, page, page_size)).all()
    total = len(session.exec(query).all())
    return _list_response(items, total, page, page_size)


@app.get("/api/settings/{key}")
def get_setting(key: str, session: Session = Depends(get_session)):
    obj = session.exec(select(Setting).where(Setting.key == key)).first()
    if not obj:
        _not_found("Setting")
    return _one_response(obj)


@app.patch("/api/settings/{key}")
def patch_setting(key: str, payload: SettingUpdate, session: Session = Depends(get_session)):
    obj = session.exec(select(Setting).where(Setting.key == key)).first()
    if not obj:
        obj = Setting(key=key, value=payload.value, is_secret=payload.is_secret)
    else:
        obj.value = payload.value
        obj.is_secret = payload.is_secret
        obj.updated_at = datetime.utcnow()
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return _one_response(obj, "Setting updated")
