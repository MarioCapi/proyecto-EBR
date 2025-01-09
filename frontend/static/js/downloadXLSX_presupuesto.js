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
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Presupuesto');

            // Descargar archivo Excel
            XLSX.writeFile(workbook, 'ReportePresupuestoSugerido.xlsx');
            alert('El archivo Excel se ha generado y descargado correctamente.');
        } catch (error) {
            // Manejar errores y mostrar mensaje
            alert(`Error al generar el archivo Excel: ${error.message}`);
            console.error('Detalles del error:', error);
        } finally {
            // Eliminar overlay de carga
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) document.body.removeChild(loadingOverlay);
        }
    });
}
