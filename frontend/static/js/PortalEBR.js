const { createApp } = Vue
const UrlAPIUpload = 'http://127.0.0.1:8080/upload/';
const UrlAPI_tot_prod_mes = 'http://127.0.0.1:8080/getTot_x_prod_mes/';
const UrlError_log = 'http://127.0.0.1:8080/registerlog/';


createApp({
    data() {
        return {
            isSidebarCollapsed: false,
            activeView: 'upload',
            uploadProgress: 0,
            files: [],
            uploadComplete: false,
            presupuestoData: null,
            presupuestoContent: '',
            
            
            successFiles: [], // archivos procesados exitosamente
            errorFiles: [], // archivos con errores
            isProcessing: false,
            showSummary: false
        }
    },
    methods: { 
        get_current_year() {
            var  d = new  Date();
            var  n = d.getFullYear();
            return  n;
        },
        parseCurrency(value) {
            // Eliminar caracteres no numéricos, excepto el punto y la coma
            value = value.replace(/[$\s]/g, ''); // Eliminar el símbolo de la moneda y espacios
            // Reemplazar el punto por nada (para miles) y la coma por un punto (para decimales)
            value = value.replace(/\./g, '').replace(/,/g, '.');
            return parseFloat(value);
        },

        updateCounter(event) {
            const sliderValue = event.target.value;
            document.getElementById('sliderValue').innerText = sliderValue; // Actualiza el valor mostrado
            this.adjustTableValues(sliderValue);
            this.updateChart();
        },
        updateChart() {
            const tbody = document.querySelector('#predictionsTable tbody');
            const labels = [];
            const dataPredicted = [];
            const dataCoefficient = [];
    
            const rows = tbody.querySelectorAll('tr');
            rows.forEach(row => {
                const mes = row.cells[0].textContent; // Suponiendo que el mes está en la primera celda
                const valorPredicho = this.parseCurrency(row.cells[1].textContent);
                const coeficiente = this.parseCurrency(row.cells[3].textContent);
    
                labels.push(mes);
                dataPredicted.push(valorPredicho);
                dataCoefficient.push(coeficiente);
            });
    
            // Actualizar el gráfico
            const chart = Chart.getChart('predictionsChart'); // Obtén la instancia del gráfico
            if (chart) {
                chart.data.labels = labels; // Actualiza las etiquetas
                chart.data.datasets[0].data = dataPredicted; // Actualiza los datos del primer conjunto
                //chart.data.datasets[1].data = dataCoefficient; // Actualiza los datos del segundo conjunto
                chart.update(); // Refresca el gráfico
            }
        },

        adjustTableValues(sliderValue) {
                const tbody = document.querySelector('#predictionsTable tbody');
                if (!tbody) {
                    return;
                }
        
                const rows = tbody.querySelectorAll('tr');
                rows.forEach(row => {
                const valorPredichoCell = row.cells[1]; // Suponiendo que el valor predicho está en la segunda celda
                const coeficienteCell = row.cells[3]; // Suponiendo que el coeficiente está en la cuarta celda

                // Obtener los valores originales
                const originalValorPredicho = parseFloat(valorPredichoCell.getAttribute('data-original-value'));
                const originalCoeficiente = parseFloat(coeficienteCell.getAttribute('data-original-value'));

                // Calcular el nuevo valor basado en el porcentaje del slider
                const newValorPredicho = originalValorPredicho * (1 + (sliderValue / 100));
                const newCoeficiente = originalCoeficiente * (1 + (sliderValue / 100));

                // Actualizar las celdas con el nuevo valor
                valorPredichoCell.textContent = formatCurrency(newValorPredicho);
                coeficienteCell.textContent = formatCurrency(newCoeficiente);
            });
        },

        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed
        },
        setActiveView(view) {
            this.activeView = view
            if (view === 'budget') {
                this.loadPresupuestoContent()
            }
            if (view === 'budgetPresu') {
                this.loadPrediccionPresupuesto()
            }
            if (view === 'budgetPresuXProduct') {
                this.loadPredictionXProducto()
            }
            if (view === 'PrediccionPresupuesto') {
                this.loadPrediccionFinalPresupuesto()
            }
            if (view === 'ConciliacionPresupuesto') {
                this.ConciliationMonthlyBudget()
            }
        },

        async loadPrediccionFinalPresupuesto() {
            try{
                // Recuperar tax_id desde sessionStorage
                const userData = JSON.parse(sessionStorage.getItem("userData"));
                if (!userData || !userData.tax_id) {
                    throw new Error("No se encontró el usuario o el tax_id en sessionStorage");
                }
                const nit_actual = userData.tax_id;
                await this.$nextTick();
                const contentDiv = document.getElementById('contentPresupuestoFinal');
                if (!contentDiv) {
                    throw new Error('No se encontró el elemento con id "contentPresupuestoFinal"');
                }        
                contentDiv.innerHTML = `
                            </br> 
                                <div class="button-container">
                                
                                    <!-- Botón para guardar presupuesto -->
                                    <div class="save-section">
                                        <button class="modern-btn save-btn" onclick="guardarPresupuestoSugerido()">
                                            Guardar Presupuesto
                                        </button>
                                    </div>

                                    <!-- Sección para descargar -->
                                    <div class="download-section">
                                        <button id="download-btn" class="modern-btn pdf-btn" title="Descargar presupuesto sugerido">
                                            <i class="fas fa-file-pdf"></i> PDF
                                        </button>
                                        <button id="download-excel-btn" class="modern-btn excel-btn" title="Descargar presupuesto en formato Excel">
                                            <i class="fas fa-file-excel"></i> Excel
                                        </button>
                                    </div>

                                </div>
                            </br>
                        </br>
                        <h1>Ingresos</h1>
                        </br>
                        <div class="table-container">
                            <table id="report-table-final-presupuesto-Ingreso">
                                <thead>
                                    <tr>
                                        <th>Ingreso</th>
                                        <th>Enero</th>
                                        <th>Febrero</th>
                                        <th>Marzo</th>
                                        <th>Abril</th>
                                        <th>Mayo</th>
                                        <th>Junio</th>
                                        <th>Julio</th>
                                        <th>Agosto</th>
                                        <th>Septiembre</th>
                                        <th>Octubre</th>
                                        <th>Noviembre</th>
                                        <th>Diciembre</th>
                                        <th class="hidden-column">codigoIngreso</th>
                                        <th class="total-column">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                            </br>
                            <h1>Gastos</h1>
                            </br>
                            <table id="report-table-final-presupuesto-gasto">
                                <thead>
                                    <tr>
                                        <th>Gasto</th>
                                        <th>Enero</th>
                                        <th>Febrero</th>
                                        <th>Marzo</th>
                                        <th>Abril</th>
                                        <th>Mayo</th>
                                        <th>Junio</th>
                                        <th>Julio</th>
                                        <th>Agosto</th>
                                        <th>Septiembre</th>
                                        <th>Octubre</th>
                                        <th>Noviembre</th>
                                        <th>Diciembre</th>
                                        <th class="hidden-column">codigoGasto</th>
                                        <th class="total-column">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                            </br>                            
                            <h1>Costos</h1>
                            </br>
                            <table id="report-table-final-presupuesto-costo">
                                <thead>
                                    <tr>
                                        <th>Costo</th>
                                        <th>Enero</th>
                                        <th>Febrero</th>
                                        <th>Marzo</th>
                                        <th>Abril</th>
                                        <th>Mayo</th>
                                        <th>Junio</th>
                                        <th>Julio</th>
                                        <th>Agosto</th>
                                        <th>Septiembre</th>
                                        <th>Octubre</th>
                                        <th>Noviembre</th>
                                        <th>Diciembre</th>
                                        <th class="hidden-column">codigoCosto</th>
                                        <th class="total-column">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>


                            </br>
                            <h1>Utilidad Proyectada</h1>
                            </br>
                            <table id="report-table-final-presupuesto-sugerido">
                                <thead>
                                    <tr>
                                        <th>Totales</th>
                                        <th>Enero</th>
                                        <th>Febrero</th>
                                        <th>Marzo</th>
                                        <th>Abril</th>
                                        <th>Mayo</th>
                                        <th>Junio</th>
                                        <th>Julio</th>
                                        <th>Agosto</th>
                                        <th>Septiembre</th>
                                        <th>Octubre</th>
                                        <th>Noviembre</th>
                                        <th>Diciembre</th>
                                        <th class="total-column">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                `;
                const oldScript = document.getElementById('presupuesto-script_1');
                if (oldScript) {
                    oldScript.remove();
                }        
                // Cargar nuevo script
                const script = document.createElement('script');
                script.id = 'presupuestoFinal-script';
                script.src = './static/js/GenerateSuggestedBudget.js';
                script.onload = () => {
                    if (window.initPresupuestoFinal) {
                        window.initPresupuestoFinal();
                    }
                };
                script.onerror = (error) => {
                    
                };
                const scriptpdf = document.createElement('script');
                scriptpdf.id = 'downloadInfoPDF-script';
                scriptpdf.src = './static/js/downloadPDF.js';
                scriptpdf.onload = () => {
                    if (window.initDescargarGastoPDF) {
                        window.initDescargarGastoPDF();
                    }
                };                

                const scriptXLSX = document.createElement('script');
                scriptXLSX.id = 'downloadInfoXLSX-script';
                scriptXLSX.src = './static/js/downloadXLSX_presupuesto.js';
                scriptXLSX.onload = () => {
                    if (window.initDescargarPresupuestoXLSX) {
                        window.initDescargarPresupuestoXLSX();
                    }
                };

                document.body.appendChild(script);
                document.body.appendChild(scriptpdf);
                document.body.appendChild(scriptXLSX);

            }catch (error) {

                const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
                const nit_actual = userData.tax_id || "Desconocido";

                
                const paramsLogError = {
                    user_id: nit_actual, // el userid
                    action_type: "loadPrediccionFinalPresupuesto",  //tipo de accion
                    action_details: "Error al cargar el contenido final del presupuesto con costo y gasto",
                    ip_address: "localhost", 
                    user_agent: "navegador o dispositivo",
                    error: 1, // quiere decir error
                    error_details: error.response.data.detail || error.message
                };
                await fetch(UrlError_log, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(paramsLogError)
                });
            }
        },
        // <td class="total-column">28300</td>


        /*HTML que tiene la tabla detallada de los productos por mes*/
        async loadPresupuestoContent() {            
            try {
                // Recuperar tax_id desde sessionStorage
                const userData = JSON.parse(sessionStorage.getItem("userData"));
                if (!userData || !userData.tax_id) {
                    throw new Error("No se encontró el usuario o el tax_id en sessionStorage");
                }
                const nit_actual = userData.tax_id;
                await this.$nextTick();
                const contentDiv = document.getElementById('content');
                if (!contentDiv) {
                    throw new Error('No se encontró el elemento con id "content"');
                }        
                contentDiv.innerHTML = `
                    <div id="report-container">
                        
                            <table id="report-table">
                                <thead>
                                    <tr>
                                        <th>Año</th>
                                        <th>Mes</th>
                                        <th>Mes</th>
                                        <th>Total Ingreso</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        
                            <div id="pagination-controls" class="mt-4">
                                <button id="prev-page" class="px-4 py-2 bg-blue-500 text-white rounded" disabled><</button>
                                <span id="page-info" class="mx-2"></span>
                                <button id="next-page" class="px-4 py-2 bg-blue-500 text-white rounded">></button>
                            </div>
                            <div id="detailed-table-container" style="display: none;">
                                <h3>Detalles de la Cuenta</h3>
                                <table id="detailed-table">
                                    <thead>
                                        <tr>
                                            <th>Nombre Cuenta</th>
                                            <th>Año</th>
                                            <th>Mes</th>
                                            <th>Total Débito</th>
                                            <th>Total Crédito</th>
                                            <th>Total Ingreso</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Aquí se llenarán los detalles -->
                                    </tbody>
                                </table>
                        </div>

                        <div class="mt-8">
                            <canvas id="report-chart"></canvas>
                        </div>                        
                    </div>
                `;
                // Remover script anterior si existe
                const oldScript = document.getElementById('presupuesto-script_1');
                if (oldScript) {
                    oldScript.remove();
                }        
                // Cargar nuevo script
                const script = document.createElement('script');
                script.id = 'presupuesto-script_1';
                script.src = './static/js/presupuesto.js';
                script.onload = () => {
                    if (window.initPresupuesto) {
                        window.initPresupuesto(nit_actual);
                    }
                    this.agregarEventosClick(nit_actual);
                };
                script.onerror = (error) => {
                    
                };
                document.body.appendChild(script);
                
        
            } catch (error) {
                const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
                const nit_actual = userData.tax_id || "Desconocido";
                
                const paramsLogError = {
                    user_id: Nit_Empresa, // el userid
                    action_type: "loadPresupuestoContent",  //tipo de accion
                    action_details: "Error al cargar el contenido de presupuesto",
                    ip_address: "localhost", 
                    user_agent: "navegador o dispositivo",
                    error: 1, // quiere decir error
                    error_details: error.response.data.detail || error.message
                };
                await fetch(UrlError_log, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(paramsLogError)
                });
            }
        },

        /*eventos para seleccionar valores de la tabla*/ 

        agregarEventosClick(nit_actual) {
            const tbody = document.querySelector('#report-table tbody');
            tbody.addEventListener('click', (event) => {
                const row = event.target.closest('tr'); // Encuentra la fila más cercana al clic
                if (row) {
                    const anio = row.cells[0].textContent.trim(); // Año
                    const mes = row.cells[1].textContent.trim(); // Mes
                    const nit = nit_actual;
                    
                    // Llamar a la función para enviar los datos a la API
                    this.enviarDatosANuevaAPI(anio, mes, nit);
                }
            });
        },

        enviarDatosANuevaAPI(anio, mes, nit) {
            const data = {
                AnioBase: parseInt(anio), // Asegúrate de que sea un número
                Periodo: parseInt(mes), // Asegúrate de que sea un número
                nit: nit // El NIT como string
            };
        
            axios.post(UrlAPI_tot_prod_mes, data)
                .then(response => {
                    const resultados = response.data.data;
                    
                    if (resultados.length > 0) {
                        this.mostrarTablaDetallada(resultados);
                    } else {
                        
                    }
                })
                .catch(error => {
                    
                    alert('Error al obtener datos. Intenta nuevamente.');
                    const paramsLogError = {
                        user_id: Nit_Empresa, // el userid
                        action_type: "enviarDatosANuevaAPI",  //tipo de accion
                        action_details: "Error al obtener datos",
                        ip_address: "localhost", 
                        user_agent: "navegador o dispositivo",
                        error: 1, // quiere decir error
                        error_details: error.response.data.detail || error.message
                    };
                    fetch(UrlError_log, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(paramsLogError)
                    });
                });
        },

        mostrarTablaDetallada(resultados) {
            const detailedTableBody = document.querySelector('#detailed-table tbody');
            detailedTableBody.innerHTML = ''; // Limpiar contenido anterior
            resultados.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="border border-gray-300 px-4 py-2">${item.NombreCuenta}</td>
                    <td class="border border-gray-300 px-4 py-2">${item.Anio}</td>
                    <td class="border border-gray-300 px-4 py-2">${item.Mes}</td>                    
                    <td class="border border-gray-300 px-4 py-2">${item.TotalDebito.toLocaleString('es-CO')}</td>
                    <td class="border border-gray-300 px-4 py-2">${item.TotalCredito.toLocaleString('es-CO')}</td>
                    <td class="border border-gray-300 px-4 py-2">${item.TotalIngreso.toLocaleString('es-CO')}</td>
                `;
                detailedTableBody.appendChild(row);
            });
        
            // Mostrar el contenedor de la tabla detallada
            document.getElementById('detailed-table-container').style.display = 'block';
        },

        /*HTML de los botones con total de la prediccion, rango de años ymese analizados*/
        async loadPrediccionPresupuesto() {
            let nit_actual;
            try {
                // Recuperar tax_id desde sessionStorage
                const userData = JSON.parse(sessionStorage.getItem("userData"));
                if (!userData || !userData.tax_id) {
                    throw new Error("No se encontró el usuario o el tax_id en sessionStorage");
                }
                nit_actual = userData.tax_id;
                await this.$nextTick();
                const contentDiv = document.getElementById('contentPresu');
                if (!contentDiv) {
                    throw new Error('No se encontró el elemento con id "contentPresu"');
                }        
                contentDiv.innerHTML = `
                <div class="predictions-container">
                    <header class="predictions-header">
                        <h1><i class="fas fa-brain"></i> Predicciones Presupuestales</h1>
                        <div class="metrics-summary">
                            <div class="metric-card">
                                <i class="fas fa-calendar"></i>
                                <span id="yearRange"></span>
                            </div>
                            <div class="metric-card">
                                <i class="fas fa-chart-line"></i>
                                <span id="totalMonths"></span>
                            </div>
                            <div class="metric-card">
                                <i class="fas fa-chart-line"></i>
                                <span id="TotalPrediccionPresupuesto"></span>
                            </div>
                        </div>
                    </header>
    
                    <div class="chart-container">
                        <canvas id="predictionsChart"></canvas>
                    </div>
    
                    <div class="table-container">
                        <table id="predictionsTable">
                            <thead>
                                <tr>
                                    <th>Mes</th>
                                    <th>Valor Predicho</th>
                                    <th>Tendencia</th>
                                    <th>Coeficiente</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Se llenará dinámicamente -->
                            </tbody>
                        </table>
                    
                        <div id="savePredictionContainer"  class="hidden">
                            <button id="savePredictionButton" class="data-science-button">                        
                                <i class="fas fa-brain"></i> 
                            Guardar Prediccion
                            </button>
                        </div>

                    </div>
                </div>
            `;
                // Remover script anterior si existe
                const oldScript = document.getElementById('presupuesto-script_2');
                if (oldScript) {
                    oldScript.remove();
                }        
                // Cargar nuevo script
                const script = document.createElement('script');
                script.id = 'presupuesto-script_2';
                script.src = './static/js/prediccionesPresupuesto.js';
                script.onload = () => {
                    
                    const predictionData = JSON.parse(sessionStorage.getItem('predictionData'));
                    if (window.initPredictions && predictionData) {
                        window.initPredictions(predictionData,userData.tax_id);
                    }
                      // Mostrar el botón después de cargar las predicciones
                    const savePredictionContainer = document.getElementById('savePredictionContainer');
                    if (savePredictionContainer) {
                        savePredictionContainer.classList.remove('hidden');
                    }

                };

                script.onerror = (error) => {
                    
                };
                document.body.appendChild(script);

                const sliderContainer = document.createElement('div');
                sliderContainer.className = 'slider-container';
                sliderContainer.innerHTML = `
                    <label for="dataSlider" class="text-[#102A43] font-semibold">Ajustar Porcentaje de Incremento:</label>
                    <input type="range" id="dataSlider" min="0" max="100" value="1" class="slider" @input="updateCounter">
                    <span id="sliderValue" class="text-[#102A43] font-semibold">1</span>
                `;
                
               // Insertar el control deslizante en el DOM
                const predictionsTable = document.getElementById('predictionsTable');
                predictionsTable.parentNode.insertBefore(sliderContainer, predictionsTable);
            
                // Asegúrate de que Vue reconozca el nuevo elemento
                this.$nextTick(() => {
                const slider = document.getElementById('dataSlider');
                slider.addEventListener('input', this.updateCounter);
                });
            
        
            } catch (error) {
                const paramsLogError = {
                    user_id: nit_actual, // el userid
                    action_type: "loadPrediccionPresupuesto",  //tipo de accion
                    action_details: "Error al cargar el contenido de predicciones de presupuesto",
                    ip_address: "localhost", 
                    user_agent: "navegador o dispositivo",
                    error: 1, // quiere decir error
                    error_details: error.response.data.detail || error.message
                };
                fetch(UrlError_log, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(paramsLogError)                
                });
            }
        },


        async loadPredictionXProducto()  /*HTML de Ingreso  x Producto*/
        {
            let nit_actual;
            try {
                // Recuperar tax_id desde sessionStorage
                const userData = JSON.parse(sessionStorage.getItem("userData"));
                if (!userData || !userData.tax_id) {
                    throw new Error("No se encontró el usuario o el tax_id en sessionStorage");
                }
                nit_actual = userData.tax_id;
                await this.$nextTick();
                const contentDiv = document.getElementById('contentPresuXProduct');
                if (!contentDiv) {
                    throw new Error('No se encontró el elemento con id "content"');
                }        
                contentDiv.innerHTML = `

                <div id="report-container2">
                    <div>
                        <label for="codigoProducto">Selecciona un Código de Producto:</label>
                        <select id="codigoProducto"></select>

                        <label for="anio">Selecciona un Año:</label>
                        <select id="anio"></select>

                        <button id="filterButton">Filtrar</button>
                    </div>
                    <div class="chart-container">
                        <canvas id="predictionsChart"></canvas>
                    </div>

                        <table id="report-table-products" class="w-full">
                            <thead>
                                <tr>
                                    <th class="px-4 py-2">Nombre_Producto</th>
                                    <th class="px-4 py-2">Año</th>
                                    <th class="px-4 py-2">Mes</th>
                                    <th class="px-4 py-2">Presupuesto_Predicho</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                            <div id="pagination-controls" class="mt-4">
                                <button id="prev-page_products_predict" class="px-4 py-2 bg-blue-500 text-white rounded" disabled><</button>
                                <span id="page-info_products" class="mx-2"></span>
                                <button id="next-page_products__predict" class="px-4 py-2 bg-blue-500 text-white rounded">></button>
                            </div>
                        <div class="mt-8">
                            <canvas id="report-chart"></canvas>
                        </div>                        
                    </div>
                `;
                // Remover script anterior si existe
                const oldScript = document.getElementById('presupuesto-script');
                if (oldScript) {
                    oldScript.remove();
                }        
                // Cargar nuevo script
                const script = document.createElement('script');
                script.id = 'presupuesto-script';
                script.src = './static/js/predict_x_empresa_x_product.js';
                script.onload = () => {
                    if (window.init_get_prediction_x_producto) {
                        window.init_get_prediction_x_producto(userData.tax_id);
                    }
                    //this.agregarEventosClick(nit_actual);
                };
                script.onerror = (error) => {
                    
                };
                document.body.appendChild(script);
                
        
            } catch (error) {
                const paramsLogError = {
                    user_id: nit_actual, // el userid
                    action_type: "loadPredictionXProducto",  //tipo de accion
                    action_details: "error ejecutando la carga de la prediccion pro producto",
                    ip_address: "localhost", 
                    user_agent: "navegador o dispositivo",
                    error: 1, // quiere decir error
                    error_details: error.response.data.detail || error.message
                };
                const responseError = await fetch(UrlError_log, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(paramsLogError)
                });
            }
        },

        

        async ConciliationMonthlyBudget()  /*HTML Conciliation*/
        {
            let nit_actual;
            const userData = JSON.parse(sessionStorage.getItem("userData"));
            if (!userData || !userData.tax_id) {
                throw new Error("No se encontró el usuario o el tax_id en sessionStorage");
            }
            nit_actual = userData.tax_id;
            await this.$nextTick();
            try {
                const anioActual=this.get_current_year();
                const params = {
                    NIT_Empresa: nit_actual,
                    anio: anioActual
                };
                const API_URL = "http://127.0.0.1:8080/Consulta_si_Presu_Sugerido_Anual";
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
               // Parsear la respuesta a JSON
                const result = await response.json();

                // Manejar la respuesta
                if (result.data && result.data.length > 0) {
                    const contentDiv = document.getElementById('contentConciliacionPresupuesto');
                    if (!contentDiv) {
                        throw new Error('No se encontró el elemento con id "content"');
                    }        
                    contentDiv.innerHTML = `
                        </br>
                        <h1>Conciliacion de Ingresos</h1>
                        </br>                        
                        <div class="table-container">
                            <table id="ComparativeMonthlyConciliation">
                                <thead>
                                    <tr>
                                        <th>Codigo Cuenta</th>
                                        <th>Nombre Cuenta</th>
                                        <th>Valor Presupuestado</th>
                                        <th>Valor Mes Actual</th>
                                        <th>Diferencia</th>
                                        <th>Porcentaje </th>
                                        <th>Resultado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Se llenará dinámicamente -->
                                </tbody>
                            </table>
                        </div>                            

                        </br>
                        <h1>Conciliacion de Gastos</h1>
                        </br>                        
                        <div class="table-container">
                            <table id="ComparativeMonthlyConciliation_expenses">
                                <thead>
                                    <tr>
                                        <th>Codigo Cuenta</th>
                                        <th>Nombre Cuenta</th>
                                        <th>Valor Presupuestado</th>
                                        <th>Valor Mes Actual</th>
                                        <th>Diferencia</th>
                                        <th>Porcentaje </th>
                                        <th>Resultado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Se llenará dinámicamente -->
                                </tbody>
                            </table>
                        </div>   
                        
                        
                        </br>
                        <h1>Conciliacion de Costos</h1>
                        </br>                        
                        <div class="table-container">
                            <table id="ComparativeMonthlyConciliation_cost">
                                <thead>
                                    <tr>
                                        <th>Codigo Cuenta</th>
                                        <th>Nombre Cuenta</th>
                                        <th>Valor Presupuestado</th>
                                        <th>Valor Mes Actual</th>
                                        <th>Diferencia</th>
                                        <th>Porcentaje </th>
                                        <th>Resultado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Se llenará dinámicamente -->
                                </tbody>
                            </table>
                        </div>         


                `;
                const oldScript = document.getElementById('presupuesto-script_conciliation');
                if (oldScript) {
                    oldScript.remove();
                }                        
                const scriptConciliation = document.createElement('script');
                scriptConciliation.id = 'presupuesto-script_conciliation';
                scriptConciliation.src = './static/js/conciliacion_mensual_Presupuesto.js';
                scriptConciliation.onload = () => {
                    if (window.initConciliation) {
                        window.initConciliation(nit_actual);
                    }
                };
                scriptConciliation.onerror = (error) => {};
                document.body.appendChild(scriptConciliation);
                    
                } else {
                    alert("Aun no se ha generado presupuesto para este año");
                }
            }catch (error) {
                const paramsLogError = {
                    user_id: nit_actual, 
                    action_type: "ConciliationMonthlyBudget",  
                    action_details: "error ejecutando la conciliacion",
                    ip_address: "localhost", 
                    user_agent: "navegador o dispositivo",
                    error: 1, // quiere decir error
                    error_details: error.response.data.detail || error.message
                };
                const responseError = await fetch(UrlError_log, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(paramsLogError)
                });
            }
        },

        handleFileDrop(e) {
            const droppedFiles = Array.from(e.dataTransfer.files)
            this.validateAndAddFiles(droppedFiles)
        },
        handleFileSelect(e) {
            const selectedFiles = Array.from(e.target.files)
            this.validateAndAddFiles(selectedFiles)
        },
        validateAndAddFiles(newFiles) {
            const validFiles = newFiles.filter(file => {
                const extension = file.name.split('.').pop().toLowerCase()
                return ['xlsx', 'csv'].includes(extension)
            })

            if (validFiles.length !== newFiles.length) {
                alert('Algunos archivos no son válidos. Solo se aceptan archivos XLSX y CSV.')
            }

            this.files.push(...validFiles)
            this.uploadComplete = false
            this.simulateUpload()
        },
        removeFile(file) {
            const index = this.files.indexOf(file)
            if (index > -1) {
                this.files.splice(index, 1)
            }
            if (this.files.length === 0) {
                this.uploadComplete = false
            }
        },
        simulateUpload() {
            this.uploadProgress = 0
            const interval = setInterval(() => {
                this.uploadProgress += 10
                if (this.uploadProgress >= 100) {
                    clearInterval(interval)
                    setTimeout(() => {
                        this.uploadProgress = 0
                        this.uploadComplete = true
                    }, 1000)
                }
            }, 200)
        },
        async processFiles() {
            if (this.files.length === 0) {
                alert('No hay archivos para procesar.');
                return;
            }
            let Nit_Empresa;
            const userData = JSON.parse(sessionStorage.getItem("userData"));
            if (!userData || !userData.tax_id) {
                throw new Error("No se encontró el usuario o el tax_id en sessionStorage");
            }
            const tax_id = userData.tax_id;
            await this.$nextTick();
            this.isProcessing = true;
            this.showSummary = true;
            
            const promises = Array.from(this.files).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                try {

                    const response = await axios.post(`${UrlAPIUpload}?tax_id=${encodeURIComponent(tax_id)}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        onUploadProgress: progressEvent => {
                            this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        }
                    });
                    this.successFiles.push(file.name);
                    return { success: true, file: file.name };
                } catch (error) {
                    this.errorFiles.push({
                        name: file.name,
                        error: "hubo problemas con el archivo por favor revisar"
                    });                    
                    const paramsLogError = {
                        user_id: Nit_Empresa, // el userid
                        action_type: "almacenando Archivo: metodo: processFiles",  //tipo de accion
                        action_details: file.name,
                        ip_address: "localhost", 
                        user_agent: "navegador o dispositivo",
                        error: 1, // quiere decir error
                        error_details: error.response.data.detail || error.message
                    };
                    const responseError = await fetch(UrlError_log, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(paramsLogError)
                    });
                    return { success: false, file: file.name, error: error };
                }
            });
        
            try {
                await Promise.all(promises);
            } finally {
                this.files = [];
                this.isProcessing = false;
                this.uploadProgress = 0;
                this.uploadComplete = false; // Reset upload complete
            }
        },
    }
    
}).mount('#app')
