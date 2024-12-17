from flask import request, jsonify, render_template
from flask_cors import cross_origin
from flask import Blueprint, request, jsonify
from utils.exec_procedure_SQLServer import execute_stored_procedure_from_config

companies_bp = Blueprint('companies', __name__)

@companies_bp.route('/api/companies', methods=['POST'])
@cross_origin()
def create_company():
    try:
        data = request.get_json()
        params = {
            'company_name': data.get('company_name'),
            'tax_identification_type': data.get('tax_identification_type'),
            'tax_id': data.get('tax_id'),
            'email': data.get('email'),
            'num_employees': data.get('num_employees'),
            'company_type': data.get('company_type'),
            'address': data.get('address'),
            'phone': data.get('phone'),
            'subscription_type': data.get('subscription_type'),
            'subscription_end_date': data.get('subscription_end_date')
        }
        
        result = execute_stored_procedure_from_config(
            'admin.sp_CreateCompany',
            params
        )
        
        return jsonify({'success': True, 'data': result}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@companies_bp.route('/api/companies', methods=['GET'])
@cross_origin()
def get_companies():
    try:
        # Obtener parámetros de consulta
        company_id = request.args.get('company_id', type=int)
        status = request.args.get('status')
        subscription_type = request.args.get('subscription_type')
        search_term = request.args.get('search_term')
        page_number = request.args.get('page_number', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)

        params = {
            'company_id': company_id,
            'status': status,
            'subscription_type': subscription_type,
            'search_term': search_term,
            'page_number': page_number,
            'page_size': page_size
        }

        result = execute_stored_procedure_from_config(
            'admin.sp_GetCompanies',
            params
        )

        return jsonify({'success': True, 'data': result}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@companies_bp.route('/api/companies/<int:company_id>', methods=['PUT'])
@cross_origin()
def update_company(company_id):
    try:
        data = request.get_json()
        params = {
            'company_id': company_id,
            'company_name': data.get('company_name'),
            'tax_identification_type': data.get('tax_identification_type'),
            'tax_id': data.get('tax_id'),
            'email': data.get('email'),
            'num_employees': data.get('num_employees'),
            'company_type': data.get('company_type'),
            'address': data.get('address'),
            'phone': data.get('phone'),
            'status': data.get('status'),
            'subscription_type': data.get('subscription_type'),
            'subscription_end_date': data.get('subscription_end_date')
        }

        result = execute_stored_procedure_from_config(
            'admin.sp_UpdateCompany',
            params
        )

        return jsonify({'success': True, 'data': result}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@companies_bp.route('/api/companies/<int:company_id>', methods=['DELETE'])
@cross_origin()
def delete_company(company_id):
    try:
        result = execute_stored_procedure_from_config(
            'admin.sp_DeleteCompany',
            {'company_id': company_id}
        )

        return jsonify({'success': True, 'data': result}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@companies_bp.route('/api/companies/<int:company_id>/status', methods=['PATCH'])
@cross_origin()
def change_company_status(company_id):
    try:
        data = request.get_json()
        params = {
            'company_id': company_id,
            'status': data.get('status')
        }

        result = execute_stored_procedure_from_config(
            'admin.sp_ChangeCompanyStatus',
            params
        )

        return jsonify({'success': True, 'data': result}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Ruta para renderizar la página de crear empresa
@companies_bp.route('/crear-empresa', methods=['GET'])
def render_create_company():
    return render_template('crear_empresas.html')


