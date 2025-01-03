import pandas as pd
import numpy as np
from fastapi import HTTPException
from sklearn.linear_model import LinearRegression
from typing import List, Dict
from xgboost import XGBRegressor
import xgboost as xgb
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import TimeSeriesSplit
from datetime import datetime

def generateBudgetExpectation(dataFull: List[tuple]) -> Dict:    
    """
    Genera predicciones de presupuesto usando XGBoost y características avanzadas.
    Incluye manejo de datos faltantes y validaciones adicionales.
    
    Args:
        dataFull (List[tuple]): Lista de tuplas con datos históricos
        
    Returns:
        Dict: Predicciones por mes y métricas adicionales
    """
    try:
        # Convertir los datos a DataFrame
        df = pd.DataFrame(dataFull, columns=['Anio', 'Mes', 'NombreMes', 'TotalDebito', 
                                        'TotalCredito', 'Diferencia'])
        
        if df.empty:
            raise ValueError("No hay datos suficientes para generar predicciones")

        # Asegurar tipos de datos correctos
        df['Anio'] = pd.to_numeric(df['Anio'])
        df['Mes'] = pd.to_numeric(df['Mes'])
        df['TotalDebito'] = pd.to_numeric(df['TotalDebito'])
        df['TotalCredito'] = pd.to_numeric(df['TotalCredito'])
        df['Diferencia'] = pd.to_numeric(df['Diferencia'])

        # Crear características más robustas
        df['Fecha'] = pd.to_datetime(df['Anio'].astype(str) + '-' + df['Mes'].astype(str) + '-01')
        df['Tendencia'] = np.arange(len(df))
        df['MesNumerico'] = df['Mes']
        
        # Características estacionales mejoradas
        df['Mes_sin'] = np.sin(2 * np.pi * df['MesNumerico']/12)
        df['Mes_cos'] = np.cos(2 * np.pi * df['MesNumerico']/12)
        
        # Características adicionales
        df['MA3'] = df['Diferencia'].rolling(window=3, min_periods=1).mean()
        df['MA6'] = df['Diferencia'].rolling(window=6, min_periods=1).mean()
        df['Std3'] = df['Diferencia'].rolling(window=3, min_periods=1).std()
        
        # Lag features
        df['Lag1'] = df['Diferencia'].shift(1)
        df['Lag3'] = df['Diferencia'].shift(3)
        df['Lag6'] = df['Diferencia'].shift(6)
        
        # Características de tendencia
        df['TendenciaMensual'] = (df['Diferencia'] - df['Lag1']).rolling(window=3, min_periods=1).mean()
        
        # Llenar valores NaN solo para columnas numéricas específicas
        numeric_columns = ['MA3', 'MA6', 'Std3', 'Lag1', 'Lag3', 'Lag6', 'TendenciaMensual']
        for col in numeric_columns:
            df[col] = df[col].fillna(df[col].mean() if not df[col].empty else 0)
        
        # Preparar características para el modelo
        feature_columns = [
            'MesNumerico', 'Tendencia', 'Mes_sin', 'Mes_cos',
            'MA3', 'MA6', 'Std3', 'Lag1', 'Lag3', 'Lag6', 'TendenciaMensual'
        ]
        
        # Asegurar que todas las características son numéricas
        X = df[feature_columns].astype(float)
        
        # Normalizar las características
        scaler = StandardScaler()
        X = scaler.fit_transform(X)
        y = df['Diferencia'].values
        
        # Configurar validación cruzada para series temporales
        tscv = TimeSeriesSplit(n_splits=3)
        
        # Crear y entrenar el modelo XGBoost con parámetros optimizados
        model = XGBRegressor(
            n_estimators=200,
            learning_rate=0.025,
            max_depth=4,
            min_child_weight=2,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=84
        )
        # Entrenar el modelo con validación cruzada
        confidences = []
        for train_idx, val_idx in tscv.split(X):
            X_train, X_val = X[train_idx], X[val_idx]
            y_train, y_val = y[train_idx], y[val_idx]
            # Entrenamiento simple sin eval_set
            model.fit(X_train, y_train)
            confidence = model.score(X_val, y_val)
            #confidences.append(confidence)
            confidences.append(float(confidence))

        # Entrenar el modelo final con todos los datos
        model.fit(X, y)
        
        # Calcular importancia de características
        #feature_importance = dict(zip(feature_columns, model.feature_importances_))
        feature_importance = dict(zip(feature_columns, [float(x) for x in model.feature_importances_]))
        
        # Preparar predicciones
        anio_prediccion = df['Anio'].max() + 1
        predicciones = {
            "anio_prediccion": int(anio_prediccion),
            "predicciones_mensuales": {},
            "metricas": {}
        }
        
        # Crear un mapeo de números de mes a nombres de mes
        mes_mapping = df[['Mes', 'NombreMes']].drop_duplicates().set_index('Mes')['NombreMes'].to_dict()
        
        # Variables para métricas globales
        total_prediccion = 0
        meses_con_datos_anteriores = 0
        suma_anio_anterior = 0
        
        # Últimos valores conocidos para features de lag
        ultimo_valor = float(df['Diferencia'].iloc[-1])
        ultima_ma3 = float(df['MA3'].iloc[-1])
        ultima_ma6 = float(df['MA6'].iloc[-1])
        ultimo_std3 = float(df['Std3'].iloc[-1])
        ultima_tendencia = float(df['TendenciaMensual'].iloc[-1])
        
        for mes in range(1, 13):
            nombre_mes = mes_mapping.get(mes, f"Month_{mes}")
            
            # Crear features para predicción
            mes_prediccion = pd.DataFrame({
                'MesNumerico': [float(mes)],
                'Tendencia': [float(len(df) + mes)],
                'Mes_sin': [float(np.sin(2 * np.pi * mes/12))],
                'Mes_cos': [float(np.cos(2 * np.pi * mes/12))],
                'MA3': [ultima_ma3],
                'MA6': [ultima_ma6],
                'Std3': [ultimo_std3],
                'Lag1': [ultimo_valor],
                'Lag3': [ultimo_valor],
                'Lag6': [ultimo_valor],
                'TendenciaMensual': [ultima_tendencia]
            })
            
            # Normalizar características
            X_pred = scaler.transform(mes_prediccion[feature_columns])
            
            # Realizar predicción
            #prediccion = model.predict(X_pred)[0]
            prediccion = float(model.predict(X_pred)[0])
            total_prediccion += prediccion
            
            # Actualizar valores para el siguiente mes
            ultimo_valor = prediccion
            ultima_ma3 = (ultima_ma3 * 2 + prediccion) / 3
            ultima_ma6 = (ultima_ma6 * 5 + prediccion) / 6
            
            # Obtener datos del año anterior
            datos_mes_anterior = df[(df['Mes'] == mes) & (df['Anio'] == df['Anio'].max())]
            
            if not datos_mes_anterior.empty:
                valor_anterior = float(datos_mes_anterior['Diferencia'].iloc[0])
                meses_con_datos_anteriores += 1
                suma_anio_anterior += valor_anterior
                
                coeficiente = prediccion - valor_anterior
                porcentaje_cambio = ((prediccion - valor_anterior) / valor_anterior) * 100
                tendencia = "incremento" if coeficiente > 0 else "decremento"
                
                # Calcular confianza específica para este mes
                confianza = np.mean(confidences) * (1 - abs(porcentaje_cambio)/100)
                confianza = max(min(confianza, 0.95), 0.3)  # Limitar entre 0.3 y 0.95
                
                prediccion_info = {
                    "valor_predicho": round(float(prediccion), 2),
                    "valor_anterior": round(float(valor_anterior), 2),
                    "tendencia": tendencia,
                    "coeficiente": round(float(coeficiente), 2),
                    "porcentaje_cambio": round(float(porcentaje_cambio), 2),
                    "confianza": round(float(confianza), 4)
                }
            else:
                confianza = np.mean(confidences) * 0.8  # Menor confianza para meses sin comparación
                prediccion_info = {
                    "valor_predicho": round(float(prediccion), 2),
                    "valor_anterior": None,
                    "tendencia": "no_comparable",
                    "coeficiente": None,
                    "porcentaje_cambio": None,
                    "confianza": round(float(confianza), 4)
                }
            
            predicciones["predicciones_mensuales"][nombre_mes] = {
                "Diferencia": prediccion_info
            }
        
        # Calcular métricas globales
        confianza_promedio = np.mean(confidences)
        
        predicciones["metricas"] = {
            "total_meses_analizados": int(len(df['NombreMes'].unique())),
            "rango_años": f"{int(df['Anio'].min())} - {int(df['Anio'].max())}",
            "fecha_generacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "TotalPrediccion": float(round(float(total_prediccion), 2)),
            "TotalAnioAnterior": round(float(suma_anio_anterior), 2) if meses_con_datos_anteriores > 0 else None,
            "PorcentajeCambioTotal": float(round(float(((total_prediccion - suma_anio_anterior) / suma_anio_anterior) * 100), 2))
                if meses_con_datos_anteriores > 0 else None,
            "ConfianzaPromedio": float(round(float(confianza_promedio), 4)),
            "ImportanciaCaracteristicas": {k: float(round(v, 4)) for k, v in feature_importance.items()}
        }
        
        return predicciones

    except Exception as e:
        error_msg = f"Error al generar predicciones: {str(e)}"
        print(error_msg)
        raise Exception(error_msg)