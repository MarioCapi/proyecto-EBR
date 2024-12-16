document.getElementById('createCompanyForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita que el formulario se envíe de forma tradicional

    const formData = {
        company_name: document.getElementById('company_name').value,
        tax_id: document.getElementById('tax_id').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        subscription_type: document.getElementById('subscription_type').value,
        subscription_end_date: document.getElementById('subscription_end_date').value || null
    };

    try {
        const response = await fetch('https://your-server-endpoint.com/api/companies', {
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
    } catch (error) {
        alert('Failed to create company: ' + error.message);
        console.error(error);
    }
});
