from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, APIRouter
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from ..database import get_db
from .. import models, schemas

load_dotenv()

# ================= CONFIGURACIÓN ==================
SECRET_KEY = os.getenv("SECRET_KEY", "mi_clave_super_secreta_cambiar_en_produccion")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

# ================= UTILIDADES ==================
def verificar_contraseña(contraseña_plana: str, contraseña_guardada: str) -> bool:
    return contraseña_plana == contraseña_guardada

def hashear_contraseña(contraseña: str) -> str:
    return contraseña

def crear_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

# ============== FUNCIONES DE DEPENDENCIAS ==============
async def obtener_usuario_actual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    email = verificar_token(token)
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar el token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return email

def obtener_usuario_actual_db(email: str = Depends(obtener_usuario_actual)):
    return email

# ============== ROUTER =================
router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

@router.post("/registro", response_model=schemas.UsuarioResponse)
def registro(usuario: schemas.UsuarioRegistro, db: Session = Depends(get_db)):
    existe = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if existe:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    nuevo_usuario = models.Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        telefono=usuario.telefono,
        departamento=usuario.departamento,
        rol=usuario.rol,
        contraseña=hashear_contraseña(usuario.contraseña),
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@router.post("/login", response_model=schemas.TokenResponse)
def login(datos: schemas.LoginUser, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == datos.email).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if not verificar_contraseña(datos.contraseña, usuario.contraseña):
        raise HTTPException(status_code=400, detail="Contraseña incorrecta")

    token = crear_access_token({"sub": usuario.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": usuario
    }

@router.get("/me", response_model=schemas.UsuarioResponse)
def obtener_perfil(email: str = Depends(obtener_usuario_actual), db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@router.delete("/borrar_todos")
def borrar_todos(db: Session = Depends(get_db)):
    db.query(models.Usuario).delete()
    db.commit()
    return {"msg": "Todos los usuarios fueron eliminados"}
