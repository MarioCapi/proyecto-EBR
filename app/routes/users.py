from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento, ejecutar_procedimiento_read
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    company_id: int
    email: str
    first_name: str
    last_name: str = ""  # Valor por defecto
    role_id: int = 4  # ID del rol "Analista contable y financiero"
    password_hash: str = "default_password_hash"  # Esto debería ser un hash real en producción

users_router = APIRouter()

#@users_router.post("/users/create-from-company")
async def create_user_from_company(
    company_id: int,
    company_name: str,
    email: str,
    db):
    print(f"Iniciando creación de usuario para compañía {company_id}")
    try:
        user_data = UserBase(
            company_id=company_id,
            email=email,
            first_name=company_name,
            last_name="",  # Asignamos el valor por defecto
            role_id=4
        )
        
        params = {
            'company_id': user_data.company_id,
            'first_name': user_data.first_name,
            'last_name': user_data.last_name,
            'email': user_data.email,
            'password_hash': user_data.password_hash,
            'role_id': user_data.role_id,
            'active': 1
        }
        
        print("Ejecutando SP CreateUser con parámetros:", params)
        result = ejecutar_procedimiento(
            db,
            'admin.CreateUser',
            params
        )        
        
        if not result:
            raise HTTPException(
                status_code=500,
                detail="No se recibió respuesta del procedimiento almacenado CreateUser"
            )

        return {
            "message": "Usuario creado exitosamente"
        }
    except Exception as e:
        print(f"Error detallado en crear usuario: {str(e)}")
        import traceback
        print("Traceback completo:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear el usuario: {str(e)}"
        )