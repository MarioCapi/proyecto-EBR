from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from decimal import Decimal
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento_ingresos, ejecutar_procedimiento
from utils.CalculatePrediction import generateBudgetExpectation
from routes.API_Pred_x_Prod import getTot_prod_mes
from typing import List, Dict


class ReporteIngresosRequest(BaseModel):
    anio: int
    nit: str
    
presupuesto_router = APIRouter()
@presupuesto_router.post("/GenerarReporteIngresos")
async def generar_reporte_ingresos(
    request: ReporteIngresosRequest,  # Parámetros enviados en el cuerpo
    db: Session = Depends(get_db)
):
    try:
        # Validar el año
        if not 2000 <= request.anio <= 2100:  # Rango razonable de años
            raise HTTPException(
                status_code=400, 
                detail=f"Año inválido: {request.anio}. Debe estar entre 2000 y 2100"
            )
        # Parámetros del procedimiento almacenado
        parametros = {
            "AnioBase": request.anio,
            "NIT": request.nit
        }
        resultados = ejecutar_procedimiento_ingresos(
            db, 
            "Admin.sp_ObtenerTotalesDebitoCreditoPorMesAnio", 
            parametros
        )
        
        formatted_results = [
            {
                'Anio': row[0],
                'Mes': row[1],
                'NombreMes': row[2],
                'TotalDebito': float(row[3]) if isinstance(row[3], Decimal) else row[3],
                'TotalCredito': float(row[4]) if isinstance(row[4], Decimal) else row[4],
                'Diferencia': float(row[5]) if isinstance(row[5], Decimal) else row[5]
            }
            for row in resultados
        ]
        
        # Validar resultados
        if not resultados:
            return {
                "data": [],
                "message": f"No se encontraron datos para el año {request.anio}"
            }

        predicciones = generateBudgetExpectationFull(request.anio, resultados)
        
        try:
            resultado_predicciones = getTot_prod_mes(request.nit, db) # generacion y almacenamiento de las predicciones por producto
            #if resultado_predicciones["errores"]:
            #    print(":")
        except Exception as e:
            import inspect
            parametros = {
                "user_id": request.nit,
                "action_type": inspect.currentframe().f_code.co_name,
                "action_details": "error en: metodo: resultado_predicciones-getTot_prod_mes() ",
                "error" : 1,
                "error_details" : str(e)
            }
            ejecutar_procedimiento(
                db, 
                "Admin.SaveLogBakend", 
                parametros
            )
        
        return {
            "data": formatted_results,
            "predictions": predicciones,
            "message": f"Datos obtenidos exitosamente para el año {request.anio}"
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        import inspect
        parametros = {
            "user_id": request.nit,
            "action_type": inspect.currentframe().f_code.co_name,
            "action_details": "generar_reporte_ingresos",
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
            detail=f"Error al generar el reporte: {str(e)}",
            resultado_predicciones_x_prod=f"resultado_predicciones"
        )

def generateBudgetExpectationFull(
    anio: int,  # Parámetro de año
    data: List[Dict]) -> Dict:  # Parámetro de datos
    try:
        resultados = generateBudgetExpectation(data)
        return {
            "data": resultados,
            "message": f"Datos generados exitosamente para el año {anio}"
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al generar el reporte presupuesto: {str(e)}"
        )