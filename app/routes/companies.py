from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from utils.config.connection import get_db
from utils.exec_any_SP_SQLServer import ejecutar_procedimiento, ejecutar_procedimiento_read
from utils.exec_procedure_SQLServer import exec_sp_save_data 
from typing import Optional, List, Literal
from datetime import date
from routes.users import create_user_from_company
import inspect

# Definir los tipos de suscripción permitidos
SubscriptionType = Literal['FREEMIUM', 'BASIC', 'PREMIUM', 'ENTERPRISE']

class CompanyBase(BaseModel):
    company_name: str
    tax_identification_type: str
    tax_id: str
    email: str
    num_employees: Optional[int]
    company_type: Optional[str]
    address: Optional[str]
    phone: Optional[str]
    subscription_type: str
    subscription_end_date: Optional[date]

class CompanyUpdate(CompanyBase):
    status: Optional[str]

    

##class CompanyStatusUpdate(BaseModel):
##    status: str

# Router
companies_router = APIRouter()

# Endpoints
@companies_router.post("/companies")
async def create_company(
    request: CompanyBase,
    db: Session = Depends(get_db)
):
    try:
        # Primero obtenemos el subscription_id basado en el subscription_type
        subscription_result = ejecutar_procedimiento_read(
            db,
            'admin.sp_GetSubscriptionByName',
            {'subscription_name': request.subscription_type.upper()}  # Convertimos a mayúsculas para consistencia
        )
        
        if not subscription_result:
            raise HTTPException(
                status_code=400,
                detail=f"El tipo de suscripción '{request.subscription_type}' no es válido"
            )
            
        subscription_id = subscription_result[0]['id_subscription']
                       
        company_id = exec_sp_save_data(
            db,
            'admin.sp_CreateCompany',
            return_scalar=True,
            company_name=request.company_name,
            tax_identification_type=request.tax_identification_type,
            tax_id=request.tax_id,
            email=request.email,
            num_employees=request.num_employees,
            company_type=request.company_type,
            address=request.address,
            phone=request.phone,
            subscription_type=request.subscription_type,
            subscription_id=subscription_id,  # Agregamos el subscription_id
            subscription_end_date=request.subscription_end_date
        )
        
        if company_id:
            try:
                user_response = await create_user_from_company(
                    tax_id=request.tax_id,
                    company_id=company_id,
                    company_name=request.company_name,
                    email=request.email,
                    subscription_id=subscription_id,
                    db=db
                )
                
                return {
                    "data": {
                        "company_id": company_id
                    },
                    "message": "Compañía y usuario creados exitosamente"
                }
            except Exception as user_error:
                print(f"Error detallado al crear usuario: {str(user_error)}")
                import traceback
                print("Traceback de error de usuario:", traceback.format_exc())
                return {
                    "data": company_id,
                    "message": "Compañía creada exitosamente, pero hubo un error al crear el usuario"
                }
        
        return {
            "data": company_id,
            "message": 'Compañía creada exitosamente'
        }
    except Exception as e:
        parametros = {
            "user_id": request.tax_id,
            "action_type": inspect.currentframe().f_code.co_name,
            "action_details": "intenta crear compañia en el backend",
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
            detail=f"Error al crear la compañía: {str(e)}"
        )
    

#Metodo para traer los nombres de las subscripciones para el front desde la base de datos
@companies_router.get("/subscriptions")
async def get_subscriptions(db: Session = Depends(get_db)):
    try:
        result = ejecutar_procedimiento_read(
            db,
            'admin.sp_GetSubscriptionNames',
            {}
        )
        
        return {
            "data": result,
            "message": "Subscriptions retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving subscriptions: {str(e)}"
        )


#######################################
#######################################
#######################################
## estas apis de abajo no se estan usando, son para futuros desarrollos

@companies_router.get("/companies")
async def get_companies(
    company_id: Optional[int] = None,
    status: Optional[str] = None,
    subscription_type: Optional[str] = None,
    search_term: Optional[str] = None,
    page_number: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db)
):
    try:
        params = {
            'company_id': company_id,
            'status': status,
            'subscription_type': subscription_type,
            'search_term': search_term,
            'page_number': page_number,
            'page_size': page_size
        }

        result = ejecutar_procedimiento(
            db,
            'admin.sp_GetCompanies',
            params
        )

        return {
            "data": result,
            "message": "Companies retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving companies: {str(e)}"
        )

@companies_router.put("/companies/{company_id}")
async def update_company(
    company_id: int,
    request: CompanyUpdate,
    db: Session = Depends(get_db)
):
    try:
        params = {
            'company_id': company_id,
            'company_name': request.company_name,
            'tax_identification_type': request.tax_identification_type,
            'tax_id': request.tax_id,
            'email': request.email,
            'num_employees': request.num_employees,
            'company_type': request.company_type,
            'address': request.address,
            'phone': request.phone,
            'status': request.status,
            'subscription_type': request.subscription_type,
            'subscription_end_date': request.subscription_end_date
        }

        result = ejecutar_procedimiento(
            db,
            'admin.sp_UpdateCompany',
            params
        )

        return {
            "data": result,
            "message": "Company updated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating company: {str(e)}"
        )


##@companies_router.patch("/companies/{company_id}/status")
##def change_company_status(
##    company_id: int,
##    request: CompanyStatusUpdate,
##    db: Session = Depends(get_db)
##):
    try:
        params = {
            'company_id': company_id,
            'status': request.status
        }

        result = ejecutar_procedimiento(
            db,
            'admin.sp_ChangeCompanyStatus',
            params
        )

        return {
            "data": result,
            "message": "Company status updated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating company status: {str(e)}"
        )




