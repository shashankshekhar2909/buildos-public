import os
from pathlib import Path
from sqlmodel import SQLModel, create_engine, Session

DEFAULT_DB_PATH = Path(os.getenv("BUILDOS_DATA_DIR", "/app/data")).resolve() / "buildos.db"
DEFAULT_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
