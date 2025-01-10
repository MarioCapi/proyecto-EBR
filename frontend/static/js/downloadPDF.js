async function initDescargarGastoPDF() {
    document.getElementById('download-btn').addEventListener('click', async function () {
        // Crear overlay de carga
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="spinner"></div>
            <p>Generando archivo PDF, por favor espere...</p>
        `;
        document.body.appendChild(loadingOverlay);

        try {
            const tableIDs = [
                'report-table-final-presupuesto-Ingreso',
                'report-table-final-presupuesto-gasto',
                'report-table-final-presupuesto-costo',
                'report-table-final-presupuesto-sugerido'
            ];

            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < tableIDs.length; i++) {
                const table = document.querySelector(`#${tableIDs[i]}`);
                if (!table) throw new Error(`No se encontró la tabla con el ID '${tableIDs[i]}'.`);

                const canvas = await html2canvas(table, { scale: 1 });
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                let position = 0;

                while (position < canvas.height) {
                    const canvasSection = document.createElement('canvas');
                    canvasSection.width = canvas.width;

                    // Calcular la altura restante para evitar estiramientos en la última página
                    const remainingHeight = canvas.height - position;
                    const pageCanvasHeight = Math.min(pageHeight * canvas.width / pageWidth, remainingHeight);
                    canvasSection.height = pageCanvasHeight;

                    const context = canvasSection.getContext('2d');
                    context.drawImage(
                        canvas,
                        0, position, canvas.width, pageCanvasHeight, // Origen
                        0, 0, canvas.width, pageCanvasHeight // Destino
                    );

                    const sectionImgData = canvasSection.toDataURL('image/png');
                    const adjustedHeight = (pageCanvasHeight * imgWidth) / canvas.width;

                    pdf.addImage(sectionImgData, 'PNG', 0, 0, imgWidth, adjustedHeight);

                    // Agregar la marca de agua en el centro de cada página
                    pdf.setFontSize(50);
                    pdf.setTextColor(150, 150, 150);
                    pdf.text('Elterlich Report', pageWidth / 2, pageHeight / 2, {
                        align: 'center',
                        angle: 45,
                    });

                    position += pageCanvasHeight; // Mover la posición
                    if (position < canvas.height) pdf.addPage(); // Agregar nueva página si queda más contenido
                }

                // Agregar una nueva página entre tablas (excepto para la última tabla)
                if (i < tableIDs.length - 1) pdf.addPage();
            }

            pdf.save('ReportePresupuestoSugerido.pdf');
            alert('El archivo PDF se ha generado y descargado correctamente.');
        } catch (error) {
            alert(`Error al generar el PDF: ${error.message}`);
        } finally {
            // Eliminar el overlay de carga al final del proceso
            const overlay = document.getElementById('loading-overlay');
            if (overlay) document.body.removeChild(overlay);
        }
    });
}