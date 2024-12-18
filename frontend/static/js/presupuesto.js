// Función para determinar el año a consultar
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

let presupuestoData = null;

// Función principal de inicialización
async function initPresupuesto() {
    console.log('Iniciando carga de datos de presupuesto...');
    const anioConsulta = determinarAnioConsulta();
    const API_URL = `http://127.0.0.1:8080/GenerarReporteIngresos/${anioConsulta}`;


    try {
        console.log('Consultando API para el año:', anioConsulta);
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datos recibidos:', data);
        presupuestoData = data;
        const predictionData = presupuestoData.predictions.data;        
        sessionStorage.setItem('predictionData', JSON.stringify(predictionData));
        if (data && data.data) {
            renderTable(data.data);
            renderChart(data.data);
        } else {
            console.error('No se recibieron datos válidos de la API');
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
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
function renderTable(data) {
    console.log('Renderizando tabla...');
    const tbody = document.querySelector("#report-table tbody");
    if (!tbody) {
        console.error('No se encontró el elemento tbody');
        return;
    }
    
    const formatCurrency = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
    });
    
    tbody.innerHTML = "";
    data.forEach(row => {
        tbody.innerHTML += `
            <tr>
                <td>${row.Anio}</td>
                <td>${row.Mes}</td>
                <td>${row.NombreMes}</td>
                <td>${formatCurrency.format(row.TotalDebito)}</td>
                <td>${formatCurrency.format(row.TotalCredito)}</td>
                <td class="${row.Diferencia >= 0 ? 'positive-amount' : 'negative-amount'}">
                    ${formatCurrency.format(row.Diferencia)}
                </td>
            </tr>
        `;
    });
}

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