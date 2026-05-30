from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from ..database import get_session
from ..models.production import ProductionRecord
from ..models.equipment import Equipment

router = APIRouter(prefix="/api/production", tags=["生产报工"])

@router.post("/report")
def report_production(record: ProductionRecord, session: Session = Depends(get_session)):
    device = session.get(Equipment, record.equipment_id)
    if not device: raise HTTPException(404, "设备不存在")
    
    device.total_parts += record.actual_qty
    device.good_parts += (record.actual_qty - record.defect_qty)
    
    session.add(record)
    session.add(device)
    session.commit()
    return {"message": "报工成功，OEE数据已更新"}

@router.get("/records", response_model=List[ProductionRecord])
def get_records(session: Session = Depends(get_session)):
    return session.exec(select(ProductionRecord).order_by(ProductionRecord.record_time.desc())).all()