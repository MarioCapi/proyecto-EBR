/*Este Store procedure retorna todas las diferencias calculadas para 
cada uno de los meses del año partidendo de un año base y retornando valores para los
ultimos 3 años
*/
USE [EBR]
GO

CREATE PROCEDURE [Admin].[sp_ObtenerTotalesDebitoCreditoPorMesAnio]
    @AnioBase INT      -- Año base actual para calcular los últimos tres años
AS
BEGIN
    SET NOCOUNT ON;

    -- Consulta para sumar los valores por año y mes
    SELECT 
        YEAR(arc.Periodo) AS Anio,
        MONTH(arc.Periodo) AS Mes,
        DATENAME(MONTH, arc.Periodo) AS NombreMes,

        -- Nueva lógica: Sumar solo los valores donde CodigoCuenta tiene 4 dígitos
        SUM(CASE 
                WHEN LEN(dat.CodigoCuenta) = 4 THEN dat.Debito 
                ELSE 0 
            END) AS TotalDebito,

        SUM(CASE 
                WHEN LEN(dat.CodigoCuenta) = 4 THEN dat.Credito 
                ELSE 0 
            END) AS TotalCredito,

        -- Diferencia entre total Crédito y total Débito (repetir la lógica aquí)
        SUM(CASE 
                WHEN LEN(dat.CodigoCuenta) = 4 THEN dat.Credito 
                ELSE 0 
            END) - 
        SUM(CASE 
                WHEN LEN(dat.CodigoCuenta) = 4 THEN dat.Debito 
                ELSE 0 
            END) AS Diferencia

    FROM 
        admin.empresas emp
        INNER JOIN admin.Archivos arc ON emp.empresaId = arc.empresaId
        INNER JOIN admin.DatosContables dat ON dat.ArchivoID = arc.archivoId
    WHERE
        dat.CodigoCuenta LIKE '4%'  -- Mantener filtro de códigos que comienzan con '4'
        AND YEAR(arc.Periodo) BETWEEN @AnioBase - 2 AND @AnioBase
    GROUP BY 
        YEAR(arc.Periodo),
        MONTH(arc.Periodo),
        DATENAME(MONTH, arc.Periodo)
    ORDER BY 
        YEAR(arc.Periodo) ASC,
        MONTH(arc.Periodo) ASC;

END;
GO
