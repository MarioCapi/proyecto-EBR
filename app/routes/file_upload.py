from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
import os
from werkzeug.utils import secure_filename

from routes.file_processor import FileProcessor
from utils.config.connection import get_db
from utils.config.config import settings

router = APIRouter(
    prefix=f"/api/{settings.API_VERSION}/files",
    tags=["Cargas de Archivos"]
)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)
):
    """
    Endpoint para carga de archivos contables
    """
    try:
        # Validaciones iniciales
        FileProcessor.validate_file(file.filename)
        
        # Guardar archivo temporalmente
        temp_path = f"temp/{secure_filename(file.filename)}"
        os.makedirs("temp", exist_ok=True)
        
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # Leer y procesar archivo
        df = FileProcessor.read_file(temp_path)
        
        # Validar estructura del DataFrame
        required_columns = [
            'CodigoCuenta', 'NombreCuenta', 'SaldoInicial', 
            'Debito', 'Credito', 'SaldoFinal'
        ]
        FileProcessor.validate_dataframe(df, required_columns)
        
        # Preparar datos para base de datos
        processed_data = FileProcessor.prepare_data_for_database(df)
        
        # Aquí implementarías la lógica de inserción en base de datos
        # db.bulk_insert_mappings(DatoContable, processed_data)
        # db.commit()
        
        # Eliminar archivo temporal
        os.remove(temp_path)
        
        return JSONResponse(
            status_code=200, 
            content={
                "message": "Archivo procesado exitosamente",
                "registros_procesados": len(processed_data)
            }
        )
    
    except ValueError as ve:
        return JSONResponse(
            status_code=400, 
            content={"error": str(ve)}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500, 
            content={"error": "Error interno del servidor"}
        )