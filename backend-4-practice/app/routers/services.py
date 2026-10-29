from fastapi import APIRouter, HTTPException, Request
from sqlalchemy import select
from app.models import Category, Service
from app.schemas import ServiceCreate, ServiceResponse

router = APIRouter(tags=["services"])


def serialize(service):
    return {"id": service.id, "categoryId": service.category_id,
            "title": service.title, "desc": service.desc,
            "duration": service.duration, "price": service.price}


@router.post("/services", status_code=201, response_model=ServiceResponse)
def create_service(data: ServiceCreate, request: Request):
    with request.app.state.SessionLocal.begin() as session:
        if session.get(Category, data.categoryId) is None:
            raise HTTPException(404, detail="Category not found")
        service = Service(category_id=data.categoryId, title=data.title,
                          desc=data.desc, duration=data.duration, price=data.price)
        session.add(service)
        session.flush()
        result = serialize(service)
    return result


@router.get("/services", response_model=list[ServiceResponse])
def list_services(request: Request):
    with request.app.state.SessionLocal() as session:
        return [serialize(s) for s in session.scalars(select(Service).order_by(Service.id))]
