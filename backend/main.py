from collections import defaultdict, deque
from contextlib import asynccontextmanager
from threading import Lock
from time import monotonic

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.trustedhost import TrustedHostMiddleware

from .database import create_db_and_tables
from .init_data import init_db
from .routers import equipment, production
from .settings import settings


class WriteRateLimiter:
    def __init__(self, requests_per_minute: int):
        self.limit = requests_per_minute
        self.window_seconds = 60.0
        self.requests: dict[str, deque[float]] = defaultdict(deque)
        self.lock = Lock()

    def allow(self, key: str) -> bool:
        now = monotonic()
        cutoff = now - self.window_seconds
        with self.lock:
            timestamps = self.requests[key]
            while timestamps and timestamps[0] <= cutoff:
                timestamps.popleft()
            if len(timestamps) >= self.limit:
                return False
            timestamps.append(now)
            return True


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_db_and_tables()
    init_db()
    yield


app = FastAPI(
    title="企业级 MES 系统",
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
    lifespan=lifespan,
)
write_limiter = WriteRateLimiter(settings.write_requests_per_minute)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=list(settings.allowed_hosts))

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Accept", "Content-Type"],
    allow_credentials=False,
)
app.add_middleware(GZipMiddleware, minimum_size=1000)


def add_security_headers(response, api_request: bool):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if api_request:
        response.headers["Cache-Control"] = "no-store"
    return response


@app.middleware("http")
async def protect_api_requests(request: Request, call_next):
    api_request = request.url.path.startswith("/api/")
    if api_request and request.method in {"POST", "PUT", "PATCH"}:
        content_type = request.headers.get("content-type", "").split(";", 1)[0].lower()
        if content_type != "application/json":
            return add_security_headers(
                JSONResponse(status_code=415, content={"detail": "仅支持 application/json 请求"}),
                api_request,
            )

        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > settings.max_request_bytes:
                    return add_security_headers(
                        JSONResponse(status_code=413, content={"detail": "请求体过大"}),
                        api_request,
                    )
            except ValueError:
                return add_security_headers(
                    JSONResponse(status_code=400, content={"detail": "Content-Length 无效"}),
                    api_request,
                )

        client_host = request.client.host if request.client else "unknown"
        if not write_limiter.allow(client_host):
            return add_security_headers(
                JSONResponse(
                    status_code=429,
                    content={"detail": "写入请求过于频繁，请稍后再试"},
                    headers={"Retry-After": "60"},
                ),
                api_request,
            )

    response = await call_next(request)
    return add_security_headers(response, api_request)


@app.get("/api/health", tags=["系统"])
def health_check():
    return {"status": "ok", "environment": settings.environment}


app.include_router(equipment.router)
app.include_router(production.router)
