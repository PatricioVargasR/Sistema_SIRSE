from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from .auth import obtener_usuario_actual_db  # <-- Agregar esta línea

router = APIRouter(prefix="/estados", tags=["Estados"])

@router.post("/", response_model=schemas.EstadoResponse, status_code=201)
def crear_estado(estado: schemas.EstadoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo estado"""
    nuevo_estado = models.Estado(**estado.dict())
    db.add(nuevo_estado)
    db.commit()
    db.refresh(nuevo_estado)
    return nuevo_estado

@router.get("/", response_model=List[schemas.EstadoResponse])
def listar_estados(skip: int = 0, limit: int = 100, activos: bool = None, db: Session = Depends(get_db)):
    """Listar todos los estados"""
    query = db.query(models.Estado)
    
    if activos is not None:
        query = query.filter(models.Estado.activo == activos)
    
    estados = query.offset(skip).limit(limit).all()
    return estados

@router.get("/{estado_id}", response_model=schemas.EstadoResponse)
def obtener_estado(estado_id: int, db: Session = Depends(get_db)):
    """Obtener un estado por ID"""
    estado = db.query(models.Estado).filter(models.Estado.id_estado == estado_id).first()
    if not estado:
        raise HTTPException(status_code=404, detail="Estado no encontrado")
    return estado

@router.put("/{estado_id}", response_model=schemas.EstadoResponse)
def actualizar_estado(estado_id: int, estado: schemas.EstadoUpdate, db: Session = Depends(get_db)):
    """Actualizar un estado"""
    db_estado = db.query(models.Estado).filter(models.Estado.id_estado == estado_id).first()
    if not db_estado:
        raise HTTPException(status_code=404, detail="Estado no encontrado")
    
    for key, value in estado.dict(exclude_unset=True).items():
        setattr(db_estado, key, value)
    
    db.commit()
    db.refresh(db_estado)
    return db_estado

@router.delete("/{estado_id}")
def eliminar_estado(estado_id: int, db: Session = Depends(get_db)):
    """Eliminar un estado (soft delete)"""
    estado = db.query(models.Estado).filter(models.Estado.id_estado == estado_id).first()
    if not estado:
        raise HTTPException(status_code=404, detail="Estado no encontrado")
    
    estado.activo = False
    db.commit()
    return {"message": "Estado desactivado correctamente"}