from datetime import date, datetime
from typing import Any, Optional
from pydantic import BaseModel


class APIError(BaseModel):
    code: str
    message: str


class APIResponse(BaseModel):
    success: bool
    data: Any | None = None
    message: str = "OK"


class ListMeta(BaseModel):
    total: int
    page: int
    page_size: int


class ListResponse(APIResponse):
    meta: ListMeta


class ProjectCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    goal: Optional[str] = None
    status: str = "idea"
    category: str = "product"
    priority: str = "medium"
    tech_stack: Optional[str] = None
    public_url: Optional[str] = None
    github_url: Optional[str] = None
    local_path: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    goal: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    tech_stack: Optional[str] = None
    public_url: Optional[str] = None
    github_url: Optional[str] = None
    local_path: Optional[str] = None


class PromptCreate(BaseModel):
    title: str
    slug: str
    category: str = "coding"
    body: str
    variables: Optional[str] = None
    recommended_tool: str = "codex"
    recommended_model: Optional[str] = None
    project_id: Optional[int] = None
    tags: Optional[str] = None
    rating: int = 0


class PromptUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    body: Optional[str] = None
    variables: Optional[str] = None
    recommended_tool: Optional[str] = None
    recommended_model: Optional[str] = None
    project_id: Optional[int] = None
    tags: Optional[str] = None
    rating: Optional[int] = None


class ContentCreate(BaseModel):
    title: str
    platform: str = "linkedin"
    content_type: str = "post"
    status: str = "idea"
    hook: Optional[str] = None
    body: Optional[str] = None
    cta: Optional[str] = None
    hashtags: Optional[str] = None
    project_id: Optional[int] = None
    scheduled_date: Optional[date] = None
    published_at: Optional[datetime] = None
    published_url: Optional[str] = None
    tags: Optional[str] = None


class ContentUpdate(BaseModel):
    title: Optional[str] = None
    platform: Optional[str] = None
    content_type: Optional[str] = None
    status: Optional[str] = None
    hook: Optional[str] = None
    body: Optional[str] = None
    cta: Optional[str] = None
    hashtags: Optional[str] = None
    project_id: Optional[int] = None
    scheduled_date: Optional[date] = None
    published_at: Optional[datetime] = None
    published_url: Optional[str] = None
    tags: Optional[str] = None


class AISessionCreate(BaseModel):
    title: str
    tool: str = "codex"
    model: Optional[str] = None
    input_prompt: Optional[str] = None
    output_text: Optional[str] = None
    summary: Optional[str] = None
    project_id: Optional[int] = None
    source_module: str = "manual"
    tags: Optional[str] = None
    rating: int = 0


class AISessionUpdate(BaseModel):
    title: Optional[str] = None
    tool: Optional[str] = None
    model: Optional[str] = None
    input_prompt: Optional[str] = None
    output_text: Optional[str] = None
    summary: Optional[str] = None
    project_id: Optional[int] = None
    source_module: Optional[str] = None
    tags: Optional[str] = None
    rating: Optional[int] = None


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    project_id: Optional[int] = None
    due_date: Optional[date] = None
    completed_at: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    project_id: Optional[int] = None
    due_date: Optional[date] = None
    completed_at: Optional[datetime] = None


class KnowledgeCreate(BaseModel):
    title: str
    content: str
    source_type: str = "manual"
    project_id: Optional[int] = None
    tags: Optional[str] = None


class KnowledgeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    source_type: Optional[str] = None
    project_id: Optional[int] = None
    tags: Optional[str] = None


class SettingUpdate(BaseModel):
    value: str
    is_secret: bool = False
