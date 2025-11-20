from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sirse_api import models, schemas
from sirse_api.database import get_db
from sirse_api.auth import hashear_contraseña

router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])


# ============================
# CREAR USUARIO
# ============================
@router.post("/", response_model=schemas.UsuarioResponse)
def crear_usuario(usuario: schemas.UsuarioRegistro, db: Session = Depends(get_db)):

    # Validar email existente
    existe = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if existe:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    nuevo = models.Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        telefono=usuario.telefono,
        departamento=usuario.departamento,
        rol=usuario.rol,
        contraseña=hashear_contraseña(usuario.contraseña)
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


# ============================
# LISTAR USUARIOS
# ============================
@router.get("/", response_model=list[schemas.UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(models.Usuario).all()


# ============================
# OBTENER USUARIO POR ID
# ============================
@router.get("/{usuario_id}", response_model=schemas.UsuarioResponse)
def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


# ============================
# ACTUALIZAR USUARIO
# ============================
@router.put("/{usuario_id}", response_model=schemas.UsuarioResponse)
def actualizar_usuario(usuario_id: int, datos: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    for k, v in datos.dict().items():
        setattr(usuario, k, v)

    db.commit()
    db.refresh(usuario)
    return usuario


# ============================
# ELIMINAR USUARIO
# ============================
@router.delete("/{usuario_id}")
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(usuario)
    db.commit()
    return {"detail": "Usuario eliminado correctamente"}
