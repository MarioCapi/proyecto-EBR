// Función para determinar el año a consultar
let currentPage = 1;
const recordsPerPage = 7;
let allResults = []; // Almacena todos los resultados

function mostrarResultadosEnTabla_presupuesto(resultados) {
    const reportTableBody = document.querySelector('#report-table tbody'); // Asegúrate de que este selector sea correcto

    // Verificar si el elemento de la tabla existe
    if (!reportTableBody) {
        console.error('El elemento de la tabla no se encontró.');
        return; // Salir de la función si el elemento no existe
    }

    // Limpiar el contenido anterior
    reportTableBody.innerHTML = '';


    allResults = resultados; // Almacena todos los resultados
    currentPage = 1; // Reinicia a la primera página
    renderTable(); // Renderiza la tabla
}


function determinarAnioConsulta() {
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const mes = fechaActual.getMonth() + 1; // getMonth() retorna 0-11
    
    // Si estamos después del 1 de julio (mes >= 7)
    const anioConsulta = mes >= 7 ? anioActual : anioActual - 1;
    
    console.log('Fecha actual:', fechaActual.toLocaleDateString());
    console.log('Mes actual:', mes);
    console.log('Año a consultar:', anioConsulta);
    
    return anioConsulta;
}


// Función principal de inicialización
async function initPresupuesto(tax_id) {
    console.log('Iniciando carga de datos de presupuesto...');
    const anioConsulta = determinarAnioConsulta();
    const API_URL = "http://127.0.0.1:8080/GenerarReporteIngresos";

    const params = {
        anio: anioConsulta,
        nit: tax_id // Reemplaza con el valor real
    };

    // Mostrar spinner y mensaje
    const spinner = document.createElement('div');
    spinner.className = 'spinner'; // asegurar los estilos CSS para el  '.spinner'
    const message = document.createElement('p');
    message.textContent = "Estamos procesando las predicciones. Esto puede tomar algunos minutos...";
    const container = document.getElementById('loading-container');
    if (!container) {
        console.error('El contenedor "loading-container" no existe en el DOM.');
        return;
    }
    container.innerHTML = ''; // Limpiar el contenedor
    container.appendChild(spinner);
    container.appendChild(message);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            //console.error('Error en la respuesta de la API:', response.status, response.statusText);
            message.textContent = "Hubo un error al procesar. Por favor, intenta nuevamente.";
            container.removeChild(spinner); // Ocultar spinner
            return;
        }

        const result = await response.json();
        console.log('Datos recibidos:', result);

        if (result && result.data) {
            const presupuestoData = result.data;   // presupuesto actual consolidado para cada mes con la diferencia entre debito y credito
            const predictionData = result.predictions; // las prediccioens del presupuesto para el año siguiente

            // Guardar predicciones en el sessionStorage
            sessionStorage.setItem('predictionData', JSON.stringify(predictionData.data));

            // Ocultar spinner y mensaje
            container.innerHTML = '';

            // Renderizar tabla y gráfico
            mostrarResultadosEnTabla_presupuesto(presupuestoData);
            renderChart(presupuestoData);
        } else {
            console.error('No se recibieron datos válidos de la API');
            message.textContent = "No se recibieron datos válidos. Por favor, revisa los parámetros.";
            container.removeChild(spinner); // Ocultar spinner
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
        message.textContent = "Ocurrió un error inesperado. Por favor, intenta más tarde.";
        container.removeChild(spinner); // Ocultar spinner
    }
}

// Evento click del botón de predicción
function setupPredictionButton() {
    const generatePredictionBtn = document.getElementById('generatePredictionBtn');
    if (generatePredictionBtn) {
        generatePredictionBtn.addEventListener('click', function() {
            if (presupuestoData?.predictions?.data) {
                // Guardar solo los datos relevantes de predicción
                const predictionData = presupuestoData.predictions.data;
                sessionStorage.setItem('predictionData', JSON.stringify(predictionData));
                window.location.href = 'PrediccionesPresupuesto.html';
            } else {
                console.error('No hay datos de predicción disponibles');
                alert('No hay datos de predicción disponibles en este momento');
            }
        });
    }
}


// También actualiza la función renderTable para usar el nuevo formato de moneda
function renderTable() {
    const reportTableBody = document.querySelector('#report-table tbody');
    reportTableBody.innerHTML = ''; // Limpiar contenido anterior

    // Calcular los índices de inicio y fin
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    const paginatedResults = allResults.slice(start, end); // Obtener solo los resultados de la página actual

    paginatedResults.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 py-2">${item.Anio}</td>
            <td class="px-4 py-2">${item.Mes}</td>
            <td class="px-4 py-2">${item.NombreMes}</td>
            <td class="px-4 py-2 text-center">${item.Diferencia.toLocaleString('es-CO')}</td>
        `;
        reportTableBody.appendChild(row);
    });

    // Actualizar la información de la página
    document.getElementById('page-info').textContent = `Página ${currentPage} de ${Math.ceil(allResults.length / recordsPerPage)}`;

    // Habilitar o deshabilitar botones de paginación
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === Math.ceil(allResults.length / recordsPerPage);
}

// Agregar eventos a los botones de paginación
document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < Math.ceil(allResults.length / recordsPerPage)) {
        currentPage++;
        renderTable();
    }
});

function renderChart(data) {
    console.log('Renderizando gráfico...');
    const ctx = document.getElementById("report-chart");
    if (!ctx) {
        console.error('No se encontró el elemento canvas');
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

// Modificar el evento click del botón en el archivo original
document.getElementById('generatePredictionBtn').addEventListener('click', function() {
    // Guardar los datos en sessionStorage
    sessionStorage.setItem('predictionData', JSON.stringify(presupuestoData));
    // Redirigir a la página de predicciones
    window.location.href = 'PrediccionesPresupuesto.html';
});

// Exponer la función de inicialización globalmente
window.initPresupuesto = initPresupuesto;

// También mantener el evento DOMContentLoaded por si se necesita
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('report-container')) {
        initPresupuesto();
        setupPredictionButton();
    }
});