from datetime import datetime
import base64
import json
import time

import os
import re
from pathlib import Path
import platform
import psutil
import configparser
from urllib.request import urlopen

try:
    import docker
except Exception:
    docker = None
import jwt
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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

PROJECTS_ROOT = Path(os.getenv("PROJECTS_ROOT", "/app/projects")).resolve()
CLOUDFLARED_CONFIG_PATH = os.getenv("CLOUDFLARED_CONFIG_PATH", "/etc/cloudflared/config.yml")
BUILDOS_GITHUB_URL = os.getenv("BUILDOS_GITHUB_URL", "")
SEED_PROFILE = os.getenv("SEED_PROFILE", "generic").strip().lower()
DEFAULT_ADMIN_USERNAME = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@local")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "change-me")
AUTO_IMPORT_DISCOVERED_PROJECTS = os.getenv("AUTO_IMPORT_DISCOVERED_PROJECTS", "false").strip().lower() in {"1", "true", "yes", "on"}
AUTH_MODE = os.getenv("AUTH_MODE", "local").strip().lower()
AUTH_ENABLED = os.getenv("AUTH_ENABLED", "true").strip().lower() in {"1", "true", "yes", "on"}
AUTH_JWT_SECRET = os.getenv("AUTH_JWT_SECRET", "change-me-local-jwt-secret")
AUTH_JWT_ALGORITHM = os.getenv("AUTH_JWT_ALGORITHM", "HS256")
AUTH_TOKEN_TTL_SECONDS = int(os.getenv("AUTH_TOKEN_TTL_SECONDS", "43200"))
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN", "").strip()
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE", "").strip()
AUTH0_ISSUER = os.getenv("AUTH0_ISSUER", f"https://{AUTH0_DOMAIN}/" if AUTH0_DOMAIN else "").strip()
_auth0_jwks_cache = {"keys": None, "expires_at": 0}
DISCOVERY_ROOTS = [
    Path(p.strip()).resolve()
    for p in os.getenv("PROJECTS_DISCOVERY_ROOTS", "").split(",")
    if p.strip()
]
AI_CONTEXT_FILES = [
    "AGENTS.md",
    "CODEX.md",
    "CLAUDE.md",
    "AIDER.md",
    "PLAN.md",
    "ARCHITECTURE.md",
    "API_SPEC.md",
    "DATA_MODEL.md",
    "UI_SPEC.md",
    "FRONTEND_SPEC.md",
    "BACKEND_SPEC.md",
]

PROTECTED_PATH_PREFIXES = ("/api/", "/api")
UNPROTECTED_PATHS = {"/health", "/api/auth/token", "/api/auth/login"}


def _encode_local_token(user: User) -> str:
    now = int(time.time())
    payload = {
        "sub": str(user.id),
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "auth_mode": "local",
        "iat": now,
        "exp": now + AUTH_TOKEN_TTL_SECONDS,
    }
    return jwt.encode(payload, AUTH_JWT_SECRET, algorithm=AUTH_JWT_ALGORITHM)


