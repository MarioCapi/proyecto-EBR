import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from decimal import Decimal
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento_read, ejecutar_procedimiento_JSONParams, ejecutar_procedimiento

import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.preprocessing import LabelEncoder
from datetime import datetime, timedelta

class ReportePredProdRequest(BaseModel):
    nit: str

class ReporteForecastProd(BaseModel):
    nit: str
    codigoCuenta: str



Tot_pred_prod_monthly_router = APIRouter()
@Tot_pred_prod_monthly_router.post("/get_all_list_Products")
async def get_all_list_Products(
    request: ReportePredProdRequest,
    db: Session = Depends(get_db)
):
    try:
        parametros = {"nit": request.nit}
        resultados = ejecutar_procedimiento_read(
            db, 
            "Admin.sp_for_Product_Prediction_monthly",
            parametros
        )
        #productos_unicos = set(item['CodigoCuenta'] for item in resultados)  # Usar un conjunto para obtener valores únicos        
        
        # Crear un diccionario para almacenar CodigoCuenta y NombreCuenta únicos
        productos_unicos = {}
        
        for item in resultados:
            codigo = item['CodigoCuenta']
            nombre = item['NombreCuenta']            
            if codigo not in productos_unicos:
                productos_unicos[codigo] = nombre

        # Convertir el diccionario a una lista de tuplas (opcional)
        lista_productos_unicos = list(productos_unicos.items())

        return {"lista": lista_productos_unicos}
    except HTTPException as he:
        raise he
    except Exception as e:
        import inspect
        parametros = {
            "user_id": request.nit,
            "action_type": inspect.currentframe().f_code.co_name,
            "action_details": "intenta obtener toda la lista de los productos",
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
            detail=f"Error al obtener consulta mes producto: {str(e)}"
        )


#@Tot_pred_prod_monthly_router.post("/get_for_Product_Prediction_monthly")
#async def getTot_prod_mes(request: ReporteForecastProd,db: Session = Depends(get_db)):

def getTot_prod_mes(nit, db: Session):
    try:
        usuario = 'genericoAPI'
        parametros = {"NIT": nit}
        resultados = ejecutar_procedimiento_read(
            db, 
            "Admin.sp_for_Product_Prediction_monthly",
            parametros
        )
        
        data = resultados
        productos_unicos = set(item['CodigoCuenta'] for item in data)
        predicciones_totales = []
        exitosas = 0
        errores = []
        
        for producto in productos_unicos:
            try:
                df_producto = pd.DataFrame([item for item in data if item["CodigoCuenta"] == producto])
                
                if df_producto.empty or len(df_producto) < 2:
                    continue
                    
                productos_Nameunicos = df_producto['NombreCuenta'].unique()
                
                # Preparar datos
                df_producto['Fecha'] = pd.to_datetime(df_producto['Anio'].astype(str) + "-" + df_producto['Mes'].astype(str) + "-01")
                df_producto['TotalIngreso'] = pd.to_numeric(df_producto['TotalIngreso'], errors='coerce')
                df_producto = df_producto.dropna()
                
                # Crear características temporales
                df_producto['mes'] = df_producto['Fecha'].dt.month
                df_producto['anio'] = df_producto['Fecha'].dt.year
                df_producto['tendencia'] = range(len(df_producto))
                
                # Definir número de meses a predecir
                forecast_length = 12 if len(df_producto) >= 10 else (3 if len(df_producto) >= 5 else 1)
                
                # Preparar datos para XGBoost
                X = df_producto[['mes', 'anio', 'tendencia']].values
                y = df_producto['TotalIngreso'].values
                
                # Entrenar modelo
                model = XGBRegressor(
                    n_estimators=100,
                    learning_rate=0.05,
                    max_depth=4,
                    random_state=31
                )
                model.fit(X, y)
                
                # Generar fechas futuras
                ultima_fecha = df_producto['Fecha'].max()
                fechas_futuras = pd.date_range(start=ultima_fecha + timedelta(days=32), periods=forecast_length, freq='M')
                
                # Preparar datos para predicción
                X_future = pd.DataFrame({
                    'mes': fechas_futuras.month,
                    'anio': fechas_futuras.year,
                    'tendencia': range(len(df_producto), len(df_producto) + forecast_length)
                }).values
                
                # Realizar predicción
                predicciones = model.predict(X_future)
                
                # Formatear predicciones
                predicciones_producto = []
                for i, fecha in enumerate(fechas_futuras):
                    predicciones_producto.append({
                        'Fecha': fecha.strftime('%Y-%m-%d'),
                        'TotalIngreso': float(max(0, predicciones[i]))  # Evitar predicciones negativas
                    })
                
                predicciones_totales.append({
                    "CodigoCuenta": producto,
                    "predicciones": predicciones_producto
                })
                
                # Insertar predicciones
                insertar_predicciones(nit, producto, productos_Nameunicos[0], predicciones_producto, usuario, db)
                exitosas += 1
                
            except Exception as e:
                errores.append(f"Error en producto {producto}: {str(e)}")
                continue
        
        return {
            "mensaje": f"Insertadas exitosamente {exitosas} predicciones.",
            "errores": errores
        }
    
    except Exception as e:
        import inspect
        parametros = {
            "user_id": nit,
            "action_type": inspect.currentframe().f_code.co_name,
            "action_details": "intenta obtener total x producto x mensual",
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

def insertar_predicciones(nit_empresa, codigo_producto, NombreCuenta, predicciones, usuario, db: Session):
# Método para invocar el procedimiento almacenado Admin.sp_InsertOrUpdatePredicciones_x_producto.
    try:
        predicciones_json = []
        for prediccion in predicciones:
            # Convertir la fecha de cadena a un objeto datetime
            fecha = datetime.strptime(prediccion['Fecha'], '%Y-%m-%d')
            valor = prediccion['TotalIngreso']  # Predicción
            predicciones_json.append({
                "anio": fecha.year,
                "mes": f"{fecha.month:02}",  # Mes en formato de dos dígitos
                "prediccion": valor
            })
    # Convertimos a JSON string
        json_data = json.dumps(predicciones_json)
        # Ajustar el nombre del parámetro
        parametros = {
            "NIT_Empresa": nit_empresa,
            "Codigo_Producto": codigo_producto,
            "Nombre_Producto": NombreCuenta,
            "JsonData": json_data,
            "Usuario": usuario  # Cambiado de "@Usuario" a "Usuario"
        }
    # Llamar al procedimiento almacenado
        resultados = ejecutar_procedimiento_JSONParams(    
            db,
            "Admin.sp_InsertOrUpdatePredicciones_x_producto",
            parametros
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        import inspect
        parametros = {
            "user_id": nit_empresa,
            "action_type": inspect.currentframe().f_code.co_name,
            "action_details": "intenta insertar todas las predicciones",
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
            detail=f"Error al generar insertar_predicciones: {str(e)}"
    )