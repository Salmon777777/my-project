"""Backend 2: категории услуг, хранящиеся в памяти процесса."""
from fastapi import FastAPI, HTTPException

app = FastAPI(title="Салон — категории услуг")
categories = [
    {"id": 1, "name": "Стрижки и укладки", "servicesCount": 5},
    {"id": 2, "name": "Маникюр и педикюр", "servicesCount": 5},
    {"id": 3, "name": "Брови и ресницы", "servicesCount": 4},
    {"id": 4, "name": "Спа-процедуры", "servicesCount": 4},
]


@app.get("/categories")
def list_categories():
    return categories


@app.get("/categories/{category_id}")
def get_category(category_id: int):
    category = next((c for c in categories if c["id"] == category_id), None)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category