def _decode_unverified_header(token: str) -> dict:
    parts = token.split(".")
    if len(parts) != 3:
        raise HTTPException(status_code=401, detail="Invalid token format")
    padded = parts[0] + "=" * (-len(parts[0]) % 4)
    try:
        return json.loads(base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token header")


def _get_auth0_jwks() -> dict:
    now = int(time.time())
    if _auth0_jwks_cache["keys"] is not None and now < _auth0_jwks_cache["expires_at"]:
        return _auth0_jwks_cache["keys"]
    if not AUTH0_DOMAIN:
        raise HTTPException(status_code=500, detail="AUTH0_DOMAIN not configured")
    with urlopen(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json", timeout=5) as resp:
        keys = json.loads(resp.read().decode("utf-8"))
    _auth0_jwks_cache["keys"] = keys
    _auth0_jwks_cache["expires_at"] = now + 300
    return keys


def _verify_auth0_token(token: str) -> dict:
    header = _decode_unverified_header(token)
    kid = header.get("kid")
    if not kid:
        raise HTTPException(status_code=401, detail="Missing kid in token")
    jwks = _get_auth0_jwks()
    key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
    if not key:
        raise HTTPException(status_code=401, detail="Signing key not found")
    public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
    options = {"verify_aud": bool(AUTH0_AUDIENCE)}
    return jwt.decode(
        token,
        key=public_key,
        algorithms=["RS256"],
        audience=AUTH0_AUDIENCE or None,
        issuer=AUTH0_ISSUER or None,
        options=options,
    )


def _verify_local_token(token: str) -> dict:
    return jwt.decode(token, AUTH_JWT_SECRET, algorithms=[AUTH_JWT_ALGORITHM])


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


def _discover_cloudflare_routes_from_config(path: str) -> dict:
    config_path = Path(path)
    if not config_path.exists():
        return {"available": False, "error": f"Config not found at {path}", "routes": []}

    routes = []
    current_host = None
    current_service = None
    hostname_re = re.compile(r"^\s*-\s*hostname:\s*(.+)\s*$")
    service_re = re.compile(r"^\s*service:\s*(.+)\s*$")

    try:
        for raw in config_path.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            host_match = hostname_re.match(raw)
            if host_match:
                if current_host:
                    routes.append({"hostname": current_host, "service": current_service or ""})
                current_host = host_match.group(1).strip().strip("'\"")
                current_service = None
                continue
            service_match = service_re.match(raw)
            if service_match and current_host:
                current_service = service_match.group(1).strip().strip("'\"")
        if current_host:
            routes.append({"hostname": current_host, "service": current_service or ""})
    except Exception as e:
        return {"available": False, "error": str(e), "routes": []}

    return {"available": True, "error": None, "routes": routes}


def _docker_container_payload(container) -> dict:
    attrs = container.attrs or {}
    config = attrs.get("Config", {}) or {}
    network = attrs.get("NetworkSettings", {}) or {}
    labels = config.get("Labels", {}) or {}
    state = attrs.get("State", {}) or {}
    ports = network.get("Ports", {}) or {}
    published_ports = []
    for container_port, host_bindings in ports.items():
        if not host_bindings:
            continue
        for binding in host_bindings:
            published_ports.append(
                {
                    "container_port": container_port,
                    "host_ip": binding.get("HostIp"),
                    "host_port": binding.get("HostPort"),
                }
            )
    health = (state.get("Health") or {}).get("Status")
    networks = list((network.get("Networks") or {}).keys())
    try:
        image_name = container.image.tags[0] if container.image.tags else config.get("Image", "unknown")
    except Exception:
        image_name = config.get("Image", "unknown")
    return {
        "id": container.id,
        "short_id": container.short_id,
        "name": container.name,
        "status": container.status,
        "health": health,
        "image": image_name,
        "ports": ports,
        "published_ports": published_ports,
        "networks": networks,
        "labels": labels,
        "compose_project": labels.get("com.docker.compose.project"),
        "compose_service": labels.get("com.docker.compose.service"),
    }


def _read_git_origin(local_path: str | None) -> str | None:
    if not local_path:
        return None
    config_path = Path(local_path) / ".git" / "config"
    if not config_path.exists():
        return None
    parser = configparser.ConfigParser()
    try:
        parser.read(config_path, encoding="utf-8")
        section = 'remote "origin"'
        if parser.has_section(section) and parser.has_option(section, "url"):
            return parser.get(section, "url")
    except Exception:
        return None
    return None


def _normalize_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def _title_from_slug(slug: str) -> str:
    return " ".join(part.capitalize() for part in slug.split("-") if part)


def _infer_project_local_path(slug: str, working_dir: str | None) -> str:
    candidates = []
    if working_dir:
        candidates.append(Path(working_dir).resolve())
    for root in DISCOVERY_ROOTS:
        candidates.append((root / slug).resolve())
    candidates.append((PROJECTS_ROOT / slug).resolve())
    for cand in candidates:
        if cand.exists() and cand.is_dir():
            return str(cand)
    return _ensure_project_folder(slug)


def _scan_project_context_files(local_path: str | None) -> list[dict]:
    if not local_path:
        return []
    base = Path(local_path)
    if not base.exists() or not base.is_dir():
        return []
    found = []
    for filename in AI_CONTEXT_FILES:
        fp = base / filename
        if fp.exists() and fp.is_file():
            found.append(
                {
                    "name": filename,
                    "path": str(fp),
                    "size": fp.stat().st_size,
                    "updated_at": datetime.fromtimestamp(fp.stat().st_mtime).isoformat(),
                }
            )
    return found


def _discover_project_folders() -> list[Path]:
    roots = [PROJECTS_ROOT] + [r for r in DISCOVERY_ROOTS if r != PROJECTS_ROOT]
    folders: list[Path] = []
    for root in roots:
        if not root.exists() or not root.is_dir():
            continue
        for child in sorted(root.iterdir(), key=lambda p: p.name.lower()):
            if child.is_dir():
                folders.append(child.resolve())
    return folders


def _import_project_folder(session: Session, folder: Path) -> bool:
    slug = _slug_from_name(folder.name)
    existing = session.exec(select(Project).where(Project.slug == slug)).first()
    if existing:
        return False
    obj = Project(
        name=folder.name,
        slug=slug,
        category="product",
        status="active",
        priority="medium",
        goal=f"Imported from filesystem folder: {folder.name}",
        local_path=str(folder),
    )
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return True


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
            seed_projects = [
                Project(
                    name="BuildOS",
                    slug="buildos",
                    category="product",
                    status="active",
                    priority="critical",
                    goal="Build a private AI-native operating dashboard.",
                    tech_stack="Next.js, Carbon, FastAPI, SQLite, Docker",
                    github_url=BUILDOS_GITHUB_URL or None,
                )
            ]
            if SEED_PROFILE == "extended":
                seed_projects.extend(
                    [
                        Project(name="AI Stack Lab", slug="ai-stack-lab", category="portfolio", status="active", priority="high", goal="Curated AI tools and workflow platform.", tech_stack="Next.js, SQLite, Docker", public_url="https://ai.example.com"),
                        Project(name="KnowMy Homelab", slug="knowmy-homelab", category="homelab", status="active", priority="high", goal="Public-safe homelab learning platform.", tech_stack="Proxmox, Docker, LiteLLM, Cloudflare, Next.js"),
                        Project(name="GhostPilot", slug="ghostpilot", category="product", status="active", priority="medium", goal="AI-assisted editorial dashboard.", tech_stack="FastAPI, Ghost CMS, Docker"),
                        Project(name="Cascade UI", slug="cascade-ui", category="product", status="paused", priority="medium", goal="Reusable component library.", tech_stack="React, Storybook, npm"),
                    ]
                )
            session.add_all(seed_projects)
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
            session.add_all([Task(title="Set up first project", status="todo", priority="high")])
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
            if proj.slug == "buildos" and BUILDOS_GITHUB_URL and not proj.github_url:
                proj.github_url = BUILDOS_GITHUB_URL
                proj.updated_at = datetime.utcnow()
                session.add(proj)
        session.commit()

        if AUTO_IMPORT_DISCOVERED_PROJECTS:
            imported = 0
            for folder in _discover_project_folders():
                if _import_project_folder(session, folder):
                    imported += 1
            if imported:
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
                    username=DEFAULT_ADMIN_USERNAME,
                    email=DEFAULT_ADMIN_EMAIL,
                    full_name="BuildOS Admin",
                    role="admin",
                    password=DEFAULT_ADMIN_PASSWORD,
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


@app.middleware("http")
async def auth_middleware(request, call_next):
    if not AUTH_ENABLED:
        return await call_next(request)
    if request.method == "OPTIONS":
        return await call_next(request)
    path = request.url.path
    if path in UNPROTECTED_PATHS or not path.startswith(PROTECTED_PATH_PREFIXES):
        return await call_next(request)
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"detail": "Missing bearer token"})
    token = auth_header.split(" ", 1)[1].strip()
    try:
        claims = _verify_auth0_token(token) if AUTH_MODE == "auth0" else _verify_local_token(token)
        request.state.auth_claims = claims
    except jwt.ExpiredSignatureError:
        return JSONResponse(status_code=401, content={"detail": "Token expired"})
    except HTTPException as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.detail})
    except Exception:
        return JSONResponse(status_code=401, content={"detail": "Invalid token"})
    return await call_next(request)


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


