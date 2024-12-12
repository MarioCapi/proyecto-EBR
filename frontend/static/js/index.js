async function fetchPredictions() {
    const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: new FormData(document.querySelector('form'))
    });
    const data = await response.json();
    return data.predicciones;
}

async function renderChart() {
    const predictions = await fetchPredictions();
    const ctx = document.getElementById('lineChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: predictions.length }, (_, i) => i + 1),
            datasets: [{
                label: 'Predicciones',
                data: predictions,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}
renderChart();