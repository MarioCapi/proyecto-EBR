USE [EBR]
GO
/****** Object:  StoredProcedure [Admin].[sp_SaveDatoContable]    Script Date: 12/17/2024 9:05:05 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create or ALTER PROCEDURE [Admin].[sp_SaveDatoContable]
	@ArchivoID INT,
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
	DECLARE @NivelID NVARCHAR(100);

	

    BEGIN TRY	
		SET @NivelID = CASE 
			WHEN LEN(@CodigoCuenta) = 1 THEN 'Clase'
			WHEN LEN(@CodigoCuenta) = 2 THEN 'Grupo'
			WHEN LEN(@CodigoCuenta) = 3 THEN 'Cuenta'
			WHEN LEN(@CodigoCuenta) = 4 THEN 'SubCuenta'
			WHEN LEN(@CodigoCuenta) >= 5 THEN 'Auxiliar'
			ELSE 'Desconocido'
		END;

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
