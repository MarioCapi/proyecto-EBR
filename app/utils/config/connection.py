from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
import urllib
from .config import settings

# Cadena de conexión para SQL Server usando las configuraciones
params = urllib.parse.quote_plus(
    f'DRIVER={{ODBC Driver 17 for SQL Server}};'
    f'SERVER={settings.DB_SERVER};'
    f'DATABASE={settings.DB_NAME};'
    f'UID={settings.DB_USER};'
    f'PWD={settings.DB_PASSWORD}'
)

# Crear el engine de SQLAlchemy
engine = create_engine(f"mssql+pyodbc:///?odbc_connect={params}")

# Crear la sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    Generador de sesiones de base de datos
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_database_connection():
    """
    Prueba la conexión a la base de datos
    """
    try:
        with engine.connect() as connection:
            return True
    except SQLAlchemyError as e:
        raise Exception(f"Error de conexión a la base de datos: {str(e)}")