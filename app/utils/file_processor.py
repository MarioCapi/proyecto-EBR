import pandas as pd
import io
from typing import List, Dict
from routes.models import FileMetadata, FileProcessor
import re
from datetime import datetime
from .exec_procedure_SQLServer import sp_save_empresa, sp_save_archivo, sp_save_dato_contable

async def process_excel_file(contents: bytes, filename: str, db_session) -> FileProcessor:
    """
    Procesa el archivo Excel y guarda los datos en la base de datos
    """
    # Leer el archivo
    df = pd.read_excel(io.BytesIO(contents)) if filename.endswith(('.xls', '.xlsx')) else pd.read_csv(io.BytesIO(contents))
    
    # Extraer metadata
    metadata = extract_metadata(df, filename)
    
    # Guardar metadata en la base de datos
    empresa = save_empresa(db_session, metadata)
    archivo = save_archivo(db_session, metadata, empresa.EmpresaID)
    
    # Encontrar donde empiezan los datos y obtener mapeo de columnas
    start_row, mapeo_columnas = find_table_start(df)
    
    # Procesar datos principales
    datos = process_main_data(df, start_row, mapeo_columnas)
    
    # Guardar datos en lotes
    BATCH_SIZE = 500
    for i in range(0, len(datos), BATCH_SIZE):
        batch = datos[i:i + BATCH_SIZE]
        save_datos_contables(db_session, batch, archivo.ArchivoID)
        db_session.commit()  # Commit por cada lote
    
    return FileProcessor(
        metadata=metadata,
        datos=datos
    )

def extract_metadata(df: pd.DataFrame, filename: str) -> FileMetadata:
    metadata_dict = {
        'nombre_archivo': "",
        'nombre_empresa': "",
        'codigo_nit': "",
        'periodo': ""
    }
    
    # Convertir las primeras 5 filas en una lista de strings para análisis
    primeras_filas = []
    
    # Añadir nombres de columnas a la lista de búsqueda
    column_values = [str(col).strip() for col in df.columns if str(col).strip() and 'Unnamed' not in str(col)]
    primeras_filas.extend(column_values)
    
    # Añadir valores de las primeras 5 filas
    for i in range(min(5, len(df))):
        row_values = [str(val).strip() for val in df.iloc[i] if str(val).strip()]
        if row_values:
            primeras_filas.extend(row_values)
    
    # Patrones para identificar cada tipo de dato
    patrones = {
        'nit': r'\b\d{9}\b',  # Exactamente 9 dígitos
        'periodo': r'\b(?:(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)|(?:0?[1-9]|1[0-2]))[\/\s-]*(?:de\s+)?(?:20\d{2})\b',
        'nombre_archivo': r'\b(?:balance[\s\w]*(?:general|prueba)|estado[\s\w]*|reporte[\s\w]*|informe[\s\w]*)\b'
    }
    
    # Buscar nombre del archivo (primero, ya que suele estar en la primera línea)
    for texto in primeras_filas:
        texto_lower = texto.lower()
        if ('balance' in texto_lower or 
            'estado' in texto_lower or 
            'reporte' in texto_lower or 
            'informe' in texto_lower):
            metadata_dict['nombre_archivo'] = texto.strip()
            break
    
    # Buscar NIT
    for texto in primeras_filas:
        if re.search(patrones['nit'], texto):
            metadata_dict['codigo_nit'] = re.search(patrones['nit'], texto).group()
            break
    
    # Buscar periodo
    for texto in primeras_filas:
        periodo_match = re.search(patrones['periodo'], texto.lower())
        if periodo_match:
            metadata_dict['periodo'] = periodo_match.group()
            break
    
    # Buscar nombre de empresa
    for texto in primeras_filas:
        # Si el texto no es NIT, periodo o nombre de archivo
        if (texto not in [metadata_dict['codigo_nit'], metadata_dict['periodo'], metadata_dict['nombre_archivo']] and
            len(texto.split()) >= 1 and  # Al menos 1 palabra
            not texto.lower().startswith(('balance', 'estado', 'reporte', 'informe')) and
            not re.search(patrones['nit'], texto) and
            not re.search(patrones['periodo'], texto.lower())):
            metadata_dict['nombre_empresa'] = texto.strip()
            break
    
    # Validaciones adicionales
    if not metadata_dict['nombre_empresa']:
        candidatos = [texto for texto in primeras_filas 
                     if texto not in [metadata_dict['codigo_nit'], 
                                    metadata_dict['periodo'], 
                                    metadata_dict['nombre_archivo']]]
        if candidatos:
            metadata_dict['nombre_empresa'] = max(candidatos, key=len).strip()
            
    # Si no se encontró nombre de archivo, usar el primer texto que contenga las palabras clave
    if not metadata_dict['nombre_archivo']:
        for texto in primeras_filas:
            texto_lower = texto.lower()
            if any(keyword in texto_lower for keyword in ['balance', 'estado', 'reporte', 'informe']):
                metadata_dict['nombre_archivo'] = texto.strip()
                break
    
    return FileMetadata(**metadata_dict)

