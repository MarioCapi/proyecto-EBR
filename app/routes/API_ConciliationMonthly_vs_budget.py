from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento_read, ejecutar_procedimiento


class Report_Conciliation(BaseModel):
    NIT_Empresa: str
    Anio: int
    Mes: int
    
ConciliationMonthly_budget_router = APIRouter()
@ConciliationMonthly_budget_router.post("/ConciliationMonthly_vs_budget")
async def get_ConciliationMonthly_vs_budget(
    request: Report_Conciliation,
    db: Session = Depends(get_db)
):
    try:
        parametros = {"NIT": request.NIT_Empresa,
                        "Anio" :request.Anio,
                        "Mes" :request.Mes
                    }
        resultados = ejecutar_procedimiento_read(
            db, 
            "Admin.sp_Presupuesto_IngresoSugerido_vs_IngresosMes",
            parametros
        )
        # Validar si resultados es None o vacío
        if not resultados:
            return {
                "data": [],
                "message": "No se encontraron datos"
            }
        # Formatear los resultados si existen datos
        formatted_results = [
            {
                'CodigoCuenta': row['CodigoCuenta'],
                'NombreCuenta': row['NombreCuenta'],
                'ValorPresupuesto': row['ValorPresupuesto'],
                'TotalIngreso': row['TotalIngreso'],
                'Diferencia': row['Diferencia'],
                'PorcentajeDiferencia': row['PorcentajeDiferencia'],
                'Resultado': row['Resultado'],
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
            "action_details": "intenta obtener la conciliacion para el mes ",
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