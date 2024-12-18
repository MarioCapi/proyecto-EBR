from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from decimal import Decimal
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento

from typing import List, Dict


class GuardaPredicPresu_x_Emp(BaseModel):    
    Nit_Empresa: str
    Anio_Prediccion: int
    Mes: str
    Valor_Predicho: float
    Tendencia: str
    Coeficiente_Diferencia: float
    
PredicPres_x_empresa_router = APIRouter()
@PredicPres_x_empresa_router.post("/GuardaPrediccionPresupuesto_x_empresa")
async def GuardaPrediPresupuesto(
    request: GuardaPredicPresu_x_Emp,
    db: Session = Depends(get_db)
):
    try:                
        parametros = {
            "Nit_Empresa": request.Nit_Empresa,
            "Anio_Prediccion": request.Anio_Prediccion,
            "Mes": request.Mes,
            "Valor_Predicho": request.Valor_Predicho,
            "Tendencia": request.Tendencia,
            "Coeficiente_Diferencia": request.Coeficiente_Diferencia
        }
        
        # Ejecutar el procedimiento almacenado
        resultados = ejecutar_procedimiento(
            db, 
            "Admin.GuardarPrediccionPresupuesto", 
            parametros
        )
        # Validar resultados
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
        print(f"Error en GuardaPrediccionPresupuesto_x_empresa: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error al generar el GuardaPrediccionPresupuesto_x_empresa: {str(e)}"
        )