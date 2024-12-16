DECLARE @Mes INT = 4; -- Mes a consultar (1 para enero, 2 para febrero, etc.)
DECLARE @AnioBase INT = 2024; -- Año base actual para calcular los últimos tres años

SELECT 
    emp.NombreEmpresa, 
    emp.NIT, 
    arc.Periodo, 
    dat.CodigoCuenta, 
    dat.Debito, 
    dat.Credito
FROM 
    admin.empresas emp
    INNER JOIN admin.Archivos arc ON emp.empresaId = arc.empresaId
    INNER JOIN admin.DatosContables dat ON dat.ArchivoID = arc.archivoId
WHERE
    dat.CodigoCuenta LIKE '4%' 
    AND MONTH(arc.Periodo) = @Mes
    AND YEAR(arc.Periodo) BETWEEN @AnioBase - 2 AND @AnioBase;
