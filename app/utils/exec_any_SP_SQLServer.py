from sqlalchemy import text
from sqlalchemy.orm import Session

def ejecutar_procedimiento(db: Session, sp_name: str, parametros: dict):
    try:
        # Construir la consulta usando text()
        query = text(f"EXEC {sp_name} " + ", ".join([f"@{k} = :{k}" for k in parametros.keys()]))        
        
        
        # Ejecutar el procedimiento almacenado
        result = db.execute(query, parametros)
        db.commit()
        
        # Verificar si el resultado tiene filas
        if result.returns_rows:
            rows = result.fetchall()  # Obtener todas las filas
            if not rows:
                return {"message": "Operación completada sin resultados."}  # Retornar mensaje si no hay filas
            
            # Obtener nombres de columnas
            columns = rows[0].keys()  # Obtener nombres de columnas de la primera fila
            
            # Convertir resultados a lista de diccionarios
            return [dict(zip(columns, row)) for row in rows]
        else:
            # Si no se devuelven filas, retornar el mensaje de éxito
            return {"message": "Operación completada exitosamente."}
            
    except Exception as e:
        #print(f"Error ejecutando procedimiento {sp_name}: {str(e)}")
        raise Exception(f"Error ejecutando procedimiento almacenado: {str(e)}")
    

def ejecutar_procedimiento_JSONParams(db: Session, sp_name: str, parametros: dict):
    try:
        
        param_declarations = ", ".join([f"@{k}=:{k}" for k in parametros.keys()])
        query = f"EXEC {sp_name} {param_declarations}"

        # Crear la consulta como texto explícito
        query_text = text(query)

        # Ejecutar el procedimiento almacenado con parámetros
        result = db.execute(query_text, parametros)
        db.commit()

        # Verificar si el resultado tiene filas
        if result.returns_rows:
            rows = result.fetchall()  # Obtener todas las filas
            if not rows:
                return {"message": "Operación completada sin resultados."}  # Retornar mensaje si no hay filas
            
            # Obtener nombres de columnas
            columns = rows[0].keys()  # Obtener nombres de columnas de la primera fila
            
            # Convertir resultados a lista de diccionarios
            return [dict(zip(columns, row)) for row in rows]
        else:
            # Si no se devuelven filas, retornar el mensaje de éxito
            return {"message": "Operación completada exitosamente."}
            
    except Exception as e:
        print(f"Error ejecutando procedimiento {sp_name}: {str(e)}")
        raise Exception(f"Error ejecutando procedimiento almacenado: {str(e)}")
    
def ejecutar_procedimiento_read(db: Session, sp_name: str, parametros: dict):
    try:
        query = text(f"EXEC {sp_name} " + ", ".join([f"@{k} = :{k}" for k in parametros.keys()]))
        
        result = db.execute(query, parametros)
        if result.returns_rows:
            rows = result.fetchall()  # Obtener todas las filas
            if not rows:
                return {"message": "Operación completada sin resultados."}
            columns = result.keys()
            return [dict(zip(columns, row)) for row in rows]
        else:            
            return {"message": "Operación completada exitosamente."}
    except Exception as e:
        print(f"Error ejecutando procedimiento {sp_name}: {str(e)}")
        raise Exception(f"Error ejecutando procedimiento almacenado: {str(e)}")
    

def ejecutar_procedimiento_ingresos(db: Session, sp_name: str, parametros: dict):
    try:
        # Construir la consulta usando text()
        query = text(f"EXEC {sp_name} " + ", ".join([f"@{k} = :{k}" for k in parametros.keys()]))
        
        # Ejecutar el procedimiento almacenado
        result = db.execute(query, parametros).fetchall()
        
        # Si no hay resultados, retornar lista vacía
        if not result:
            return []
        return result
        
    except Exception as e:
        print(f"Error ejecutando procedimiento {sp_name}: {str(e)}")
        raise Exception(f"Error ejecutando procedimiento almacenado: {str(e)}")