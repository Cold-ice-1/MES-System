from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field as PydanticField, field_validator, model_validator
from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ProductionReportCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    equipment_id: int = PydanticField(gt=0)
    work_order: str = PydanticField(
        min_length=1,
        max_length=64,
        pattern=r"^[A-Za-z0-9][A-Za-z0-9._/-]*$",
    )
    target_qty: int = PydanticField(gt=0, le=1_000_000)
    actual_qty: int = PydanticField(ge=0, le=1_000_000)
    defect_qty: int = PydanticField(default=0, ge=0, le=1_000_000)

    @field_validator("work_order")
    @classmethod
    def normalize_work_order(cls, value: str) -> str:
        return value.upper()

    @model_validator(mode="after")
    def validate_quantities(self):
        if self.defect_qty > self.actual_qty:
            raise ValueError("不良数量不能大于实际数量")
        return self

class ProductionRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    equipment_id: int = Field(foreign_key="equipment.id")
    equipment_name: str = Field(min_length=1, max_length=100)
    work_order: str = Field(min_length=1, max_length=64)
    target_qty: int = Field(gt=0, le=1_000_000)
    actual_qty: int = Field(ge=0, le=1_000_000)
    defect_qty: int = Field(default=0, ge=0, le=1_000_000)
    record_time: datetime = Field(default_factory=utc_now)
