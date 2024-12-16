from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from utils.config import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento

presupuesto_router = APIRouter()
@presupuesto_router.get("/GenerarReporteIngresos/")
async def generar_reporte_ingresos(db: Session = Depends(get_db)):
    try:
        # Parámetros del procedimiento almacenado
        parametros = {
            "Mes": None,  # Puedes ajustar para filtrar por un mes específico si es necesario
            "AnioBase": 2024
        }
        # Invocar al procedimiento almacenado
        resultados = ejecutar_procedimiento(db, "sp_ObtenerTotalesDebitoCreditoPorMesAnio", parametros)
        return {"data": resultados}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al generar el reporte: {str(e)}")
