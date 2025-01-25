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
from routes.API_Consulta_si_PresupuestoSugeridoAnual import consulta_si_presu_suger_anual_router as consulta_si_presu_suger_anual_router
from routes.API_ConciliationMonthly_vs_budget import ConciliationMonthly_budget_router as ConciliationMonthly_budget_router
from routes.API_ConciliationMonthly_vs_Expenses import ConciliationMonthly_expenses_router as ConciliationMonthly_expenses_router
from routes.API_ConciliationMonthly_vs_Cost import ConciliationMonthly_cost_router as ConciliationMonthly_cost_router
from utils.config.connection import test_database_connection
from routes.companies import companies_router
from pathlib import Path
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles



ebr = FastAPI(
    title="API Gestion Contable",
    description="API para gestion de carga de archivos contables y predicciones",
    version="1.1.0"
)

ebr.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ebr.include_router(Logsrouter)
ebr.include_router(file_upload_router)
ebr.include_router(presupuesto_router)
ebr.include_router(PredicPres_x_empresa_router)
ebr.include_router(Tot_prod_mes_router)
ebr.include_router(Get_pred_empresa_producto_router)
ebr.include_router(companies_router, prefix="/api")
ebr.include_router(users_router, prefix="/api")
ebr.include_router(auth_router, prefix="/api")
ebr.include_router(generate_suggested_budget_router)
ebr.include_router(Presupuesto_sugerido_router)
ebr.include_router(consulta_si_presu_suger_anual_router)
ebr.include_router(ConciliationMonthly_budget_router)
ebr.include_router(ConciliationMonthly_expenses_router)
ebr.include_router(ConciliationMonthly_cost_router)


    
# Configuración para servir archivos estáticos y HTML
frontend_dir = Path("frontend")  # Carpeta donde está el frontend
ebr.mount("/static", StaticFiles(directory=frontend_dir / "static"), name="static")


@ebr.get("/", response_class=HTMLResponse)
async def serve_login_page():
    """Servir el archivo login.html como página principal."""
    login_path = frontend_dir / "login.html"
    if login_path.exists():
        return HTMLResponse(content=login_path.read_text(), status_code=200)
    return HTMLResponse(content="Archivo login.html no encontrado", status_code=404)