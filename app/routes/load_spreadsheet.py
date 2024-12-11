from flask import request, jsonify, render_template
from flask_cors import  cross_origin
from flask import Blueprint, request, jsonify
from utils.exec_procedure_SQLServer import execute_stored_procedure_from_config


products_bp = Blueprint('products', __name__)


@cross_origin
@products_bp.route('/api/load_spreadsheet', methods=['GET'])
def load_spreadsheet():
    data = request.json
    try:
        result = execute_stored_procedure_from_config('sp_insert_product', (data['codeProducto'],data['nombre_producto'],
                                                            data['unidad_de_medida'], data['descripcion'],data['precio_unitario']))
        return jsonify({'message':result}),200
    except Exception as e:
        return jsonify({'message': 'Error creando producto','error':str(e)}),500