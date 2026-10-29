from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_categories_and_details():
    response = client.get("/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) == 4
    for category in categories:
        assert set(category) == {"id", "name", "servicesCount"}
        assert isinstance(category["servicesCount"], int)
        assert client.get(f"/categories/{category['id']}").json() == category


def test_missing_category():
    response = client.get("/categories/999")
    assert response.status_code == 404
    assert response.json() == {"detail": "Category not found"}


def test_invalid_id():
    assert client.get("/categories/not-an-id").status_code == 422
