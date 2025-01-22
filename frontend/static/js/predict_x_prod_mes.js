// Función para determinar el año a consultar
let currentPage_ = 1;
let currentPage_forecast = 1;
const recordsPerPage_ = 7;
//let allResults = []; // Almacena todos los resultados

function mostrarResultadosEnTabla(resultados) {
    allResults = resultados; 
    currentPage_ = 1; // Reinicia a la primera página
    renderTable_products(); // Renderiza la tabla
}
function mostrarForecastTabla(resultados) {
    allResults = resultados;
    currentPage_forecast = 1; 
    renderTable(); // Renderiza la tabla
}


function determinarAnioConsulta() {
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const mes = fechaActual.getMonth() + 1; // getMonth() retorna 0-11
    
    // Si estamos después del 1 de julio (mes >= 7)
    const anioConsulta = mes >= 7 ? anioActual : anioActual - 1;  
    return anioConsulta;
}


// Función principal de inicialización
async function initPresupuesto_x_producto() {
    
    const anioConsulta = determinarAnioConsulta();
    const API_URL_allProducts = "http://127.0.0.1:8080/get_all_list_Products";

    const params = {nit: "901292126"};
    try {
        const response = await fetch(API_URL_allProducts, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            return;
        }
        const products = await response.json();        

        if (products && products.lista) {
            const presupuestoData = products.lista;
            mostrarResultadosEnTabla(presupuestoData);
            
        } else {
            
        }
    } catch (error) {
        
    }
}




async function initPresupuesto_x_producto_forecast(codigoCuenta) {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = 'Realizando la predicción, por favor espere...';
    loadingIndicator.id = 'loading-indicator';
    document.body.appendChild(loadingIndicator); 
    try {
        const params = { nit: "901292126", codigoCuenta: codigoCuenta };
        const API_URL = "http://127.0.0.1:8080/get_for_Product_Prediction_monthly";
        
       


        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            return;
        }

        const result = await response.json();
        

        if (result && result.predicciones) {
            const predictionData = result.predicciones;

            // Construir la tabla HTML
            const tableBody = document.getElementById('report-table-products-forecast-body'); // Asegúrate de que este ID sea correcto
            tableBody.innerHTML = ''; // Limpiar contenido anterior

            predictionData.forEach(item => {
                const date = new Date(item.index); // Convertir el string a objeto Date
                const month = date.toLocaleString('es-CO', { month: 'long' }); // Obtener el nombre del mes en español
                const value = item.value.toLocaleString('es-CO'); // Formatear el valor

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-4 py-2">${month.charAt(0).toUpperCase() + month.slice(1)}</td>
                    <td class="px-4 py-2">${value}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            
        }
    } catch (error) {        
    }finally {        
        setTimeout(() => {
            document.body.removeChild(loadingIndicator);
        }, 1000); // Esperar 1 segundo antes de eliminar
    }
}


// También actualiza la función renderTable para usar el nuevo formato de moneda
function renderTable_products() {
    const reportTableBody = document.querySelector('#report-table-products tbody');
    reportTableBody.innerHTML = ''; 
    // Calcular los índices de inicio y fin
    const start = (currentPage_ - 1) * recordsPerPage_;
    const end = start + recordsPerPage_;
    const paginatedResults = allResults.slice(start, end); 

    paginatedResults.forEach(item => {
        const [codigoCuenta, nombreCuenta] = item;
        const row = document.createElement('tr');
        
        // Agregar un evento de clic a la fila
        row.addEventListener('click', () => {
            const rows = reportTableBody.querySelectorAll('tr');
            rows.forEach(r => r.classList.remove('selected'));
            // Agregar la clase a la fila seleccionada
            initPresupuesto_x_producto_forecast(codigoCuenta)
            row.classList.add('selected');
        });

        row.innerHTML = `
        <td class="px-4 py-2">${codigoCuenta}</td>
        <td class="px-4 py-2">${nombreCuenta}</td>
    `;
        reportTableBody.appendChild(row);
    });

    // Actualizar la información de la página
    document.getElementById('page-info_products').textContent = `Página ${currentPage_} de ${Math.ceil(allResults.length / recordsPerPage_)}`;

    // Habilitar o deshabilitar botones de paginación
    document.getElementById('prev-page_products').disabled = currentPage_ === 1;
    document.getElementById('next-page_products').disabled = currentPage_ === Math.ceil(allResults.length / recordsPerPage_);
}








// También actualiza la función renderTable para usar el nuevo formato de moneda
function renderTable() {
    const reportTableBody = document.querySelector('#report-table tbody');
    reportTableBody.innerHTML = ''; // Limpiar contenido anterior

    // Calcular los índices de inicio y fin
    const start = (currentPage_ - 1) * recordsPerPage_;
    const end = start + recordsPerPage_;
    const paginatedResults = allResults.slice(start, end); // Obtener solo los resultados de la página actual

    paginatedResults.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 py-2">${item.Anio}</td>
            <td class="px-4 py-2">${item.Mes}</td>
            <td class="px-4 py-2">${item.NombreMes}</td>
            <td class="px-4 py-2">${item.TotalDebito.toLocaleString('es-CO')}</td>
            <td class="px-4 py-2">${item.TotalCredito.toLocaleString('es-CO')}</td>
            <td class="px-4 py-2">${item.Diferencia.toLocaleString('es-CO')}</td>
        `;
        reportTableBody.appendChild(row);
    });

    // Actualizar la información de la página
    document.getElementById('page-info').textContent = `Página ${currentPage_} de ${Math.ceil(allResults.length / recordsPerPage_)}`;

    // Habilitar o deshabilitar botones de paginación
    document.getElementById('prev-page').disabled = currentPage_ === 1;
    document.getElementById('next-page').disabled = currentPage_ === Math.ceil(allResults.length / recordsPerPage_);
}

// Agregar eventos a los botones de paginación
document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage_ > 1) {
        currentPage_--;
        renderTable();
    }
});
document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage_ < Math.ceil(allResults.length / recordsPerPage_)) {
        currentPage_++;
        renderTable();
    }
});
document.getElementById('prev-page_products').addEventListener('click', () => {
    if (currentPage_ > 1) {
        currentPage_--;
        renderTable_products();
    }
});
document.getElementById('next-page_products').addEventListener('click', () => {
    if (currentPage_ < Math.ceil(allResults.length / recordsPerPage_)) {
        currentPage_++;
        renderTable_products();
    }
});

function renderChart_forecast_prod(data) {
    
    const ctx = document.getElementById("report-chart");
    if (!ctx) {
        return;
    }

    const labels = data.map(row => `${row.NombreMes} ${row.Anio}`);
    const debitData = data.map(row => row.TotalDebito);
    const creditData = data.map(row => row.TotalCredito);
    const diferenciaData = data.map(row => row.Diferencia);

    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Total Ingreso",
                    data: diferenciaData,
                    borderColor: "#2ecc71",
                    backgroundColor: "rgba(46, 204, 113, 0.1)",
                    borderWidth: 2,
                    pointBackgroundColor: "#2ecc71",
                    pointRadius: 4,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Reporte de Ingresos ${determinarAnioConsulta()}`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    position: 'top',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#2c3e50',
                    bodyColor: '#2c3e50',
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('es-CO', {
                                    style: 'currency',
                                    currency: 'COP'
                                }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                                minimumFractionDigits: 0
                            }).format(value);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Exponer la función de inicialización globalmente
window.initPresupuesto_x_producto = initPresupuesto_x_producto;

// También mantener el evento DOMContentLoaded por si se necesita
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('report-container')) {
        initPresupuesto_x_producto();
    }
});