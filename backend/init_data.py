from sqlmodel import Session, select
from .database import engine
from .models.equipment import Equipment, DeviceStatus

def init_db():
    with Session(engine) as session:
        if not session.exec(select(Equipment)).all():
            devices = [
                Equipment(name="CNC-加工中心-01", status=DeviceStatus.RUNNING, total_run_time_minutes=450, good_parts=120, total_parts=125),
                Equipment(name="CNC-车床-02", status=DeviceStatus.IDLE, total_run_time_minutes=200, good_parts=50, total_parts=50),
                Equipment(name="注塑机-A01", status=DeviceStatus.FAULT, total_run_time_minutes=800, good_parts=1500, total_parts=1550),
                Equipment(name="注塑机-A02", status=DeviceStatus.RUNNING, total_run_time_minutes=750, good_parts=1400, total_parts=1410),
                Equipment(name="AGV-搬运车-01", status=DeviceStatus.RUNNING, total_run_time_minutes=1200),
                Equipment(name="AGV-搬运车-02", status=DeviceStatus.MAINTENANCE),
                Equipment(name="六轴机械臂-01", status=DeviceStatus.RUNNING, total_run_time_minutes=600, good_parts=300, total_parts=305),
                Equipment(name="包装流水线-01", status=DeviceStatus.OFFLINE),
            ]
            for d in devices: session.add(d)
            session.commit()
            print("✅ 成功初始化 8 台测试设备数据！")