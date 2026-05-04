from datetime import datetime, date
from typing import Optional
from sqlmodel import Field, SQLModel


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    slug: str = Field(index=True, unique=True)
    description: Optional[str] = None
    goal: Optional[str] = None
    status: str = Field(default="idea", index=True)
    category: str = Field(default="product", index=True)
    priority: str = Field(default="medium", index=True)
    tech_stack: Optional[str] = None
    public_url: Optional[str] = None
    github_url: Optional[str] = None
    local_path: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Prompt(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    slug: str = Field(index=True, unique=True)
    category: str = Field(default="coding", index=True)
    body: str
    variables: Optional[str] = None
    recommended_tool: str = Field(default="codex", index=True)
    recommended_model: Optional[str] = None
    project_id: Optional[int] = Field(default=None, index=True)
    tags: Optional[str] = None
    rating: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ContentItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    platform: str = Field(default="linkedin", index=True)
    content_type: str = Field(default="post", index=True)
    status: str = Field(default="idea", index=True)
    hook: Optional[str] = None
    body: Optional[str] = None
    cta: Optional[str] = None
    hashtags: Optional[str] = None
    project_id: Optional[int] = Field(default=None, index=True)
    scheduled_date: Optional[date] = None
    published_at: Optional[datetime] = None
    published_url: Optional[str] = None
    tags: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AISession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    tool: str = Field(default="codex", index=True)
    model: Optional[str] = None
    input_prompt: Optional[str] = None
    output_text: Optional[str] = None
    summary: Optional[str] = None
    project_id: Optional[int] = Field(default=None, index=True)
    source_module: str = Field(default="manual", index=True)
    tags: Optional[str] = None
    rating: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    status: str = Field(default="todo", index=True)
    priority: str = Field(default="medium", index=True)
    project_id: Optional[int] = Field(default=None, index=True)
    due_date: Optional[date] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class KnowledgeNote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    source_type: str = Field(default="manual", index=True)
    project_id: Optional[int] = Field(default=None, index=True)
    tags: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Setting(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(index=True, unique=True)
    value: str
    is_secret: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
