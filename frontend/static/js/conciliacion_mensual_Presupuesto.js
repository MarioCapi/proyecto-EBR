async function initConciliation(nit_actual) {
    //console.log('Iniciando carga de datos de presupuesto...');
    try {
        const { mes, anio } = obtenerMesAnteriorYAñoActual();
        const params = {
            NIT_Empresa: nit_actual,
            Anio: anio,
            Mes: '1'  // TODO solo por pruebas se deja mes 1
        };
        const API_URL = "http://127.0.0.1:8080/ConciliationMonthly_vs_budget";
        const API_URL_Expenses = "http://127.0.0.1:8080/ConciliationMonthly_vs_Expenses";
        const API_URL_Cost = "http://127.0.0.1:8080/ConciliationMonthly_vs_Cost";

        const apiCalls = [
            fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params)
            }),
            fetch(API_URL_Expenses, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params)
            }),
            fetch(API_URL_Cost, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params)
            })
        ];

         // Ejecuta las llamadas en paralelo
        const responses = await Promise.all(apiCalls);

         // Verifica si alguna de las respuestas no fue exitosa
        for (const response of responses) {
            if (!response.ok) {
                const error = await response.json();
                //alert(error.message || "Error en una de las solicitudes");
                return;
            }
        }


        // Procesa las respuestas JSON
        const results = await Promise.all(responses.map(response => response.json()));

         // Maneja los resultados
         if (results && results.length === 3) {
            const [resultBudget, resultExpenses, resultCost] = results;

            // Realiza acciones con cada resultado
            populateComparativeTable(resultBudget);
            populateComparativeTable_cost(resultCost);
            populateComparativeTable_expenses(resultExpenses);
            /*console.log("Datos de presupuesto:", resultBudget);
            console.log("Datos de gastos:", resultExpenses);
            console.log("Datos de costos:", resultCost);*/
        }



        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params)
        });
        if (!response.ok) {
            alert(result.message || "Aun no se ha generado presupuesto para este año");
            return;
        }
        const result = await response.json();

        if (result) {  
            populateComparativeTable(result);          
            const si = result.message;
        }
    } catch (error) {
        //console.error('Error al obtener datos:', error);
    }
}
function obtenerMesAnteriorYAñoActual() {
    const fechaActual = new Date();
    let mes = fechaActual.getMonth(); // Obtiene el mes actual (0 = enero, 11 = diciembre)
    let anio = fechaActual.getFullYear();
    if (mes === 0) {
        mes = 12; // Diciembre
        //anio -= 1; // Año anterior
    }
    return {
        mes: mes, // Retorna el mes anterior (1 = enero, 12 = diciembre)
        anio: anio // Retorna el año correspondiente
    };
}

function populateComparativeTable(result) {
    // Verificar que result tenga datos válidos
    if (!result || !result.data || !Array.isArray(result.data)) {
        console.error("Datos inválidos para llenar la tabla.");
        return;
    }

    const tableBody = document.querySelector("#ComparativeMonthlyConciliation tbody");
    tableBody.innerHTML = ""; // Limpiar la tabla antes de llenarla

    result.data.forEach(row => {
        const tableRow = document.createElement("tr");

        // Crear celdas para cada campo
        const codigoCuentaCell = document.createElement("td");
        codigoCuentaCell.textContent = row.CodigoCuenta;

        const nombreCuentaCell = document.createElement("td");
        nombreCuentaCell.textContent = row.NombreCuenta;

        const valorPresupuestoCell = document.createElement("td");
        valorPresupuestoCell.textContent = row.ValorPresupuesto.toLocaleString("es-CO");

        const valorMesActualCell = document.createElement("td");
        valorMesActualCell.textContent = row.TotalIngreso.toLocaleString("es-CO");

        const diferenciaCell = document.createElement("td");
        diferenciaCell.textContent = row.Diferencia.toLocaleString("es-CO");

        const porcentajeCell = document.createElement("td");
        porcentajeCell.textContent = `${row.PorcentajeDiferencia.toFixed(2)}%`;

        const resultadoCell = document.createElement("td");
        resultadoCell.textContent = row.Resultado;

        // Aplicar estilos basado en el porcentaje
        if (row.PorcentajeDiferencia < 0) {
            porcentajeCell.style.color = "red";
            resultadoCell.style.color = "red";
        } else {
            porcentajeCell.style.color = "green";
            resultadoCell.style.color = "green";
        }

        // Agregar celdas a la fila
        tableRow.appendChild(codigoCuentaCell);
        tableRow.appendChild(nombreCuentaCell);
        tableRow.appendChild(valorPresupuestoCell);
        tableRow.appendChild(valorMesActualCell);
        tableRow.appendChild(diferenciaCell);
        tableRow.appendChild(porcentajeCell);
        tableRow.appendChild(resultadoCell);

        // Agregar fila al cuerpo de la tabla
        tableBody.appendChild(tableRow);
    });
}




