from datetime import datetime, timedelta
from typing import Dict
from jose import JWTError, jwt
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from ..config.auth_config import auth_settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def create_access_token(user_data: Dict) -> str:
    """Crea un token JWT con los datos del usuario"""
    to_encode = user_data.copy()
    expire = datetime.utcnow() + timedelta(minutes=auth_settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    token = jwt.encode(
        to_encode, 
        auth_settings.JWT_SECRET_KEY, 
        algorithm=auth_settings.JWT_ALGORITHM
    )
    
    return token

def verify_token(token: str = Depends(oauth2_scheme)) -> Dict:
    """Verifica y decodifica el token JWT"""
    try:
        payload = jwt.decode(
            token, 
            auth_settings.JWT_SECRET_KEY, 
            algorithms=[auth_settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido"
        )
