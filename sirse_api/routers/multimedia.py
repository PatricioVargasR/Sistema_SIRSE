from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from pathlib import Path
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/multimedia", tags=["Multimedia"])

# Carpeta para guardar archivos
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/{reporte_id}/upload", response_model=schemas.MultimediaResponse, status_code=201)
async def subir_archivo(
    reporte_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Subir un archivo multimedia a un reporte"""
    
    # Verificar que el reporte existe
    reporte = db.query(models.Reporte).filter(models.Reporte.id_reporte == reporte_id).first()
    if not reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    
    # Validar tipo de archivo
    extension = file.filename.split(".")[-1].lower()
    tipos_permitidos = ["jpg", "jpeg", "png", "gif", "mp4", "mov", "avi", "pdf"]
    
    if extension not in tipos_permitidos:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido")
    
    # Determinar tipo de archivo
    if extension in ["jpg", "jpeg", "png", "gif"]:
        tipo_archivo = "imagen"
    elif extension in ["mp4", "mov", "avi"]:
        tipo_archivo = "video"
    elif extension == "pdf":
        tipo_archivo = "documento"
    else:
        tipo_archivo = "otro"
    
    # Generar nombre único para el archivo
    unique_filename = f"{uuid.uuid4()}.{extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Guardar archivo
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Crear registro en la base de datos
    nuevo_multimedia = models.Multimedia(
        id_reporte=reporte_id,
        url_archivo=str(file_path),
        tipo_archivo=tipo_archivo
    )
    
    db.add(nuevo_multimedia)
    db.commit()
    db.refresh(nuevo_multimedia)
    
    return nuevo_multimedia

@router.get("/reporte/{reporte_id}", response_model=List[schemas.MultimediaResponse])
def listar_multimedia_reporte(reporte_id: int, db: Session = Depends(get_db)):
    """Listar todos los archivos multimedia de un reporte"""
    multimedia = db.query(models.Multimedia).filter(
        models.Multimedia.id_reporte == reporte_id
    ).all()
    return multimedia

@router.delete("/{multimedia_id}")
def eliminar_multimedia(multimedia_id: int, db: Session = Depends(get_db)):
    """Eliminar un archivo multimedia"""
    multimedia = db.query(models.Multimedia).filter(
        models.Multimedia.id_multimedia == multimedia_id
    ).first()
    
    if not multimedia:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    # Eliminar archivo físico
    try:
        if os.path.exists(multimedia.url_archivo):
            os.remove(multimedia.url_archivo)
    except Exception as e:
        print(f"Error al eliminar archivo: {e}")
    
    # Eliminar registro de la base de datos
    db.delete(multimedia)
    db.commit()
    
    return {"message": "Archivo eliminado correctamente"}