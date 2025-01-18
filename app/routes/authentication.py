from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento_read
from utils.auth.jwt_manager import create_access_token
from datetime import datetime
from typing import Dict, Any

# 1. Modelo para la solicitud de autenticación
class LoginRequest(BaseModel):
    email: str
    password: str

# 2. Modelo para la respuesta de autenticación
class AuthResponse(BaseModel):
    token: str
    user_data: Dict[str, Any]

auth_router = APIRouter()

@auth_router.post("/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        # 2. Preparar y ejecutar la validación en la base de datos
        params = {
            'email': request.email,
            'password': request.password
        }
        
        # 3. Llamada al stored procedure y validación de respuesta
        result = ejecutar_procedimiento_read(
            db,
            'admin.sp_validateUsersCredentials',
            params
        )
        
        if not result or len(result) == 0:
            raise HTTPException(
                status_code=401,
                detail="Credenciales inválidas"
            )

        # 4. Procesar la respuesta y crear el token
        user_data = result[0]
        
        # Preparar datos para el token
        token_data = {
            'user_id': user_data['user_id'],
            'email': user_data['email'],
            'role_id': user_data['role_id'],
            'company_id': user_data['company_id'],
            'exp': datetime.utcnow()
        }
        
        # Generar el token
        token = create_access_token(token_data)
        
        # Estructurar la respuesta completa
        response_data = {
            'token': token,
            'user_data': {
                'user_id': user_data['user_id'],
                'role_id': user_data['role_id'],
                'email': user_data['email'],
                'company_id': user_data['company_id'],
                'company_name': user_data['company_name'],
                'tax_id': user_data['tax_id'],
                #'subscription_type': user_data['subscription_type'],
                'subscription_id': user_data['subscription_id'],
                'created_at': user_data['created_at']
            }
        }
        
        return response_data
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error en login: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error en el servidor: {str(e)}"
        )