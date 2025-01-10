from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from decimal import Decimal
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento, ejecutar_procedimiento_JSONParams
from typing import List
import json


class PresupuestoDetalle(BaseModel):    
    Nit_Empresa: str
    Producto: str
    enero: float
    febrero: float
    marzo: float
    abril: float
    mayo: float
    junio: float
    julio: float
    agosto: float
    septiembre: float
    octubre: float
    noviembre: float
    diciembre: float
    total: float
    
class GuardaPresuSugeridoRequest(BaseModel):
    Nit_Empresa: str
    Anio_Presupuesto: int
    Total: float
    UsuarioInsercion: str
    JsonCosto: List[PresupuestoDetalle]
    JsonGasto: List[PresupuestoDetalle]
    JsonIngreso: List[PresupuestoDetalle]
    JsonSugerido: List[PresupuestoDetalle]
        
    
Presupuesto_sugerido_router = APIRouter()
@Presupuesto_sugerido_router.post("/GuardaPresupuestoSugeridoFinal")
async def GuardaPresupuestoSugeridoFinal(
    request: GuardaPresuSugeridoRequest,
    db: Session = Depends(get_db)
):
    try:
        # Convertir las listas de detalles en JSON
        
        #json_costo = [detalle.model_dump() for detalle in request.JsonCosto]        
        #json_gasto = [detalle.model_dump() for detalle in request.JsonGasto]
        #json_ingreso = [detalle.model_dump() for detalle in request.JsonIngreso]
        #json_sugerido = [detalle.model_dump() for detalle in request.JsonSugerido]


        json_costo = json.dumps([detalle.model_dump() for detalle in request.JsonCosto])
        json_gasto = json.dumps([detalle.model_dump() for detalle in request.JsonGasto])
        json_ingreso = json.dumps([detalle.model_dump() for detalle in request.JsonIngreso])
        json_sugerido = json.dumps([detalle.model_dump() for detalle in request.JsonSugerido])

        # Preparar los parámetros para el procedimiento almacenado
        import traceback        
        parametros = {
            "AnioPresupuesto": request.Anio_Presupuesto,
            "NIT": request.Nit_Empresa,
            "Total": request.Total,
            "UsuarioInsercion": request.UsuarioInsercion,        
            "JsonCosto": str(json_costo),  # Convertir a string para enviar al SP
            "JsonGasto": str(json_gasto),
            "JsonIngreso": str(json_ingreso),
            "JsonSugerido": str(json_sugerido)
        }
        #parametros["error_details"] = traceback.format_exc()
        # Ejecutar el procedimiento almacenado
        ejecutar_procedimiento(
            db,
            "admin.SP_guardar_presupuesto_sugerido_anual",
            parametros
        )
        return {"message": "Datos guardados exitosamente"}

    except HTTPException as he:
        raise he
    except Exception as e:
        import inspect
        parametros = {
            "user_id": request.Nit_Empresa,
            "action_type": inspect.currentframe().f_code.co_name,
            "action_details": "intenta guardar el presupuesto final sugerido",
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
            detail=f"Error al guardar presupuesto final sugerido: {str(e)}"
        )