USE [EBR]
GO
/****** Object:  StoredProcedure [Admin].[sp_Consulta_si_presupuesto_Sugerido_Anual]    Script Date: 1/12/2025 2:17:50 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER   PROCEDURE [Admin].[sp_Consulta_si_presupuesto_Sugerido_Anual]
    @NIT_Empresa NVARCHAR(20),            
    @Anio INT = NULL                       
AS
BEGIN
    BEGIN TRY        
        SET NOCOUNT ON;

        -- Validar parámetros obligatorios
        IF @NIT_Empresa IS NULL
        BEGIN
            RAISERROR('El parámetro @NIT_Empresa es obligatorio.', 16, 1);
            RETURN;
        END
        IF @Anio IS NULL
        BEGIN
            RAISERROR('El parámetro @Año es obligatorio.', 16, 1);
            RETURN;
        END

        -- Verificar si hay resultados
        IF EXISTS (
            SELECT 1
            FROM Admin.PresupuestoSugerido_anual
            WHERE Nit = @NIT_Empresa
              AND AnioPresupuesto = @Anio
        )
        BEGIN
            -- Devolver resultados si existen
            SELECT NIT
            FROM Admin.PresupuestoSugerido_anual
            WHERE Nit = @NIT_Empresa
              AND AnioPresupuesto = @Anio;
        END
        ELSE
        BEGIN
            -- Devolver mensaje si no hay resultados
            SELECT 'No se encontraron datos para los parámetros especificados.' AS Mensaje;
        END
    END TRY
    BEGIN CATCH               
        -- Obtener información del error
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;
        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();
        -- Mostrar el mensaje de error
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
