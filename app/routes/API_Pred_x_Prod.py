import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from decimal import Decimal
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento_read, ejecutar_procedimiento_JSONParams


from autots import AutoTS
import pandas as pd
import matplotlib.pyplot as plt


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
        print(f"Error en generar consulta de mes producto: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error al generar consulta mes producto: {str(e)}"
        )


#@Tot_pred_prod_monthly_router.post("/get_for_Product_Prediction_monthly")
#async def getTot_prod_mes(request: ReporteForecastProd,db: Session = Depends(get_db)):
def getTot_prod_mes(nit, db: Session):
    try:
        # quemamos un usuario
        usuario = 'genericoAPI'
        parametros = {"NIT": nit}
        resultados = ejecutar_procedimiento_read(
            db, 
            "Admin.sp_for_Product_Prediction_monthly",
            parametros
        )   
        # Cargar los datos
        data = resultados
        productos_unicos = set(item['CodigoCuenta'] for item in data)  # Usar un conjunto para obtener valores únicos
        predicciones_totales = []  # Lista para almacenar las predicciones de todos los productos
        exitosas = 0  # Contador de iteraciones exitosas
        errores = []  # Lista para almacenar errores
        
        for producto in productos_unicos:
            df_producto = [item for item in data if item["CodigoCuenta"] == producto]
            df_producto = pd.DataFrame(df_producto)
            
            if df_producto.empty:
                continue  # Saltar este producto si no hay datos
            
            # Asegurar que las columnas sean del tipo correcto
            df_producto['Fecha'] = pd.to_datetime(df_producto['Anio'].astype(str) + "-" + df_producto['Mes'].astype(str) + "-01", errors='coerce')
            df_producto['TotalIngreso'] = pd.to_numeric(df_producto['TotalIngreso'], errors='coerce')  # Asegurar que la columna de valores sea numérica
            df_producto = df_producto.dropna() # Eliminar filas con NaN
            # Verificar si hay suficientes datos
            if len(df_producto) < 2:  # Necesitamos al menos 2 puntos para hacer una predicción
                continue
            
            #Ajustar forecast_length basado en la cantidad de datos
            if len(df_producto) < 5:
                forecast_length = 1  # Si hay menos de 5 datos, predecir solo 1 mes
            elif len(df_producto) < 10:
                forecast_length = 3  # Si hay entre 5 y 10 datos, predecir 3 meses
            else:
                forecast_length = 12  # Si hay 10 o más datos, predecir 12 meses
            # Configurar el modelo AutoTS
            model = AutoTS(
                forecast_length=forecast_length,
                frequency='M',
                ensemble='simple',
                model_list="fast",
                max_generations=5,
                num_validations=2
            )
            # Entrenamiento
            model = model.fit(df_producto, date_col="Fecha", value_col="TotalIngreso")  # Asegúrate de que "TotalIngreso" sea la columna correcta                        
            prediction = model.predict()
            forecast = prediction.forecast
            
            # Almacenar las predicciones en la lista total
            predicciones_producto = forecast.reset_index().to_dict(orient='records')  # Convertir a lista de diccionarios
            predicciones_totales.append({"CodigoCuenta": producto, "predicciones": predicciones_producto})
            
            # Insertar predicciones en la base de datos
            try:
                insertar_predicciones(nit, producto, predicciones_producto, usuario, db)
                exitosas += 1  # Incrementar contador de exitosas
            except Exception as e:
                errores.append(f"Error al insertar predicciones para {producto}: {str(e)}")
        
        return {
            "mensaje": f"Insertadas exitosamente {exitosas} predicciones.",
            "errores": errores
        }
    
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error en generar consulta de mes producto: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error al generar consulta mes producto: {str(e)}"
        )


def insertar_predicciones(nit_empresa, codigo_producto, predicciones, usuario, db: Session):
# Método para invocar el procedimiento almacenado Admin.sp_InsertOrUpdatePredicciones_x_producto.
    try:
        predicciones_json = []
        for prediccion in predicciones:  # Accede a la clave 'predicciones'
            fecha = prediccion['index']  # Timestamp
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
        raise HTTPException(
            status_code=500, 
            detail=f"Error al generar insertar_predicciones: {str(e)}"
    )