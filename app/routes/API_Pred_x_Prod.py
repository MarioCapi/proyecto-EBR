from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from decimal import Decimal
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento_read


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


@Tot_pred_prod_monthly_router.post("/get_for_Product_Prediction_monthly")
async def getTot_prod_mes(
    request: ReporteForecastProd,
    db: Session = Depends(get_db)
):
    try:
        parametros = {"nit": request.nit}
        producto = request.codigoCuenta
        resultados = ejecutar_procedimiento_read(
            db, 
            "Admin.sp_for_Product_Prediction_monthly",
            parametros
        )
 
        # Cargar los datos
        data = resultados
        
        productos_unicos = set(item['CodigoCuenta'] for item in data)  # Usar un conjunto para obtener valores únicos

        
        predicciones = {}

        # Iterar sobre cada producto
        
            # Filtrar datos para el producto específico
        df_producto = [item for item in data if item["CodigoCuenta"] == producto]

        # Convertir a DataFrame de pandas
        df_producto = pd.DataFrame(df_producto)

        # Verificar si hay datos para el producto
        if df_producto.empty:
            #print(f"No hay datos para el producto {producto}.")
            return {"predicciones": []}  # Retornar una lista vacía si no hay datos

        # Preparar los datos para AutoTS
        df_producto["Fecha"] = pd.to_datetime(df_producto["Anio"].astype(str) + "-" + df_producto["Mes"].astype(str) + "-01")
        df_producto = df_producto.sort_values("Fecha")
        df_producto = df_producto[["Fecha", "TotalIngreso"]].rename(columns={"Fecha": "datetime", "TotalIngreso": "value"})

        # Verificar si hay valores NaN
        if df_producto.isnull().values.any():
            #print(f"Valores NaN encontrados en los datos de {producto}.")
            df_producto = df_producto.dropna()  # O puedes rellenar con un valor, por ejemplo, df_producto.fillna(0)

        # Asegurarse de que hay suficientes datos
        if len(df_producto) < 2:  # Necesitamos al menos 2 puntos para hacer una predicción
            return {"predicciones": []}  # Retornar una lista vacía si no hay suficientes datos

        # Configurar el modelo AutoTS
        model = AutoTS(
            forecast_length=12,
            frequency='M',
            ensemble='simple',
            model_list="fast",
            max_generations=5,
            num_validations=2
        )

        # Entrenamiento
        model = model.fit(df_producto, date_col="datetime", value_col="value")

        # Predicción
        prediction = model.predict()
        forecast = prediction.forecast

        # Almacenar las predicciones en el diccionario
        predicciones = forecast.reset_index().to_dict(orient='records')  # Convertir a lista de diccionarios
                
        return {"predicciones": predicciones}
        #### Visualizar predicciones
        #print("Predicciones futuras:")
        #print(forecast)

        '''
        plt.figure(figsize=(10, 6))
        plt.plot(df_producto["datetime"], df_producto["value"], label="Datos reales", color="blue")
        plt.plot(forecast.index, forecast["value"], label="Predicciones futuras", color="green")
        plt.legend()
        plt.title(f"Predicción AutoTS para {producto}")
        plt.show()
        '''
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error en generar consulta de mes producto: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error al generar consulta mes producto: {str(e)}"
        )
