# Backend. Задание 2

FastAPI-приложение с двумя маршрутами из практики:
- `GET /categories` — четыре категории с `id`, `name`, `servicesCount`.
- `GET /categories/1` — одна категория; неизвестный ID даёт 404 и `{"detail":"Category not found"}`.
- Не целочисленный ID даёт 422.

Количество услуг задано в памяти, что разрешено условием. Данные не изменяются через API.

Python 3.10+. Из этой папки:
```sh
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```
Проверка в Swagger: http://127.0.0.1:8000/docs
```sh
python -m pytest -q
```
3 теста проверяют список, детали каждой категории, неизвестный и неверный ID.
