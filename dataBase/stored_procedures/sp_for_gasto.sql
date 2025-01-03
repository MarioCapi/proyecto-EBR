USE [EBR]
GO
/****** Object:  StoredProcedure [Admin].[sp_for_Gasto]    Script Date: 1/3/2025 3:11:18 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER   PROCEDURE [Admin].[sp_for_Gasto]    
    @NIT_Empresa NVARCHAR(50)   -- NIT de la empresa
AS
BEGIN
    SET NOCOUNT ON;
		BEGIN TRY
			SELECT  dat.CodigoCuenta,
					dat.NombreCuenta,
					YEAR(arc.Periodo) AS Anio,
					MONTH(arc.Periodo) AS Mes,
					SUM(dat.debito) AS TotalDebito,
					SUM(dat.credito) AS TotalCredito,
					SUM(dat.debito)  - SUM(dat.credito) AS Gasto
				FROM admin.empresas emp
				INNER JOIN admin.Archivos arc ON emp.empresaId = arc.empresaId
				INNER JOIN admin.DatosContables dat ON dat.ArchivoID = arc.archivoId
				WHERE emp.nit = @NIT_Empresa
					AND YEAR(arc.Periodo) = YEAR(GETDATE()) - 1
					AND (
							(LEN(dat.CodigoCuenta) = 6 AND (dat.CodigoCuenta LIKE '5105%')) -- Incluye valores 
							OR (dat.CodigoCuenta LIKE '5%' AND  ((LEN(dat.CodigoCuenta) = 4) AND (dat.CodigoCuenta NOT LIKE '5105%' AND dat.CodigoCuenta NOT LIKE '5205%')))
						
							OR (
								(LEN(dat.CodigoCuenta) = 6 AND (dat.CodigoCuenta LIKE '5205%')) -- Incluye valores 
								OR (dat.CodigoCuenta LIKE '5%' AND((LEN(dat.CodigoCuenta) = 4) AND (dat.CodigoCuenta NOT LIKE '5105%' AND dat.CodigoCuenta NOT LIKE '5205%')))
								)								
							)
						
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