@app.post("/api/auth/token")
def auth_token(payload: dict, session: Session = Depends(get_session)):
    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", ""))
    if not username or not password:
        raise HTTPException(status_code=400, detail="username and password are required")
    if AUTH_MODE != "local":
        raise HTTPException(status_code=400, detail="Local token login disabled when AUTH_MODE is auth0")
    user = session.exec(select(User).where(User.username == username)).first()
    if not user or not user.is_active or user.password != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = _encode_local_token(user)
    return APIResponse(success=True, data={"access_token": token, "token_type": "Bearer", "user": _sanitize_user(user)}, message="Authenticated")


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
    roots = [PROJECTS_ROOT] + [r for r in DISCOVERY_ROOTS if r != PROJECTS_ROOT]
    for root in roots:
        if not root.exists():
            continue
        for child in sorted(root.iterdir(), key=lambda p: p.name.lower()):
            if not child.is_dir():
                continue
            resolved = str(child.resolve())
            slug = _slug_from_name(child.name)
            items.append(
                {
                    "name": child.name,
                    "slug": slug,
                    "path": resolved,
                    "root": str(root),
                    "already_imported": resolved in known_paths or slug in known_slugs,
                }
            )
    return APIResponse(success=True, data={"roots": [str(r) for r in roots], "items": items}, message="OK")


