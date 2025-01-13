from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento_read, ejecutar_procedimiento

class Reporte(BaseModel):
    NIT_Empresa: str
    anio: int

consulta_si_presu_suger_anual_router = APIRouter()
@consulta_si_presu_suger_anual_router.post("/Consulta_si_Presu_Sugerido_Anual")
async def get_Consulta_si_Presu_Sugerido_Anual(
    request: Reporte,
    db: Session = Depends(get_db)
):
    try:
        parametros = {"NIT_Empresa": request.NIT_Empresa,
                        "Anio" :request.anio
                    }
        resultados = ejecutar_procedimiento_read(
            db, 
            "Admin.sp_Consulta_si_presupuesto_Sugerido_Anual",
            parametros
        )    
        if isinstance(resultados, list) and len(resultados) == 1 and 'Mensaje' in resultados[0]:
            mensaje = resultados[0]['Mensaje']
            if "No se encontraron datos" in mensaje:
                return {
                    "data": [],
                    "message": mensaje
                }
        
        # Validar si resultados es None o vacío
        if not resultados:
            return {
                "data": [],
                "message": "No se encontraron datos"
            }

        # Formatear los resultados si existen datos
        formatted_results = [
            {
                'NIT_Empresa': row.get('NIT', None)  # Usar .get para evitar errores si la clave no existe
            }
            for row in resultados
        ]        
        return {
            "data": formatted_results,
            "message": "Operación completada con éxito"
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        import inspect
        parametros = {
            "user_id": request.NIT_Empresa,
            "action_type": inspect.currentframe().f_code.co_name,
            "action_details": "intenta obtener el presupuesto sugerido",
            "error" : 1,
            "error_details" : str(e)
        }
        ejecutar_procedimiento(
            db, 
            "Admin.SaveLogBakend", 
            parametros
        )
        raise HTTPException(
            status_code=500, 
            detail=f"Error al consultar costos: {str(e)}"
        )