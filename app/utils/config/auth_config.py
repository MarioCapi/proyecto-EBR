from pydantic_settings import BaseSettings
from typing import Optional, List
import json

class AuthSettings(BaseSettings):
    # JWT Settings
    JWT_SECRET_KEY: str = "tu_clave_secreta_muy_segura"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API Settings
    API_URL: str = "http://localhost:8080"
    
    # CORS Settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Database Settings
    DATABASE_URL: Optional[str] = None
    DB_SERVER: Optional[str] = None
    DB_NAME: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = "allow"  # Permite campos adicionales en el modelo

        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str):
            if field_name == "CORS_ORIGINS":
                return json.loads(raw_val)
            return raw_val

auth_settings = AuthSettings()