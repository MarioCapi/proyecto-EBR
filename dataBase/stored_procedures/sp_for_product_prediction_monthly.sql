USE [EBR]
GO
/****** Object:  StoredProcedure [Admin].[sp_ObtenerTotalesDebitoCreditoPorMesAnio]    Script Date: 12/18/2024 9:24:51 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Alter PROCEDURE [Admin].[sp_for_Product_Prediction_monthly]    
    @NIT NVARCHAR(50)   -- NIT de la empresa
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
		SELECT 
			dat.CodigoCuenta,
			dat.NombreCuenta,
			YEAR(arc.Periodo) AS Anio,
			MONTH(arc.Periodo) AS Mes,
			SUM(dat.debito) AS TotalDebito,
			SUM(dat.credito) AS TotalCredito,
			SUM(dat.credito) - SUM(dat.debito) AS TotalIngreso
		FROM admin.empresas emp
		INNER JOIN admin.Archivos arc ON emp.empresaId = arc.empresaId
		INNER JOIN admin.DatosContables dat ON dat.ArchivoID = arc.archivoId
		WHERE emp.nit = @NIT
		  AND dat.CodigoCuenta LIKE '4%'
		  AND LEN(dat.CodigoCuenta) >= 7		  
		GROUP BY 
			dat.CodigoCuenta, 
			dat.NombreCuenta, 
			YEAR(arc.Periodo), 
			MONTH(arc.Periodo)
		ORDER BY 
			dat.CodigoCuenta, 
			Anio, 
			Mes;
	END TRY
		BEGIN CATCH			
			PRINT 'Ocurrió un error:';
			PRINT 'Mensaje: ' + ERROR_MESSAGE();
			PRINT 'Número de Error: ' + CAST(ERROR_NUMBER() AS NVARCHAR);
			PRINT 'Estado: ' + CAST(ERROR_STATE() AS NVARCHAR);
		END CATCH
	END;