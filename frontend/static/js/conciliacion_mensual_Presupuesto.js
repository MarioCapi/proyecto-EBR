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
                alert(error.message || "Aun no se ha generado presupuesto para este año");
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
        //console.error("Datos inválidos para llenar la tabla.");
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
    try {
        //console.log("Iniciando población de tabla...");
        
        // Validación de entrada
        if (!result) {
            throw new Error("No se recibieron datos para poblar la tabla");
        }

        if (!result.data) {
            throw new Error("El objeto result no contiene la propiedad 'data'");
        }

        if (!Array.isArray(result.data)) {
            throw new Error("Los datos recibidos no son un array válido");
        }

        // Validación del DOM
        const tableBody = document.querySelector("#ComparativeMonthlyConciliation_expenses tbody");
        if (!tableBody) {
            throw new Error("No se encontró el elemento tbody en la tabla");
        }

        // Limpiar tabla
        tableBody.innerHTML = "";
        
       // console.log(`Número total de registros a procesar: ${result.data.length}`);
        
        // Crear un fragmento de documento para mejor rendimiento
        const fragment = document.createDocumentFragment();

        result.data.forEach((row, index) => {
            try {
                //console.log(`Procesando registro ${index + 1}`);
                
                // Validación de datos de la fila
                if (!row) {
                    throw new Error(`Fila ${index + 1} es undefined o null`);
                }

                // Validar propiedades requeridas
                const requiredProperties = [
                    'CodigoCuenta', 
                    'NombreCuenta', 
                    'ValorPresupuesto', 
                    'TotalIngreso', 
                    'Diferencia', 
                    'PorcentajeDiferencia', 
                    'Resultado'
                ];

                for (const prop of requiredProperties) {
                    if (!(prop in row)) {
                        throw new Error(`Falta la propiedad '${prop}' en la fila ${index + 1}`);
                    }
                }

                const tableRow = document.createElement("tr");
                tableRow.setAttribute('data-row-index', index);

                // Crear celdas con manejo de errores para cada valor
                const cells = [
                    { 
                        value: row.CodigoCuenta || 'N/A',
                        format: value => value
                    },
                    { 
                        value: row.NombreCuenta || 'N/A',
                        format: value => value
                    },
                    { 
                        value: row.ValorPresupuesto,
                        format: value => {
                            if (typeof value !== 'number') {
                                //console.warn(`ValorPresupuesto no es un número en la fila ${index + 1}`);
                                return '0';
                            }
                            return value.toLocaleString("es-CO");
                        }
                    },
                    { 
                        value: row.TotalIngreso,
                        format: value => {
                            if (typeof value !== 'number') {
                                //console.warn(`TotalIngreso no es un número en la fila ${index + 1}`);
                                return '0';
                            }
                            return value.toLocaleString("es-CO");
                        }
                    },
                    { 
                        value: row.Diferencia,
                        format: value => {
                            if (typeof value !== 'number') {
                                //console.warn(`Diferencia no es un número en la fila ${index + 1}`);
                                return '0';
                            }
                            return value.toLocaleString("es-CO");
                        }
                    },
                    { 
                        value: row.PorcentajeDiferencia,
                        format: value => {
                            if (typeof value !== 'number') {
                                //console.warn(`PorcentajeDiferencia no es un número en la fila ${index + 1}`);
                                return '0%';
                            }
                            return `${value.toFixed(2)}%`;
                        }
                    },
                    { 
                        value: row.Resultado || 'N/A',
                        format: value => value
                    }
                ];

                cells.forEach((cell, cellIndex) => {
                    try {
                        const td = document.createElement("td");
                        td.textContent = cell.format(cell.value);
                        td.setAttribute('data-cell-index', cellIndex);
                        tableRow.appendChild(td);
                    } catch (cellError) {
                       // console.error(`Error al crear celda ${cellIndex} en fila ${index + 1}:`, cellError);
                        const td = document.createElement("td");
                        td.textContent = 'Error';
                        td.style.color = 'red';
                        tableRow.appendChild(td);
                    }
                });

                // Aplicar estilos con manejo de errores
                try {
                    const porcentajeCell = tableRow.children[5];
                    const resultadoCell = tableRow.children[6];
                    
                    if (porcentajeCell && resultadoCell) {
                        const porcentaje = row.PorcentajeDiferencia;
                        if (typeof porcentaje === 'number') {
                            const color = porcentaje < 0 ? "red" : "green";
                            porcentajeCell.style.color = color;
                            resultadoCell.style.color = color;
                        }
                    }
                } catch (styleError) {
                    //console.error(`Error al aplicar estilos en fila ${index + 1}:`, styleError);
                }

                fragment.appendChild(tableRow);
            } catch (rowError) {
                //console.error(`Error al procesar la fila ${index + 1}:`, rowError);
                // Crear una fila de error
                const errorRow = document.createElement("tr");
                const errorCell = document.createElement("td");
                errorCell.colSpan = 7;
                errorCell.textContent = `Error en fila ${index + 1}: ${rowError.message}`;
                errorCell.style.color = 'red';
                errorRow.appendChild(errorCell);
                fragment.appendChild(errorRow);
            }
        });

        // Agregar todas las filas
        tableBody.appendChild(fragment);

        // Verificaciones finales
       // console.log(`Número final de filas en la tabla: ${tableBody.children.length}`);
        
        // Verificar visibilidad de las filas
        setTimeout(() => {
            const rows = tableBody.querySelectorAll('tr');
            rows.forEach((row, index) => {
                const isVisible = row.offsetParent !== null;
                //console.log(`Fila ${index + 1} visible: ${isVisible}`);
            });
        }, 100);

    } catch (error) {
       // console.error("Error general al poblar la tabla:", error);
        // Mostrar mensaje de error en la interfaz
        const tableContainer = document.querySelector(".table-container");
        if (tableContainer) {
            const errorMessage = document.createElement("div");
            errorMessage.className = "error-message";
            errorMessage.style.color = "red";
            errorMessage.style.padding = "10px";
            errorMessage.style.textAlign = "center";
            errorMessage.textContent = `Error al cargar los datos: ${error.message}`;
            tableContainer.appendChild(errorMessage);
        }
    }
}





function populateComparativeTable_cost(result) {
    // Verificar que result tenga datos válidos
    if (!result || !result.data || !Array.isArray(result.data)) {
       // console.error("Datos inválidos para llenar la tabla.");
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
