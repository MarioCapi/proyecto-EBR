import pandas as pd
import os
from typing import Dict, List
from werkzeug.utils import secure_filename

class FileProcessor:
    @staticmethod
    def validate_file(filename: str, max_size: int = 10_000_000) -> bool:
        """
        Valida el archivo según extensión y tamaño
        """
        allowed_extensions = ['.xlsx', '.csv']
        file_ext = os.path.splitext(filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise ValueError(f"Tipo de archivo no permitido. Use {', '.join(allowed_extensions)}")
        
        return True

    @staticmethod
    def read_file(file_path: str) -> pd.DataFrame:
        """
        Lee archivo Excel o CSV
        """
        try:
            file_ext = os.path.splitext(file_path)[1].lower()
            
            if file_ext == '.xlsx':
                df = pd.read_excel(file_path)
            elif file_ext == '.csv':
                df = pd.read_csv(file_path)
            else:
                raise ValueError("Formato de archivo no soportado")
            
            return df
        except Exception as e:
            raise ValueError(f"Error procesando archivo: {str(e)}")

    @staticmethod
    def validate_dataframe(df: pd.DataFrame, required_columns: List[str]) -> bool:
        """
        Valida estructura del DataFrame
        """
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise ValueError(f"Columnas faltantes: {', '.join(missing_columns)}")
        
        return True

    @staticmethod
    def prepare_data_for_database(df: pd.DataFrame) -> List[Dict]:
        """
        Prepara datos para inserción en base de datos
        """
        # Lógica de transformación y preparación
        return df.to_dict('records')