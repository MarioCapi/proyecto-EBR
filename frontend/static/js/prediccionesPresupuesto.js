// predicciones.js

function initPredictions(data) {
    console.log('Iniciando renderizado de predicciones:', data);

    try {
        // Actualizar métricas
        if (data.metricas) {
            document.getElementById('yearRange').textContent = `Rango: ${data.metricas.rango_años}`;
            document.getElementById('totalMonths').textContent = `${data.metricas.total_meses_analizados} meses analizados`;
            document.getElementById('generationDate').textContent = `Generado: ${data.metricas.fecha_generacion}`;
        }

        // Renderizar tabla y gráfico
        if (data.predicciones_mensuales) {            
            renderPredictionsTable(data);
            renderPredictionsChart(data);
        }
    } catch (error) {
        console.error('Error en initPredictions:', error);
    }
}

function renderPredictionsTable(data) {
    try {
        console.log('Renderizando tabla con datos:', data);
        const tbody = document.querySelector('#predictionsTable tbody');
        if (!tbody) {
            console.error('No se encontró el elemento tbody');
            return;
        }
        tbody.innerHTML = '';

        if (!data.predicciones_mensuales) {
            console.error('No hay datos de predicciones mensuales');
            return;
        }

        Object.entries(data.predicciones_mensuales).forEach(([mes, metricas]) => {
            Object.entries(metricas).forEach(([metrica, valores]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${mes}</td>                    
                    <td>${formatCurrency(valores.valor_predicho)}</td>
                    <td class="${valores.tendencia === 'incremento' ? 'trend-up' : 'trend-down'}">
                        <i class="fas fa-${valores.tendencia === 'incremento' ? 'arrow-up' : 'arrow-down'}"></i>
                        ${valores.tendencia}
                    </td>
                    <td>${formatCurrency(valores.coeficiente)}</td>
                `;
                tbody.appendChild(row);
            });
        });
    } catch (error) {
        console.error('Error en renderPredictionsTable:', error);
    }
}

function renderPredictionsChart(data) {
    try {
        console.log('Renderizando gráfico con datos:', data);
        const ctx = document.getElementById('predictionsChart');
        if (!ctx) {
            console.error('No se encontró el elemento canvas');
            return;
        }

        if (!data.predicciones_mensuales) {
            console.error('No hay datos para el gráfico');
            return;
        }
        
        const meses = Object.keys(data.predicciones_mensuales);
        const datasets = [
            {
                label: 'Total Ingreso',
                data: meses.map(mes => data.predicciones_mensuales[mes].Diferencia.valor_predicho),
                borderColor: '#5d7ec9',
                backgroundColor: 'rgba(93, 126, 201, 0.1)',
                tension: 0.4
            }
        ];

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: meses,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Predicciones para ${data.anio_prediccion}`,
                        font: { size: 16 }
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => formatCurrency(value)
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error en renderPredictionsChart:', error);
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(value);
}

document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('Iniciando carga de predicciones...');
        const predictionData = JSON.parse(sessionStorage.getItem('predictionData'));
        console.log('Datos recuperados:', predictionData);
        
        if (predictionData && 
            predictionData.predictions.data.predicciones_mensuales && 
            predictionData.predictions.data.metricas) {
            initPredictions(predictionData);
        } else {
            console.error('Datos de predicción incompletos:', predictionData);
            alert('Los datos de predicción están incompletos');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error al inicializar predicciones:', error);
    }
});
