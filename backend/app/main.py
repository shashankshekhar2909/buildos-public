from datetime import datetime

import os
from pathlib import Path
import platform
import psutil

try:
    import docker
except Exception:
    docker = None
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.db import engine, get_session, init_db
from app.models import AISession, ContentItem, Deployment, KnowledgeNote, Project, Prompt, Setting, Task, User
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
    UserCreate,
    UserUpdate,
    DeploymentCreate,
    DeploymentUpdate,
)

app = FastAPI(title="BuildOS API", version="0.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECTS_ROOT = Path(os.getenv("PROJECTS_ROOT", "/home/shashank/app/projects")).resolve()


def _ensure_project_folder(slug: str) -> str:
    path = (PROJECTS_ROOT / slug).resolve()
    path.mkdir(parents=True, exist_ok=True)
    return str(path)


def _safe_project_subpath(base: str, relative_path: str) -> Path:
    base_path = Path(base).resolve()
    target = (base_path / relative_path).resolve()
    if target != base_path and base_path not in target.parents:
        raise HTTPException(status_code=400, detail="Invalid path")
    return target


def _slug_from_name(value: str) -> str:
    return "-".join("".join(ch.lower() if ch.isalnum() else " " for ch in value).split())


def _sanitize_user(user: User):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    PROJECTS_ROOT.mkdir(parents=True, exist_ok=True)
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
        for proj in session.exec(select(Project)).all():
            if not proj.local_path and proj.slug:
                proj.local_path = _ensure_project_folder(proj.slug)
                proj.updated_at = datetime.utcnow()
                session.add(proj)
        session.commit()

        if session.exec(select(Deployment)).first() is None:
            buildos = session.exec(select(Project).where(Project.slug == "buildos")).first()
            buildos_id = buildos.id if buildos else None
            session.add_all(
                [
                    Deployment(
                        project_id=buildos_id,
                        environment="production",
                        service_name="BuildOS Frontend",
                        service_type="frontend",
                        docker_compose_project="buildos",
                        docker_service_name="frontend",
                        container_name="buildos-frontend-phase3",
                        internal_host="frontend",
                        internal_port=3000,
                        internal_url="http://frontend:3000",
                        public_domain="buildos.example.com",
                        public_url="https://buildos.example.com",
                        cloudflare_tunnel_name="homelab-main",
                        cloudflare_route_hostname="buildos.example.com",
                        cloudflare_access_enabled=True,
                        health_check_url="https://buildos.example.com",
                        status="active",
                        notes="Primary UI route via Cloudflare Tunnel.",
                    ),
                    Deployment(
                        project_id=buildos_id,
                        environment="production",
                        service_name="BuildOS Backend",
                        service_type="backend",
                        docker_compose_project="buildos",
                        docker_service_name="backend",
                        container_name="buildos-backend-phase2",
                        internal_host="backend",
                        internal_port=8000,
                        internal_url="http://backend:8000",
                        public_domain="buildos-api.example.com",
                        public_url="https://buildos-api.example.com",
                        cloudflare_tunnel_name="homelab-main",
                        cloudflare_route_hostname="buildos-api.example.com",
                        cloudflare_access_enabled=True,
                        health_check_url="https://buildos-api.example.com/health",
                        status="active",
                        notes="API route behind tunnel + Access.",
                    ),
                ]
            )
            session.commit()
        if session.exec(select(User)).first() is None:
            session.add(
                User(
                    username="shashank",
                    email="sunnyrocks1122@gmail.com",
                    full_name="Shashank Shekhar",
                    role="admin",
                    password="buildos123",
                    is_active=True,
                )
            )
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


@app.post("/api/auth/login")
def auth_login(payload: dict, session: Session = Depends(get_session)):
    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", ""))
    if not username or not password:
        raise HTTPException(status_code=400, detail="username and password are required")
    user = session.exec(select(User).where(User.username == username)).first()
    if not user or not user.is_active or user.password != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return APIResponse(success=True, data=_sanitize_user(user), message="Authenticated")


@app.get("/api/users")
def list_users(search: str | None = None, role: str | None = None, is_active: bool | None = None, page: int = Query(default=1, ge=1), page_size: int = Query(default=20, ge=1, le=100), session: Session = Depends(get_session)):
    query = select(User)
    if search:
        query = query.where(User.username.contains(search))
    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    items = session.exec(_paginate(query, page, page_size)).all()
    return _list_response([_sanitize_user(u) for u in items], len(session.exec(query).all()), page, page_size)


@app.post("/api/users")
def create_user(payload: UserCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.username == payload.username)).first()
    if existing:
        raise HTTPException(status_code=409, detail="username already exists")
    if payload.email:
        email_existing = session.exec(select(User).where(User.email == payload.email)).first()
        if email_existing:
            raise HTTPException(status_code=409, detail="email already exists")
    obj = User(**payload.model_dump())
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return _one_response(_sanitize_user(obj), "User created")