function populateComparativeTable_expenses(result) {
    // Verificar que result tenga datos válidos
    if (!result || !result.data || !Array.isArray(result.data)) {
        console.error("Datos inválidos para llenar la tabla.");
        return;
    }

    const tableBody = document.querySelector("#ComparativeMonthlyConciliation_expenses tbody");
    tableBody.innerHTML = ""; // Limpiar la tabla antes de llenarla

    result.data.forEach(row => {
        const tableRow = document.createElement("tr");

        // Crear celdas para cada campo
        const codigoCuentaCell = document.createElement("td");
        codigoCuentaCell.textContent = row.CodigoCuenta;

        const nombreCuentaCell = document.createElement("td");
        nombreCuentaCell.textContent = row.NombreCuenta;

        const valorPresupuestoCell = document.createElement("td");
        valorPresupuestoCell.textContent = row.ValorPresupuesto.toLocaleString("es-CO");

        const valorMesActualCell = document.createElement("td");
        valorMesActualCell.textContent = row.TotalIngreso.toLocaleString("es-CO");

        const diferenciaCell = document.createElement("td");
        diferenciaCell.textContent = row.Diferencia.toLocaleString("es-CO");

        const porcentajeCell = document.createElement("td");
        porcentajeCell.textContent = `${row.PorcentajeDiferencia.toFixed(2)}%`;

        const resultadoCell = document.createElement("td");
        resultadoCell.textContent = row.Resultado;

        // Aplicar estilos basado en el porcentaje
        if (row.PorcentajeDiferencia < 0) {
            porcentajeCell.style.color = "red";
            resultadoCell.style.color = "red";
        } else {
            porcentajeCell.style.color = "green";
            resultadoCell.style.color = "green";
        }

        // Agregar celdas a la fila
        tableRow.appendChild(codigoCuentaCell);
        tableRow.appendChild(nombreCuentaCell);
        tableRow.appendChild(valorPresupuestoCell);
        tableRow.appendChild(valorMesActualCell);
        tableRow.appendChild(diferenciaCell);
        tableRow.appendChild(porcentajeCell);
        tableRow.appendChild(resultadoCell);

        // Agregar fila al cuerpo de la tabla
        tableBody.appendChild(tableRow);
    });
}





function populateComparativeTable_cost(result) {
    // Verificar que result tenga datos válidos
    if (!result || !result.data || !Array.isArray(result.data)) {
        console.error("Datos inválidos para llenar la tabla.");
        return;
    }

    const tableBody = document.querySelector("#ComparativeMonthlyConciliation_cost tbody");
    tableBody.innerHTML = ""; // Limpiar la tabla antes de llenarla

    result.data.forEach(row => {
        const tableRow = document.createElement("tr");

        // Crear celdas para cada campo
        const codigoCuentaCell = document.createElement("td");
        codigoCuentaCell.textContent = row.CodigoCuenta;

        const nombreCuentaCell = document.createElement("td");
        nombreCuentaCell.textContent = row.NombreCuenta;

        const valorPresupuestoCell = document.createElement("td");
        valorPresupuestoCell.textContent = row.ValorPresupuesto.toLocaleString("es-CO");

        const valorMesActualCell = document.createElement("td");
        valorMesActualCell.textContent = row.TotalIngreso.toLocaleString("es-CO");

        const diferenciaCell = document.createElement("td");
        diferenciaCell.textContent = row.Diferencia.toLocaleString("es-CO");

        const porcentajeCell = document.createElement("td");
        porcentajeCell.textContent = `${row.PorcentajeDiferencia.toFixed(2)}%`;

        const resultadoCell = document.createElement("td");
        resultadoCell.textContent = row.Resultado;

        // Aplicar estilos basado en el porcentaje
        if (row.PorcentajeDiferencia < 0) {
            porcentajeCell.style.color = "red";
            resultadoCell.style.color = "red";
        } else {
            porcentajeCell.style.color = "green";
            resultadoCell.style.color = "green";
        }

        // Agregar celdas a la fila
        tableRow.appendChild(codigoCuentaCell);
        tableRow.appendChild(nombreCuentaCell);
        tableRow.appendChild(valorPresupuestoCell);
        tableRow.appendChild(valorMesActualCell);
        tableRow.appendChild(diferenciaCell);
        tableRow.appendChild(porcentajeCell);
        tableRow.appendChild(resultadoCell);

        // Agregar fila al cuerpo de la tabla
        tableBody.appendChild(tableRow);
    });
}
