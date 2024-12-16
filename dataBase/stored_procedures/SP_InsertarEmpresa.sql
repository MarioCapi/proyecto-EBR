-- Store Procedure para insertar Empresas
CREATE PROCEDURE [Admin].[InsertarEmpresa]
    @NombreEmpresa NVARCHAR(255),
    @NIT NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ErrorMessage NVARCHAR(4000);
    DECLARE @ErrorSeverity INT;
    DECLARE @ErrorState INT;
    DECLARE @EmpresaID INT;

    BEGIN TRY
        -- Validar que el NIT ya exista
        SELECT @EmpresaID = EmpresaID
        FROM Admin.Empresas
        WHERE NIT = @NIT;

        -- Si el NIT ya existe, retornar el EmpresaID
        IF @EmpresaID IS NOT NULL
        BEGIN
            SELECT @EmpresaID AS EmpresaID;
            RETURN;
        END

        -- Validar que el NombreEmpresa no esté vacío
        IF @NombreEmpresa IS NULL OR LTRIM(RTRIM(@NombreEmpresa)) = ''
        BEGIN
            RAISERROR('El nombre de la empresa no puede estar vacío.', 16, 1);
        END

        -- Insertar la nueva empresa
        INSERT INTO Admin.Empresas (NombreEmpresa, NIT)
        VALUES (@NombreEmpresa, @NIT);

        -- Obtener el ID de la empresa insertada
        SET @EmpresaID = SCOPE_IDENTITY();

        -- Retornar el EmpresaID
        SELECT @EmpresaID AS EmpresaID;
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
