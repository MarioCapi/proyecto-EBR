from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.file_upload import router as file_upload_router
from utils.config.connection import test_database_connection

from routes.file_upload import usuarios_bp


app = FastAPI(
    title="API Carga Contable",
    description="API para carga de archivos contables",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(file_upload_router)

@app.on_event("startup")
async def startup_event():
    # Probar conexión a base de datos
    test_database_connection()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    
