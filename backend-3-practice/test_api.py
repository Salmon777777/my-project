from fastapi.testclient import TestClient
from app.main import create_app
from app.models import Master


def test_database_queries_and_restart(tmp_path):
    url = f"sqlite:///{(tmp_path / 'test.db').as_posix()}"
    app = create_app(url)
    with TestClient(app) as client:
        response = client.get("/masters")
        assert response.status_code == 200
        assert len(response.json()) == 2
        assert client.get("/masters/1").json() == {
            "id": 1, "name": "Анна", "specialization": "Парикмахер"}
        assert client.get("/masters", params={"specialization": "Парикмахер"}).json() == [
            {"id": 1, "name": "Анна", "specialization": "Парикмахер"}]
        assert client.get("/masters", params={"specialization": "Неизвестная"}).json() == []
        assert client.get("/masters/999").status_code == 404
        assert client.get("/masters/abc").status_code == 422
        with app.state.SessionLocal.begin() as session:
            session.add(Master(name="Ирина", specialization="Парикмахер"))
        assert len(client.get("/masters").json()) == 3
    with TestClient(create_app(url)) as client:
        assert len(client.get("/masters").json()) == 3
        assert client.get("/masters/3").json()["name"] == "Ирина"
