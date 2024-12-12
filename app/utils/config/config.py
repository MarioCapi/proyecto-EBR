from pydantic import BaseSettings

class Settings(BaseSettings):
    # Configuraciones de Base de Datos
    DB_SERVER: str = "localhost"
    DB_NAME: str = "EBR"
    DB_USER: str = "EBR_Admin_Super"
    DB_PASSWORD: str = "102849465!"
    
    # Configuraciones de API
    API_VERSION: str = "v1"
    MAX_FILE_SIZE: int = 10_000_000  # 10 MB
    ALLOWED_EXTENSIONS: list = ['.xls','.xlsx', '.csv']

settings = Settings()