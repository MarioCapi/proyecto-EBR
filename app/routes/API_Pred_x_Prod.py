from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from decimal import Decimal
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento_read
from typing import List, Dict

from autots import AutoTS
import pandas as pd
import matplotlib.pyplot as plt


class ReportePredProdRequest(BaseModel):
    producto_recived: str #codigo del producto
    nit: str
    
Pred_x_prod_router = APIRouter()
@Pred_x_prod_router.post("/getPred_x_prod")
async def getPredictions_x_prod(
request: ReportePredProdRequest,
    db: Session = Depends(get_db)
):
    try:
        # Cargar los datos
        data = pd.read_csv("ruta_del_archivo.csv")

        # Filtrar datos para un producto específico
        producto = ReportePredProdRequest.producto_recived  #"MONTURAS"
        df_producto = data[data["Producto"] == producto]

        # Preparar los datos para AutoTS
        df_producto["Fecha"] = pd.to_datetime(df_producto["Año"].astype(str) + "-" + df_producto["Mes"].astype(str) + "-01")
        df_producto = df_producto.sort_values("Fecha")
        df_producto = df_producto[["Fecha", "TotalIngresos"]].rename(columns={"Fecha": "datetime", "TotalIngresos": "value"})

        # Configurar el modelo AutoTS
        model = AutoTS(
            forecast_length=12,
            frequency='M',
            ensemble='simple',  # También puedes probar "horizontal" o "vertical"
            model_list="fast",  # Usa "all" para probar todos los modelos disponibles
            max_generations=5,  # Aumenta para exploración más exhaustiva
            num_validations=2
        )

        # Entrenamiento
        model = model.fit(df_producto, date_col="datetime", value_col="value")

        # Predicción
        prediction = model.predict()
        forecast = prediction.forecast

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
