from sqlalchemy import text
from sqlalchemy.orm import Session

def ejecutar_procedimiento(db: Session, sp_name: str, parametros: dict):
    try:
        # Construir la consulta usando text()
        query = text(f"EXEC {sp_name} " + ", ".join([f"@{k} = :{k}" for k in parametros.keys()]))
        
        # Ejecutar el procedimiento almacenado
        result = db.execute(query, parametros).fetchall()
        
        # Si no hay resultados, retornar lista vacía
        if not result:
            return []
            
        # Obtener nombres de columnas
        columns = result[0].keys()
        
        # Convertir resultados a lista de diccionarios
        return [dict(zip(columns, row)) for row in result]
        
    except Exception as e:
        print(f"Error ejecutando procedimiento {sp_name}: {str(e)}")
        raise Exception(f"Error ejecutando procedimiento almacenado: {str(e)}")
    
    from sqlalchemy import text
from sqlalchemy.orm import Session
from decimal import Decimal

def ejecutar_procedimiento(db: Session, sp_name: str, parametros: dict):
    try:
        # Construir la consulta usando text()
        query = text(f"EXEC {sp_name} " + ", ".join([f"@{k} = :{k}" for k in parametros.keys()]))
        
        # Ejecutar el procedimiento almacenado
        result = db.execute(query, parametros).fetchall()
        
        # Si no hay resultados, retornar lista vacía
        if not result:
            return []
            
        # Definir las columnas basadas en el SP
        columns = ['Anio', 'Mes', 'NombreMes', 'TotalDebito', 'TotalCredito', 'Diferencia']
        
        # Convertir resultados a lista de diccionarios
        formatted_results = []
        for row in result:
            formatted_results.append({
                'Anio': row[0],
                'Mes': row[1],
                'NombreMes': row[2],
                'TotalDebito': float(row[3]) if isinstance(row[3], Decimal) else row[3],
                'TotalCredito': float(row[4]) if isinstance(row[4], Decimal) else row[4],
                'Diferencia': float(row[5]) if isinstance(row[5], Decimal) else row[5]
            })
            
        return formatted_results
        
    except Exception as e:
        print(f"Error ejecutando procedimiento {sp_name}: {str(e)}")
        raise Exception(f"Error ejecutando procedimiento almacenado: {str(e)}")