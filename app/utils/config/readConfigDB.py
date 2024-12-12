import json

def read_config(file_path="config.json"):
    """
    Lee la configuración del servidor y la base de datos desde un archivo JSON.
    """
    try:
        with open(file_path, "r") as file:
            config = json.load(file)
        return config
    except Exception as e:
        raise Exception(f"Error al leer el archivo de configuración: {e}")
