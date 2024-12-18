USE [EBR]
GO
/****** Object:  StoredProcedure [Admin].[ConsultaPrediccionPresupuesto]    Script Date: 12/18/2024 12:04:58 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [Admin].[ConsultaPrediccionPresupuesto]
    @Nit_Empresa NVARCHAR(20),
    @Anio_Prediccion INT
AS
BEGIN
    BEGIN TRY
        -- Consultar datos filtrados por NIT y Año
        SELECT 
            Nit_Empresa,
            Anio_Prediccion,
            Mes,
            Valor_Predicho,
            Tendencia,
            Coeficiente_Diferencia,
            Fecha_Generacion
        FROM [Admin].[PrediccionesPresupuesto_x_Empresa]
        WHERE Nit_Empresa = @Nit_Empresa AND Anio_Prediccion = @Anio_Prediccion;

        -- Si no hay resultados, enviar mensaje
        IF NOT EXISTS (
            SELECT 1 
            FROM [Admin].[PrediccionesPresupuesto_x_Empresa]
            WHERE Nit_Empresa = @Nit_Empresa AND Anio_Prediccion = @Anio_Prediccion
        )
        BEGIN
            SELECT 'No se encontraron predicciones para los parámetros especificados.' AS Mensaje;
        END
    END TRY
    BEGIN CATCH
        -- Manejo de errores
        SELECT 
            ERROR_MESSAGE() AS ErrorMensaje, 
            ERROR_NUMBER() AS ErrorNumero, 
            ERROR_SEVERITY() AS ErrorSeveridad;
    END CATCH
END;
