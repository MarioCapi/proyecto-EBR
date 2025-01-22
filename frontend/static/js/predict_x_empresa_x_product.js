// Función para determinar el año a consultar
let recordsPerPage_predicted = 1;
let predicted;
const recordsPerPage_ = 12; // Número de registros por página



// Función principal de inicialización
//let tax_id_rec
async function init_get_prediction_x_producto(tax_id) {    
    const API_URL_GetPredict_Products = "http://127.0.0.1:8080/Get_pred_empresa_producto";

    const params = {nit: tax_id};
    try {
        const response = await fetch(API_URL_GetPredict_Products, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            
            return;
        }
        predicted = await response.json();        

        if (predicted) {
            renderTable_products(predicted,recordsPerPage_predicted);
            renderChart(predicted, null, null); // Renderiza todos los datos inicialmente
            populateFilters(predicted);

            document.getElementById("filterButton").addEventListener("click", () => {
                const codigoProducto = document.getElementById("codigoProducto").value;
                const anio = parseInt(document.getElementById("anio").value);
                renderChart(predicted, codigoProducto, anio); // Actualiza la gráfica con los filtros seleccionados
            });

            
        } else {
           
        }
    } catch (error) {
        
    }
}

// También actualiza la función renderTable para usar el nuevo formato de moneda
function renderTable_products(predicted, page = 1) {

    const tbody = document.querySelector("#report-table-products tbody");
    // Limpiar el contenido del tbody
    tbody.innerHTML = '';
    const startIndex = (page - 1) * recordsPerPage_;
    const endIndex = startIndex + recordsPerPage_;

    const paginatedData = predicted.data.slice(startIndex, endIndex);
    // Iterar sobre los datos y crear filas
    paginatedData.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="px-4 py-2">${item.Nombre_Producto}</td>
            <td class="px-4 py-2">${item.Año}</td>
            <td class="px-4 py-2">${getMonthName(item.Mes)}</td> <!-- Usar el nombre del mes -->
            <td class="px-4 py-2">${formatCurrency(item.Presupuesto_Predicho)}</td> <!-- Formatear aquí -->
        `;
        

        row.addEventListener("click", () => {
            const codigoProducto = item.Codigo_Producto;
            const anio = item.Año;
            renderChart(predicted, codigoProducto, anio);
        });

        tbody.appendChild(row);
    });
    updatePaginationControls(predicted.data.length, page);
}

function updatePaginationControls(totalRecords, page) {
    const totalPages = Math.ceil(totalRecords / recordsPerPage_);
    const pageInfo = document.getElementById("page-info_products");
    const prevButton = document.getElementById("prev-page_products_predict");
    const nextButton = document.getElementById("next-page_products__predict");

    pageInfo.textContent = `Página ${page} de ${totalPages}`;

    prevButton.disabled = page === 1;
    nextButton.disabled = page === totalPages;
}

document.getElementById("prev-page_products_predict").addEventListener("click", () => {
    if (recordsPerPage_predicted > 1) {
        recordsPerPage_predicted--;
        renderTable_products(predicted, recordsPerPage_predicted);
    }
});

document.getElementById("next-page_products__predict").addEventListener("click", () => {
    const totalPages = Math.ceil(predicted.data.length / recordsPerPage_);
    if (recordsPerPage_predicted < totalPages) {
        recordsPerPage_predicted++;
        renderTable_products(predicted, recordsPerPage_predicted);
    }
});
















// Función para poblar los filtros
function populateFilters(predicted) {
    const codigoProductoSelect = document.getElementById("codigoProducto");
    const anioSelect = document.getElementById("anio");
    const productos = new Map(); // Usar un mapa para almacenar Codigo_Producto y Nombre_Producto
    const anios = new Set();

    predicted.data.forEach(item => {
        productos.set(item.Codigo_Producto, item.Nombre_Producto); // Almacenar el par Codigo_Producto - Nombre_Producto
        anios.add(item.Año);
    });

    // Población del select de productos
    productos.forEach((nombre, codigo) => {
        const option = document.createElement("option");
        option.value = codigo; // Usar Codigo_Producto como valor
        option.textContent = nombre; // Usar Nombre_Producto como texto
        codigoProductoSelect.appendChild(option);
    });


    anios.forEach(anio => {
        const option = document.createElement("option");
        option.value = anio;
        option.textContent = anio;
        anioSelect.appendChild(option);
    });
}













// Función para renderizar la gráfica
function renderChart(predicted, codigoProducto, anio) {
    const anioNumber = parseInt(anio, 10); // Convertir a número si es necesario
    const filteredData = predicted.data.filter(item => {
        const codigoMatch = codigoProducto ? item.Codigo_Producto.trim() === codigoProducto.trim() : true; // Comparar sin espacios
        const anioMatch = anioNumber ? item.Año === anioNumber : true; // Comparar como número        
        return codigoMatch && anioMatch; // Retornar verdadero si ambos coinciden
    });

    if (filteredData.length === 0) {
        alert("No hay datos disponibles para el Código de Producto y Año seleccionados.");
        return;
    }

    const labels = filteredData.map(item => getMonthName(item.Mes)); // Usar el nombre del mes
    const data = filteredData.map(item => item.Presupuesto_Predicho);
    const productos = filteredData.map(item => item.Nombre_Producto);

    const ctx = document.getElementById('predictionsChart').getContext('2d');

    // Asignar colores únicos por Código_Producto
    const colorMap = {};
    filteredData.forEach(item => {
        if (!colorMap[item.Codigo_Producto]) {
            colorMap[item.Codigo_Producto] = getRandomColor(); // Generar un color nuevo si no existe
        }
    });

    const colors = filteredData.map(item => colorMap[item.Codigo_Producto]);

    if (window.chart) {
        window.chart.destroy();
    }

    window.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Presupuesto Predicho',
                data: data,
                backgroundColor: colors, // Usar colores únicos por Código_Producto
                borderColor: colors.map(color => color.replace(/0.5/, '1')), // Color del borde
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: (tooltipItems) => {
                            const index = tooltipItems[0].dataIndex;
                            return productos[index]; // Mostrar Nombre_Producto en el tooltip
                        },
                        label: (tooltipItem) => {
                            const presupuesto = tooltipItem.raw; // Presupuesto_Predicho
                            return `Presupuesto: ${formatCurrency(presupuesto)}`; // Formatear el presupuesto
                        }
                    }
                }
            }
        }
    });
}




















function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, 0.5)`; // Color con opacidad
}

function getMonthName(monthNumber) {
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return monthNames[monthNumber - 1]; // Restar 1 porque los índices de los arrays comienzan en 0
}
function formatCurrency(value) {
    return new Intl.NumberFormat('es-ES', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}



// Exponer la función de inicialización globalmente
window.init_get_prediction_x_producto = init_get_prediction_x_producto;

// También mantener el evento DOMContentLoaded por si se necesita
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('report-container')) {
        init_get_prediction_x_producto();       
    }
});