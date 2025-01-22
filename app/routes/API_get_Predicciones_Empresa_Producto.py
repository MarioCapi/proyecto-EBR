import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from decimal import Decimal
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento_read, ejecutar_procedimiento


from autots import AutoTS
import pandas as pd
import matplotlib.pyplot as plt

class ReporteForecastProd(BaseModel):
    nit: str


Get_pred_empresa_producto_router = APIRouter()
@Get_pred_empresa_producto_router.post("/Get_pred_empresa_producto")
async def get_all_predictions_Emp_Products(
    request: ReporteForecastProd,
    db: Session = Depends(get_db)
):
    try:
        parametros = {"NIT_Empresa": request.nit}
        #parametros = {"nit": request.nit,"Codigo_Producto": request.codigoProducto,"Año": request.año}
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
        
        return {
            "data": formatted_results,
            "message": f"Predicciones obtenidas exitosamente"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        
        import inspect
        parametros = {
            "user_id": request.nit,
            "action_type": inspect.currentframe().f_code.co_name,
            "action_details": "intenta obtener todas las predicciones",
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
            detail=f"Error al consultar predicciones: {str(e)}"
        )

