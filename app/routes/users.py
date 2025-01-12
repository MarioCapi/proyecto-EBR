from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento, ejecutar_procedimiento_read
from typing import Optional
#from datetime import datetime
import bcrypt
import secrets
import string

class UserBase(BaseModel):
    company_id: int
    email: str
    first_name: str
    last_name: str = ""
    role_id: int
    subscription_id: int
    #password_hash: str = "default_password_hash"  

users_router = APIRouter()

def generate_secure_password(length=8):
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(characters) for _ in range(length))
    return password

#@users_router.post("/users/create-from-company")
async def create_user_from_company(
    tax_id: str,
    company_id: int,
    company_name: str,
    email: str,
    subscription_id: int,  
    db):
    try:
        password = generate_secure_password()
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

        user_data = UserBase(
            company_id=company_id,
            email=email,
            first_name=company_name,
            last_name="",
            role_id=1,
            subscription_id=subscription_id  
        )
        
        params = {
            'company_id': user_data.company_id,
            'first_name': user_data.first_name,
            'last_name': user_data.last_name,
            'email': user_data.email,
            'password_hash': password,
            'role_id': user_data.role_id,
            'subscription_id': user_data.subscription_id,  
            'active': 1
        }
        
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
            "message": "Usuario creado exitosamente",
            "email": email,
            "temporary_password": password
        }
    except Exception as e:
        import inspect
        parametros = {
            "user_id": tax_id,
            "action_type": inspect.currentframe().f_code.co_name,
            "action_details": "intenta crear el usuario para la compañia",
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