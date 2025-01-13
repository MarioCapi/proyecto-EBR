
let monthlyTotalsIngresos = [];
let monthlyTotalsGastos = [];
let monthlyTotalsCostos = [];
let resultTotals = []; // Aquí se guardarán los resultados de la resta


async function initPresupuestoFinal() {
    //console.log('Iniciando carga de datos de presupuesto...');
    try {
        const params = {
            NIT_Empresa: "901292126" // Reemplaza con el valor real
        };
        const API_URL = "http://127.0.0.1:8080/generate_suggested_budget";
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            //console.error('Error en la respuesta de la API:', response.status, response.statusText);
            return;
        }
        const result = await response.json();
        //console.log('Datos recibidos:', result);

        if (result && result.dataIngresos) {            
            const Costos = result.dataCosto;
            populateTable(result.dataIngresos)
            populateTableGastos(result.dataGasto)
            populateTableCostos(result.dataCosto)
            calculateResultTotals();
        }
    } catch (error) {
        //console.error('Error al obtener datos:', error);
        container.removeChild(spinner); // Ocultar spinner
    }
}


/*Poblar Costo*/
function populateTableCostos(data) {
    try{
        const tableBody = document.querySelector('#report-table-final-presupuesto-costo tbody');

        // Agrupar los datos por Nombre_Producto
        const groupedData = data.reduce((acc, item) => {
            if (!acc[item.NombreCuenta]) {
                acc[item.NombreCuenta] = {
                    monthlyValues: Array(12).fill(0), // Inicializar con 12 ceros
                    codigoCosto:item.CodigoCuenta 
                };
            }
            acc[item.NombreCuenta].monthlyValues[item.Mes - 1] = item.Costo;
            return acc;
        }, {});

        // Inicializar una fila para los totales de cada mes
        const monthlyTotals = Array(12).fill(0);
        let grandTotal = 0;

        // Poblar la tabla
        for (const [productName, { monthlyValues, codigoCosto }] of Object.entries(groupedData)) {
            const total = monthlyValues.reduce((sum, val) => sum + val, 0);

            // Sumar los valores de cada mes a los totales generales
            monthlyValues.forEach((value, index) => {
                monthlyTotals[index] += value;
            });
            grandTotal += total;

            // Crear una nueva fila
            const row = document.createElement('tr');
            // Celda para Nombre_Producto
            const productCell = document.createElement('td');
            productCell.textContent = productName;
            row.appendChild(productCell);
            // Celdas para cada mes
            monthlyValues.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value.toLocaleString(); // Formato numérico con separador de miles
                row.appendChild(cell);
            });

            // Celda invisible para codigoIngreso
            const codigoCell = document.createElement('td');
            codigoCell.textContent = codigoCosto;
            codigoCell.className = 'hidden-column'; // Clase para ocultar
            row.appendChild(codigoCell);

            // Celda para Total
            const totalCell = document.createElement('td');
            totalCell.className = 'total-column';
            totalCell.textContent = total.toLocaleString(); // Formato numérico con separador de miles
            row.appendChild(totalCell);

            // Agregar la fila al cuerpo de la tabla
            tableBody.appendChild(row);
        }
        // Crear la fila para los totales de cada mes
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row'; // Clase para estilos específicos

        // Celda para el título "Total"
        const totalLabelCell = document.createElement('td');
        totalLabelCell.textContent = 'Total';
        totalLabelCell.style.fontWeight = 'bold';
        totalRow.appendChild(totalLabelCell);

        // Celdas para los totales de cada mes
        monthlyTotals.forEach(total => {
            const cell = document.createElement('td');
            cell.textContent = total.toLocaleString(); // Formato numérico con separador de miles
            totalRow.appendChild(cell);
        });
        // Celda vacía para codigoCosto en la fila de totales
        const codigoTotalCell = document.createElement('td');
        codigoTotalCell.className = 'hidden-column'; // Clase para ocultar
        totalRow.appendChild(codigoTotalCell);

        monthlyTotalsCostos = monthlyTotals;

        // Celda para el total general
        const grandTotalCell = document.createElement('td');
        grandTotalCell.className = 'total-column';
        grandTotalCell.textContent = grandTotal.toLocaleString(); // Formato numérico con separador de miles
        grandTotalCell.style.fontWeight = 'bold';
        totalRow.appendChild(grandTotalCell);

        // Agregar la fila de totales al cuerpo de la tabla
        tableBody.appendChild(totalRow);
    }catch(error){
        console.error('Error: ' , error)
    }
}

