from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento, ejecutar_procedimiento_read
import jwt
from datetime import datetime, timedelta

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    user_id: int
    role_id: int
    email: str
    
auth_router = APIRouter()
SECRET_KEY = "tu_clave_secreta"  # Cambiar por una clave segura

@auth_router.post("/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        params = {
            'email': request.email,
            'password': request.password
        }
        
        # Ejecutar el SP
        result = ejecutar_procedimiento_read(
            db,
            'admin.ValidateUserCredentials',
            params
        )
        
        # Verificar si hay resultados
        if result and len(result) > 0:
            user_data = result[0]
            
            # Generar token
            token_data = {
                'user_id': user_data['user_id'],
                'email': user_data['email'],
                'role_id': user_data['role_id'],
                'exp': datetime.utcnow() + timedelta(hours=24)
            }
            
            token = jwt.encode(token_data, SECRET_KEY, algorithm='HS256')
            
            # Construir respuesta
            return {
                'token': token,
                'user_id': user_data['user_id'],
                'role_id': user_data['role_id'],
                'email': user_data['email'],
            }
        
        raise HTTPException(
            status_code=401,
            detail="Credenciales inválidas"
        )
        
    except Exception as e:
        print(f"Error en login: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error en el servidor: {str(e)}"
        )