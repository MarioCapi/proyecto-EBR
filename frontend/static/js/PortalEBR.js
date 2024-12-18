const { createApp } = Vue
const UrlAPIUpload = 'http://127.0.0.1:8080/upload/';
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
        },
        
        async loadPresupuestoContent() {
            try {
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
                    console.log('Script de presupuesto cargado correctamente');
                    if (window.initPresupuesto) {
                        window.initPresupuesto();
                    }
                };
                script.onerror = (error) => {
                    console.error('Error al cargar el script de presupuesto:', error);
                };
                document.body.appendChild(script);
        
            } catch (error) {
                console.error('Error al cargar el contenido de presupuesto:', error);
            }
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
                                <i class="fas fa-clock"></i>
                                <span id="generationDate"></span>
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
                };
                script.onerror = (error) => {
                    console.error('Error al cargar el script de predicciones:', error);
                };
                document.body.appendChild(script);
        
            } catch (error) {
                console.error('Error al cargar el contenido de predicciones:', error);
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
                alert('No hay archivos para procesar.')
                return
            }

            const file = this.files[0] // Procesar solo el primer archivo seleccionado
            const formData = new FormData()
            formData.append('file', file)

            try {
                const response = await axios.post(UrlAPIUpload, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: progressEvent => {
                        this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    }
                })

                alert('Archivo procesado con éxito: ' + JSON.stringify(response.data))
                this.uploadComplete = true
            } catch (error) {
                alert('Error al procesar el archivo: ' + error.response?.data?.detail || error.message)
                this.uploadProgress = 0
                this.uploadComplete = false
            }
        }
    }
}).mount('#app')
