EXEC Admin.InsertarEmpresa @NombreEmpresa = 'Mi Empresa', @NIT = '1234567890'

EXEC Admin.InsertarArchivo 
    @NombreArchivo = 'Reporte2024.pdf', 
    @EmpresaID = 1, 
    @Periodo = '2024-01-01'
