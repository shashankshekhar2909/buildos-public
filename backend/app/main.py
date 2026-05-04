from datetime import datetime
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.db import engine, get_session, init_db
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

app = FastAPI(title="BuildOS API", version="0.3.0")
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
            session.add_all(
                [
                    Project(name="BuildOS", slug="buildos", category="product", status="active", priority="critical", goal="Build a private AI-native operating dashboard.", tech_stack="Next.js, Carbon, FastAPI, SQLite, Docker"),
                    Project(name="AI Stack Lab", slug="ai-stack-lab", category="portfolio", status="active", priority="high", goal="Curated AI tools and workflow platform.", tech_stack="Next.js, SQLite, Docker", public_url="https://ai.buildwithshashank.com"),
                    Project(name="KnowMy Homelab", slug="knowmy-homelab", category="homelab", status="active", priority="high", goal="Public-safe homelab learning platform.", tech_stack="Proxmox, Docker, LiteLLM, Cloudflare, Next.js"),
                    Project(name="GhostPilot", slug="ghostpilot", category="product", status="active", priority="medium", goal="AI-assisted editorial dashboard.", tech_stack="FastAPI, Ghost CMS, Docker"),
                    Project(name="Cascade UI", slug="cascade-ui", category="product", status="paused", priority="medium", goal="Reusable component library.", tech_stack="React, Storybook, npm"),
                ]
            )
            session.add_all(
                [
                    Prompt(title="Codex Phase Builder", slug="codex-phase-builder", category="coding", body="Implement only requested phase.", recommended_tool="codex", recommended_model="gpt-5.5", rating=5),
                    Prompt(title="Claude Architecture Review", slug="claude-architecture-review", category="architecture", body="Review architecture and risks.", recommended_tool="claude", recommended_model="claude-opus", rating=4),
                    Prompt(title="Carbon UI Page Builder", slug="carbon-ui-page-builder", category="coding", body="Use ai-tools-dir as UI reference.", recommended_tool="codex", recommended_model="gpt-5.5", rating=5),
                ]
            )
            session.add_all(
                [
                    ContentItem(title="Why I am building BuildOS", platform="linkedin", content_type="post", status="draft", hook="Execution beats scattered chats."),
                    ContentItem(title="How I use Codex, Claude, Aider, and Groq together", platform="youtube", content_type="video", status="idea", hook="A practical multi-agent stack."),
                    ContentItem(title="Why prompts should be saved like reusable assets", platform="blog", content_type="article", status="review", hook="Prompts are operating assets."),
                ]
            )
            session.add_all(
                [
                    Task(title="Create BuildOS frontend shell using Carbon", status="in_progress", priority="critical"),
                    Task(title="Create dashboard with operating snapshot", status="todo", priority="high"),
                    Task(title="Connect frontend to backend", status="todo", priority="medium"),
                ]
            )
            session.add_all(
                [
                    AISession(title="BuildOS Phase 1 frontend pass", tool="codex", model="gpt-5.5", source_module="manual", rating=5),
                    AISession(title="Architecture risk review", tool="claude", model="claude-opus", source_module="manual", rating=4),
                ]
            )
            session.add_all(
                [
                    KnowledgeNote(title="BuildOS product note", content="BuildOS is not a chatbot.", source_type="manual"),
                    KnowledgeNote(title="Execution layer", content="BuildOS is an execution layer.", source_type="manual"),
                ]
            )
            session.add_all([Setting(key="app.theme", value="g10", is_secret=False), Setting(key="ai.default_model", value="gpt-5.5", is_secret=False)])
            session.commit()


def _list_response(items: list, total: int, page: int, page_size: int, message: str = "OK"):
    return ListResponse(success=True, data=items, meta=ListMeta(total=total, page=page, page_size=page_size), message=message)


def _one_response(item, message: str = "OK"):
    return APIResponse(success=True, data=item, message=message)


def _not_found(entity: str):
    raise HTTPException(status_code=404, detail=f"{entity} not found")


def _paginate(query, page: int, page_size: int):
    return query.offset((page - 1) * page_size).limit(page_size)


def _apply_updates(obj, payload):
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    obj.updated_at = datetime.utcnow()
    return obj


def _register_item_routes(base_path: str, model_cls, create_schema, update_schema):
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
        obj = _apply_updates(obj, payload)
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
    return _list_response(items, len(session.exec(query).all()), page, page_size)


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
    obj = _apply_updates(obj, payload)
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


@app.get("/api/prompts")
def list_prompts(search: str | None = None, category: str | None = None, recommended_tool: str | None = None, project_id: int | None = None, page: int = Query(default=1, ge=1), page_size: int = Query(default=20, ge=1, le=100), session: Session = Depends(get_session)):
    query = select(Prompt)
    if search:
        query = query.where(Prompt.title.contains(search))
    if category:
        query = query.where(Prompt.category == category)
    if recommended_tool:
        query = query.where(Prompt.recommended_tool == recommended_tool)
    if project_id is not None:
        query = query.where(Prompt.project_id == project_id)
    items = session.exec(_paginate(query, page, page_size)).all()
    return _list_response(items, len(session.exec(query).all()), page, page_size)


