from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from app.main import create_app
from app.models import Service

VALID = {"categoryId": 3, "title": "Наращивание ресниц",
         "desc": "Огромные ресницы уже через 30 минут", "duration": 30, "price": 1500.00}


@pytest.fixture
def api(tmp_path):
    app = create_app(f"sqlite:///{(tmp_path / 'test.db').as_posix()}")
    with TestClient(app) as client:
        yield app, client


def test_creation_and_database(api):
    app, client = api
    response = client.post("/services", json=VALID)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == 1 and data["categoryId"] == 3
    assert Decimal(str(data["price"])) == Decimal("1500.00")
    with app.state.SessionLocal() as session:
        saved = session.get(Service, data["id"])
        assert saved.title == VALID["title"] and saved.duration == 30
    assert client.get("/categories/3").json()["servicesCount"] == 1


@pytest.mark.parametrize("change", [
    {"price": "бесплатно"}, {"desc": "", "duration": 0, "price": -1500},
    {"title": "   "}, {"desc": "   "}, {"title": "а" * 101}, {"desc": "а" * 101},
    {"duration": 29}, {"duration": 181}, {"duration": 30.5}, {"duration": True},
    {"price": 0}, {"price": -1}, {"price": "NaN"}, {"categoryId": 0},
])
def test_invalid_data_not_saved(api, change):
    app, client = api
    response = client.post("/services", json=VALID | change)
    assert response.status_code == 422
    with app.state.SessionLocal() as session:
        assert session.scalar(select(func.count()).select_from(Service)) == 0


def test_nonexistent_category(api):
    app, client = api
    assert client.post("/services", json=VALID | {"categoryId": 999}).status_code == 404
    assert client.get("/services").json() == []


def test_boundaries_and_trim(api):
    _, client = api
    response = client.post("/services", json=VALID | {
        "title": "  " + "а" * 100 + "  ", "desc": "б" * 100, "duration": 180, "price": 0.01})
    assert response.status_code == 201
    assert response.json()["title"] == "а" * 100


def test_persistence_after_restart(tmp_path):
    url = f"sqlite:///{(tmp_path / 'persistent.db').as_posix()}"
    with TestClient(create_app(url)) as client:
        assert client.post("/services", json=VALID).status_code == 201
    with TestClient(create_app(url)) as client:
        assert len(client.get("/services").json()) == 1
        assert len(client.get("/categories").json()) == 4
