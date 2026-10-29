"""Backend 1: класс записи клиента и часы работы салона."""
from dataclasses import dataclass
import re


@dataclass
class Master:
    master_id: int
    name: str


@dataclass
class Service:
    service_id: int
    title: str


masters = [Master(1, "Анна"), Master(2, "Мария")]
services = [Service(1, "Стрижка"), Service(2, "Укладка")]


def get_master(master_id: int) -> Master | None:
    return next((m for m in masters if m.master_id == master_id), None)


def get_service(service_id: int) -> Service | None:
    return next((s for s in services if s.service_id == service_id), None)


@dataclass
class Appoinment:
    # Название Appoinment сохранено как в условии курса.
    id: int
    client_name: str
    master_id: int
    service_id: int
    time: str


appointments: list[Appoinment] = []


def create_appointment(client_name: str, master_id: int,
                       service_id: int, time: str) -> Appoinment | None:
    """Некорректная запись возвращает None и не изменяет список."""
    if not isinstance(client_name, str) or not client_name.strip():
        return None
    if type(master_id) is not int or type(service_id) is not int:
        return None
    master, service = get_master(master_id), get_service(service_id)
    if master is None or service is None:
        return None
    if not isinstance(time, str) or not re.fullmatch(r"(?:[01][0-9]|2[0-3]):[0-5][0-9]", time):
        return None
    if not "08:00" <= time <= "20:00":
        return None
    if any(a.master_id == master_id and a.time == time for a in appointments):
        return None
    appointment = Appoinment(
        max((a.id for a in appointments), default=0) + 1,
        client_name.strip(), master.master_id, service.service_id, time,
    )
    appointments.append(appointment)
    return appointment


if __name__ == "__main__":
    create_appointment("Иванова А.А.", 1, 1, "10:00")
    create_appointment("Петрова А.А.", 1, 1, "11:00")
    print("Список записей:")
    for appointment in appointments:
        print(appointment.client_name, appointment.time)
