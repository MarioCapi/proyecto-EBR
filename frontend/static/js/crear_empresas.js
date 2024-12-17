document.getElementById('createCompanyForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Validaciones básicas
    const email = document.getElementById('email').value;
    const numEmployees = document.getElementById('num_employees').value;
    const companyType = document.getElementById('company_type').value;
    const otherCompanyType = document.getElementById('other_company_type').value;

    if (!validateEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }

    if (numEmployees && numEmployees < 1) {
        alert('Number of employees must be greater than 0');
        return;
    }

    if (companyType === 'OTROS' && !otherCompanyType.trim()) {
        alert('Please specify the company type');
        return;
    }

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
        const response = await fetch('/api/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        alert('Company created successfully!');
        console.log(result);
        
        // Limpiar el formulario después de un registro exitoso
        document.getElementById('createCompanyForm').reset();
    } catch (error) {
        alert('Failed to create company: ' + error.message);
        console.error('Error:', error);
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
        e.target.setCustomValidity('Number must be greater than 0');
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
        otherInput.value = ''; // Limpiar el valor cuando se oculta
    }
});
