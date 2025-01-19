USE [ebr]
GO
/****** Object:  StoredProcedure [admin].[sp_for_Gasto]    Script Date: 1/18/2025 4:04:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER     PROCEDURE [admin].[sp_for_Gasto]    
    @NIT_Empresa NVARCHAR(50)   -- NIT de la empresa
AS
BEGIN
    SET NOCOUNT ON;
		BEGIN TRY
		/*
			se calcula el porcentaje de aumento del auxilio de 
			transporte con base al total impuesto por el gobierno
			para el año 2025 es de $200.000  y de acuerdo al anterior año 2024
			que el valor era 162000 conclusion el aumento fue del : 23.456789%
			este valor se almacena en la tabla [admin].[SalaryAndInflationData]
		*/
			-- Declarar una variable para el porcentaje de incremento
			DECLARE @PorcentajeIncremento DECIMAL(10, 2);
			DECLARE @PorcentajeIncAuxTrans DECIMAL(10,2);
			
			DECLARE @ValorIncAuxTrans51 DECIMAL(10,2);
			DECLARE @ValorIncAuxTrans52 DECIMAL(10,2);

			DECLARE @ValorIncSueldo510506 DECIMAL(10,2);
			DECLARE @ValorIncSueldo520506 DECIMAL(10,2);
			

			DECLARE @ARCHIVOID INT;
			-- Obtener el porcentaje de incremento del año actual
			
			
			
			SELECT @PorcentajeIncAuxTrans = PorcentajeAuxTransporte
			FROM admin.SalaryAndInflationData
			WHERE Anio = YEAR(GETDATE());
			

			SELECT top 1 @ARCHIVOID = ArchivoID /*retorna el maximo archivo ID para el ultimo periodo  cargado*/
			FROM admin.companies emp 
				INNER JOIN  admin.Archivos arc ON emp.company_id = arc.empresaId				
			WHERE emp.tax_id = @NIT_Empresa	
			ORDER BY arc.PERIODO DESC;
			
			SELECT  @ValorIncAuxTrans51 = (SUM(dat.debito) - SUM(dat.credito)) * (1 + @PorcentajeIncAuxTrans / 100.0)					
			FROM admin.Archivos arc 
				INNER JOIN admin.DatosContables dat ON dat.ArchivoID = arc.archivoId
			WHERE DAT.ArchivoID=@ARCHIVOID
			AND dat.CodigoCuenta = '510527' --- > AUXILIO DE transporte
			GROUP BY dat.CodigoCuenta
			
			SELECT @ValorIncAuxTrans52 = (SUM(dat.debito) - SUM(dat.credito)) * (1 + @PorcentajeIncAuxTrans / 100.0)
			FROM admin.Archivos arc 
				INNER JOIN admin.DatosContables dat ON dat.ArchivoID = arc.archivoId
			WHERE DAT.ArchivoID=@ARCHIVOID
			AND dat.CodigoCuenta = '520527' --- > AUXILIO DE transporte
			GROUP BY dat.CodigoCuenta
		

			SELECT @PorcentajeIncremento = PorcentajeIncremento			
			FROM admin.SalaryAndInflationData
			WHERE Anio = YEAR(GETDATE());


			SELECT  @ValorIncSueldo510506 = (SUM(dat.debito) - SUM(dat.credito)) * (1 + @PorcentajeIncremento / 100.0)					
			FROM admin.Archivos arc 
				INNER JOIN admin.DatosContables dat ON dat.ArchivoID = arc.archivoId
			WHERE DAT.ArchivoID=@ARCHIVOID
			AND dat.CodigoCuenta = '510506' --- > 
			GROUP BY dat.CodigoCuenta
			
			SELECT @ValorIncSueldo520506 = (SUM(dat.debito) - SUM(dat.credito)) * (1 + @PorcentajeIncremento / 100.0)
			FROM admin.Archivos arc 
				INNER JOIN admin.DatosContables dat ON dat.ArchivoID = arc.archivoId
			WHERE DAT.ArchivoID=@ARCHIVOID
			AND dat.CodigoCuenta = '520506' --- > 
			GROUP BY dat.CodigoCuenta


			-- Consulta principal con ajuste en "Gasto"
			SELECT  
				dat.CodigoCuenta,
				dat.NombreCuenta,
				YEAR(arc.Periodo) AS Anio,
				MONTH(arc.Periodo) AS Mes,
				SUM(dat.debito) AS TotalDebito,
				SUM(dat.credito) AS TotalCredito,
				CASE 
					WHEN dat.CodigoCuenta = '510506' THEN @ValorIncSueldo510506
					WHEN dat.CodigoCuenta = '520506' THEN @ValorIncSueldo520506
					WHEN dat.CodigoCuenta = '510527' THEN @ValorIncAuxTrans51
					WHEN dat.CodigoCuenta = '520527' THEN @ValorIncAuxTrans52
					ELSE SUM(dat.debito) - SUM(dat.credito)					
				END AS Gasto

			FROM 
				admin.companies emp
			INNER JOIN 
				admin.Archivos arc ON emp.company_id = arc.empresaId
			INNER JOIN 
				admin.DatosContables dat ON dat.ArchivoID = arc.archivoId
			WHERE 
				emp.tax_id = @NIT_Empresa
				AND YEAR(arc.Periodo) = YEAR(GETDATE()) - 1
				AND (
					(LEN(dat.CodigoCuenta) = 6 AND (dat.CodigoCuenta LIKE '5105%')) -- Incluye valores 
					OR (dat.CodigoCuenta LIKE '5%' AND ((LEN(dat.CodigoCuenta) = 4) 
						AND (dat.CodigoCuenta NOT LIKE '5105%' AND dat.CodigoCuenta NOT LIKE '5205%')))
					OR (
						(LEN(dat.CodigoCuenta) = 6 AND (dat.CodigoCuenta LIKE '5205%')) -- Incluye valores 
						OR (dat.CodigoCuenta LIKE '5%' AND ((LEN(dat.CodigoCuenta) = 4) 
							AND (dat.CodigoCuenta NOT LIKE '5105%' AND dat.CodigoCuenta NOT LIKE '5205%')))
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