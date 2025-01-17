from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.file_upload import router as file_upload_router
from routes.API_presupuesto import presupuesto_router as presupuesto_router
from routes.API_GuardaPresupuesto import PredicPres_x_empresa_router as PredicPres_x_empresa_router
from routes.API_getTotales_x_Prod_mes import Tot_prod_mes_router as Tot_prod_mes_router
#from routes.API_Pred_x_Prod import Tot_pred_prod_monthly_router as Tot_pred_prod_monthly_router
from routes.API_get_Predicciones_Empresa_Producto import Get_pred_empresa_producto_router  as Get_pred_empresa_producto_router
from routes.users import users_router
from routes.API_registerLogs import Logsrouter as Logsrouter
from routes.authentication import auth_router
from routes.API_Generate_Suggested_Budget import generate_suggested_budget_router as generate_suggested_budget_router
from routes.API_guarda_presupuesto_sugerido_final import Presupuesto_sugerido_router as Presupuesto_sugerido_router

from utils.config.connection import test_database_connection
from routes.companies import companies_router


app = FastAPI(
    title="API Gestion Contable",
    description="API para gestion de carga de archivos contables y predicciones",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(Logsrouter)
app.include_router(file_upload_router)
app.include_router(presupuesto_router)
app.include_router(PredicPres_x_empresa_router)
app.include_router(Tot_prod_mes_router)
app.include_router(Get_pred_empresa_producto_router)
app.include_router(companies_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(generate_suggested_budget_router)
app.include_router(Presupuesto_sugerido_router)

#@app.on_event("startup")
#async def startup_event():
    ## Probar conexión a base de datos
#    test_database_connection()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8080)
    
