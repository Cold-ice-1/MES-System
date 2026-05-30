from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from ..database import get_session
from ..models.equipment import Equipment, EquipmentEvent, DeviceStatus
from pydantic import BaseModel

router = APIRouter(prefix="/api/equipment", tags=["设备管理"])

class StateChangeReq(BaseModel):
    new_status: DeviceStatus
    reason_code: str

@router.get("/", response_model=List[Equipment])
def get_devices(session: Session = Depends(get_session)):
    return session.exec(select(Equipment)).all()

@router.post("/{device_id}/state-change")
def change_state(device_id: int, req: StateChangeReq, session: Session = Depends(get_session)):
    device = session.get(Equipment, device_id)
    if not device: raise HTTPException(404, "设备不存在")
    if not req.reason_code: raise HTTPException(400, "MES拦截：必须提供原因码")
    
    old_status = device.status
    device.status = req.new_status
    event = EquipmentEvent(equipment_id=device_id, old_status=old_status, new_status=req.new_status, reason_code=req.reason_code)
    
    session.add(device); session.add(event); session.commit()
    return {"message": "状态变更成功"}

@router.get("/{device_id}/events", response_model=List[EquipmentEvent])
def get_events(device_id: int, session: Session = Depends(get_session)):
    return session.exec(select(EquipmentEvent).where(EquipmentEvent.equipment_id == device_id).order_by(EquipmentEvent.timestamp.desc())).all()