@app.patch("/api/users/{item_id}")
def patch_user(item_id: int, payload: UserUpdate, session: Session = Depends(get_session)):
    obj = session.get(User, item_id)
    if not obj:
        _not_found("User")
    updates = payload.model_dump(exclude_unset=True)
    if "username" in updates and updates["username"] != obj.username:
        existing = session.exec(select(User).where(User.username == updates["username"])).first()
        if existing:
            raise HTTPException(status_code=409, detail="username already exists")
    if "email" in updates and updates["email"] != obj.email and updates["email"]:
        existing_email = session.exec(select(User).where(User.email == updates["email"])).first()
        if existing_email:
            raise HTTPException(status_code=409, detail="email already exists")
    for k, v in updates.items():
        setattr(obj, k, v)
    obj.updated_at = datetime.utcnow()
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return _one_response(_sanitize_user(obj), "User updated")


@app.delete("/api/users/{item_id}")
def delete_user(item_id: int, session: Session = Depends(get_session)):
    obj = session.get(User, item_id)
    if not obj:
        _not_found("User")
    session.delete(obj)
    session.commit()
    return APIResponse(success=True, data={"id": item_id}, message="User deleted")


@app.get("/api/project-finder/discover")
def discover_projects(session: Session = Depends(get_session)):
    known_paths = {str((Path(p.local_path).resolve())) for p in session.exec(select(Project)).all() if p.local_path}
    known_slugs = {p.slug for p in session.exec(select(Project)).all()}
    items = []
    if PROJECTS_ROOT.exists():
        for child in sorted(PROJECTS_ROOT.iterdir(), key=lambda p: p.name.lower()):
            if not child.is_dir():
                continue
            resolved = str(child.resolve())
            slug = _slug_from_name(child.name)
            items.append(
                {
                    "name": child.name,
                    "slug": slug,
                    "path": resolved,
                    "already_imported": resolved in known_paths or slug in known_slugs,
                }
            )
    return APIResponse(success=True, data={"root": str(PROJECTS_ROOT), "items": items}, message="OK")


@app.post("/api/project-finder/import")
def import_discovered_projects(payload: dict, session: Session = Depends(get_session)):
    names = payload.get("names") or []
    if not isinstance(names, list) or not names:
        raise HTTPException(status_code=400, detail="names is required")
    imported = []
    skipped = []
    for name in names:
        if not isinstance(name, str) or not name.strip():
            continue
        folder = (PROJECTS_ROOT / name).resolve()
        if not folder.exists() or not folder.is_dir():
            skipped.append({"name": name, "reason": "Folder not found"})
            continue
        if PROJECTS_ROOT not in folder.parents:
            skipped.append({"name": name, "reason": "Outside projects root"})
            continue
        slug = _slug_from_name(name)
        existing = session.exec(select(Project).where(Project.slug == slug)).first()
        if existing:
            skipped.append({"name": name, "reason": "Already imported"})
            continue
        obj = Project(
            name=name,
            slug=slug,
            category="product",
            status="active",
            priority="medium",
            goal=f"Imported from filesystem folder: {name}",
            local_path=str(folder),
        )
        session.add(obj)
        session.commit()
        session.refresh(obj)
        imported.append({"id": obj.id, "name": obj.name, "slug": obj.slug, "local_path": obj.local_path})
    return APIResponse(success=True, data={"imported": imported, "skipped": skipped}, message="Import completed")


