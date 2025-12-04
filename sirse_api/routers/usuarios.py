from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from .auth import obtener_usuario_actual_db, hashear_contraseña  # <-- Importar hashear_contraseña

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

# Listar todos los usuarios (protegido)
@router.get("/", response_model=List[schemas.UsuarioResponse])
def listar_usuarios(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: str = Depends(obtener_usuario_actual_db)
):
    """Listar todos los usuarios"""
    usuarios = db.query(models.Usuario).offset(skip).limit(limit).all()
    return usuarios

# Obtener un usuario por ID (protegido)
@router.get("/{usuario_id}", response_model=schemas.UsuarioResponse)
def obtener_usuario(
    usuario_id: int, 
    db: Session = Depends(get_db),
    current_user: str = Depends(obtener_usuario_actual_db)
):
    """Obtener un usuario por ID"""
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

# Crear usuario (protegido)
@router.post("/", response_model=schemas.UsuarioResponse, status_code=201)
def crear_usuario(
    usuario: schemas.UsuarioRegistro, 
    db: Session = Depends(get_db),
    current_user: str = Depends(obtener_usuario_actual_db)
):
    """Crear un nuevo usuario"""
    
    # Verificar si el email ya existe
    db_usuario = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if db_usuario:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Crear usuario CON departamento y rol
    nuevo_usuario = models.Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        contraseña=hashear_contraseña(usuario.contraseña),
        telefono=usuario.telefono,
        departamento=usuario.departamento,
        rol=usuario.rol or "Operador"
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

# Actualizar usuario (protegido)
@router.put("/{usuario_id}", response_model=schemas.UsuarioResponse)
def actualizar_usuario(
    usuario_id: int,
    usuario: schemas.UsuarioUpdate,  # <-- Usar UsuarioUpdate en lugar de UsuarioCreate
    db: Session = Depends(get_db),
    current_user: str = Depends(obtener_usuario_actual_db)
):
    """Actualizar un usuario"""
    db_usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Actualizar solo los campos proporcionados
    update_data = usuario.dict(exclude_unset=True)
    
    if 'contraseña' in update_data:
        update_data['contraseña'] = hashear_contraseña(update_data['contraseña'])
    
    for field, value in update_data.items():
        setattr(db_usuario, field, value)
    
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

# Eliminar usuario (protegido)
@router.delete("/{usuario_id}")
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(obtener_usuario_actual_db)
):
    """Eliminar un usuario"""
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # No permitir eliminar al usuario logueado
    user = db.query(models.Usuario).filter(models.Usuario.email == current_user).first()
    if user and user.id == usuario_id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta")
    
    db.delete(usuario)
    db.commit()
    return {"message": "Usuario eliminado correctamente"}

# Cambiar contraseña del usuario actual (MEJORADO)
@router.put("/me/cambiar-contraseña")
def cambiar_contraseña(
    contraseña_data: schemas.CambiarContraseñaRequest,  # <-- Usar el nuevo schema
    db: Session = Depends(get_db),
    current_user: str = Depends(obtener_usuario_actual_db)
):
    """Cambiar contraseña del usuario actual"""
    usuario = db.query(models.Usuario).filter(models.Usuario.email == current_user).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Verificar contraseña actual
    from .auth import verificar_contraseña
    if not verificar_contraseña(contraseña_data.contraseña_actual, usuario.contraseña):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    
    usuario.contraseña = hashear_contraseña(contraseña_data.contraseña_nueva)
    db.commit()
    
    return {"message": "Contraseña actualizada correctamente"}