/*Este Store procedure retorna todas las diferencias calculadas para 
cada uno de los meses del año partidendo de un año base y retornando valores para los
ultimos 3 años
*/
CREATE PROCEDURE sp_ObtenerTotalesDebitoCreditoPorMesAnio
    @AnioBase INT      -- Año base actual para calcular los últimos tres años
AS
BEGIN
    SET NOCOUNT ON;

    -- Consulta para sumar los valores por año y mes
    SELECT 
        YEAR(arc.Periodo) AS Anio,
        MONTH(arc.Periodo) AS Mes,
        DATENAME(MONTH, arc.Periodo) AS NombreMes,
        SUM(dat.Debito) AS TotalDebito,
        SUM(dat.Credito) AS TotalCredito,
        SUM(dat.Credito) - SUM(dat.Debito) AS Diferencia
    FROM 
        admin.empresas emp
        INNER JOIN admin.Archivos arc ON emp.empresaId = arc.empresaId
        INNER JOIN admin.DatosContables dat ON dat.ArchivoID = arc.archivoId
    WHERE
        dat.CodigoCuenta LIKE '4%'
        AND YEAR(arc.Periodo) BETWEEN @AnioBase - 2 AND @AnioBase
    GROUP BY 
        YEAR(arc.Periodo),
        MONTH(arc.Periodo),
        DATENAME(MONTH, arc.Periodo)
    ORDER BY 
        YEAR(arc.Periodo) DESC,
        MONTH(arc.Periodo) ASC;
END;
