from sqlalchemy import text

def exec_sp_save_data(db_session, sp_name: str, **params):
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
        db_session.commit()
        
        return result
    except Exception as e:
        db_session.rollback()
        raise Exception(f"Error ejecutando SP {sp_name}: {str(e)}")

# Funciones específicas para cada SP
def sp_save_empresa(db_session, nombre_empresa: str, nit: str):
    return exec_sp_save_data(
        db_session,
        "Admin.sp_SaveEmpresa",
        nombre_empresa=nombre_empresa,
        nit=nit
    )

def sp_save_archivo(db_session, nombre_archivo: str, empresa_id: int, periodo: str):
    return exec_sp_save_data(
        db_session,
        "Admin.sp_SaveArchivo",
        nombre_archivo=nombre_archivo,
        empresa_id=empresa_id,
        periodo=periodo
    )

def sp_save_dato_contable(db_session, archivo_id: int, nivel_id: int, 
                        transaccional: bool, codigo_cuenta: str, nombre_cuenta: str,
                        saldo_inicial: float, debito: float, credito: float, 
                        saldo_final: float):
    return exec_sp_save_data(
        db_session,
        "Admin.sp_SaveDatoContable",
        archivo_id=archivo_id,
        nivel_id=nivel_id,
        transaccional=transaccional,
        codigo_cuenta=codigo_cuenta,
        nombre_cuenta=nombre_cuenta,
        saldo_inicial=saldo_inicial,
        debito=debito,
        credito=credito,
        saldo_final=saldo_final
    )
