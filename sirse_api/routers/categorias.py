from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas
from .auth import obtener_usuario_actual_db  # ← CORRECTO

router = APIRouter(prefix="/api/categorias", tags=["Categorías"])

# ... el resto de tu código de categorias

@router.get("/", response_model=List[schemas.CategoriaResponse])
def obtener_categorias(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    usuario_actual: str = Depends(obtener_usuario_actual_db)
):
    """Obtener todas las categorías"""
    categorias = db.query(models.Categoria).offset(skip).limit(limit).all()
    return categorias

@router.get("/{categoria_id}", response_model=schemas.CategoriaResponse)
def obtener_categoria(
    categoria_id: int, 
    db: Session = Depends(get_db),
    usuario_actual: str = Depends(obtener_usuario_actual_db)
):
    """Obtener una categoría por ID"""
    categoria = db.query(models.Categoria).filter(models.Categoria.id_categoria == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria

@router.post("/", response_model=schemas.CategoriaResponse)
def crear_categoria(
    categoria: schemas.CategoriaCreate, 
    db: Session = Depends(get_db),
    usuario_actual: str = Depends(obtener_usuario_actual_db)
):
    """Crear una nueva categoría"""
    db_categoria = models.Categoria(**categoria.dict())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

@router.put("/{categoria_id}", response_model=schemas.CategoriaResponse)
def actualizar_categoria(
    categoria_id: int, 
    categoria: schemas.CategoriaUpdate, 
    db: Session = Depends(get_db),
    usuario_actual: str = Depends(obtener_usuario_actual_db)
):
    """Actualizar una categoría"""
    db_categoria = db.query(models.Categoria).filter(models.Categoria.id_categoria == categoria_id).first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    for key, value in categoria.dict(exclude_unset=True).items():
        setattr(db_categoria, key, value)
    
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

@router.delete("/{categoria_id}")
def eliminar_categoria(
    categoria_id: int, 
    db: Session = Depends(get_db),
    usuario_actual: str = Depends(obtener_usuario_actual_db)
):
    """Eliminar una categoría (cambiar estado a False)"""
    db_categoria = db.query(models.Categoria).filter(models.Categoria.id_categoria == categoria_id).first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    db_categoria.estado = False
    db.commit()
    return {"message": "Categoría desactivada correctamente"}