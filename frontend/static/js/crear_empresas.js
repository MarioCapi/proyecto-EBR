const UrlError_log = 'http://127.0.0.1:8080/registerlog/';
const API_URL = 'http://localhost:8080/api';

document.getElementById('createCompanyForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    // Validaciones básicas
    const email = document.getElementById('email').value;
    const numEmployees = document.getElementById('num_employees').value;
    const companyType = document.getElementById('company_type').value;
    const otherCompanyType = document.getElementById('other_company_type').value;
    const taxId = document.getElementById('tax_id').value;
    const taxIdType = document.getElementById('id_type').value;
    const companyName = document.getElementById('company_name').value;

    // Validación de campos requeridos
    if (!companyName.trim()) {
        showValidationError('El nombre de la empresa es requerido');
        return;
    }

    if (!taxId.trim()) {
        showValidationError('El número de identificación fiscal es requerido');
        return;
    }

    if (!validateEmail(email)) {
        showValidationError('Por favor ingrese un email válido');
        return;
    }

    if (numEmployees && numEmployees < 1) {
        showValidationError('El número de empleados debe ser mayor a 0');
        return;
    }

    if (companyType === 'OTROS' && !otherCompanyType.trim()) {
        showValidationError('Por favor especifique el tipo de compañía');
        return;
    }

    // Validación de formato de identificación fiscal según el tipo
    if (!validateTaxId(taxId, taxIdType)) {
        showValidationError('El formato del número de identificación fiscal no es válido');
        return;
    }

    const subscription_type = document.getElementById('subscription_type').value;
    if (!subscription_type) {
        showValidationError('El tipo de suscripción es obligatorio');
        return;
    }

    // Preparar los datos
    const direccion = document.getElementById('address').value || null;
    const telefonoCompany = document.getElementById('phone').value || null;
    const subscription_end_date = document.getElementById('subscription_end_date').value || null;
    const formData = {
        company_name: companyName,
        tax_identification_type: taxIdType,
        tax_id: taxId,
        email: email,
        num_employees: numEmployees ? parseInt(numEmployees) : null,
        company_type: companyType === 'OTROS' ? otherCompanyType : companyType,
        address: direccion,
        phone: telefonoCompany,
        subscription_type: subscription_type,
        subscription_end_date: subscription_end_date || null
    };

    try {
        //console.log('Enviando datos:', formData);

        const paramsLogTrace = {
            user_id: taxId, // el userid
            action_type: "creando Compañia",  //tipo de accion
            action_details: "datos enviados al intentar crear compañia",
            ip_address: "localhost", 
            user_agent: "navegador o dispositivo",
            error: 0, // quiere decir log de trazabilidad
            error_details: "parametros enviados: " + "Nombre Company: " + companyName + " - " +  "taxId: " + taxId + " - " +
            "tipo ID: " + taxIdType + " - " + "cantidad Empleados: " + numEmployees  + " - " +  
            "tipo company: " + companyType + " - " + "direccion: " + direccion  + " - " +  
            "telefonoCompany: " + telefonoCompany + " - " + "subscription_type: " + subscription_type  + " - " + 
            "subscription_end_date: " + subscription_end_date
        };
        fetch(UrlError_log, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(paramsLogTrace)
        });


        
        const API_URL = 'http://localhost:8080/api/companies';
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        //console.log('Respuesta del servidor:', result);

        if (!response.ok) {
            // Manejar diferentes tipos de errores
            if (response.status === 400 && result.detail.includes('tipo de suscripción')) {
                showValidationError('El tipo de suscripción seleccionado no es válido');
            } else if (response.status === 400 && result.detail.includes('subscription_type')) {
                showValidationError('El tipo de suscripción es obligatorio');
            } else if (response.status === 405) {
                showValidationError('Ya existe una empresa con este número de identificación fiscal');
            } else if (response.status === 400) {
                showValidationError(result.detail || 'Datos inválidos. Por favor verifique la información');
            } else if (response.status === 500) {
                showValidationError('Error interno del servidor. Por favor intente más tarde');
            } else {
                throw new Error(result.detail || 'Error al crear la compañía');
            }
            return;
        }

        showMessage('¡Compañía creada exitosamente!', 'success');
        
        // Limpiar el formulario
        document.getElementById('createCompanyForm').reset();
        
        // Ocultar el campo de "otros" si estaba visible
        const otherContainer = document.getElementById('other_company_type_container');
        otherContainer.style.display = 'none';
        
    } catch (error) {
        //console.error('Error completo:', error);        
            const paramsLogError = {
                user_id: taxId, // el userid
                action_type: "createCompanyForm",  //tipo de accion
                action_details: "Error al intentar crear compañia",
                ip_address: "localhost", 
                user_agent: "navegador o dispositivo",
                error: 1, // quiere decir error
                error_details: error.detail || error.message
            };
            fetch(UrlError_log, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paramsLogError)
            });
        showValidationError('Error de conexión: No se pudo conectar con el servidor');
    } finally {
        hideLoader();
    }
});

