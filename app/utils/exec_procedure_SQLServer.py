import pyodbc
import json
import os
def load_db_config(config_file=None):
    """
    Lee el archivo de configuración JSON y devuelve un diccionario con los parámetros de la base de datos.
    :param config_file: Ruta al archivo de configuración. Si no se proporciona, se busca en una ubicación predeterminada.
    :return: Diccionario con la configuración del servidor, base de datos, usuario y contraseña.
    """
    try:
        # Establecer una ruta predeterminada si no se proporciona config_file
        if config_file is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            config_file = os.path.join(base_dir, "config", "configDB.Json")

        with open(config_file, 'r') as file:
            config = json.load(file)
        return config
    except Exception as e:
        raise Exception(f"Error al leer el archivo de configuración: {e}")

def execute_stored_procedure(server, database, username, password, procedure_name, params=None):
    """
    Ejecuta un procedimiento almacenado en SQL Server.
    :param server: Dirección del servidor SQL (ej. 'localhost', '192.168.1.10').
    :return: Resultado de la ejecución (lista de filas para procedimientos con SELECT).
    """
    try:
        # Configurar la conexión
        connection_string = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={server};"
            f"DATABASE={database};"
            f"UID={username};"
            f"PWD={password};"
        )
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()

        # Preparar la llamada al procedimiento almacenado
        if params:
            placeholders = ", ".join(["?" for _ in params])  # Generar placeholders para los parámetros
            query = f"EXEC {procedure_name} {placeholders}"
            cursor.execute(query, params)
        else:
            query = f"EXEC {procedure_name}"
            cursor.execute(query)

        # Intentar recuperar resultados (si aplica)
        try:
            rows = cursor.fetchall()  # Para procedimientos con SELECT
            result = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
        except pyodbc.ProgrammingError:
            # Si no hay resultados (ej. INSERT, UPDATE), retornar éxito
            result = "Procedimiento almacenado ejecutado exitosamente."

        # Confirmar transacción si es necesario
        conn.commit()

    except Exception as e:
        result = f"Error al ejecutar el procedimiento almacenado: {e}"

    finally:
        # Cerrar la conexión
        cursor.close()
        conn.close()

    return result

def execute_stored_procedure_from_config(procedure_name, params=None, config_file=None):
    """
    Ejecuta un procedimiento almacenado usando la configuración leída desde un archivo JSON.

    :param procedure_name: Nombre del procedimiento almacenado.
    :param params: Parámetros a pasar al procedimiento (opcional).
    :param config_file: Ruta al archivo de configuración (opcional).
    :return: Resultado de la ejecución.
    """
    config = load_db_config(config_file)
    if config:
        server = config.get("server")
        database = config.get("database")
        username = config.get("username")
        password = config.get("password")

        # Llamar al método que ejecuta el procedimiento almacenado con la configuración cargada
        return execute_stored_procedure(server, database, username, password, procedure_name, params)
    else:
        return "Error en la configuración de la base de datos."
