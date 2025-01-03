
async function initPresupuestoFinal() {
    console.log('Iniciando carga de datos de presupuesto...');
    const anioConsulta = determinarAnioConsulta();
    const API_URL = "http://127.0.0.1:8080/get_Gastos_Costos";

    const params = {
        anio: anioConsulta,
        nit: "901292126" // Reemplaza con el valor real
    };

}
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
    