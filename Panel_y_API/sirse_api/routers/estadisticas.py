from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Dict
from datetime import datetime, timedelta
from .. import models
from ..database import get_db
from .auth import obtener_usuario_actual_db

router = APIRouter(prefix="/estadisticas", tags=["Estadísticas"])

# PROTEGIDO - Solo admins pueden ver estadísticas
@router.get("/generales")
def estadisticas_generales(
    db: Session = Depends(get_db),
    current_user: str = Depends(obtener_usuario_actual_db)  # <-- PROTEGIDO
):
    """Obtener estadísticas generales del sistema"""
    
    total_reportes = db.query(models.Reporte).count()
    total_categorias = db.query(models.Categoria).filter(models.Categoria.estado == True).count()
    
    reportes_pendientes = db.query(models.Reporte).filter(models.Reporte.id_estado == 1).count()
    reportes_proceso = db.query(models.Reporte).filter(models.Reporte.id_estado == 2).count()
    reportes_resueltos = db.query(models.Reporte).filter(models.Reporte.id_estado == 3).count()
    
    hace_un_mes = datetime.now() - timedelta(days=30)
    reportes_ultimo_mes = db.query(models.Reporte).filter(
        models.Reporte.created_at >= hace_un_mes
    ).count()
    
    return {
        "total_reportes": total_reportes,
        "total_categorias": total_categorias,
        "reportes_pendientes": reportes_pendientes,
        "reportes_proceso": reportes_proceso,
        "reportes_resueltos": reportes_resueltos,
        "reportes_ultimo_mes": reportes_ultimo_mes
    }

@router.get("/por-categoria")
def reportes_por_categoria(
    db: Session = Depends(get_db),
    current_user: str = Depends(obtener_usuario_actual_db)  # <-- PROTEGIDO
):
    """Obtener número de reportes por categoría"""
    
    resultado = db.query(
        models.Categoria.nombre,
        func.count(models.Reporte.id_reporte).label('total')
    ).outerjoin(
        models.Reporte, models.Categoria.id_categoria == models.Reporte.id_categoria
    ).group_by(
        models.Categoria.id_categoria, models.Categoria.nombre
    ).all()
    
    return [
        {"categoria": nombre, "total": total}
        for nombre, total in resultado
    ]

@router.get("/por-estado")
def reportes_por_estado(
    db: Session = Depends(get_db),
    current_user: str = Depends(obtener_usuario_actual_db)  # <-- PROTEGIDO
):
    """Obtener número de reportes por estado"""
    
    resultado = db.query(
        models.Estado.nombre,
        func.count(models.Reporte.id_reporte).label('total')
    ).outerjoin(
        models.Reporte, models.Estado.id_estado == models.Reporte.id_estado
    ).group_by(
        models.Estado.id_estado, models.Estado.nombre
    ).all()
    
    return [
        {"estado": nombre, "total": total}
        for nombre, total in resultado
    ]

@router.get("/por-mes")
def reportes_por_mes(
    db: Session = Depends(get_db),
    current_user: str = Depends(obtener_usuario_actual_db)  # <-- PROTEGIDO
):
    """Obtener reportes de los últimos 12 meses"""
    
    resultado = db.query(
        extract('year', models.Reporte.created_at).label('año'),
        extract('month', models.Reporte.created_at).label('mes'),
        func.count(models.Reporte.id_reporte).label('total')
    ).group_by('año', 'mes').order_by('año', 'mes').all()
    
    meses = {
        1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
        5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
        9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
    }
    
    return [
        {
            "año": int(año),
            "mes": int(mes),
            "nombre_mes": meses[int(mes)],
            "total": total
        }
        for año, mes, total in resultado
    ]

@router.get("/recientes")
def reportes_recientes(
    limit: int = 10, 
    db: Session = Depends(get_db),
    current_user: str = Depends(obtener_usuario_actual_db)  # <-- PROTEGIDO
):
    """Obtener los reportes más recientes"""
    
    reportes = db.query(models.Reporte).order_by(
        models.Reporte.created_at.desc()
    ).limit(limit).all()
    
    return [
        {
            "id_reporte": r.id_reporte,
            "folio": r.folio,
            "nombre": f"{r.nombre} {r.apellido_paterno}",
            "categoria": r.categoria.nombre,
            "estado": r.estado.nombre,
            "created_at": r.created_at
        }
        for r in reportes
    ]

@router.get("/zonas-calientes")
def zonas_con_mas_reportes(
    limit: int = 10, 
    db: Session = Depends(get_db),
    current_user: str = Depends(obtener_usuario_actual_db)  # <-- PROTEGIDO
):
    """Obtener las zonas con más reportes"""
    
    resultado = db.query(
        models.Reporte.direccion,
        func.count(models.Reporte.id_reporte).label('total')
    ).filter(
        models.Reporte.direccion.isnot(None)
    ).group_by(
        models.Reporte.direccion
    ).order_by(
        func.count(models.Reporte.id_reporte).desc()
    ).limit(limit).all()
    
    return [
        {"direccion": direccion, "total": total}
        for direccion, total in resultado
    ]