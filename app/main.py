from flask import Flask, request, jsonify
import os
import joblib

app = Flask(__name__)

# Cargar el modelo, escalador y codificador previamente entrenados
model_path = "modelo_entrenado.joblib"
scaler_path = "scaler.joblib"
encoder_path = "encoder.joblib"

modelo = joblib.load(model_path)
scaler = joblib.load(scaler_path)
encoder = joblib.load(encoder_path)

# Endpoint para subir archivos y predecir
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No se encontró un archivo"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "El archivo está vacío"}), 400

    # Guardar archivo subido temporalmente
    temp_path = os.path.join("temp", file.filename)
    file.save(temp_path)

    try:
        # Preparar datos del archivo
        X_new, _, _, _, _, _, _, _ = prepare_data(temp_path)
        predictions = modelo.predict(X_new)

        # Respuesta JSON con predicciones
        response = {
            "predicciones": predictions.tolist()
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Eliminar archivo temporal
        os.remove(temp_path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