@app.post("/api/project-finder/import")
def import_discovered_projects(payload: dict, session: Session = Depends(get_session)):
    names = payload.get("names") or []
    paths = payload.get("paths") or []
    if (not isinstance(names, list) or not names) and (not isinstance(paths, list) or not paths):
        raise HTTPException(status_code=400, detail="names or paths is required")
    imported = []
    skipped = []
    roots = [PROJECTS_ROOT] + [r for r in DISCOVERY_ROOTS if r != PROJECTS_ROOT]
    targets: list[Path] = []
    for name in names if isinstance(names, list) else []:
        if not isinstance(name, str) or not name.strip():
            continue
        candidate = None
        for root in roots:
            p = (root / name).resolve()
            if p.exists() and p.is_dir():
                candidate = p
                break
        if candidate is None:
            skipped.append({"name": name, "reason": "Folder not found"})
            continue
        targets.append(candidate)
    for raw in paths if isinstance(paths, list) else []:
        if not isinstance(raw, str) or not raw.strip():
            continue
        p = Path(raw).resolve()
        targets.append(p)

    for folder in targets:
        if not folder.exists() or not folder.is_dir():
            skipped.append({"path": str(folder), "reason": "Folder not found"})
            continue
        if not any(root == folder or root in folder.parents for root in roots):
            skipped.append({"path": str(folder), "reason": "Outside configured discovery roots"})
            continue
        slug = _slug_from_name(folder.name)
        existing = session.exec(select(Project).where(Project.slug == slug)).first()
        if existing:
            skipped.append({"path": str(folder), "reason": "Already imported"})
            continue
        obj = Project(
            name=folder.name,
            slug=slug,
            category="product",
            status="active",
            priority="medium",
            goal=f"Imported from filesystem folder: {folder.name}",
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


@app.get("/api/containers")
def list_containers(
    status: str | None = None,
    project_id: int | None = None,
    search: str | None = None,
    session: Session = Depends(get_session),
):
    if docker is None:
        return APIResponse(
            success=True,
            data={"available": False, "message": "Docker access is not configured. Mount Docker socket read-only or configure Docker Socket Proxy.", "items": []},
            message="OK",
        )
    try:
        client = docker.from_env()
        containers = client.containers.list(all=True)
        deployment_map = {d.container_name: d for d in session.exec(select(Deployment)).all() if d.container_name}
        items = []
        for c in containers:
            row = _docker_container_payload(c)
            mapping = deployment_map.get(row["name"])
            row["mapped_project_id"] = mapping.project_id if mapping else None
            row["mapped_deployment_id"] = mapping.id if mapping else None
            row["mapped_service_name"] = mapping.service_name if mapping else None
            items.append(row)

        if status:
            items = [i for i in items if i.get("status") == status]
        if project_id is not None:
            items = [i for i in items if i.get("mapped_project_id") == project_id]
        if search:
            q = search.lower()
            items = [
                i
                for i in items
                if q in str(i.get("name", "")).lower()
                or q in str(i.get("image", "")).lower()
                or q in str(i.get("compose_project", "")).lower()
                or q in str(i.get("compose_service", "")).lower()
            ]
        return APIResponse(success=True, data={"available": True, "items": items}, message="OK")
    except Exception as e:
        return APIResponse(
            success=True,
            data={"available": False, "message": "Docker access is not configured. Mount Docker socket read-only or configure Docker Socket Proxy.", "error": str(e), "items": []},
            message="OK",
        )


@app.get("/api/containers/summary")
def containers_summary(session: Session = Depends(get_session)):
    if docker is None:
        return APIResponse(
            success=True,
            data={"available": False, "message": "Docker access is not configured. Mount Docker socket read-only or configure Docker Socket Proxy."},
            message="OK",
        )
    try:
        client = docker.from_env()
        containers = client.containers.list(all=True)
        deployment_map = {d.container_name: d for d in session.exec(select(Deployment)).all() if d.container_name}
        unhealthy = 0
        running = 0
        stopped = 0
        unmapped = 0
        for c in containers:
            row = _docker_container_payload(c)
            if row["status"] == "running":
                running += 1
            else:
                stopped += 1
            if row.get("health") == "unhealthy":
                unhealthy += 1
            if row["name"] not in deployment_map:
                unmapped += 1
        return APIResponse(
            success=True,
            data={
                "available": True,
                "total": len(containers),
                "running": running,
                "stopped": stopped,
                "unhealthy": unhealthy,
                "unmapped": unmapped,
                "mapped_deployments": len(deployment_map),
            },
            message="OK",
        )
    except Exception as e:
        return APIResponse(
            success=True,
            data={"available": False, "message": "Docker access is not configured. Mount Docker socket read-only or configure Docker Socket Proxy.", "error": str(e)},
            message="OK",
        )


@app.get("/api/containers/{container_id}")
def get_container(container_id: str, session: Session = Depends(get_session)):
    if docker is None:
        raise HTTPException(status_code=503, detail="Docker not available")
    try:
        client = docker.from_env()
        c = client.containers.get(container_id)
        row = _docker_container_payload(c)
        mapping = session.exec(select(Deployment).where(Deployment.container_name == row["name"])).first()
        row["mapping"] = mapping
        return APIResponse(success=True, data=row, message="OK")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Container not found: {e}")


@app.post("/api/containers/{container_id}/attach-project")
def attach_container_project(container_id: str, payload: dict, session: Session = Depends(get_session)):
    project_id = payload.get("project_id")
    if not project_id:
        raise HTTPException(status_code=400, detail="project_id is required")
    if docker is None:
        raise HTTPException(status_code=503, detail="Docker not available")
    project = session.get(Project, int(project_id))
    if not project:
        _not_found("Project")
    client = docker.from_env()
    container = client.containers.get(container_id)
    row = _docker_container_payload(container)
    existing = session.exec(select(Deployment).where(Deployment.container_name == row["name"])).first()
    internal_port = None
    if row["ports"]:
        first_key = next(iter(row["ports"].keys()))
        try:
            internal_port = int(str(first_key).split("/")[0])
        except Exception:
            internal_port = None
    internal_host = row.get("compose_service") or row["name"]
    internal_url = f"http://{internal_host}:{internal_port}" if internal_port else None
    if existing:
        existing.project_id = int(project_id)
        existing.docker_compose_project = row.get("compose_project")
        existing.docker_service_name = row.get("compose_service")
        existing.internal_host = internal_host
        existing.internal_port = internal_port
        existing.internal_url = existing.internal_url or internal_url
        existing.notes = payload.get("notes") or existing.notes
        existing.updated_at = datetime.utcnow()
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return APIResponse(success=True, data=existing, message="Container attached to project")
    obj = Deployment(
        project_id=int(project_id),
        environment="local",
        service_name=row["name"],
        service_type="other",
        docker_compose_project=row.get("compose_project"),
        docker_service_name=row.get("compose_service"),
        container_name=row["name"],
        internal_host=internal_host,
        internal_port=internal_port,
        internal_url=internal_url,
        status="active" if row.get("status") == "running" else "broken",
        notes=payload.get("notes") or "Attached from container mapping.",
    )
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return APIResponse(success=True, data=obj, message="Container attached to project")


@app.post("/api/containers/{container_id}/detach-project")
def detach_container_project(container_id: str, session: Session = Depends(get_session)):
    if docker is None:
        raise HTTPException(status_code=503, detail="Docker not available")
    client = docker.from_env()
    container = client.containers.get(container_id)
    row = _docker_container_payload(container)
    existing = session.exec(select(Deployment).where(Deployment.container_name == row["name"])).first()
    if not existing:
        return APIResponse(success=True, data={"detached": False}, message="No mapping found")
    existing.project_id = None
    existing.updated_at = datetime.utcnow()
    session.add(existing)
    session.commit()
    return APIResponse(success=True, data={"detached": True, "deployment_id": existing.id}, message="Container detached from project")


@app.get("/api/cloudflare/routes")
def list_cloudflare_routes():
    data = _discover_cloudflare_routes_from_config(CLOUDFLARED_CONFIG_PATH)
    data["source"] = CLOUDFLARED_CONFIG_PATH
    data["message"] = (
        "Cloudflare routes loaded from cloudflared config."
        if data.get("available")
        else "Cloudflare routes unavailable. Mount cloudflared config and set CLOUDFLARED_CONFIG_PATH."
    )
    return APIResponse(success=True, data=data, message="OK")


@app.post("/api/sync/discover-project-details")
def sync_project_details(session: Session = Depends(get_session)):
    projects = session.exec(select(Project)).all()
    deployments = session.exec(select(Deployment)).all()
    deployment_by_container = {d.container_name: d for d in deployments if d.container_name}

    git_updated = 0
    deployment_created = 0
    deployment_updated = 0

    for project in projects:
        if not project.github_url:
            origin = _read_git_origin(project.local_path)
            if origin:
                project.github_url = origin
                project.updated_at = datetime.utcnow()
                session.add(project)
                git_updated += 1

    if docker is not None:
        try:
            client = docker.from_env()
            for container in client.containers.list(all=True):
                attrs = container.attrs or {}
                labels = attrs.get("Config", {}).get("Labels", {}) or {}
                compose_project = labels.get("com.docker.compose.project")
                compose_service = labels.get("com.docker.compose.service")

                matched_project = None
                for project in projects:
                    keys = {_normalize_key(project.slug), _normalize_key(project.name)}
                    cp = _normalize_key(compose_project) if compose_project else ""
                    cn = _normalize_key(container.name)
                    if cp in keys or any(k and (k in cn or cn in k) for k in keys):
                        matched_project = project
                        break

                if not matched_project:
                    continue

                ports = attrs.get("NetworkSettings", {}).get("Ports", {}) or {}
                first_port = None
                if ports:
                    first_key = next(iter(ports.keys()))
                    try:
                        first_port = int(str(first_key).split("/")[0])
                    except Exception:
                        first_port = None

                internal_host = compose_service or container.name
                internal_url = f"http://{internal_host}:{first_port}" if first_port else None
                status = "active" if container.status == "running" else "broken"

                existing = deployment_by_container.get(container.name)
                if existing:
                    existing.project_id = matched_project.id
                    existing.docker_compose_project = compose_project
                    existing.docker_service_name = compose_service
                    existing.internal_host = internal_host
                    existing.internal_port = first_port
                    existing.internal_url = existing.internal_url or internal_url
                    existing.status = existing.status or status
                    existing.updated_at = datetime.utcnow()
                    session.add(existing)
                    deployment_updated += 1
                else:
                    obj = Deployment(
                        project_id=matched_project.id,
                        environment="local",
                        service_name=container.name,
                        service_type="other",
                        docker_compose_project=compose_project,
                        docker_service_name=compose_service,
                        container_name=container.name,
                        internal_host=internal_host,
                        internal_port=first_port,
                        internal_url=internal_url,
                        status=status,
                        notes="Auto-discovered from Docker metadata.",
                    )
                    session.add(obj)
                    deployment_created += 1
        except Exception:
            pass

    session.commit()
    return APIResponse(
        success=True,
        data={
            "projects_scanned": len(projects),
            "git_updated": git_updated,
            "deployment_created": deployment_created,
            "deployment_updated": deployment_updated,
        },
        message="Project detail sync complete",
    )


@app.post("/api/containers/auto-attach")
def auto_attach_containers(payload: dict | None = None, session: Session = Depends(get_session)):
    if docker is None:
        raise HTTPException(status_code=503, detail="Docker not available")

    options = payload or {}
    create_missing_projects = bool(options.get("create_missing_projects", True))
    attach_running_only = bool(options.get("attach_running_only", False))

    client = docker.from_env()
    containers = client.containers.list(all=True)
    projects = session.exec(select(Project)).all()
    project_by_norm = {}
    for p in projects:
        project_by_norm[_normalize_key(p.slug)] = p
        project_by_norm[_normalize_key(p.name)] = p

    deployments = session.exec(select(Deployment)).all()
    deployment_by_container = {d.container_name: d for d in deployments if d.container_name}

    created_projects = 0
    attached = 0
    updated = 0
    skipped = 0

    for c in containers:
        row = _docker_container_payload(c)
        if attach_running_only and row.get("status") != "running":
            skipped += 1
            continue

        labels = row.get("labels") or {}
        compose_project = labels.get("com.docker.compose.project")
        working_dir = labels.get("com.docker.compose.project.working_dir")
        base_key = _normalize_key(compose_project or row["name"])
        base_key = base_key.replace("_", "-")
        project = project_by_norm.get(base_key)

        if not project and create_missing_projects:
            slug = _slug_from_name(compose_project or row["name"])
            local_path = _infer_project_local_path(slug, working_dir)
            project = Project(
                name=_title_from_slug(slug),
                slug=slug,
                category="product",
                status="active",
                priority="medium",
                goal="Auto-discovered from Docker containers.",
                local_path=local_path,
            )
            session.add(project)
            session.commit()
            session.refresh(project)
            project_by_norm[_normalize_key(project.slug)] = project
            project_by_norm[_normalize_key(project.name)] = project
            created_projects += 1

        if not project:
            skipped += 1
            continue

        internal_port = None
        if row["ports"]:
            first_key = next(iter(row["ports"].keys()))
            try:
                internal_port = int(str(first_key).split("/")[0])
            except Exception:
                internal_port = None
        internal_host = row.get("compose_service") or row["name"]
        internal_url = f"http://{internal_host}:{internal_port}" if internal_port else None

        existing = deployment_by_container.get(row["name"])
        if existing:
            existing.project_id = project.id
            existing.docker_compose_project = row.get("compose_project")
            existing.docker_service_name = row.get("compose_service")
            existing.internal_host = internal_host
            existing.internal_port = internal_port
            existing.internal_url = existing.internal_url or internal_url
            existing.status = "active" if row.get("status") == "running" else "broken"
            existing.updated_at = datetime.utcnow()
            session.add(existing)
            updated += 1
        else:
            obj = Deployment(
                project_id=project.id,
                environment="local",
                service_name=row["name"],
                service_type="other",
                docker_compose_project=row.get("compose_project"),
                docker_service_name=row.get("compose_service"),
                container_name=row["name"],
                internal_host=internal_host,
                internal_port=internal_port,
                internal_url=internal_url,
                status="active" if row.get("status") == "running" else "broken",
                notes="Auto-attached from Docker container scan.",
            )
            session.add(obj)
            attached += 1

    session.commit()
    return APIResponse(
        success=True,
        data={
            "containers_seen": len(containers),
            "projects_created": created_projects,
            "deployments_created": attached,
            "deployments_updated": updated,
            "skipped": skipped,
        },
        message="Auto attach complete",
    )


@app.get("/api/projects/{project_id}/contexts")
def get_project_contexts(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        _not_found("Project")
    files = _scan_project_context_files(project.local_path)
    return APIResponse(
        success=True,
        data={
            "project_id": project_id,
            "project_name": project.name,
            "local_path": project.local_path,
            "context_files": files,
            "count": len(files),
        },
        message="OK",
    )


@app.get("/api/projects/context-index")
def project_context_index(session: Session = Depends(get_session)):
    projects = session.exec(select(Project)).all()
    items = []
    for p in projects:
        files = _scan_project_context_files(p.local_path)
        items.append(
            {
                "project_id": p.id,
                "project_name": p.name,
                "slug": p.slug,
                "local_path": p.local_path,
                "context_count": len(files),
                "context_files": files,
            }
        )
    return APIResponse(success=True, data={"items": items}, message="OK")


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
