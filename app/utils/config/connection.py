from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
import urllib

from config import settings

# Cadena de conexión para SQL Server
params = urllib.parse.quote_plus(
    f'DRIVER={{ODBC Driver 17 for SQL Server}};'
    f'SERVER={settings.DB_SERVER};'
    f'DATABASE={settings.DB_NAME};'
    f'UID={settings.DB_USER};'
    f'PWD={settings.DB_PASSWORD}'
)

engine = create_engine(f"mssql+pyodbc:///?odbc_connect={params}")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class DatabaseConnectionError(Exception):
    """Excepción personalizada para errores de conexión"""
    pass

def test_database_connection():
    """Prueba la conexión a la base de datos"""
    try:
        with engine.connect() as connection:
            return True
    except SQLAlchemyError as e:
        raise DatabaseConnectionError(f"Error de conexión: {str(e)}")