@app.post("/api/projects")
def create_project(payload: ProjectCreate, session: Session = Depends(get_session)):
    values = payload.model_dump()
    values["local_path"] = values.get("local_path") or _ensure_project_folder(values["slug"])
    obj = Project(**values)
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
    updates = payload.model_dump(exclude_unset=True)
    if "slug" in updates and updates["slug"] and not updates.get("local_path"):
        updates["local_path"] = _ensure_project_folder(updates["slug"])
    for k, v in updates.items():
        setattr(obj, k, v)
    obj.updated_at = datetime.utcnow()
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return _one_response(obj, "Project updated")


@app.get("/api/projects/{item_id}/files")
def list_project_files(item_id: int, path: str = ".", session: Session = Depends(get_session)):
    obj = session.get(Project, item_id)
    if not obj:
        _not_found("Project")
    base = obj.local_path or _ensure_project_folder(obj.slug)
    target = _safe_project_subpath(base, path)
    if not target.exists():
        raise HTTPException(status_code=404, detail="Path not found")
    if not target.is_dir():
        raise HTTPException(status_code=400, detail="Path is not a directory")
    items = []
    for child in sorted(target.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower())):
        try:
            stat = child.stat()
            items.append(
                {
                    "name": child.name,
                    "path": str(child.relative_to(Path(base))),
                    "is_dir": child.is_dir(),
                    "size": stat.st_size,
                    "updated_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                }
            )
        except OSError:
            continue
    return APIResponse(
        success=True,
        data={
            "project_id": obj.id,
            "project_slug": obj.slug,
            "base_path": base,
            "current_path": str(target.relative_to(Path(base))) if target != Path(base) else ".",
            "items": items,
        },
        message="OK",
    )


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


@app.get("/api/deployments")
def list_deployments(search: str | None = None, status: str | None = None, environment: str | None = None, project_id: int | None = None, docker_compose_project: str | None = None, page: int = Query(default=1, ge=1), page_size: int = Query(default=20, ge=1, le=100), session: Session = Depends(get_session)):
    query = select(Deployment)
    if search:
        query = query.where(Deployment.service_name.contains(search))
    if status:
        query = query.where(Deployment.status == status)
    if environment:
        query = query.where(Deployment.environment == environment)
    if project_id is not None:
        query = query.where(Deployment.project_id == project_id)
    if docker_compose_project:
        query = query.where(Deployment.docker_compose_project == docker_compose_project)
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



@app.get("/api/system/snapshot")
def system_snapshot():
    cpu_percent = psutil.cpu_percent(interval=0.2)
    vm = psutil.virtual_memory()
    du = psutil.disk_usage("/")

    containers = []
    docker_available = False
    docker_error = None

    if docker is not None:
        try:
            client = docker.from_env()
            docker_available = True
            for c in client.containers.list(all=True):
                status = c.status
                ports = c.attrs.get("NetworkSettings", {}).get("Ports", {})
                try:
                    image_name = c.image.tags[0] if c.image.tags else c.image.id[:12]
                except Exception:
                    image_name = c.attrs.get("Config", {}).get("Image", "unknown")
                containers.append({
                    "id": c.short_id,
                    "name": c.name,
                    "status": status,
                    "image": image_name,
                    "ports": ports,
                })
        except Exception as e:
            docker_error = str(e)

    data = {
        "timestamp": datetime.utcnow().isoformat(),
        "host": {
            "platform": platform.platform(),
            "hostname": platform.node(),
            "cpu_percent": cpu_percent,
            "memory_percent": vm.percent,
            "memory_used_mb": round(vm.used / (1024 * 1024), 2),
            "memory_total_mb": round(vm.total / (1024 * 1024), 2),
            "disk_percent": du.percent,
            "disk_used_gb": round(du.used / (1024 * 1024 * 1024), 2),
            "disk_total_gb": round(du.total / (1024 * 1024 * 1024), 2),
            "load_avg": os.getloadavg() if hasattr(os, "getloadavg") else None,
        },
        "docker": {
            "available": docker_available,
            "error": docker_error,
            "containers_total": len(containers),
            "containers_running": len([c for c in containers if c["status"] == "running"]),
            "containers": containers,
        },
    }
    return APIResponse(success=True, data=data, message="OK")


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
_register_item_routes("/api/deployments", Deployment, DeploymentCreate, DeploymentUpdate)
