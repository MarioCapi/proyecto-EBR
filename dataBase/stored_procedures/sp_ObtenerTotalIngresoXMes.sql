CREATE PROCEDURE sp_ObtenerTotalIngresoXMes
    @Mes INT,          -- Mes a consultar
    @AnioBase INT      -- Año base actual para calcular los últimos tres años
AS
BEGIN
    SET NOCOUNT ON;
    -- Declaración de variables para los totales
    DECLARE @TotalDebito DECIMAL(18, 2);
    DECLARE @TotalCredito DECIMAL(18, 2);
    DECLARE @Diferencia DECIMAL(18, 2);

    -- Cálculo de totales
    SELECT 
        @TotalDebito = SUM(dat.Debito),
        @TotalCredito = SUM(dat.Credito)
    FROM 
        admin.empresas emp
        INNER JOIN admin.Archivos arc ON emp.empresaId = arc.empresaId
        INNER JOIN admin.DatosContables dat ON dat.ArchivoID = arc.archivoId
    WHERE
        dat.CodigoCuenta LIKE '4%'
        AND MONTH(arc.Periodo) = @Mes
        AND YEAR(arc.Periodo) BETWEEN @AnioBase - 2 AND @AnioBase;

    -- Cálculo de la diferencia
    SET @Diferencia = @TotalDebito - @TotalCredito;

    -- Retorno de los resultados
    SELECT 
        @TotalDebito AS TotalDebito, 
        @TotalCredito AS TotalCredito, 
        @Diferencia AS Diferencia;
END;
