CREATE PROCEDURE [admin].[Sp_CreateCompany]
    @company_name NVARCHAR(100),
    @tax_identification_type NVARCHAR(10),
    @tax_id NVARCHAR(20),
    @email NVARCHAR(100),
    @num_employees INT = NULL,
    @company_type NVARCHAR(50) = NULL,
    @address NVARCHAR(200) = NULL,
    @phone NVARCHAR(20) = NULL,
    @status NVARCHAR(20) = 'Active',
    @subscription_id INT,
    @password NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @company_id INT;
    DECLARE @role_id INT;
    DECLARE @result_message NVARCHAR(500);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Crear la compañía
        INSERT INTO [admin].[Companies] (
            company_name, 
            tax_identification_type, 
            tax_id, 
            email, 
            num_employees, 
            company_type, 
            address, 
            phone, 
            status, 
            subscription_id, 
            created_at, 
            active
        )
        VALUES (
            @company_name, 
            @tax_identification_type, 
            @tax_id, 
            @email, 
            @num_employees, 
            @company_type, 
            @address, 
            @phone, 
            @status, 
            @subscription_id, 
            GETDATE(), 
            1
        );

        SET @company_id = SCOPE_IDENTITY();

        -- Asignar la suscripción a la compañía
        INSERT INTO [admin].[EmpresaSubscripciones] (
            EmpresaID, 
            SubscripcionID, 
            FechaInicio, 
            FechaFin
        )
        VALUES (
            @company_id, 
            @subscription_id, 
            GETDATE(),
            DATEADD(DAY, 75, GETDATE())  -- FechaFin es 75 días después de la fecha actual
        );

        -- Consultar el ID del rol "1" (administrador)
        SELECT @role_id = role_id
        FROM [admin].[Roles]
        WHERE role_id = 1;

        -- Si el rol "1" no existe, lanzar un error
        IF @role_id IS NULL
        BEGIN
            RAISERROR('El rol con ID 1 no existe.', 16, 1);
            RETURN;
        END

        -- Crear el usuario administrador
        INSERT INTO [admin].[Users] (
            company_id, 
            role_id, 
            email, 
            password_hash, 
            first_name, 
            last_name, 
            created_at, 
            active
        )
        VALUES (
            @company_id, 
            @role_id, 
            @email, 
            @password, 
            @company_name, 
            @company_name, 
            GETDATE(), 
            1
        );

        -- Asignar el rol al usuario en la tabla UsuariosRoles
        INSERT INTO [admin].[UsuariosRoles] (
            UsuarioID, 
            RolID
        )
        VALUES (
            SCOPE_IDENTITY(),  -- Obtener el ID del usuario recién creado
            @role_id
        );

        -- Crear mensajes de resultado
        SET @result_message = CONCAT(
            'Compañía: "', @company_name, '" creada exitosamente. ', 
            'Usuario: "', @email, '" creado exitosamente.'
        );

        -- Confirmar la transacción
        COMMIT TRANSACTION;

        -- Retornar los mensajes
        SELECT @result_message AS Mensaje;
    END TRY
    BEGIN CATCH
        -- Revertir en caso de error
        ROLLBACK TRANSACTION;

        -- Manejo de errores
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO
