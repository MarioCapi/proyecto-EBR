
async function initPresupuestoFinal() {
    console.log('Iniciando carga de datos de presupuesto...');
    

    try {
        const params = {
            NIT_Empresa: "901292126" // Reemplaza con el valor real
        };
        const API_URL = "http://127.0.0.1:8080/generate_suggested_budget";
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            console.error('Error en la respuesta de la API:', response.status, response.statusText);
            return;
        }
        const result = await response.json();
        console.log('Datos recibidos:', result);

        if (result && result.dataIngresos) {
            const Ingresos = result.dataIngresos;
            const Costos = result.dataCosto;
            const Gastos = result.dataGasto;
            populateTable(result.dataIngresos)
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
        container.removeChild(spinner); // Ocultar spinner
    }

}
function populateTable(data) {
    const tableBody = document.querySelector('#report-table-final-presupuesto-Ingreso tbody');

    // Agrupar los datos por Nombre_Producto
    const groupedData = data.reduce((acc, item) => {
        if (!acc[item.Nombre_Producto]) {
            acc[item.Nombre_Producto] = Array(12).fill(0); // Inicializar con 12 ceros
        }
        acc[item.Nombre_Producto][item.Mes - 1] = item.Presupuesto_Predicho; // Mes en base 0
        return acc;
    }, {});

     // Inicializar una fila para los totales de cada mes
    const monthlyTotals = Array(12).fill(0);
    let grandTotal = 0;

    // Poblar la tabla
    for (const [productName, monthlyValues] of Object.entries(groupedData)) {
        const total = monthlyValues.reduce((sum, val) => sum + val, 0);

         // Sumar los valores de cada mes a los totales generales
         monthlyValues.forEach((value, index) => {
            monthlyTotals[index] += value;
        });
        grandTotal += total;

        // Crear una nueva fila
        const row = document.createElement('tr');
        
        // Celda para Nombre_Producto
        const productCell = document.createElement('td');
        productCell.textContent = productName;
        row.appendChild(productCell);

        // Celdas para cada mes
        monthlyValues.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value.toLocaleString(); // Formato numérico con separador de miles
            row.appendChild(cell);
        });

        // Celda para Total
       const totalCell = document.createElement('td');
       totalCell.className = 'total-column';
       totalCell.textContent = total.toLocaleString(); // Formato numérico con separador de miles
       row.appendChild(totalCell);

        // Agregar la fila al cuerpo de la tabla
        tableBody.appendChild(row);
    }
    // Crear la fila para los totales de cada mes
    const totalRow = document.createElement('tr');

    // Celda para el título "Total"
    const totalLabelCell = document.createElement('td');
    totalLabelCell.textContent = 'Total';
    totalLabelCell.style.fontWeight = 'bold';
    totalRow.appendChild(totalLabelCell);

    // Celdas para los totales de cada mes
    monthlyTotals.forEach(total => {
        const cell = document.createElement('td');
        cell.textContent = total.toLocaleString(); // Formato numérico con separador de miles
        totalRow.appendChild(cell);
    });

    // Celda para el total general
    const grandTotalCell = document.createElement('td');
    grandTotalCell.className = 'total-column';
    grandTotalCell.textContent = grandTotal.toLocaleString(); // Formato numérico con separador de miles
    grandTotalCell.style.fontWeight = 'bold';
    totalRow.appendChild(grandTotalCell);

    // Agregar la fila de totales al cuerpo de la tabla
    tableBody.appendChild(totalRow);
}

// Llamar a la función con los datos de "result.dataIngresos"
populateTable(result.dataIngresos);





function calcularTotales() {
    const filas = document.querySelectorAll('tbody tr');
    
    filas.forEach(fila => {
        let total = 0;
        const celdas = fila.querySelectorAll('td:not(:first-child):not(:last-child)');
        celdas.forEach(celda => {
            total += parseInt(celda.textContent);
        });
        fila.querySelector('.total-column').textContent = total;
    });
}

    //window.onload = calcularTotales;
    