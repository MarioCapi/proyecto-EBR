const { createApp } = Vue
const UrlAPIUpload = 'http://127.0.0.1:8080/upload/';
const UrlAPI_tot_prod_mes = 'http://127.0.0.1:8080/getTot_x_prod_mes/';


createApp({
    data() {
        return {
            isSidebarCollapsed: false,
            activeView: 'upload',
            uploadProgress: 0,
            files: [],
            uploadComplete: false,
            presupuestoData: null,
            presupuestoContent: '' // Nuevo
        }
    },
    methods: {        
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
                console.error('No se encontró el elemento tbody');
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
        },
        async loadPresupuestoContent() {            
            try {
                const nit_actual = '901292126'
                await this.$nextTick();
                const contentDiv = document.getElementById('content');
                if (!contentDiv) {
                    throw new Error('No se encontró el elemento con id "content"');
                }        
                contentDiv.innerHTML = `
                    <div id="report-container">
                        <table id="report-table" class="w-full">
                            <thead>
                                <tr>
                                    <th class="px-4 py-2">Año</th>
                                    <th class="px-4 py-2">Mes</th>
                                    <th class="px-4 py-2">Nombre del Mes</th>
                                    <th class="px-4 py-2">Total Débito</th>
                                    <th class="px-4 py-2">Total Crédito</th>
                                    <th class="px-4 py-2">Total Ingreso</th>
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
                            <table id="detailed-table" class="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr>
                                        <th class="border border-gray-300 px-4 py-2">Código Cuenta</th>
                                        <th class="border border-gray-300 px-4 py-2">Nombre Cuenta</th>
                                        <th class="border border-gray-300 px-4 py-2">Año</th>
                                        <th class="border border-gray-300 px-4 py-2">Mes</th>
                                        <th class="border border-gray-300 px-4 py-2">Total Débito</th>
                                        <th class="border border-gray-300 px-4 py-2">Total Crédito</th>
                                        <th class="border border-gray-300 px-4 py-2">Total Ingreso</th>
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
                const oldScript = document.getElementById('presupuesto-script');
                if (oldScript) {
                    oldScript.remove();
                }        
                // Cargar nuevo script
                const script = document.createElement('script');
                script.id = 'presupuesto-script';
                script.src = './static/js/presupuesto.js';
                script.onload = () => {
                    if (window.initPresupuesto) {
                        window.initPresupuesto();
                    }
                    this.agregarEventosClick(nit_actual);
                };
                script.onerror = (error) => {
                    console.error('Error al cargar el script de presupuesto:', error);
                };
                document.body.appendChild(script);
                
        
            } catch (error) {
                console.error('Error al cargar el contenido de presupuesto:', error);
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
        
                    console.log(`Fila clickeada: Año: ${anio}, Mes: ${mes}, NIT: ${nit}`); // Para depuración
        
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
                    console.log('Datos obtenidos:', resultados); // Para depuración
                    if (resultados.length > 0) {
                        this.mostrarTablaDetallada(resultados);
                    } else {
                        console.log('No se encontraron datos.');
                    }
                })
                .catch(error => {
                    console.error('Error al obtener datos:', error);
                    alert('Error al obtener datos. Intenta nuevamente.');
                });
        },

        mostrarTablaDetallada(resultados) {
            const detailedTableBody = document.querySelector('#detailed-table tbody');
            detailedTableBody.innerHTML = ''; // Limpiar contenido anterior
            resultados.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="border border-gray-300 px-4 py-2">${item.CodigoCuenta}</td>
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

        async loadPrediccionPresupuesto() {
            try {
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
                script.src = './static/js/prediccionesPresupuesto.js';
                script.onload = () => {
                    console.log('Script de predicciones cargado correctamente');
                    const predictionData = JSON.parse(sessionStorage.getItem('predictionData'));
                    if (window.initPredictions && predictionData) {
                        window.initPredictions(predictionData);
                    }
                      // Mostrar el botón después de cargar las predicciones
                    const savePredictionContainer = document.getElementById('savePredictionContainer');
                    if (savePredictionContainer) {
                        savePredictionContainer.classList.remove('hidden');
                    }

                };
                script.onerror = (error) => {
                    console.error('Error al cargar el script de predicciones:', error);
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
                console.error('Error al cargar el contenido de predicciones:', error);
            }
        },





        async loadPredictionXProducto()
        {
            try {
                const nit_actual = '901292126'
                await this.$nextTick();
                const contentDiv = document.getElementById('contentPresuXProduct');
                if (!contentDiv) {
                    throw new Error('No se encontró el elemento con id "content"');
                }        
                contentDiv.innerHTML = `

                <div id="report-container2">
                        <table id="report-table-products" class="w-full">
                            <thead>
                                <tr>
                                    <th class="px-4 py-2">Codigo</th>
                                    <th class="px-4 py-2">Producto</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                            <div id="pagination-controls" class="mt-4">
                                <button id="prev-page_products" class="px-4 py-2 bg-blue-500 text-white rounded" disabled><</button>
                                <span id="page-info_products" class="mx-2"></span>
                                <button id="next-page_products" class="px-4 py-2 bg-blue-500 text-white rounded">></button>
                            </div>
                        <div class="mt-8">
                            <canvas id="report-chart"></canvas>
                        </div>                        
                    </div>





                    <div id="report-container">
                        <table id="report-table-products-forecast" class="w-full">
                            <thead>
                                <tr>
                                    <th>Mes</th>
                                    <th>Valor</th>
                                </tr>
                            </thead>
                            <tbody id="report-table-products-forecast-body">
                                
                            </tbody>
                        </table>
                            <div id="pagination-controls" class="mt-4">
                                <button id="prev-page" class="px-4 py-2 bg-blue-500 text-white rounded" disabled><</button>
                                <span id="page-info" class="mx-2"></span>
                                <button id="next-page" class="px-4 py-2 bg-blue-500 text-white rounded">></button>
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
                script.src = './static/js/predict_x_prod_mes.js';
                script.onload = () => {
                    if (window.initPresupuesto_x_producto) {
                        window.initPresupuesto_x_producto();
                    }
                    //this.agregarEventosClick(nit_actual);
                };
                script.onerror = (error) => {
                    console.error('Error al cargar el script de presupuesto:', error);
                };
                document.body.appendChild(script);
                
        
            } catch (error) {
                console.error('Error al cargar el contenido de presupuesto:', error);
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
        
            // Procesar todos los archivos seleccionados
            const promises = Array.from(this.files).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
        
                try {
                    const response = await axios.post(UrlAPIUpload, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        onUploadProgress: progressEvent => {
                            this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        }
                    });
                    this.uploadComplete = true;
                } catch (error) {
                    alert('Error al procesar el archivo: ' + error.response?.data?.detail || error.message);
                    this.uploadProgress = 0;
                    this.uploadComplete = false;
                }
                alert('Archivo procesado con éxito: ' + JSON.stringify(response.data));
            });
        
            // Esperar a que todas las promesas se resuelvan            
            await Promise.all(promises);            
        }
    }
}).mount('#app')
