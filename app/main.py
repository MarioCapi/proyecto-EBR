from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.file_upload import router as file_upload_router
from routes.API_presupuesto import presupuesto_router as presupuesto_router
from routes.API_GuardaPresupuesto import PredicPres_x_empresa_router as PredicPres_x_empresa_router
from utils.config.connection import test_database_connection


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
app.include_router(presupuesto_router)
app.include_router(PredicPres_x_empresa_router)

#@app.on_event("startup")
#async def startup_event():
    ## Probar conexión a base de datos
#    test_database_connection()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8080)
    
