from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from decimal import Decimal
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento_read

import pandas as pd
import matplotlib.pyplot as plt

class Reporte(BaseModel):
    NIT: str


Get_Gastos_Costos_router = APIRouter()
@Get_Gastos_Costos_router.post("/get_Gastos_Costos")
async def get_all_predictions_Emp_Products(
    request: Reporte,
    db: Session = Depends(get_db)
):
    try:
        parametros = {"NIT_Empresa": request.nit}
        resultados = ejecutar_procedimiento_read(
            db, 
            "Admin.sp_for_Costo",
            parametros
        )        
        formatted_results_costo = [
            {                
                'CodigoCuenta': row['CodigoCuenta'],
                'NombreCuenta':row['NombreCuenta'],
                'Anio':row['Anio'],
                'Mes':row['Mes'],
                'TotalDebito': float(row['TotalDebito']),
                'TotalCredito': float(row['TotalCredito']),
                'Costo': float(row['Costo'])
            }
            for row in resultados
        ]
        if not resultados:
            return {
                "data": [],
                "message": f"No se encontraron datos"
            }
        
        
        resultados = ejecutar_procedimiento_read(
            db, 
            "Admin.sp_for_Gasto",
            parametros
        )        
        formatted_results_gasto = [
            {                
                'CodigoCuenta': row['CodigoCuenta'],
                'NombreCuenta':row['NombreCuenta'],
                'Anio':row['Anio'],
                'Mes':row['Mes'],
                'TotalDebito': float(row['TotalDebito']),
                'TotalCredito': float(row['TotalCredito']),
                'Costo': float(row['Gasto'])
            }
            for row in resultados
        ]
        if not resultados:
            return {
                "data": [],
                "message": f"No se encontraron datos"
            }
            
            
        
        return {
            "dataCosto": formatted_results_costo,
            "dataGasto": formatted_results_gasto,
            "message": f" obtenidas exitosamente"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error en consultar costos: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error al consultar costos: {str(e)}"
        )