// Función para validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Función para validar el formato de identificación fiscal
function validateTaxId(taxId, taxIdType) {
    const taxIdPatterns = {
        'NIT': /^\d{9}$/, // Formato NIT: 9 dígitos sin dígito verificador
        'RUC': /^\d{11}$/, // Formato RUC peruano: 11 dígitos
        'CUIT': /^\d{2}-\d{8}-\d{1}$/, // Formato CUIT argentino: 2-8-1 dígitos
        'RFC': /^[A-Z]{4}\d{6}[A-Z0-9]{3}$/, // Formato RFC mexicano
        'RUT': /^\d{8}-[\dK]$/, // Formato RUT chileno
        'CNPJ': /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/ // Formato CNPJ brasileño
    };

    const pattern = taxIdPatterns[taxIdType];
    if (!pattern) return true;  // Si no hay patrón definido, se considera válido

    // Limpiar el taxId de guiones y espacios para el NIT
    const cleanTaxId = taxIdType === 'NIT' ? taxId.replace(/[-\s]/g, '') : taxId;
    
    return pattern.test(cleanTaxId);
}

// Función para mostrar mensajes
function showMessage(message, type = 'info', duration = 5000) {
    const messageContainer = document.querySelector('.message-container') || 
                           createMessageContainer();
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    
    const icon = getIconForType(type);
    
    messageElement.innerHTML = `
        <span class="message-icon">${icon}</span>
        <span class="message-content">${message}</span>
        <span class="message-close">&times;</span>
    `;
    
    messageContainer.appendChild(messageElement);
    
    // Animación de entrada
    messageElement.style.animation = 'slideIn 0.3s ease-out';
    
    // Configurar el botón de cerrar
    const closeButton = messageElement.querySelector('.message-close');
    closeButton.onclick = () => removeMessage(messageElement);
    
    // Auto-remover después del tiempo especificado
    if (duration > 0) {
        setTimeout(() => removeMessage(messageElement), duration);
    }
    
    return messageElement;
}

function createMessageContainer() {
    const container = document.createElement('div');
    container.className = 'message-container';
    document.body.appendChild(container);
    return container;
}

function getIconForType(type) {
    switch(type) {
        case 'success': return '✓';
        case 'error': return '✕';
        case 'warning': return '⚠';
        case 'info': return 'ℹ';
        default: return '';
    }
}

function removeMessage(messageElement) {
    messageElement.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
        messageElement.remove();
        // Limpiar el contenedor si no hay más mensajes
        const container = document.querySelector('.message-container');
        if (container && container.children.length === 0) {
            container.remove();
        }
    }, 300);
}


function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
}

// Modificar las funciones existentes para usar el nuevo sistema de mensajes
function showValidationError(message) {
    showMessage(message, 'error');
}

function showSuccessMessage(message) {
    showMessage(message, 'success');
}

// Agregar tooltips de ayuda para los campos
document.querySelectorAll('input, select').forEach(element => {
    const tooltip = element.getAttribute('data-tooltip');
    if (tooltip) {
        const tooltipSpan = document.createElement('span');
        tooltipSpan.className = 'tooltip';
        tooltipSpan.innerHTML = '?<span class="tooltip-text">' + tooltip + '</span>';
        element.parentNode.insertBefore(tooltipSpan, element.nextSibling);
    }
});

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

// Función para cargar las suscripciones
async function loadSubscriptions() {
    try {
        const response = await fetch(`${API_URL}/subscriptions`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.detail || 'Error al cargar las suscripciones');
        }

        const subscriptionSelect = document.getElementById('subscription_type');
        subscriptionSelect.innerHTML = '<option value="">Seleccione una suscripción *</option>';
        
        if (Array.isArray(result.data)) {
            result.data.forEach(subscription => {
                const option = document.createElement('option');
                option.value = subscription.subscription_name;
                option.textContent = subscription.subscription_name;
                subscriptionSelect.appendChild(option);
            });
        } else {
            throw new Error('La respuesta no contiene un array de suscripciones');
        }
    } catch (error) {
        console.error('Error al cargar las suscripciones:', error);
        const subscriptionSelect = document.getElementById('subscription_type');
        subscriptionSelect.innerHTML = '<option value="">Error al cargar suscripciones</option>';
        subscriptionSelect.disabled = true;
        
        showValidationError('Error al cargar las suscripciones. Por favor recargue la página.');
    }
}

// Agregar este evento al final del archivo
document.addEventListener('DOMContentLoaded', function() {
    loadSubscriptions();
    // ... otros eventos existentes
});