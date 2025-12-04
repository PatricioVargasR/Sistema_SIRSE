"""
Script para poblar la base de datos con datos iniciales
Ejecutar con: python -m sirse_api.seed_data
"""
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from .models import Categoria, Estado, Base

def init_db():
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Verificar si ya existen datos
        if db.query(Estado).count() > 0:
            print("⚠️  Ya existen datos en la base de datos")
            return
        
        # Crear Estados
        estados = [
            Estado(nombre="Pendiente", descripcion="Reporte recibido, pendiente de revisión", activo=True),
            Estado(nombre="En proceso", descripcion="Reporte en proceso de atención", activo=True),
            Estado(nombre="Resuelto", descripcion="Reporte atendido y resuelto", activo=True),
            Estado(nombre="Rechazado", descripcion="Reporte no válido o duplicado", activo=True),
            Estado(nombre="Cerrado", descripcion="Reporte cerrado", activo=True),
        ]
        
        db.add_all(estados)
        db.commit()
        print("✅ Estados creados correctamente")
        
        # Crear Categorías
        categorias = [
            Categoria(nombre="Seguridad", descripcion="Reportes relacionados con seguridad pública", estado=True),
            Categoria(nombre="Robo", descripcion="Reportes de robos o asaltos", estado=True),
            Categoria(nombre="Accidente", descripcion="Reportes de accidentes viales", estado=True),
            Categoria(nombre="Vandalismo", descripcion="Actos de vandalismo o daños a propiedad", estado=True),
            Categoria(nombre="Persona sospechosa", descripcion="Reportes de personas con actitud sospechosa", estado=True),
            Categoria(nombre="Alumbrado público", descripcion="Problemas con iluminación en vías públicas", estado=True),
            Categoria(nombre="Baches", descripcion="Reportes de baches en calles", estado=True),
            Categoria(nombre="Basura", descripcion="Acumulación de basura o residuos", estado=True),
            Categoria(nombre="Fuga de agua", descripcion="Reportes de fugas de agua", estado=True),
            Categoria(nombre="Animal callejero", descripcion="Presencia de animales en la vía pública", estado=True),
            Categoria(nombre="Otro", descripcion="Otros tipos de reportes", estado=True),
        ]
        
        db.add_all(categorias)
        db.commit()
        print("✅ Categorías creadas correctamente")
        
        print("\n🎉 Base de datos inicializada correctamente")
        print(f"   - {len(estados)} estados creados")
        print(f"   - {len(categorias)} categorías creadas")
        
    except Exception as e:
        print(f"❌ Error al inicializar la base de datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Inicializando base de datos SIRSE...")
    init_db()