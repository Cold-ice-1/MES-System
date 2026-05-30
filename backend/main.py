from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import create_db_and_tables
from .init_data import init_db
from .routers import equipment, production

app = FastAPI(title="企业级 MES 系统")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    init_db()

app.include_router(equipment.router)
app.include_router(production.router)