import pandas as pd
import numpy as np
from fastapi import HTTPException
from sklearn.linear_model import LinearRegression
from typing import List, Dict

def generateBudgetExpectation(dataFull: List[Dict]) -> Dict:
    """
    Genera predicciones de presupuesto para el próximo año basado en datos históricos.
    Args: dataFull (List[Dict]): Lista de diccionarios con datos históricos
    Returns: Dict: Predicciones por mes y métricas adicionales
    """
    try:
        # Convertir la lista de diccionarios a DataFrame
        df = pd.DataFrame(dataFull)
        
        # Verificar si hay datos suficientes
        if df.empty:
            raise ValueError("No hay datos para generar predicciones")

        # Obtener los meses únicos
        meses_unicos = df["NombreMes"].unique()
        
        # Año objetivo para la predicción
        anio_prediccion = df["Anio"].max() + 1
        
        # Diccionario para almacenar resultados
        predicciones = {
            "anio_prediccion": int(anio_prediccion),
            "predicciones_mensuales": {},
            "metricas": {}
        }

        # Generar predicciones para cada mes
        for mes in meses_unicos:
            datos_mes = df[df["NombreMes"] == mes].copy()
            
            # Verificar si hay suficientes datos para el mes
            if len(datos_mes) < 2:
                print(f"Advertencia: Datos insuficientes para {mes}")
                continue
                
            # Preparar datos para el modelo
            X = datos_mes["Anio"].values.reshape(-1, 1)
            
            # Generar predicciones para cada métrica
            #for metrica in ["TotalDebito", "TotalCredito", "Diferencia"]:
            for metrica in ["Diferencia"]:
                y = datos_mes[metrica].values
                
                # Crear y entrenar el modelo
                modelo = LinearRegression()
                modelo.fit(X, y)
                
                # Calcular R² para evaluar la calidad del modelo
                r2 = modelo.score(X, y)
                
                # Realizar predicción
                prediccion = modelo.predict([[anio_prediccion]])[0]
                
                # Calcular tendencia
                tendencia = "incremento" if modelo.coef_[0] > 0 else "decremento"
                
                # Almacenar resultados
                if mes not in predicciones["predicciones_mensuales"]:
                    predicciones["predicciones_mensuales"][mes] = {}
                
                #predicciones["predicciones_mensuales"][mes][metrica] = {
                #    "valor_predicho": round(float(prediccion), 2),
#                    "r2": round(float(r2), 4),
#                    "tendencia": tendencia,
#                    "coeficiente": round(float(modelo.coef_[0]), 2)
#                }
                predicciones["predicciones_mensuales"][mes][metrica] = {
                    "valor_predicho": round(float(prediccion), 2),
                    "tendencia": tendencia,
                    "coeficiente": round(float(modelo.coef_[0]), 2)
                }

        # Calcular métricas globales
        predicciones["metricas"] = {
            "total_meses_analizados": len(meses_unicos),
            "rango_años": f"{df['Anio'].min()} - {df['Anio'].max()}",
            "fecha_generacion": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        return predicciones

    except Exception as e:
        error_msg = f"Error al generar predicciones: {str(e)}"
        print(error_msg)
        raise HTTPException(
            status_code=500,
            detail=error_msg
        )