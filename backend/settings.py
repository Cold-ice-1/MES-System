import os
from dataclasses import dataclass


def _csv_setting(name: str, default: str) -> tuple[str, ...]:
    values = tuple(item.strip() for item in os.getenv(name, default).split(",") if item.strip())
    if not values:
        raise RuntimeError(f"{name} must contain at least one value")
    return values


def _positive_int_setting(name: str, default: int) -> int:
    raw_value = os.getenv(name, str(default))
    try:
        value = int(raw_value)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be an integer") from exc
    if value <= 0:
        raise RuntimeError(f"{name} must be greater than zero")
    return value


@dataclass(frozen=True)
class Settings:
    environment: str
    allowed_origins: tuple[str, ...]
    allowed_hosts: tuple[str, ...]
    write_requests_per_minute: int
    max_request_bytes: int

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


def load_settings() -> Settings:
    environment = os.getenv("MES_ENV", "development").strip().lower()
    if environment not in {"development", "test", "production"}:
        raise RuntimeError("MES_ENV must be development, test, or production")

    settings = Settings(
        environment=environment,
        allowed_origins=_csv_setting(
            "MES_ALLOWED_ORIGINS",
            "http://127.0.0.1:5173,http://localhost:5173",
        ),
        allowed_hosts=_csv_setting("MES_ALLOWED_HOSTS", "127.0.0.1,localhost,testserver"),
        write_requests_per_minute=_positive_int_setting("MES_WRITE_RATE_LIMIT", 60),
        max_request_bytes=_positive_int_setting("MES_MAX_REQUEST_BYTES", 65536),
    )

    if settings.is_production and (
        "*" in settings.allowed_origins or "*" in settings.allowed_hosts
    ):
        raise RuntimeError("Wildcard origins or hosts are not allowed in production")
    return settings


settings = load_settings()
