USE [EBR]
GO
/****** Object:  StoredProcedure [Admin].[InsertarArchivo]    Script Date: 1/10/2025 6:53:37 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [Admin].[InsertarArchivo]
    @NombreArchivo NVARCHAR(255),
    @EmpresaID INT,
    @Periodo DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ErrorMessage NVARCHAR(4000);
    DECLARE @ErrorSeverity INT;
    DECLARE @ErrorState INT;
    DECLARE @ArchivoID INT;

    BEGIN TRY        
        -- Validar que el NombreArchivo no esté vacío
        IF @NombreArchivo IS NULL OR LTRIM(RTRIM(@NombreArchivo)) = ''
        BEGIN
            RAISERROR('El nombre del archivo no puede estar vacío.', 16, 1);
        END

        -- Validar que el Periodo no sea nulo
        IF @Periodo IS NULL
        BEGIN
            RAISERROR('El periodo no puede ser nulo.', 16, 1);
        END

        -- Validar que no exista un archivo para el mismo EmpresaID y Periodo
        IF EXISTS (SELECT 1 FROM Admin.Archivos WHERE EmpresaID = @EmpresaID AND Periodo = @Periodo)
        BEGIN
            SET @ErrorMessage = 'Archivo repetido para el periodo ' + CONVERT(NVARCHAR, @Periodo, 120);
            RAISERROR(@ErrorMessage, 16, 1);
        END

        -- Insertar el nuevo archivo
        INSERT INTO Admin.Archivos (NombreArchivo, EmpresaID, Periodo)
        VALUES (@NombreArchivo, @EmpresaID, @Periodo);

        -- Obtener el ID del archivo insertado
        SET @ArchivoID = SCOPE_IDENTITY();

        -- Retornar el ArchivoID
        SELECT @ArchivoID AS ArchivoID;
    END TRY
    BEGIN CATCH
        -- Capturar y manejar los errores
        SET @ErrorMessage = ERROR_MESSAGE();
        SET @ErrorSeverity = ERROR_SEVERITY();
        SET @ErrorState = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
