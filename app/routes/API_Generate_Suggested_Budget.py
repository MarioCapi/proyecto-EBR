from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from decimal import Decimal
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento_read, ejecutar_procedimiento

import pandas as pd
import matplotlib.pyplot as plt


class Reporte(BaseModel):
    NIT_Empresa: str


generate_suggested_budget_router = APIRouter()
@generate_suggested_budget_router.post("/generate_suggested_budget")
async def get_generate_suggested_budget(
    request: Reporte,
    db: Session = Depends(get_db)
):
    try:
        parametros = {"NIT_Empresa": request.NIT_Empresa}
        
        # Traer Prediccion de los Ingresos por Producto
        resultados = ejecutar_procedimiento_read(
            db, 
            "Admin.sp_get_Predicciones_empresa_producto",
            parametros
        )        
        formatted_results = [
            {                
                'ID_Prediccion': row['ID_Prediccion'],
                'NIT_Empresa':row['NIT_Empresa'],
                'Codigo_Producto':row['Codigo_Producto'],
                'Nombre_Producto':row['Nombre_Producto'],
                'Año':row['Año'],
                'Mes':row['Mes'],
                'Presupuesto_Predicho': float(row['Presupuesto_Predicho']) if isinstance(row['Presupuesto_Predicho'],Decimal) else row['Presupuesto_Predicho'],
                'Fecha_Creacion':row['Fecha_Creacion'],
                'Usuario_Creador':row['Usuario_Creador'],
                'Fecha_Actualizacion':row['Fecha_Actualizacion'],
                'Usuario_Actualizador':row['Usuario_Actualizador']
            }
            for row in resultados
        ]
        if not resultados:
            return {
                "data": [],
                "message": f"No se encontraron datos"
            }
        
        
        
        # Traer el costo 
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
        
        
        #Traer el gasto
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
                'Gasto': float(row['Gasto'])
            }
            for row in resultados
        ]
        if not resultados:
            return {
                "data": [],
                "message": f"No se encontraron datos"
            }
            
            
        
        return {
            "dataIngresos": formatted_results,
            "dataCosto": formatted_results_costo,
            "dataGasto": formatted_results_gasto,
            "message": f" obtenidas exitosamente"
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

