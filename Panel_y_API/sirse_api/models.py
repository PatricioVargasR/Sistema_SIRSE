from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from .database import Base

# ==================== MODELO DE USUARIO ====================
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    contraseña = Column(String(255), nullable=False)
    telefono = Column(String(20), nullable=True)
    departamento = Column(String(100), nullable=True)
    rol = Column(String(50), default="Operador")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# ==================== MODELOS SIRSE ====================
class Categoria(Base):
    __tablename__ = "categorias"
    
    id_categoria = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    estado = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    
    reportes = relationship("Reporte", back_populates="categoria")

class Estado(Base):
    __tablename__ = "estados"
    
    id_estado = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    
    reportes = relationship("Reporte", back_populates="estado")

class Reporte(Base):
    __tablename__ = "reportes"
    
    id_reporte = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    apellido_paterno = Column(String(100), nullable=False)
    apellido_materno = Column(String(100), nullable=False)
    folio = Column(String(50), unique=True, nullable=False, index=True)
    telefono_reportante = Column(String(20), nullable=True)
    descripcion = Column(String(500), nullable=True)
    latitud = Column(String(50), nullable=True)
    longitud = Column(String(50), nullable=True)
    direccion = Column(String(255), nullable=True)
    
    id_categoria = Column(Integer, ForeignKey("categorias.id_categoria"), nullable=False)
    id_estado = Column(Integer, ForeignKey("estados.id_estado"), nullable=False)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    categoria = relationship("Categoria", back_populates="reportes")
    estado = relationship("Estado", back_populates="reportes")
    multimedia = relationship("Multimedia", back_populates="reporte", cascade="all, delete-orphan")

class Multimedia(Base):
    __tablename__ = "multimedia"
    
    id_multimedia = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_reporte = Column(Integer, ForeignKey("reportes.id_reporte"), nullable=False)
    url_archivo = Column(String(255), nullable=False)
    tipo_archivo = Column(String(50), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    reporte = relationship("Reporte", back_populates="multimedia")
