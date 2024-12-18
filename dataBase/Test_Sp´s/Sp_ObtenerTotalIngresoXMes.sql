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



DECLARE @AnioBase int = 2024
EXECUTE [admin].[sp_ObtenerTotalesDebitoCreditoPorMesAnio]    
  @AnioBase
GO




-- ================================================================================================
-- ================================================================================================
/*GUARDAR Y CONSULTAR PREDICCIONES PRESUPUESTO*/
DECLARE @Nit_Empresa NVARCHAR(50) = '901292126'
DECLARE @Anio_Prediccion INT = 2024
DECLARE @Mes NVARCHAR(20) = 'ENERO'
DECLARE @Valor_Predicho DECIMAL(18, 2) = 1500
DECLARE @Tendencia NVARCHAR(50) = 'INCREMENTO'
DECLARE @Coeficiente_Diferencia DECIMAL(18, 2) = 770 
EXECUTE [admin].GuardarPrediccionPresupuesto    
   @Nit_Empresa
  ,@Anio_Prediccion
  ,@Mes
  ,@Valor_Predicho
  ,@Valor_Predicho
  ,@Coeficiente_Diferencia
GO

DECLARE @Nit_Empresa NVARCHAR(50) = '901292126'
DECLARE @Anio_Prediccion INT = 2024
execute [Admin].[ConsultaPrediccionPresupuesto]
@Nit_Empresa,
@Anio_Prediccion
go


SELECT * FROM [Admin].[PrediccionesPresupuesto_x_Empresa]

-- ================================================================================================
-- ================================================================================================
