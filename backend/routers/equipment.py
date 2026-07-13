import re
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, field_validator
from sqlmodel import Session, select

from ..database import get_session
from ..models.equipment import DeviceStatus, Equipment, EquipmentEvent

router = APIRouter(prefix="/api/equipment", tags=["设备管理"])


class StateChangeReq(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    new_status: DeviceStatus
    reason_code: str

    @field_validator("reason_code")
    @classmethod
    def validate_reason_code(cls, value: str) -> str:
        if not 5 <= len(value) <= 64:
            raise ValueError("原因码长度必须在 5 到 64 个字符之间")
        if not re.fullmatch(r"[A-Z][0-9]{2}-[^\r\n<>]+", value):
            raise ValueError("原因码格式无效")
        return value


@router.get("/", response_model=List[Equipment])
def get_devices(session: Session = Depends(get_session)):
    return session.exec(select(Equipment).order_by(Equipment.id).limit(500)).all()


@router.post("/{device_id}/state-change")
def change_state(device_id: int, req: StateChangeReq, session: Session = Depends(get_session)):
    device = session.get(Equipment, device_id)
    if not device:
        raise HTTPException(404, "设备不存在")
    old_status = device.status
    device.status = req.new_status
    event = EquipmentEvent(
        equipment_id=device_id,
        old_status=old_status,
        new_status=req.new_status,
        reason_code=req.reason_code,
    )

    session.add(device)
    session.add(event)
    session.commit()
    session.refresh(device)
    return {"message": "状态变更成功", "device": device}


@router.get("/{device_id}/events", response_model=List[EquipmentEvent])
def get_events(
    device_id: int,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
    session: Session = Depends(get_session),
):
    if not session.get(Equipment, device_id):
        raise HTTPException(404, "设备不存在")
    return session.exec(
        select(EquipmentEvent)
        .where(EquipmentEvent.equipment_id == device_id)
        .order_by(EquipmentEvent.timestamp.desc())
        .limit(limit)
    ).all()
