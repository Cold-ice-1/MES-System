import unittest

from pydantic import ValidationError

from backend.main import WriteRateLimiter
from backend.models.production import ProductionReportCreate
from backend.routers.equipment import StateChangeReq


class ProductionReportValidationTests(unittest.TestCase):
    def test_accepts_valid_report_and_normalizes_work_order(self):
        report = ProductionReportCreate(
            equipment_id=1,
            work_order=" wo-cnc-2301 ",
            target_qty=100,
            actual_qty=95,
            defect_qty=2,
        )
        self.assertEqual(report.work_order, "WO-CNC-2301")

    def test_rejects_spoofed_server_owned_fields(self):
        with self.assertRaises(ValidationError):
            ProductionReportCreate(
                equipment_id=1,
                equipment_name="伪造设备",
                work_order="WO-1",
                target_qty=100,
                actual_qty=95,
                defect_qty=2,
            )

    def test_rejects_defects_greater_than_actual_quantity(self):
        with self.assertRaises(ValidationError):
            ProductionReportCreate(
                equipment_id=1,
                work_order="WO-1",
                target_qty=100,
                actual_qty=5,
                defect_qty=6,
            )

    def test_rejects_invalid_work_order_characters(self):
        with self.assertRaises(ValidationError):
            ProductionReportCreate(
                equipment_id=1,
                work_order="<script>alert(1)</script>",
                target_qty=100,
                actual_qty=5,
                defect_qty=0,
            )


class EquipmentStateValidationTests(unittest.TestCase):
    def test_rejects_markup_in_reason_code(self):
        with self.assertRaises(ValidationError):
            StateChangeReq(new_status="Running", reason_code="P01-<script>")

    def test_rejects_unknown_request_fields(self):
        with self.assertRaises(ValidationError):
            StateChangeReq(new_status="Running", reason_code="P01-正常开机", admin=True)


class RateLimiterTests(unittest.TestCase):
    def test_limits_repeated_write_requests(self):
        limiter = WriteRateLimiter(2)
        self.assertTrue(limiter.allow("127.0.0.1"))
        self.assertTrue(limiter.allow("127.0.0.1"))
        self.assertFalse(limiter.allow("127.0.0.1"))


if __name__ == "__main__":
    unittest.main()