/*Poblar los Gastos*/
function populateTableGastos(data) {
    try{
        const tableBody = document.querySelector('#report-table-final-presupuesto-gasto tbody');
        // Agrupar los datos por Nombre_Producto    
        const groupedData = data.reduce((acc, item) => {
            if (!acc[item.CodigoCuenta]) {
                acc[item.CodigoCuenta] = {
                    NombreCuenta: item.NombreCuenta, // Almacenar el NombreCuenta
                    GastosMensuales: Array(12).fill(0), // Inicializar los gastos mensuales con 12 ceros
                };
            }
            acc[item.CodigoCuenta].GastosMensuales[item.Mes - 1] = item.Gasto; // Mes en base 0
            return acc;
        }, {});
        // Inicializar una fila para los totales de cada mes
        const monthlyTotals = Array(12).fill(0);
        let grandTotal = 0;
        // Poblar la tabla
        for (const [codigoCuenta, dataItem] of Object.entries(groupedData)) {
            const { NombreCuenta, GastosMensuales } = dataItem; // Extraer NombreCuenta y GastosMensuales
            const total = GastosMensuales.reduce((sum, val) => sum + val, 0);
            // Sumar los valores de cada mes a los totales generales
            GastosMensuales.forEach((value, index) => {
                monthlyTotals[index] += value;
            });
            grandTotal += total;
            // Crear una nueva fila
            const row = document.createElement('tr');
            // Celda para NombreCuenta
            const productCell = document.createElement('td');
            productCell.textContent = NombreCuenta; // Mostrar NombreCuenta en lugar de CodigoCuenta
            row.appendChild(productCell);
            // Celdas para cada mes
            GastosMensuales.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value.toLocaleString(); // Formato numérico con separador de miles
                row.appendChild(cell);
            });

            // Celda invisible para codigoIngreso
            const codigoCell = document.createElement('td');
            codigoCell.textContent = codigoCuenta;
            codigoCell.className = 'hidden-column'; // Clase para ocultar
            row.appendChild(codigoCell);


            // Celda para Total
            const totalCell = document.createElement('td');
            totalCell.className = 'total-column';
            totalCell.textContent = total.toLocaleString(); // Formato numérico con separador de miles
            row.appendChild(totalCell);    
            // Agregar la fila al cuerpo de la tabla
            tableBody.appendChild(row);
        }
        // Crear la fila para los totales de cada mes
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row'; // Clase para estilos específicos

        // Celda para el título "Total"
        const totalLabelCell = document.createElement('td');
        totalLabelCell.textContent = 'Total';
        totalLabelCell.style.fontWeight = 'bold';
        totalRow.appendChild(totalLabelCell);

        // Celdas para los totales de cada mes
        monthlyTotals.forEach(total => {
            const cell = document.createElement('td');
            cell.textContent = total.toLocaleString(); // Formato numérico con separador de miles
            totalRow.appendChild(cell);
        });
        // Celda vacía para codigoIngreso en la fila de totales
        const codigoTotalCell = document.createElement('td');
        codigoTotalCell.className = 'hidden-column'; // Clase para ocultar
        totalRow.appendChild(codigoTotalCell);

        monthlyTotalsGastos = monthlyTotals;
        // Celda para el total general
        const grandTotalCell = document.createElement('td');
        grandTotalCell.className = 'total-column';
        grandTotalCell.textContent = grandTotal.toLocaleString(); // Formato numérico con separador de miles
        grandTotalCell.style.fontWeight = 'bold';
        totalRow.appendChild(grandTotalCell);
        // Agregar la fila de totales al cuerpo de la tabla
        tableBody.appendChild(totalRow);
    } catch (error) {
        console.error('Error:', error);
    }
}


