from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from ..database import get_session
from ..models.equipment import Equipment
from ..models.production import ProductionRecord, ProductionReportCreate

router = APIRouter(prefix="/api/production", tags=["生产报工"])


@router.post("/report", status_code=status.HTTP_201_CREATED)
def report_production(payload: ProductionReportCreate, session: Session = Depends(get_session)):
    device = session.get(Equipment, payload.equipment_id)
    if not device:
        raise HTTPException(404, "设备不存在")

    record = ProductionRecord(
        equipment_id=device.id,
        equipment_name=device.name,
        work_order=payload.work_order,
        target_qty=payload.target_qty,
        actual_qty=payload.actual_qty,
        defect_qty=payload.defect_qty,
    )
    device.total_parts += payload.actual_qty
    device.good_parts += payload.actual_qty - payload.defect_qty

    session.add(record)
    session.add(device)
    session.commit()
    session.refresh(record)
    return {"message": "报工成功，OEE 数据已更新", "record": record}


@router.get("/records", response_model=List[ProductionRecord])
def get_records(
    limit: Annotated[int, Query(ge=1, le=500)] = 200,
    session: Session = Depends(get_session),
):
    return session.exec(
        select(ProductionRecord).order_by(ProductionRecord.record_time.desc()).limit(limit)
    ).all()