def find_table_start(df: pd.DataFrame) -> tuple[int, dict]:
    """
    Encuentra la fila donde comienzan los datos y mapea las columnas
    Returns: (índice_fila_inicio, mapeo_columnas)
    """
    columnas_esperadas = {
        'codigo': ['codigo', 'codigo_cuenta', 'cod', 'cuenta'],
        'nivel': ['nivel', 'niv'],
        'transaccional': ['transaccional', 'trans'],
        'nombre': ['nombre', 'nombre_cuenta', 'descripcion'],
        'saldo_inicial': ['saldo inicial', 'saldo_inicial', 'saldo_i'],
        'saldo_final': ['saldo final', 'saldo_final', 'saldo_f'],
        'debito': ['debito', 'deb', 'debe'],
        'credito': ['credito', 'cred', 'haber']
    }
    
    for i in range(len(df)):
        row = df.iloc[i]
        mapeo_columnas = {}
        
        # Convertir la fila a string y lowercase para búsqueda
        row_values = [str(val).lower().strip() for val in row]
        
        # Si encontramos 'codigo' en alguna columna
        if any('codigo' in val for val in row_values):
            # Mapear cada columna esperada con su índice real
            for nombre_campo, alternativas in columnas_esperadas.items():
                for j, valor in enumerate(row_values):
                    if any(alt in valor for alt in alternativas):
                        mapeo_columnas[nombre_campo] = j
                        break
            
            # Si encontramos al menos las columnas obligatorias
            if all(campo in mapeo_columnas for campo in ['codigo', 'nombre']):
                return i, mapeo_columnas
    
    raise ValueError("No se encontró la estructura esperada en el archivo")

def process_main_data(df: pd.DataFrame, start_row: int, mapeo_columnas: dict) -> List[Dict]:
    """
    Procesa los datos principales usando el mapeo de columnas
    """
    # Obtener los datos desde la fila siguiente al encabezado
    data_rows = []
    
    for i in range(start_row + 1, len(df)):
        row = df.iloc[i]
        
        # Crear diccionario con los datos mapeados
        row_dict = {
            'codigo_cuenta': str(row[mapeo_columnas['codigo']]).strip(),
            'nombre_cuenta': str(row[mapeo_columnas['nombre']]).strip(),
            'saldo_inicial': float(str(row[mapeo_columnas.get('saldo_inicial', 0)]).replace(',', '') or 0),
            'saldo_final': float(str(row[mapeo_columnas.get('saldo_final', 0)]).replace(',', '') or 0),
            'debito': float(str(row[mapeo_columnas.get('debito', 0)]).replace(',', '') or 0),
            'credito': float(str(row[mapeo_columnas.get('credito', 0)]).replace(',', '') or 0),
            'nivel': str(row[mapeo_columnas.get('nivel', '')]).strip() if 'nivel' in mapeo_columnas else '',
            'transaccional': str(row[mapeo_columnas.get('transaccional', '')]).strip().lower() == 'si' 
                           if 'transaccional' in mapeo_columnas else False
        }
        
        data_rows.append(row_dict)
    
    return data_rows 

def save_empresa(db_session, metadata: FileMetadata):
    result = sp_save_empresa(
        db_session,
        nombre_empresa=metadata.nombre_empresa,
        nit=metadata.codigo_nit
    )
    # Asumiendo que el SP retorna el ID de la empresa
    return result.first()

def save_archivo(db_session, metadata: FileMetadata, empresa_id: int):
    result = sp_save_archivo(
        db_session,
        nombre_archivo=metadata.nombre_archivo,
        empresa_id=empresa_id,
        periodo=metadata.periodo
    )
    # Asumiendo que el SP retorna el ID del archivo
    return result.first()

def save_datos_contables(db_session, datos: List[Dict], archivo_id: int):
    for dato in datos:
        sp_save_dato_contable(
            db_session,
            archivo_id=archivo_id,
            nivel_id=dato.get('nivel_id'),
            transaccional=dato['transaccional'],
            codigo_cuenta=dato['codigo_cuenta'],
            nombre_cuenta=dato['nombre_cuenta'],
            saldo_inicial=dato['saldo_inicial'],
            debito=dato['debito'],
            credito=dato['credito'],
            saldo_final=dato['saldo_final']
        )