from contextlib import asynccontextmanager
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from sqlalchemy import func, select
from app.database import Base, make_database
from app.models import Category, Master, Service
from app.routers.services import router as services_router


def create_app(database_url=None):
    default_db = Path(__file__).resolve().parent.parent / "salon.db"
    engine, SessionLocal = make_database(
        database_url or os.getenv("DATABASE_URL", f"sqlite:///{default_db.as_posix()}")
    )

    @asynccontextmanager
    async def lifespan(app):
        Base.metadata.create_all(engine)
        with SessionLocal.begin() as session:
            if session.scalar(select(Category.id).limit(1)) is None:
                session.add_all([Category(id=i, name=name) for i, name in enumerate([
                    "Стрижки и укладки", "Маникюр и педикюр", "Брови и ресницы", "Спа-процедуры"], 1)])
            if session.scalar(select(Master.id).limit(1)) is None:
                session.add_all([Master(name="Анна", specialization="Парикмахер"),
                                 Master(name="Мария", specialization="Визажист")])
        yield
        engine.dispose()

    app = FastAPI(title="Салон — создание услуг", lifespan=lifespan)
    app.state.SessionLocal = SessionLocal
    app.include_router(services_router)

    def category_data(category, session):
        count = session.scalar(select(func.count()).select_from(Service).where(Service.category_id == category.id))
        return {"id": category.id, "name": category.name, "servicesCount": count}

    @app.get("/categories")
    def list_categories():
        with SessionLocal() as session:
            return [category_data(c, session) for c in session.scalars(select(Category).order_by(Category.id))]

    @app.get("/categories/{category_id}")
    def get_category(category_id: int):
        with SessionLocal() as session:
            category = session.get(Category, category_id)
            if category is None:
                raise HTTPException(404, detail="Category not found")
            return category_data(category, session)

    @app.get("/masters")
    def list_masters(specialization: str | None = None):
        statement = select(Master).order_by(Master.id)
        if specialization is not None:
            statement = statement.where(Master.specialization == specialization)
        with SessionLocal() as session:
            return [{"id": m.id, "name": m.name, "specialization": m.specialization}
                    for m in session.scalars(statement)]

    @app.get("/masters/{master_id}")
    def get_master(master_id: int):
        with SessionLocal() as session:
            master = session.get(Master, master_id)
            if master is None:
                raise HTTPException(404, detail="Master not found")
            return {"id": master.id, "name": master.name, "specialization": master.specialization}

    return app


app = create_app()
