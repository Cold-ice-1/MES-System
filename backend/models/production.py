from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class ProductionRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    equipment_id: int = Field(foreign_key="equipment.id")
    equipment_name: str
    work_order: str        
    target_qty: int        
    actual_qty: int        
    defect_qty: int = 0    
    record_time: datetime = Field(default_factory=datetime.utcnow)