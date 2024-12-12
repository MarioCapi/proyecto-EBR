CREATE PROCEDURE [Admin].[sp_SaveDatoContable]
    @ArchivoID INT,
    @NivelID NVARCHAR(100),
    @Transaccional BIT,
    @CodigoCuenta NVARCHAR(50),
    @NombreCuenta NVARCHAR(255),
    @SaldoInicial DECIMAL(18, 2),
    @Debito DECIMAL(18, 2),
    @Credito DECIMAL(18, 2),
    @SaldoFinal DECIMAL(18, 2)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ErrorMessage NVARCHAR(4000);
    DECLARE @ErrorSeverity INT;
    DECLARE @ErrorState INT;

    BEGIN TRY
        -- Validar que el ArchivoID exista
        IF NOT EXISTS (SELECT 1 FROM Admin.Archivos WHERE ArchivoID = @ArchivoID)
        BEGIN
            RAISERROR('El archivo especificado no existe.', 16, 1);
        END

        -- Insertar el nuevo dato contable
        INSERT INTO Admin.DatosContables (
            ArchivoID, NivelID, Transaccional, CodigoCuenta, NombreCuenta, SaldoInicial, Debito, Credito, SaldoFinal
        )
        VALUES (
            @ArchivoID, @NivelID, @Transaccional, @CodigoCuenta, @NombreCuenta, @SaldoInicial, @Debito, @Credito, @SaldoFinal
        );

        -- Retornar mensaje de éxito
        SELECT 'El dato contable se ha guardado correctamente.' AS Mensaje;
    END TRY
    BEGIN CATCH
        -- Capturar y manejar los errores
        SET @ErrorMessage = ERROR_MESSAGE();
        SET @ErrorSeverity = ERROR_SEVERITY();
        SET @ErrorState = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO
