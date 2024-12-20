document.getElementById('createCompanyForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Validaciones básicas
    const email = document.getElementById('email').value;
    const numEmployees = document.getElementById('num_employees').value;
    const companyType = document.getElementById('company_type').value;
    const otherCompanyType = document.getElementById('other_company_type').value;

    if (!validateEmail(email)) {
        alert('Por favor ingrese un email válido');
        return;
    }

    if (numEmployees && numEmployees < 1) {
        alert('El número de empleados debe ser mayor a 0');
        return;
    }

    if (companyType === 'OTROS' && !otherCompanyType.trim()) {
        alert('Por favor especifique el tipo de compañía');
        return;
    }

    // Preparar los datos en el formato que espera el backend
    const formData = {
        company_name: document.getElementById('company_name').value,
        tax_identification_type: document.getElementById('id_type').value,
        tax_id: document.getElementById('tax_id').value,
        email: email,
        num_employees: numEmployees ? parseInt(numEmployees) : null,
        company_type: companyType === 'OTROS' ? otherCompanyType : companyType,
        address: document.getElementById('address').value || null,
        phone: document.getElementById('phone').value || null,
        subscription_type: document.getElementById('subscription_type').value,
        subscription_end_date: document.getElementById('subscription_end_date').value || null
    };

    try {
        const API_URL = 'http://localhost:8000/api/companies';
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        }).catch(error => {
            throw new Error(`Error de conexión: No se puede conectar al servidor en ${API_URL}. Asegúrese de que el servidor esté corriendo.`);
        });

        if (!response) {
            throw new Error('No se recibió respuesta del servidor');
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || 'Error al crear la compañía');
        }

        // Mostrar mensaje de éxito
        alert(result.message || 'Compañía creada exitosamente');
        
        // Limpiar el formulario
        document.getElementById('createCompanyForm').reset();
        
        // Ocultar el campo de "otros" si estaba visible
        const otherContainer = document.getElementById('other_company_type_container');
        otherContainer.style.display = 'none';
        
    } catch (error) {
        console.error('Error:', error);
        showValidationError(error.message || 'Error al crear la compañía');
    }
});

// Función para validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validación en tiempo real para el número de empleados
document.getElementById('num_employees').addEventListener('input', function(e) {
    const value = parseInt(e.target.value);
    if (value < 1) {
        e.target.setCustomValidity('El número debe ser mayor a 0');
    } else {
        e.target.setCustomValidity('');
    }
});

// Función para manejar el campo de "otros" en tipo de compañía
document.getElementById('company_type').addEventListener('change', function(e) {
    const otherContainer = document.getElementById('other_company_type_container');
    const otherInput = document.getElementById('other_company_type');
    
    if (e.target.value === 'OTROS') {
        otherContainer.style.display = 'block';
        otherInput.required = true;
    } else {
        otherContainer.style.display = 'none';
        otherInput.required = false;
        otherInput.value = '';
    }
});

// Función para mostrar errores de validación
function showValidationError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Remover cualquier mensaje de error anterior
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Insertar el nuevo mensaje de error después del formulario
    const form = document.getElementById('createCompanyForm');
    form.parentNode.insertBefore(errorDiv, form.nextSibling);
    
    // Remover el mensaje después de 5 segundos
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}
