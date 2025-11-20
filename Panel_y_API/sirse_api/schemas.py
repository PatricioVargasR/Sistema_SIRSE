from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# ==================== SCHEMAS ORIGINALES ====================

# Schemas para Usuario
class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    departamento: Optional[str] = None
    rol: Optional[str] = "Operador"

class UsuarioCreate(UsuarioBase):
    contraseña: str

class UsuarioResponse(UsuarioBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None  # <-- Hacerlo opcional
    
    class Config:
        from_attributes = True

# Schemas para Producto
class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: int
    stock: int = 0

# ==================== SCHEMAS NUEVOS SIRSE ====================

# Schemas para Categoría
class CategoriaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    estado: bool = True

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[bool] = None

class CategoriaResponse(CategoriaBase):
    id_categoria: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schemas para Estado
class EstadoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    activo: bool = True

class EstadoCreate(EstadoBase):
    pass

class EstadoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    activo: Optional[bool] = None

class EstadoResponse(EstadoBase):
    id_estado: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schemas para Multimedia
class MultimediaBase(BaseModel):
    url_archivo: str
    tipo_archivo: str

class MultimediaCreate(MultimediaBase):
    pass

class MultimediaResponse(MultimediaBase):
    id_multimedia: int
    id_reporte: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schemas para Reporte
class ReporteBase(BaseModel):
    nombre: str
    apellido_paterno: str
    apellido_materno: str
    descripcion: Optional[str] = None
    telefono_reportante: Optional[str] = None
    latitud: Optional[str] = None
    longitud: Optional[str] = None
    direccion: Optional[str] = None
    id_categoria: int
    id_estado: int = 1

class ReporteCreate(ReporteBase):
    pass

class ReporteUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    descripcion: Optional[str] = None
    telefono_reportante: Optional[str] = None
    latitud: Optional[str] = None
    longitud: Optional[str] = None
    direccion: Optional[str] = None
    id_categoria: Optional[int] = None
    id_estado: Optional[int] = None

class ReporteResponse(ReporteBase):
    id_reporte: int
    folio: str
    created_at: datetime
    updated_at: Optional[datetime] = None  # <-- Hacerlo opcional
    categoria: CategoriaResponse
    estado: EstadoResponse
    multimedia: List[MultimediaResponse] = []
    
    class Config:
        from_attributes = True

class ReporteSimple(BaseModel):
    id_reporte: int
    nombre: str
    apellido_paterno: str
    apellido_materno: str
    folio: str
    descripcion: Optional[str] = None
    latitud: Optional[str] = None
    longitud: Optional[str] = None
    direccion: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# ==================== SCHEMAS PARA AUTENTICACIÓN ====================

# Schema para registro de usuario
class UsuarioRegistro(BaseModel):
    nombre: str
    email: EmailStr
    contraseña: str
    telefono: Optional[str] = None
    departamento: Optional[str] = None
    rol: Optional[str] = "Operador"

# Schema para login
class LoginUser(BaseModel):
    email: EmailStr
    contraseña: str

# Schema para respuesta de usuario en login (sin campos sensibles)
class UsuarioLoginResponse(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    departamento: Optional[str] = None
    rol: str
    
    class Config:
        from_attributes = True

# Schema para respuesta de token
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioLoginResponse

# Schema para datos del token
class TokenData(BaseModel):
    email: Optional[str] = None

# Schema para actualizar usuario
class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    departamento: Optional[str] = None
    rol: Optional[str] = None
    contraseña: Optional[str] = None

# Schema para cambiar contraseña
class CambiarContraseñaRequest(BaseModel):
    contraseña_actual: str
    contraseña_nueva: str

# ==================== SCHEMAS PARA ESTADÍSTICAS ====================

class EstadisticasBase(BaseModel):
    total_reportes: int
    reportes_activos: int
    reportes_resueltos: int
    categorias_populares: List[dict] = []

class EstadisticasResponse(EstadisticasBase):
    fecha_consulta: datetime
    
    class Config:
        from_attributes = True
