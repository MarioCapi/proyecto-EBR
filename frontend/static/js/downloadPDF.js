async function initDescargarGastoPDF() {

    document.getElementById('download-btn').addEventListener('click', function () {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="spinner"></div>
            <p>Generando archivo PDF, por favor espere...</p>
        `;
        document.body.appendChild(loadingOverlay);
    
        try {
            const table = document.querySelector('#report-table-final-presupuesto-gasto');
            if (!table) throw new Error("No se encontró la tabla con el ID 'report-table-final-presupuesto-gasto'.");
    
            html2canvas(table, { scale: 1 }).then((canvas) => {
                const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
                const imgData = canvas.toDataURL('image/png');
    
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = pageWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
                let position = 0;
    
                while (position < canvas.height) {
                    const canvasSection = document.createElement('canvas');
                    canvasSection.width = canvas.width;
    
                    // Calcular altura restante para evitar estiramientos en la última página
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
    
                pdf.save('ReporteGastos.pdf');
                document.body.removeChild(loadingOverlay);
            }).catch((error) => {
                document.body.removeChild(loadingOverlay);
                console.error("Error al generar el PDF:", error);
                alert(`Error al generar el PDF: ${error.message}`);
            });
        } catch (error) {
            document.body.removeChild(loadingOverlay);
            console.error("Error general:", error);
            alert(`Error general: ${error.message}`);
        }
    });
    
    


}