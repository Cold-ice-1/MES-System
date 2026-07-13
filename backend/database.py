from pathlib import Path

from sqlmodel import SQLModel, Session, create_engine

project_root = Path(__file__).resolve().parents[1]
sqlite_file_name = project_root / "mes_database.db"
sqlite_url = f"sqlite:///{sqlite_file_name.as_posix()}"
engine = create_engine(sqlite_url, echo=False, connect_args={"check_same_thread": False})


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
