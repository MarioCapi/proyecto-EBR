document.addEventListener("DOMContentLoaded", async () => {
    const UrlAPIUpload = 'http://127.0.0.1:8080/GenerarReporteIngresos/';

    // Fetch data from API
    const fetchData = async () => {
        const response = await fetch(API_URL);
        if (!response.ok) {
            console.error("Error al obtener datos:", response.statusText);
            return [];
        }
        return await response.json();
    };

    // Render data in the table
    const renderTable = (data) => {
        const tbody = document.querySelector("#report-table tbody");
        tbody.innerHTML = "";
        data.forEach(row => {
            tbody.innerHTML += `
                <tr>
                    <td>${row.Anio}</td>
                    <td>${row.Mes}</td>
                    <td>${row.NombreMes}</td>
                    <td>${row.TotalDebito.toFixed(2)}</td>
                    <td>${row.TotalCredito.toFixed(2)}</td>
                    <td>${row.Diferencia.toFixed(2)}</td>
                </tr>
            `;
        });
    };

    // Render chart
    const renderChart = (data) => {
        const ctx = document.getElementById("report-chart").getContext("2d");
        const labels = data.map(row => `${row.NombreMes} ${row.Anio}`);
        const debitData = data.map(row => row.TotalDebito);
        const creditData = data.map(row => row.TotalCredito);

        new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Total Débito",
                        data: debitData,
                        borderColor: "#00ff00",
                        fill: false
                    },
                    {
                        label: "Total Crédito",
                        data: creditData,
                        borderColor: "#ff0000",
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true
            }
        });
    };

    // Fetch and render data
    const data = await fetchData();
    renderTable(data.data);
    renderChart(data.data);
});
