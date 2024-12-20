// predicciones.js
let presupuestoData = null;
function initPredictions(data) {
    console.log('Iniciando renderizado de predicciones:', data);

    try {
        // Actualizar métricas
        if (data.metricas) {
            presupuestoData = data;
            Predict_Presupuesto = data.metricas.TotalPrediccion;
            Predict_Presupuesto = Predict_Presupuesto.toLocaleString('es-Co');
            document.getElementById('yearRange').textContent = `Rango: ${data.metricas.rango_años}`;
            document.getElementById('totalMonths').textContent = `${data.metricas.total_meses_analizados} meses analizados`;
            document.getElementById('TotalPrediccionPresupuesto').textContent = `Presupuesto: ${Predict_Presupuesto}`;
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
                    <td data-original-value="${valores.valor_predicho}">${formatCurrency(valores.valor_predicho)}</td>
                    <td class="${valores.tendencia === 'incremento' ? 'trend-up' : 'trend-down'}">
                        <i class="fas fa-${valores.tendencia === 'incremento' ? 'arrow-up' : 'arrow-down'}"></i>
                        ${valores.tendencia}
                    </td>
                    <td data-original-value="${valores.coeficiente}">${formatCurrency(valores.coeficiente)}</td>
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




async function GuardaPrediccionPresupuesto(data) {
    const API_URL = "http://127.0.0.1:8080/GuardaPrediccionPresupuesto_x_empresa";
    const Nit_Empresa = '901292126'; // NIT de la empresa

    const tbody = document.querySelector('#predictionsTable tbody');
    if (!tbody || tbody.rows.length === 0) {
        alert('No hay datos en la tabla para guardar.');
        return;
    }

    const predicciones = [];

    // Recorrer las filas de la tabla y extraer los datos
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const mes = row.cells[0].textContent; // el mes está en la primera celda
        const valorPredicho = parseCurrency(row.cells[1].textContent); //  el valor predicho está en la segunda celda
        const tendencia = row.cells[2].textContent.trim(); //la tendencia está en la tercera celda
        const coeficiente = parseCurrency(row.cells[3].textContent); // Suponiendo que el coeficiente está en la cuarta celda

        // Agregar los datos a la lista de predicciones
        predicciones.push({
            mes,
            valorPredicho,
            tendencia,
            coeficiente
        });
    });


    try {
        const { anio_prediccion, predicciones_mensuales, metricas } = data;

        // Mapa de meses en inglés a español
        const monthMap = {
            "January": "ENERO",
            "February": "FEBRERO",
            "March": "MARZO",
            "April": "ABRIL",
            "May": "MAYO",
            "June": "JUNIO",
            "July": "JULIO",
            "August": "AGOSTO",
            "September": "SEPTIEMBRE",
            "October": "OCTUBRE",
            "November": "NOVIEMBRE",
            "December": "DICIEMBRE"
        };

        // Iterar sobre las predicciones mensuales
        for (const [mes, valores] of Object.entries(predicciones)) {
            const prediccion = valores;

            // Preparar los datos a enviar
            const params = {
                Nit_Empresa: Nit_Empresa,
                Anio_Prediccion: anio_prediccion, 
                Mes: prediccion.mes.toUpperCase(), 
                Valor_Predicho: parseFloat(prediccion.valorPredicho), // debe ser un número
                Tendencia: prediccion.tendencia.toUpperCase(), // la tendencia esté en mayúsculas
                Coeficiente_Diferencia: parseFloat(prediccion.coeficiente) // debe ser un número
            };

            console.log('Datos a enviar:', JSON.stringify(params, null, 2));
            // Enviar solicitud POST a la API
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                const errorResponse = await response.json(); // Obtener el cuerpo de la respuesta de error
                console.error(
                    `Error al guardar la predicción del mes ${mes}:`,
                    response.status,
                    response.statusText,
                    errorResponse // Mostrar el mensaje de error del servidor
                );
                continue;
            }
            const result = await response.json();
            //console.log(`Predicción del mes ${mes} guardada exitosamente:`, result);
        }

        // Mostrar información de métricas
        //console.log('Métricas:', metricas);
        alert('Predicciones Guardadas exitosamente.')

    } catch (error) {
        console.error('Error al guardar predicciones:', error);
    }
}
function parseCurrency(value) {
    // Eliminar el símbolo de la moneda y los espacios
    value = value.replace(/[$\s]/g, ''); // Eliminar el símbolo de la moneda y espacios
    // Reemplazar el punto por nada (para miles) y la coma por un punto (para decimales)
    value = value.replace(/\./g, '').replace(/,/g, '.');
    return parseFloat(value);
}

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Recuperar los datos de predicción almacenados en sessionStorage
        const predictionData = JSON.parse(sessionStorage.getItem('predictionData'));
        console.log('Datos recuperados:', predictionData);
        // Verificar que los datos de predicción están completos
        if (predictionData && 
            predictionData.predictions && 
            predictionData.predictions.data && 
            predictionData.predictions.data.predicciones_mensuales && 
            predictionData.predictions.data.metricas) {
            initPredictions(predictionData);
        } else {
            // Si los datos están incompletos, mostrar error y redirigir
            console.error('Datos de predicción incompletos:', predictionData);
            alert('Los datos de predicción están incompletos');
            window.location.href = 'index.html';
        }

    } catch (error) {
        console.error('Error al inicializar predicciones:', error);
    }
});
const savePredictionContainer = document.getElementById('savePredictionContainer');
    savePredictionContainer.classList.remove('hidden'); // Asegúrate de que el botón esté visible

    // Agregar el evento de clic al botón para guardar las predicciones
    const savePredictionButton = document.getElementById('savePredictionButton');
    if (savePredictionButton) {

        savePredictionButton.addEventListener('click', async () => {
        console.log('Botón de guardar predicción clickeado');  // Depuración

        // Llamar a la función GuardaPrediccionPresupuesto con los datos completos
        try {            
            await GuardaPrediccionPresupuesto(presupuestoData);
        } catch (error) {
            console.error('Error al guardar predicción:', error);
        }
    });
    } else {
        console.error('El botón de guardar predicción no se encontró en el DOM');
    }