/*Poblar los Ingresos*/ 
function populateTable(data) {
    try {    
        const tableBody = document.querySelector('#report-table-final-presupuesto-Ingreso tbody');

        // Agrupar los datos por Nombre_Producto
        const groupedData = data.reduce((acc, item) => {
            if (!acc[item.Nombre_Producto]) {
                acc[item.Nombre_Producto] = {
                    monthlyValues: Array(12).fill(0), // Inicializar con 12 ceros
                    codigoIngreso: item.Codigo_Producto // Guardar el Código de Producto
                };
            }
            acc[item.Nombre_Producto].monthlyValues[item.Mes - 1] = item.Presupuesto_Predicho; // Mes en base 0
            return acc;
        }, {});

        // Inicializar una fila para los totales de cada mes
        const monthlyTotals = Array(12).fill(0);
        let grandTotal = 0;

        // Poblar la tabla
        for (const [productName, { monthlyValues, codigoIngreso }] of Object.entries(groupedData)) {
            const total = monthlyValues.reduce((sum, val) => sum + val, 0);

            // Sumar los valores de cada mes a los totales generales
            monthlyValues.forEach((value, index) => {
                monthlyTotals[index] += value;
            });
            grandTotal += total;
            // Crear una nueva fila
            const row = document.createElement('tr');            
            // Celda para Nombre_Producto
            const productCell = document.createElement('td');
            productCell.textContent = productName;
            row.appendChild(productCell);
            // Celdas para cada mes
            monthlyValues.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value.toLocaleString(); // Formato numérico con separador de miles
                row.appendChild(cell);
            });

            // Celda invisible para codigoIngreso
            const codigoCell = document.createElement('td');
            codigoCell.textContent = codigoIngreso;
            codigoCell.className = 'hidden-column'; // Clase para ocultar
            row.appendChild(codigoCell);

            // Celda para Total
            const totalCell = document.createElement('td');
            totalCell.className = 'total-column';
            totalCell.textContent = total.toLocaleString(); // Formato numérico con separador de miles
            row.appendChild(totalCell);

            // Agregar la fila al cuerpo de la tabla
            tableBody.appendChild(row);
        }

        // Crear la fila para los totales de cada mes
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row'; // Clase para estilos específicos

        // Celda para el título "Total"
        const totalLabelCell = document.createElement('td');
        totalLabelCell.textContent = 'Total';
        totalLabelCell.style.fontWeight = 'bold';
        totalRow.appendChild(totalLabelCell);

        // Celdas para los totales de cada mes
        monthlyTotals.forEach(total => {
            const cell = document.createElement('td');
            cell.textContent = total.toLocaleString(); // Formato numérico con separador de miles
            totalRow.appendChild(cell);
        });

        // Celda vacía para codigoIngreso en la fila de totales
        const codigoTotalCell = document.createElement('td');
        codigoTotalCell.className = 'hidden-column'; // Clase para ocultar
        totalRow.appendChild(codigoTotalCell);

        monthlyTotalsIngresos = monthlyTotals;

        // Celda para el total general
        const grandTotalCell = document.createElement('td');
        grandTotalCell.className = 'total-column';
        grandTotalCell.textContent = grandTotal.toLocaleString(); // Formato numérico con separador de miles
        grandTotalCell.style.fontWeight = 'bold';
        totalRow.appendChild(grandTotalCell);

        // Agregar la fila de totales al cuerpo de la tabla
        tableBody.appendChild(totalRow);
    } catch (error) {
        console.error('Error:', error);
    }
}



function calculateResultTotals() {
    try{

    
        if (
            monthlyTotalsIngresos.length !== monthlyTotalsCostos.length || 
            monthlyTotalsIngresos.length !== monthlyTotalsGastos.length
        ) {
            console.error("Las longitudes no coinciden.");
            return;
        }
        // Realizar la resta: (Ingresos - Costos - Gastos) para cada mes
        const resultTotals = monthlyTotalsIngresos.map(
            (ingreso, index) => ingreso - monthlyTotalsCostos[index] - monthlyTotalsGastos[index]
        );

        //console.log(resultTotals); // Muestra los resultados en consola
        // Calcular el total anual
        const totalAnual = resultTotals.reduce((sum, value) => sum + value, 0);

        // Agregar los resultados a la tabla
        const table = document.getElementById("report-table-final-presupuesto-sugerido");
        const tbody = table.querySelector("tbody");

        // Crear una nueva fila
        const newRow = document.createElement("tr");
        newRow.classList.add("total-row"); // Añadir clase para estilos específicos

        // Agregar la celda de encabezado para "Totales"
        const headerCell = document.createElement("td");
        headerCell.textContent = "Totales";
        newRow.appendChild(headerCell);

        // Agregar las celdas de los resultados mensuales
        resultTotals.forEach((total) => {
            const cell = document.createElement("td");
            cell.textContent = total.toFixed(2); // Redondear a dos decimales
            cell.textContent = total.toLocaleString(); // Redondear a dos decimales
            newRow.appendChild(cell);
        });

        // Agregar la celda del total anual
        const totalCell = document.createElement("td");
        totalCell.textContent = totalAnual.toFixed(2); // Redondear a dos decimales    
        totalCell.classList.add("total-column"); // Añadir clase para estilos específicos
        totalCell.textContent = totalAnual.toLocaleString();
        newRow.appendChild(totalCell);

        // Agregar la nueva fila al cuerpo de la tabla
        tbody.appendChild(newRow);

        return resultTotals; // Opcional, devolver resultados para uso adicional
    }catch(error){
        console.error('Error:', error)
    }
}


