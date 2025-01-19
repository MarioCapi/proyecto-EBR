
CREATE or ALTER  PROCEDURE Admin.sp_Presupuesto_CostoSugerido_vs_CostoMes  
    @NIT NVARCHAR(20),  
    @Anio INT,  
    @Mes INT  
AS  
BEGIN TRY  
    SET NOCOUNT ON;  
    DECLARE @MesColumna NVARCHAR(50);  
 DECLARE @ARCHIVOID INT;  
    BEGIN  
 SELECT @ARCHIVOID = ArchivoID  
   FROM admin.Archivos  
   WHERE YEAR(Periodo) = @Anio  
     AND MONTH(Periodo) = @Mes;  
  
        -- Asignar el nombre de la columna del mes basado en el parámetro @Mes  
        SET @MesColumna = CASE   
            WHEN @Mes = 1 THEN 'Enero'  
            WHEN @Mes = 2 THEN 'Febrero'  
            WHEN @Mes = 3 THEN 'Marzo'  
            WHEN @Mes = 4 THEN 'Abril'  
            WHEN @Mes = 5 THEN 'Mayo'  
            WHEN @Mes = 6 THEN 'Junio'  
            WHEN @Mes = 7 THEN 'Julio'  
            WHEN @Mes = 8 THEN 'Agosto'  
            WHEN @Mes = 9 THEN 'Septiembre'  
            WHEN @Mes = 10 THEN 'Octubre'  
            WHEN @Mes = 11 THEN 'Noviembre'  
            WHEN @Mes = 12 THEN 'Diciembre'  
            ELSE NULL  
        END;  
  
        -- Validar si el mes es válido  
        IF @MesColumna IS NULL  
        BEGIN  
            RAISERROR ('El parámetro @Mes debe estar entre 1 y 12', 16, 1);  
            RETURN;  
        END;  
  
        -- Crear tabla temporal para almacenar resultados  
        CREATE TABLE #Resultados (  
            CodigoCuenta NVARCHAR(50),  
            NombreCuenta NVARCHAR(255),  
            CodigoProducto NVARCHAR(50),  
            ValorPresupuesto DECIMAL(18, 2),  
            TotalIngreso DECIMAL(18, 2),  
            Diferencia DECIMAL(18, 2),  
            PorcentajeDiferencia DECIMAL(18, 2),  
            Resultado NVARCHAR(50)  
        );  
  
        -- Insertar los datos comparados  
        INSERT INTO #Resultados (CodigoCuenta, NombreCuenta, 
								CodigoProducto, ValorPresupuesto, 
								TotalIngreso, Diferencia, 
								PorcentajeDiferencia, Resultado)  
        SELECT   
            dc.CodigoCuenta,  
            dc.NombreCuenta,  
            pc.CodigoProducto,  
            ISNULL(CAST(CASE   
                WHEN @MesColumna = 'Enero' THEN pc.Enero  
                WHEN @MesColumna = 'Febrero' THEN pc.Febrero  
                WHEN @MesColumna = 'Marzo' THEN pc.Marzo  
                WHEN @MesColumna = 'Abril' THEN pc.Abril  
                WHEN @MesColumna = 'Mayo' THEN pc.Mayo  
                WHEN @MesColumna = 'Junio' THEN pc.Junio  
                WHEN @MesColumna = 'Julio' THEN pc.Julio  
                WHEN @MesColumna = 'Agosto' THEN pc.Agosto  
                WHEN @MesColumna = 'Septiembre' THEN pc.Septiembre  
                WHEN @MesColumna = 'Octubre' THEN pc.Octubre  
                WHEN @MesColumna = 'Noviembre' THEN pc.Noviembre  
                WHEN @MesColumna = 'Diciembre' THEN pc.Diciembre  
            END AS DECIMAL(18, 2)), 0) AS ValorPresupuesto,  
            (dc.Debito - dc.Credito) AS TotalIngreso,  
            (dc.Debito -dc.Credito) - ISNULL(CAST(CASE   
                WHEN @MesColumna = 'Enero' THEN pc.Enero  
                WHEN @MesColumna = 'Febrero' THEN pc.Febrero  
                WHEN @MesColumna = 'Marzo' THEN pc.Marzo  
                WHEN @MesColumna = 'Abril' THEN pc.Abril  
                WHEN @MesColumna = 'Mayo' THEN pc.Mayo  
                WHEN @MesColumna = 'Junio' THEN pc.Junio  
                WHEN @MesColumna = 'Julio' THEN pc.Julio  
                WHEN @MesColumna = 'Agosto' THEN pc.Agosto  
                WHEN @MesColumna = 'Septiembre' THEN pc.Septiembre  
                WHEN @MesColumna = 'Octubre' THEN pc.Octubre  
                WHEN @MesColumna = 'Noviembre' THEN pc.Noviembre  
                WHEN @MesColumna = 'Diciembre' THEN pc.Diciembre  
            END AS DECIMAL(18, 2)), 0) AS Diferencia,  
            CASE   
                WHEN ISNULL(CAST(CASE   
                    WHEN @MesColumna = 'Enero' THEN pc.Enero  
                    WHEN @MesColumna = 'Febrero' THEN pc.Febrero  
                    WHEN @MesColumna = 'Marzo' THEN pc.Marzo  
                    WHEN @MesColumna = 'Abril' THEN pc.Abril  
                 WHEN @MesColumna = 'Mayo' THEN pc.Mayo  
                    WHEN @MesColumna = 'Junio' THEN pc.Junio  
                    WHEN @MesColumna = 'Julio' THEN pc.Julio  
                    WHEN @MesColumna = 'Agosto' THEN pc.Agosto  
                    WHEN @MesColumna = 'Septiembre' THEN pc.Septiembre  
                    WHEN @MesColumna = 'Octubre' THEN pc.Octubre  
                    WHEN @MesColumna = 'Noviembre' THEN pc.Noviembre  
                    WHEN @MesColumna = 'Diciembre' THEN pc.Diciembre  
                END AS DECIMAL(18, 2)), 0) = 0 THEN NULL  
                ELSE ((dc.Debito -dc.Credito) - ISNULL(CAST(CASE   
                    WHEN @MesColumna = 'Enero' THEN pc.Enero  
                    WHEN @MesColumna = 'Febrero' THEN pc.Febrero  
                    WHEN @MesColumna = 'Marzo' THEN pc.Marzo  
                    WHEN @MesColumna = 'Abril' THEN pc.Abril  
                    WHEN @MesColumna = 'Mayo' THEN pc.Mayo  
                    WHEN @MesColumna = 'Junio' THEN pc.Junio  
                    WHEN @MesColumna = 'Julio' THEN pc.Julio  
                    WHEN @MesColumna = 'Agosto' THEN pc.Agosto  
                    WHEN @MesColumna = 'Septiembre' THEN pc.Septiembre  
                    WHEN @MesColumna = 'Octubre' THEN pc.Octubre  
                    WHEN @MesColumna = 'Noviembre' THEN pc.Noviembre  
                    WHEN @MesColumna = 'Diciembre' THEN pc.Diciembre  
                END AS DECIMAL(18, 2)), 0)) / CAST(CASE   
                    WHEN @MesColumna = 'Enero' THEN pc.Enero  
                    WHEN @MesColumna = 'Febrero' THEN pc.Febrero  
                    WHEN @MesColumna = 'Marzo' THEN pc.Marzo  
                    WHEN @MesColumna = 'Abril' THEN pc.Abril  
                    WHEN @MesColumna = 'Mayo' THEN pc.Mayo  
                    WHEN @MesColumna = 'Junio' THEN pc.Junio  
                    WHEN @MesColumna = 'Julio' THEN pc.Julio  
                    WHEN @MesColumna = 'Agosto' THEN pc.Agosto  
                    WHEN @MesColumna = 'Septiembre' THEN pc.Septiembre  
                    WHEN @MesColumna = 'Octubre' THEN pc.Octubre  
                    WHEN @MesColumna = 'Noviembre' THEN pc.Noviembre  
                    WHEN @MesColumna = 'Diciembre' THEN pc.Diciembre  
                END AS DECIMAL(18, 2)) * 100  
            END AS PorcentajeDiferencia,  
            CASE   
                WHEN ((dc.Debito - dc.Credito) - ISNULL(CAST(CASE   
                    WHEN @MesColumna = 'Enero' THEN pc.Enero  
                    WHEN @MesColumna = 'Febrero' THEN pc.Febrero  
                    WHEN @MesColumna = 'Marzo' THEN pc.Marzo  
                    WHEN @MesColumna = 'Abril' THEN pc.Abril  
                    WHEN @MesColumna = 'Mayo' THEN pc.Mayo  
                    WHEN @MesColumna = 'Junio' THEN pc.Junio  
                    WHEN @MesColumna = 'Julio' THEN pc.Julio  
                    WHEN @MesColumna = 'Agosto' THEN pc.Agosto  
                    WHEN @MesColumna = 'Septiembre' THEN pc.Septiembre  
                    WHEN @MesColumna = 'Octubre' THEN pc.Octubre  
                    WHEN @MesColumna = 'Noviembre' THEN pc.Noviembre  
                    WHEN @MesColumna = 'Diciembre' THEN pc.Diciembre  
                END AS DECIMAL(18, 2)), 0)) > 0 THEN 'Incremento'  
                ELSE 'Decremento'  
            END AS Resultado  
        FROM admin.datosContables dc  
        LEFT JOIN Admin.PresupuestoCosto pc  
				ON dc.CodigoCuenta = pc.CodigoProducto  
        WHERE dc.ArchivoID=@ARCHIVOID  
				AND pc.AnioPresupuesto = @Anio  
				AND pc.NIT = @NIT;  
  
        -- Retornar los resultados  
        SELECT * FROM #Resultados;  
  
        -- Limpiar tabla temporal  
        DROP TABLE #Resultados;  
    END;  
END TRY  
BEGIN CATCH  
    IF @@TRANCOUNT > 0  
    BEGIN  
        ROLLBACK TRANSACTION;  
    END;  
  
    DECLARE @ErrorMessage NVARCHAR(4000);  
    DECLARE @ErrorSeverity INT;  
    DECLARE @ErrorState INT;  
  
    SELECT   
        @ErrorMessage = ERROR_MESSAGE(),  
        @ErrorSeverity = ERROR_SEVERITY(),  
        @ErrorState = ERROR_STATE();  
  
    RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);  
END CATCH;  