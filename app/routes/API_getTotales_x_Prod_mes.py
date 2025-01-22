from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from decimal import Decimal
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento_read, ejecutar_procedimiento
from typing import List, Dict


class ReporteIngresosRequest(BaseModel):
    AnioBase: int
    Periodo: int
    nit: str
    
Tot_prod_mes_router = APIRouter()
@Tot_prod_mes_router.post("/getTot_x_prod_mes")
async def getTot_prod_mes(
    request: ReporteIngresosRequest,
    db: Session = Depends(get_db)
):
    try:
        parametros = {
            "AnioBase": request.AnioBase,
            "Periodo": request.Periodo,
            "nit": request.nit
        }
        resultados = ejecutar_procedimiento_read(
            db, 
            "Admin.sp_ObtenerTotalesPorProductoMes",
            parametros
        )
        
        formatted_results = [
            {
                'CodigoCuenta': row['CodigoCuenta'],
                'NombreCuenta': row['NombreCuenta'],
                'Anio': row['Anio'],
                'Mes': row['Mes'],
                'TotalDebito': float(row['TotalDebito']) if isinstance(row['TotalDebito'], Decimal) else row['TotalDebito'],
                'TotalCredito': float(row['TotalCredito']) if isinstance(row['TotalCredito'], Decimal) else row['TotalCredito'],
                'TotalIngreso': float(row['TotalIngreso']) if isinstance(row['TotalIngreso'], Decimal) else row['TotalIngreso']
            }
            for row in resultados
        ]
        # Validar resultados
        if not resultados:
            return {
                "data": [],
                "message": f"No se encontraron datos"
            }
        
        return {
            "data": formatted_results,
            "message": f"Datos obtenidos exitosamente"
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        
        import inspect
        parametros = {
            "user_id": request.nit,
            "action_type": inspect.currentframe().f_code.co_name,
            "action_details": "intenta obtener total producto mes",
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
            detail=f"Error al generar consulta mes producto: {str(e)}"
        )
