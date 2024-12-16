from sqlalchemy.orm import Session

def ejecutar_procedimiento(db: Session, sp_name: str, parametros: dict):
    query = f"EXEC {sp_name} " + ", ".join([f"@{k} = :{k}" for k in parametros.keys()])
    result = db.execute(query, parametros).fetchall()
    columns = result[0].keys() if result else []
    return [dict(zip(columns, row)) for row in result]
