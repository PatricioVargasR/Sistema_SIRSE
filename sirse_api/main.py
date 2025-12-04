from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import categorias, estados, reportes, auth, estadisticas, usuarios
from . import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SIRSE API",
    description="Sistema Integral de Reportes de Seguridad y Emergencias",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SIN prefix para auth.router ya que auth.py ya tiene su propio prefix
app.include_router(auth.router)
app.include_router(categorias.router, prefix="/api")
app.include_router(estados.router, prefix="/api")
app.include_router(reportes.router, prefix="/api")
app.include_router(estadisticas.router, prefix="/api")
app.include_router(usuarios.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Bienvenido a SIRSE API",
        "version": "1.0.0",
        "docs": "/docs",
        "sistema": "Sistema Integral de Reportes de Seguridad y Emergencias"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "SIRSE API"}