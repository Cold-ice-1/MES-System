from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class DeviceStatus(str, Enum):
    RUNNING = "Running"
    IDLE = "Idle"
    FAULT = "Fault"
    MAINTENANCE = "Maintenance"
    OFFLINE = "Offline"

class Equipment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    status: DeviceStatus = DeviceStatus.OFFLINE
    total_run_time_minutes: int = 0 
    good_parts: int = 0
    total_parts: int = 0

class EquipmentEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    equipment_id: int = Field(foreign_key="equipment.id")
    old_status: DeviceStatus
    new_status: DeviceStatus
    reason_code: str  
    timestamp: datetime = Field(default_factory=datetime.utcnow)