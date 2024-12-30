from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from utils.file_processor import process_excel_file
from pydantic import BaseModel
from utils.config.connection import get_db  # Función que provee la sesión
from sqlalchemy.orm import Session
from .models import FileProcessor
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento

Logsrouter = APIRouter()

class GuardaLogsRouter(BaseModel): # Captura de datos para el log
    user_id: int
    action_type: str
    action_details: str
    ip_address: str
    user_agent: str
    error : int  # 1: error     0: es trazabilidad
    error_details : str
        

@Logsrouter.post("/registerlog/", response_model=FileProcessor)
async def registrar_log_error(
    request: GuardaLogsRouter,
    db: Session = Depends(get_db)  # Inyección de dependencia para la sesión
):
    try:                
        parametros = {
            "user_id": request.user_id,
            "action_type": request.action_type,
            "action_details": request.action_details,
            "ip_address": request.ip_address,
            "user_agent": request.user_agent,
            "error" : request.error,
            "error_details" : request.error_details
        }
        resultados = ejecutar_procedimiento(
            db, 
            "Admin.SaveLog", 
            parametros
        )
        if not resultados:
            return {
                "data": [],
                "message": f"No se encontraron datos para el año {request.anio}"
            }
        return {
            "data": resultados,
            "message": f"Datos guardados exitosamente"
        }

    except HTTPException as he:
        raise he
    except Exception as e:        
        raise HTTPException(
            status_code=500, 
            detail=f"Error en registrar_log_error: {str(e)}"
        )