async function guardarPresupuestoSugerido() {
    // Leer las tablas y convertirlas a JSON
    const ingresoData = leerTablaComoJSON("report-table-final-presupuesto-Ingreso");
    const costoData = leerTablaComoJSON("report-table-final-presupuesto-costo");    
    const gastoData = leerTablaComoJSON("report-table-final-presupuesto-gasto");
    const sugeridoData = leerTablaComoJSON("report-table-final-presupuesto-sugerido");

    // Calcular el total general
    const totalIngreso = ingresoData.reduce((acc, item) => acc + item.Total, 0);
    const totalCosto = costoData.reduce((acc, item) => acc + item.Total, 0);
    const totalGasto = gastoData.reduce((acc, item) => acc + item.Total, 0);
    const totalSugerido = sugeridoData.reduce((acc, item) => acc + item.Total, 0);
    const totalGeneral = totalSugerido;

    // Datos adicionales
    const Nit_Empresa = "901292126" // TODO sessionStorage.getItem("Nit_Empresa");
    const UsuarioInsercion = "usuario generico" // TODO sessionStorage.getItem("UsuarioInsercion");
    const Anio_Presupuesto = "2025" //TODO  document.getElementById("anioPresupuesto").value; // Suponiendo que tienes un input con este ID

    // Crear el objeto para enviar al API
    const payload = {
        Nit_Empresa: Nit_Empresa,
        Anio_Presupuesto:Anio_Presupuesto,
        Total: totalGeneral,
        UsuarioInsercion: UsuarioInsercion,
        JsonCosto: costoData,
        JsonGasto: gastoData,
        JsonIngreso: ingresoData,
        JsonSugerido: sugeridoData,
    };
    
    // Enviar al API
    try {        
        const payloadTransformado = transformarPayload(payload);
        const API_URL_SAVE = "http://127.0.0.1:8080/GuardaPresupuestoSugeridoFinal";
        const response = await fetch(API_URL_SAVE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payloadTransformado)
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message || "Datos guardados exitosamente");
        } else {
            const error = await response.json();
            alert(error.error || "Error al guardar los datos");
        }
    } catch (error) {
        console.error("Error al guardar los datos:", error);
        alert("Hubo un error al comunicarse con el servidor");
    }
}

function leerTablaComoJSON(tableId) {
    try{ 
        const table = document.getElementById(tableId);
        const rows = table.querySelectorAll("tbody tr");
        const data = [];
        if(tableId == 'report-table-final-presupuesto-sugerido'){
            try{
                rows.forEach(row => {            
                    const cells = row.querySelectorAll("td");
                    const nombreCuenta = cells[0].textContent.trim();
                    const valoresMensuales = Array.from(cells).slice(1, 13).map(cell => parseFloat(cell.textContent.replace(/,/g, "")) || 0);
                    const total = parseFloat(cells[13].textContent.replace(/,/g, "")) || 0;    
                    data.push({
                        NombreCuenta: nombreCuenta,
                        Meses: valoresMensuales,
                        Total: total,
                    });
                });
            }catch(err){
                console.error('Error es:', err)
            }            
        }
        else
        {
            rows.forEach(row => {            
                const cells = row.querySelectorAll("td");
                const nombreCuenta = cells[0].textContent.trim();
                const codigoCuenta = cells[13].textContent.trim();
                const valoresMensuales = Array.from(cells).slice(1, 13).map(cell => parseFloat(cell.textContent.replace(/,/g, "")) || 0);
                const total = parseFloat(cells[14].textContent.replace(/,/g, "")) || 0;
    
                data.push({
                    NombreCuenta: nombreCuenta,
                    Meses: valoresMensuales,
                    codigoCuenta:codigoCuenta,
                    Total: total,
                });
            }); 
        }
        return data;
    }catch(error){
        'Error:', error;
    }
}

function transformarPayload(payload) {
    
    
        const transformarMeses = (detalle) => {
            const meses = detalle.Meses;
            return {
                Nit_Empresa: payload.Nit_Empresa,
                Producto: detalle.NombreCuenta,
                enero: meses[0],
                febrero: meses[1],
                marzo: meses[2],
                abril: meses[3],
                mayo: meses[4],
                junio: meses[5],
                julio: meses[6],
                agosto: meses[7],
                septiembre: meses[8],
                octubre: meses[9],
                noviembre: meses[10],
                diciembre: meses[11],
                total: detalle.Total,
                CodigoProducto: detalle.codigoCuenta || ''
            };
        };
        return {
            Nit_Empresa: payload.Nit_Empresa,
            Anio_Presupuesto: parseInt(payload.Anio_Presupuesto),
            Total: payload.Total,
            UsuarioInsercion: payload.UsuarioInsercion,
            JsonCosto: payload.JsonCosto.map(transformarMeses),
            JsonGasto: payload.JsonGasto.map(transformarMeses),
            JsonIngreso: payload.JsonIngreso.map(transformarMeses),
            JsonSugerido: payload.JsonSugerido.map(transformarMeses),
        };
}