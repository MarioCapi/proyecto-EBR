async function initDescargarPresupuestoXLSX() {
    document.getElementById('download-excel-btn').addEventListener('click', async function () {
        // Crear overlay de carga
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="spinner"></div>
            <p>Generando archivo Excel, por favor espere...</p>
        `;
        document.body.appendChild(loadingOverlay);

        try {
            const tableIDs = [
                'report-table-final-presupuesto-Ingreso',
                'report-table-final-presupuesto-gasto',
                'report-table-final-presupuesto-costo',
                'report-table-final-presupuesto-sugerido'
            ];

            const workbook = XLSX.utils.book_new();
            let allData = [];

            tableIDs.forEach((tableID) => {
                const table = document.querySelector(`#${tableID}`);
                if (!table) throw new Error(`No se encontró la tabla con el ID '${tableID}'.`);

                // Convertir tabla HTML a un array de datos
                const tableData = XLSX.utils.sheet_to_json(
                    XLSX.utils.table_to_sheet(table),
                    { header: 1 }
                );

                // Agregar un título para diferenciar cada tabla
                allData.push([`: ${tableID}`]);
                allData = allData.concat(tableData, [[""]]); // Insertar datos de la tabla y un salto de línea
            });

            // Crear hoja de Excel combinada
            const worksheet = XLSX.utils.aoa_to_sheet(allData);

            // Estilos para las celdas
            const headerStyle = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4CAF50" } } // Verde
            };

            const productsStyle = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "2196F3" } } // Azul
            };

            const totalColumnStyle = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "FF9800" } } // Naranja
            };

            const lastRowStyle = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "9C27B0" } } // Morado
            };

            // Aplicar estilos a las celdas
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            for (let row = range.s.r; row <= range.e.r; row++) {
                for (let col = range.s.c; col <= range.e.c; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                    const cell = worksheet[cellAddress];
                    if (cell) {
                        if (row === range.s.r) {
                            // Encabezado (primer fila de la tabla)
                            cell.s = headerStyle;
                        } else if (col === 0) {
                            // Columna Productos
                            cell.s = productsStyle;
                        } else if (col === range.e.c) {
                            // Columna Total
                            cell.s = totalColumnStyle;
                        } else if (row === range.e.r) {
                            // Última fila (total)
                            cell.s = lastRowStyle;
                        }
                    }
                }
            }

            // Agregar hoja al libro
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Presupuesto');

            // Descargar archivo Excel con estilos
            XLSX.writeFile(workbook, 'ReportePresupuestoSugerido.xlsx');
            alert('El archivo Excel se ha generado y descargado correctamente.');
        } catch (error) {
            // Manejar errores y mostrar mensaje
            alert(`Error al generar el archivo Excel: ${error.message}`);
        } finally {
            // Eliminar overlay de carga
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) document.body.removeChild(loadingOverlay);
        }
    });
}
