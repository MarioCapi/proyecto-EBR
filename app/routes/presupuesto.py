from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento

presupuesto_router = APIRouter()
@presupuesto_router.get("/GenerarReporteIngresos/{anio}")
async def generar_reporte_ingresos(
    anio: int,  # Parámetro de ruta
    db: Session = Depends(get_db)
):
    try:
        # Validar el año
        if not 2000 <= anio <= 2100:  # Rango razonable de años
            raise HTTPException(
                status_code=400, 
                detail=f"Año inválido: {anio}. Debe estar entre 2000 y 2100"
            )

        # Parámetros del procedimiento almacenado
        parametros = {
            "AnioBase": anio
        }

        # Log para debugging
        print(f"Consultando datos para el año: {anio}")
        
        # Invocar al procedimiento almacenado
        resultados = ejecutar_procedimiento(
            db, 
            "sp_ObtenerTotalesDebitoCreditoPorMesAnio", 
            parametros
        )

        # Validar resultados
        if not resultados:
            return {
                "data": [],
                "message": f"No se encontraron datos para el año {anio}"
            }

        return {
            "data": resultados,
            "message": f"Datos obtenidos exitosamente para el año {anio}"
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error en generar_reporte_ingresos: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error al generar el reporte: {str(e)}"
        )