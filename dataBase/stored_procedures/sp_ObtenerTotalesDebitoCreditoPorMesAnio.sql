/*Este Store procedure retorna todas las diferencias calculadas para 
cada uno de los meses del año partidendo de un año base y retornando valores para los
ultimos 3 años
*/
USE [EBR]
GO
/****** Object:  StoredProcedure [Admin].[sp_ObtenerTotalesDebitoCreditoPorMesAnio]    Script Date: 12/18/2024 9:24:51 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [Admin].[sp_ObtenerTotalesDebitoCreditoPorMesAnio]
    @AnioBase INT,      -- Año base actual para calcular los últimos tres años
    @NIT NVARCHAR(50)   -- NIT de la empresa
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Imprimir los valores de los parámetros recibidos
        /*PRINT 'Parámetros recibidos:';  PRINT 'Año Base: ' + CAST(@AnioBase AS NVARCHAR); PRINT 'NIT: ' + @NIT;*/
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

            -- Diferencia entre total Crédito y total Débito
            SUM(CASE 
                    WHEN LEN(dat.CodigoCuenta) = 4 THEN dat.Credito 
                    ELSE 0 
                END) - 
            SUM(CASE 
                    WHEN LEN(dat.CodigoCuenta) = 4 THEN dat.Debito 
                    ELSE 0 
                END) AS Diferencia

        FROM 
            admin.companies emp
            INNER JOIN admin.Archivos arc ON emp.company_id = arc.empresaId
            INNER JOIN admin.DatosContables dat ON dat.ArchivoID = arc.archivoId
        WHERE emp.tax_id = @NIT
            AND dat.CodigoCuenta LIKE '4%'
            AND YEAR(arc.Periodo) BETWEEN @AnioBase - 2 AND @AnioBase
        GROUP BY 
            YEAR(arc.Periodo),
            MONTH(arc.Periodo),
            DATENAME(MONTH, arc.Periodo)
        ORDER BY 
            YEAR(arc.Periodo) ASC,
            MONTH(arc.Periodo) ASC;

    END TRY
    BEGIN CATCH
        -- Manejo de errores
        PRINT 'Ocurrió un error:';
        PRINT 'Mensaje: ' + ERROR_MESSAGE();
        PRINT 'Número de Error: ' + CAST(ERROR_NUMBER() AS NVARCHAR);
        PRINT 'Estado: ' + CAST(ERROR_STATE() AS NVARCHAR);
    END CATCH
END;
