ALTER PROCEDURE [Admin].[GuardarPrediccionPresupuesto]
       @Nit_Empresa NVARCHAR(50),
       @Anio_Prediccion INT,
       @Mes NVARCHAR(20),
       @Valor_Predicho DECIMAL(18, 2),
       @Tendencia NVARCHAR(50),
       @Coeficiente_Diferencia DECIMAL(18, 2)
   AS
   BEGIN
       BEGIN TRY
           -- Comenzar transacción
           BEGIN TRANSACTION;

           -- Verificar si ya existe un registro con el mismo Nit_Empresa y Anio_Prediccion
           IF EXISTS (
               SELECT 1
               FROM [Admin].[PrediccionesPresupuesto_x_Empresa]
               WHERE Nit_Empresa = @Nit_Empresa
                 AND Anio_Prediccion = @Anio_Prediccion
                 AND Mes = @Mes
           )
           BEGIN
               -- Actualizar el registro existente
               UPDATE [Admin].[PrediccionesPresupuesto_x_Empresa]
               SET 
                   Valor_Predicho = @Valor_Predicho,
                   Tendencia = @Tendencia,
                   Coeficiente_Diferencia = @Coeficiente_Diferencia,
                   Fecha_Generacion = GETDATE()
               WHERE Nit_Empresa = @Nit_Empresa
                 AND Anio_Prediccion = @Anio_Prediccion
                 AND Mes = @Mes;

               SELECT 'Predicción actualizada exitosamente.' AS Mensaje;
           END
           ELSE
           BEGIN
               -- Insertar un nuevo registro
               INSERT INTO [Admin].[PrediccionesPresupuesto_x_Empresa] (
                   Nit_Empresa, Anio_Prediccion, Mes, 
                   Valor_Predicho, Tendencia, Coeficiente_Diferencia, Fecha_Generacion
               )
               VALUES (
                   @Nit_Empresa, @Anio_Prediccion, @Mes, 
                   @Valor_Predicho, @Tendencia, @Coeficiente_Diferencia, GETDATE()
               );

               SELECT 'Predicción guardada exitosamente.' AS Mensaje;
           END

           -- Confirmar transacción
           COMMIT TRANSACTION;

           -- Agregar un SELECT al final para devolver un mensaje
           SELECT 'Operación completada' AS Mensaje;
       END TRY
       BEGIN CATCH
           -- Revertir transacción en caso de error
           ROLLBACK TRANSACTION;

           -- Manejo de errores
           DECLARE @ErrorMensaje NVARCHAR(4000);
           DECLARE @ErrorNumero INT;
           DECLARE @ErrorSeveridad INT;
           DECLARE @ErrorEstado INT;
           DECLARE @ErrorLinea INT;

           SET @ErrorMensaje = ERROR_MESSAGE();
           SET @ErrorNumero = ERROR_NUMBER();
           SET @ErrorSeveridad = ERROR_SEVERITY();
           SET @ErrorEstado = ERROR_STATE();
           SET @ErrorLinea = ERROR_LINE();

           SELECT 
               @ErrorMensaje AS ErrorMensaje, 
               @ErrorNumero AS ErrorNumero, 
               @ErrorSeveridad AS ErrorSeveridad,
               @ErrorEstado AS ErrorEstado,
               @ErrorLinea AS ErrorLinea;
       END CATCH
   END;