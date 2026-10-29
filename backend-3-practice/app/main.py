from contextlib import asynccontextmanager
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from sqlalchemy import select
from app.database import Base, make_database
from app.models import Master


def create_app(database_url=None):
    default_db = Path(__file__).resolve().parent.parent / "salon.db"
    engine, SessionLocal = make_database(
        database_url or os.getenv("DATABASE_URL", f"sqlite:///{default_db.as_posix()}")
    )

    @asynccontextmanager
    async def lifespan(app):
        Base.metadata.create_all(engine)
        with SessionLocal.begin() as session:
            if session.scalar(select(Master.id).limit(1)) is None:
                session.add_all([
                    Master(name="Анна", specialization="Парикмахер"),
                    Master(name="Мария", specialization="Визажист"),
                ])
        yield
        engine.dispose()

    app = FastAPI(title="Салон — мастера в SQLite", lifespan=lifespan)
    app.state.SessionLocal = SessionLocal

    def serialize(master):
        return {"id": master.id, "name": master.name,
                "specialization": master.specialization}

    @app.get("/masters")
    def list_masters(specialization: str | None = None):
        statement = select(Master).order_by(Master.id)
        if specialization is not None:
            statement = statement.where(Master.specialization == specialization)
        with SessionLocal() as session:
            return [serialize(m) for m in session.scalars(statement)]

    @app.get("/masters/{master_id}")
    def get_master(master_id: int):
        with SessionLocal() as session:
            master = session.get(Master, master_id)
            if master is None:
                raise HTTPException(404, detail="Master not found")
            return serialize(master)

    return app


app = create_app()
