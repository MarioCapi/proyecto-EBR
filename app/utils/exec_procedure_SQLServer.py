from sqlalchemy import text
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError


def log_backend_error(db_session, user_id: int, action_type: str, error_details: str):
    """
    Registra un error en la tabla logs_bakend.
    """
    try:
        log_query = text("""
            INSERT INTO Admin.logs_bakend (user_id, action_type, error, error_details, timestamp)
            VALUES (:user_id, :action_type, 1, :error_details, :timestamp)
        """)
        db_session.execute(
            log_query,
            {
                "user_id": user_id,
                "action_type": action_type,
                "error_details": error_details,
                "timestamp": datetime.now()
            }
        )
        db_session.commit()
    except SQLAlchemyError as e:
        print(":")  # No lanzar otra excepción para evitar loops
        
        
#def exec_sp_save_data(db_session, sp_name: str, **params):
def exec_sp_save_data(db_session, sp_name: str, return_scalar: bool = False, **params):
    """
    Ejecuta un stored procedure con los parámetros proporcionados
    """
    try:
        # Construir la llamada al SP
        sp_call = f"EXEC {sp_name} "
        sp_params = []
        
        for key, value in params.items():
            sp_params.append(f"@{key}=:{key}")
        
        sp_call += ", ".join(sp_params)
        
        # Ejecutar el SP
        result = db_session.execute(text(sp_call), params)
        #db_session.commit()
        
        if return_scalar:
            # Obtener el resultado de manera segura
            row = result.fetchone()
            db_session.commit()
            if row is None:
                return None
            return row[0]  # Retorna el primer valor de la primera fila
            
        db_session.commit()
        return result
    except Exception as e:
        db_session.rollback()
        error_details = f"Error ejecutando SP {sp_name}: {str(e)}"
        log_backend_error(
            db_session=db_session,
            user_id="usuario desconocido",  
            action_type="Ejecutando el metodo: exec_sp_save_data",
            error_details=error_details
        )
        raise Exception(f"Error ejecutando SP {sp_name}: {str(e)}")

# Funciones específicas para cada SP
def sp_save_empresa(db_session, nombre_empresa: str, nit: str):
    return exec_sp_save_data(
        db_session,
        "Admin.InsertarEmpresa",
        NombreEmpresa=nombre_empresa,
        NIT=nit
    )

def sp_save_archivo(db_session, nombre_archivo: str, empresa_id: int, periodo: str):
    return exec_sp_save_data(
        db_session,
        "Admin.InsertarArchivo",
        NombreArchivo=nombre_archivo,
        EmpresaID=empresa_id,
        Periodo=periodo
    )

#def sp_save_dato_contable(db_session, archivo_id: int, nivel_id: str,transaccional: bool, codigo_cuenta: str, nombre_cuenta: str,saldo_inicial: float, debito: float, credito: float, saldo_final: float):
def sp_save_dato_contable(db_session, archivo_id: int, 
                        transaccional: bool, codigo_cuenta: str, nombre_cuenta: str,saldo_inicial: float, 
                        debito: float, credito: float, saldo_final: float):
    """Ejecuta el SP para guardar un dato contable"""
    try:
        # Validar tipos de datos antes de enviar al SP
        # < nivel_id: str >:    en version anterior se requeria el parametro NIVEL
        # ahora se calcula en el SP este parametro
        params = {
            'ArchivoID': int(archivo_id),
            'Transaccional': bool(transaccional),
            'CodigoCuenta': str(codigo_cuenta),
            'NombreCuenta': str(nombre_cuenta),
            'SaldoInicial': float(saldo_inicial),
            'Debito': float(debito),
            'Credito': float(credito),
            'SaldoFinal': float(saldo_final)
        }
        
        return exec_sp_save_data(
            db_session,
            "Admin.sp_SaveDatoContable",
            **params
        )
        
    except Exception as e:
        print(":")
        raise
