from sqlmodel import Session, select

from .database import engine
from .models.equipment import DeviceStatus, Equipment
from .models.production import ProductionRecord


SEED_DEVICES = [
    {"id": 1, "name": "CNC-加工中心-01", "status": DeviceStatus.RUNNING, "total_run_time_minutes": 450, "good_parts": 120, "total_parts": 125},
    {"id": 2, "name": "CNC-车床-02", "status": DeviceStatus.IDLE, "total_run_time_minutes": 200, "good_parts": 50, "total_parts": 50},
    {"id": 3, "name": "注塑机-A01", "status": DeviceStatus.FAULT, "total_run_time_minutes": 800, "good_parts": 1500, "total_parts": 1550},
    {"id": 4, "name": "注塑机-A02", "status": DeviceStatus.RUNNING, "total_run_time_minutes": 750, "good_parts": 1400, "total_parts": 1410},
    {"id": 5, "name": "AGV-搬运车-01", "status": DeviceStatus.RUNNING, "total_run_time_minutes": 1200, "good_parts": 0, "total_parts": 0},
    {"id": 6, "name": "AGV-搬运车-02", "status": DeviceStatus.MAINTENANCE, "total_run_time_minutes": 80, "good_parts": 0, "total_parts": 0},
    {"id": 7, "name": "六轴机械臂-01", "status": DeviceStatus.RUNNING, "total_run_time_minutes": 600, "good_parts": 300, "total_parts": 305},
    {"id": 8, "name": "包装流水线-01", "status": DeviceStatus.OFFLINE, "total_run_time_minutes": 30, "good_parts": 0, "total_parts": 0},
]


def _looks_mojibake(value: str) -> bool:
    markers = ("å", "æ", "ç", "è", "é", "鍔", "娉", "鎼", "乱码")
    return any(marker in value for marker in markers)


def init_db():
    with Session(engine) as session:
        changed = False
        existing_devices = {device.id: device for device in session.exec(select(Equipment)).all()}

        for seed in SEED_DEVICES:
            device = existing_devices.get(seed["id"])
            if not device:
                session.add(Equipment(**seed))
                changed = True
                continue

            if _looks_mojibake(device.name):
                device.name = seed["name"]
                changed = True
            if device.total_run_time_minutes == 0 and seed["total_run_time_minutes"]:
                device.total_run_time_minutes = seed["total_run_time_minutes"]
                changed = True

        device_names = {item["id"]: item["name"] for item in SEED_DEVICES}
        for record in session.exec(select(ProductionRecord)).all():
            name = device_names.get(record.equipment_id)
            if name and _looks_mojibake(record.equipment_name):
                record.equipment_name = name
                changed = True

        if changed:
            session.commit()
            print("MES sample data initialized or repaired.")