@app.get("/api/content")
def list_content(search: str | None = None, platform: str | None = None, content_type: str | None = None, status: str | None = None, project_id: int | None = None, page: int = Query(default=1, ge=1), page_size: int = Query(default=20, ge=1, le=100), session: Session = Depends(get_session)):
    query = select(ContentItem)
    if search:
        query = query.where(ContentItem.title.contains(search))
    if platform:
        query = query.where(ContentItem.platform == platform)
    if content_type:
        query = query.where(ContentItem.content_type == content_type)
    if status:
        query = query.where(ContentItem.status == status)
    if project_id is not None:
        query = query.where(ContentItem.project_id == project_id)
    items = session.exec(_paginate(query, page, page_size)).all()
    return _list_response(items, len(session.exec(query).all()), page, page_size)


@app.get("/api/ai-sessions")
def list_ai_sessions(search: str | None = None, tool: str | None = None, source_module: str | None = None, project_id: int | None = None, page: int = Query(default=1, ge=1), page_size: int = Query(default=20, ge=1, le=100), session: Session = Depends(get_session)):
    query = select(AISession)
    if search:
        query = query.where(AISession.title.contains(search))
    if tool:
        query = query.where(AISession.tool == tool)
    if source_module:
        query = query.where(AISession.source_module == source_module)
    if project_id is not None:
        query = query.where(AISession.project_id == project_id)
    items = session.exec(_paginate(query, page, page_size)).all()
    return _list_response(items, len(session.exec(query).all()), page, page_size)


@app.get("/api/tasks")
def list_tasks(search: str | None = None, status: str | None = None, priority: str | None = None, project_id: int | None = None, page: int = Query(default=1, ge=1), page_size: int = Query(default=20, ge=1, le=100), session: Session = Depends(get_session)):
    query = select(Task)
    if search:
        query = query.where(Task.title.contains(search))
    if status:
        query = query.where(Task.status == status)
    if priority:
        query = query.where(Task.priority == priority)
    if project_id is not None:
        query = query.where(Task.project_id == project_id)
    items = session.exec(_paginate(query, page, page_size)).all()
    return _list_response(items, len(session.exec(query).all()), page, page_size)


@app.get("/api/knowledge")
def list_knowledge(search: str | None = None, source_type: str | None = None, project_id: int | None = None, page: int = Query(default=1, ge=1), page_size: int = Query(default=20, ge=1, le=100), session: Session = Depends(get_session)):
    query = select(KnowledgeNote)
    if search:
        query = query.where(KnowledgeNote.title.contains(search))
    if source_type:
        query = query.where(KnowledgeNote.source_type == source_type)
    if project_id is not None:
        query = query.where(KnowledgeNote.project_id == project_id)
    items = session.exec(_paginate(query, page, page_size)).all()
    return _list_response(items, len(session.exec(query).all()), page, page_size)


@app.get("/api/settings")
def list_settings(page: int = Query(default=1, ge=1), page_size: int = Query(default=20, ge=1, le=100), session: Session = Depends(get_session)):
    query = select(Setting)
    items = session.exec(_paginate(query, page, page_size)).all()
    return _list_response(items, len(session.exec(query).all()), page, page_size)


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


@app.post("/api/ai/generate-project-context")
def generate_project_context(payload: dict, session: Session = Depends(get_session)):
    project_id = payload.get("project_id")
    target_agent = payload.get("target_agent", "codex")
    desired_files = payload.get(
        "desired_files",
        ["AGENTS.md", "CLAUDE.md", "CODEX.md", "PLAN.md", "ARCHITECTURE.md", "UI_SPEC.md", "API_SPEC.md", "DATA_MODEL.md"],
    )
    extra_context = payload.get("extra_context", "")

    project = session.get(Project, int(project_id)) if project_id and str(project_id).isdigit() else None
    project_name = project.name if project else "Unknown Project"
    files = []
    for filename in desired_files:
        content = f"# {filename}\n\nProject: {project_name}\nTarget Agent: {target_agent}\n\n{extra_context}".strip()
        files.append({"filename": filename, "content": content})

    return APIResponse(success=True, data={"files": files}, message="Context files generated")


_register_item_routes("/api/prompts", Prompt, PromptCreate, PromptUpdate)
_register_item_routes("/api/content", ContentItem, ContentCreate, ContentUpdate)
_register_item_routes("/api/ai-sessions", AISession, AISessionCreate, AISessionUpdate)
_register_item_routes("/api/tasks", Task, TaskCreate, TaskUpdate)
_register_item_routes("/api/knowledge", KnowledgeNote, KnowledgeCreate, KnowledgeUpdate)
