from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from utils.file_processor import process_excel_file
from utils.config.connection import get_db  # Función que provee la sesión
from sqlalchemy.orm import Session
from .models import FileProcessor
import pandas as pd
import io

router = APIRouter()

    
@router.post("/upload/", response_model=FileProcessor)
async def upload_file(
    tax_id: str = Query(...),  # Asegúrate de que se recibe como parámetro obligatorio
    file: UploadFile = File(...),    
    db: Session = Depends(get_db)  # Inyección de dependencia para la sesión
):
    # Validar extensión
    if not file.filename.endswith(('.xls', '.xlsx', '.csv')):
        raise HTTPException(status_code=400, detail="Formato de archivo no soportado")
    
    # Leer el contenido del archivo
    contents = await file.read()
    
    # Procesar el archivo
    try:
        return await process_excel_file(contents, file.filename, db, tax_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))