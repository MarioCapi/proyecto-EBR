USE [EBR]
GO
/****** Object:  StoredProcedure [Admin].[sp_for_Product_Prediction_monthly]    Script Date: 1/3/2025 10:03:25 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [Admin].[sp_for_Product_Prediction_monthly]    
    @NIT NVARCHAR(50),   -- NIT de la empresa
	@ultimoAnio BIT = 0  -- opcional para filtrar por el último año
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
		FROM admin.companies emp
		INNER JOIN admin.Archivos arc ON emp.company_id = arc.empresaId
		INNER JOIN admin.DatosContables dat ON dat.ArchivoID = arc.archivoId
		WHERE emp.tax_id = @NIT
		  AND LEN(dat.CodigoCuenta) >= 7
		  AND (dat.CodigoCuenta LIKE '41%' OR dat.CodigoCuenta LIKE '4%') -- Incluye valores que comiencen con 41 o 4
		  AND dat.CodigoCuenta NOT LIKE '4175%' -- Excluye valores que comiencen con 4175
		  --AND dat.CodigoCuenta NOT LIKE '4180%' -- Excluye valores que comiencen con 4175
		  AND dat.CodigoCuenta NOT LIKE '42%' -- Excluye valores que comiencen con 42
		  AND (@ultimoAnio = 0 OR YEAR(arc.Periodo) = YEAR(GETDATE()) - 1) -- Condición para último año
 
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