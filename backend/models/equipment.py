from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class DeviceStatus(str, Enum):
    RUNNING = "Running"
    IDLE = "Idle"
    FAULT = "Fault"
    MAINTENANCE = "Maintenance"
    OFFLINE = "Offline"

class Equipment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(min_length=1, max_length=100)
    status: DeviceStatus = DeviceStatus.OFFLINE
    total_run_time_minutes: int = Field(default=0, ge=0)
    good_parts: int = Field(default=0, ge=0)
    total_parts: int = Field(default=0, ge=0)

class EquipmentEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    equipment_id: int = Field(foreign_key="equipment.id")
    old_status: DeviceStatus
    new_status: DeviceStatus
    reason_code: str = Field(min_length=1, max_length=64)
    timestamp: datetime = Field(default_factory=utc_now)
