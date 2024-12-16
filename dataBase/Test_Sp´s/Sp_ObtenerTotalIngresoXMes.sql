USE [EBR]
GO

DECLARE @Mes INT = 4;        -- Establecer el mes a consultar (1 para enero)
DECLARE @AnioBase INT = 2024; -- Establecer el año base más reciente

EXEC [dbo].[sp_ObtenerTotalIngresoXMes]
    @Mes = @Mes,
    @AnioBase = @AnioBase;
GO

DECLARE @Mes int =1
DECLARE @AnioBase int = 2024
EXECUTE [dbo].[sp_ObtenerTotalesDebitoCreditoPorAnio] 
   @Mes
  ,@AnioBase
GO

