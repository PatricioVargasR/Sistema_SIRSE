from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import random
import string
from .. import models, schemas
from ..database import get_db
from ..auth import obtener_usuario_actual_db  # <-- IMPORTAR

router = APIRouter(prefix="/reportes", tags=["Reportes"])

def generar_folio():
    """Genera un folio único para el reporte"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"SIRSE-{timestamp}-{random_chars}"

# PÚBLICO - No requiere autenticación
@router.get("/", response_model=List[schemas.ReporteResponse])
def listar_reportes(
    skip: int = 0, 
    limit: int = 100,
    id_categoria: int = None,
    id_estado: int = None,
    db: Session = Depends(get_db)
):
    """Listar todos los reportes (público)"""
    query = db.query(models.Reporte)
    
    if id_categoria:
        query = query.filter(models.Reporte.id_categoria == id_categoria)
    
    if id_estado:
        query = query.filter(models.Reporte.id_estado == id_estado)
    
    reportes = query.order_by(models.Reporte.created_at.desc()).offset(skip).limit(limit).all()
    return reportes

# PÚBLICO
@router.get("/folio/{folio}", response_model=schemas.ReporteResponse)
def obtener_reporte_por_folio(folio: str, db: Session = Depends(get_db)):
    """Obtener un reporte por su folio (público)"""
    reporte = db.query(models.Reporte).filter(models.Reporte.folio == folio).first()
    if not reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    return reporte

# PÚBLICO
@router.get("/mapa/puntos", response_model=List[schemas.ReporteSimple])
def obtener_puntos_mapa(id_categoria: int = None, id_estado: int = None, db: Session = Depends(get_db)):
    """Obtener reportes para mostrar en el mapa (público)"""
    query = db.query(models.Reporte).filter(
        models.Reporte.latitud.isnot(None),
        models.Reporte.longitud.isnot(None)
    )
    
    if id_categoria:
        query = query.filter(models.Reporte.id_categoria == id_categoria)
    
    if id_estado:
        query = query.filter(models.Reporte.id_estado == id_estado)
    
    reportes = query.all()
    return reportes

# PÚBLICO
@router.get("/{reporte_id}", response_model=schemas.ReporteResponse)
def obtener_reporte(reporte_id: int, db: Session = Depends(get_db)):
    """Obtener un reporte por ID (público)"""
    reporte = db.query(models.Reporte).filter(models.Reporte.id_reporte == reporte_id).first()
    if not reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    return reporte

# PROTEGIDO - Requiere autenticación
@router.post("/", response_model=schemas.ReporteResponse, status_code=201)
def crear_reporte(
    reporte: schemas.ReporteCreate, 
    db: Session = Depends(get_db),
    current_user: str = Depends(obtener_usuario_actual_db)  # <-- PROTEGIDO
):
    """Crear un nuevo reporte (requiere autenticación)"""
    
    # Verificar que la categoría existe
    categoria = db.query(models.Categoria).filter(models.Categoria.id_categoria == reporte.id_categoria).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # Verificar que el estado existe
    estado = db.query(models.Estado).filter(models.Estado.id_estado == reporte.id_estado).first()
    if not estado:
        raise HTTPException(status_code=404, detail="Estado no encontrado")
    
    # Generar folio único
    folio = generar_folio()
    
    # Crear el reporte
    nuevo_reporte = models.Reporte(
        **reporte.dict(),
        folio=folio
    )
    
    db.add(nuevo_reporte)
    db.commit()
    db.refresh(nuevo_reporte)
    return nuevo_reporte

# PROTEGIDO
@router.put("/{reporte_id}", response_model=schemas.ReporteResponse)
def actualizar_reporte(
    reporte_id: int, 
    reporte: schemas.ReporteUpdate, 
    db: Session = Depends(get_db),
    current_user: str = Depends(obtener_usuario_actual_db)  # <-- PROTEGIDO
):
    """Actualizar un reporte (requiere autenticación)"""
    db_reporte = db.query(models.Reporte).filter(models.Reporte.id_reporte == reporte_id).first()
    if not db_reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    
    # Verificar que la categoría existe si se está actualizando
    if reporte.id_categoria:
        categoria = db.query(models.Categoria).filter(models.Categoria.id_categoria == reporte.id_categoria).first()
        if not categoria:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # Verificar que el estado existe si se está actualizando
    if reporte.id_estado:
        estado = db.query(models.Estado).filter(models.Estado.id_estado == reporte.id_estado).first()
        if not estado:
            raise HTTPException(status_code=404, detail="Estado no encontrado")
    
    for key, value in reporte.dict(exclude_unset=True).items():
        setattr(db_reporte, key, value)
    
    db.commit()
    db.refresh(db_reporte)
    return db_reporte

# PROTEGIDO
@router.delete("/{reporte_id}")
def eliminar_reporte(
    reporte_id: int, 
    db: Session = Depends(get_db),
    current_user: str = Depends(obtener_usuario_actual_db)  # <-- PROTEGIDO
):
    """Eliminar un reporte (requiere autenticación)"""
    reporte = db.query(models.Reporte).filter(models.Reporte.id_reporte == reporte_id).first()
    if not reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    
    db.delete(reporte)
    db.commit()
    return {"message": "Reporte eliminado correctamente"}