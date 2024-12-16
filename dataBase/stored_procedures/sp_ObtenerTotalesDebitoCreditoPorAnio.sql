CREATE PROCEDURE sp_ObtenerTotalesDebitoCreditoPorAnio
    @Mes INT,          -- Mes a consultar
    @AnioBase INT      -- Año base actual para calcular los últimos tres años
AS
BEGIN
    SET NOCOUNT ON;

    -- Consulta para sumar los valores por año
    SELECT 
        YEAR(arc.Periodo) AS Anio,
        SUM(dat.Debito) AS TotalDebito,
        SUM(dat.Credito) AS TotalCredito,
        SUM(dat.Debito) - SUM(dat.Credito) AS Diferencia
    FROM 
        admin.empresas emp
        INNER JOIN admin.Archivos arc ON emp.empresaId = arc.empresaId
        INNER JOIN admin.DatosContables dat ON dat.ArchivoID = arc.archivoId
    WHERE
        dat.CodigoCuenta LIKE '4%'
        AND MONTH(arc.Periodo) = @Mes
        AND YEAR(arc.Periodo) BETWEEN @AnioBase - 2 AND @AnioBase
    GROUP BY 
        YEAR(arc.Periodo)
    ORDER BY 
        YEAR(arc.Periodo) DESC;
END;
