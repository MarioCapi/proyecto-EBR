const { createApp } = Vue

createApp({
    data() {
        return {
            isSidebarCollapsed: false,
            activeView: 'upload',
            uploadProgress: 0,
            files: [],
            uploadComplete: false
        }
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed
        },
        setActiveView(view) {
            this.activeView = view
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
        processFiles() {
            // Aquí iría la lógica para procesar los archivos
            alert('Procesando archivos...')
        }
    }
}).mount('#app')
