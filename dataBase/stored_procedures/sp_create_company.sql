CREATE OR ALTER PROCEDURE [admin].[sp_CreateCompany]
    @company_name NVARCHAR(100),
    @tax_identification_type NVARCHAR(10),
    @tax_id NVARCHAR(20),
    @email NVARCHAR(100),
    @num_employees INT = NULL,
    @company_type NVARCHAR(50) = NULL,
    @address NVARCHAR(200) = NULL,
    @phone NVARCHAR(20) = NULL,
	@status NVARCHAR(20) = 'Active',  /* quemado desde al API*/
    @subscription_id INT,
    @password NVARCHAR(200)  -- Asumimos que llega hasheada
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @company_id INT;
    DECLARE @role_id INT;
    DECLARE @new_user_id INT;
    DECLARE @result_message NVARCHAR(500);
	DECLARE @status_message NVARCHAR(500);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validaciones previas
        IF EXISTS (
            SELECT 1 
            FROM [admin].[Companies] 
            WHERE tax_id = @tax_id AND tax_identification_type = @tax_identification_type
        )
        BEGIN
            RAISERROR('La compañía ya existe con el mismo ID tributario.', 16, 1);
            RETURN;
        END;

        IF NOT EXISTS (
            SELECT 1 
            FROM admin.subscription 
            WHERE id_subscription = @subscription_id
        )
        BEGIN
            RAISERROR('La suscripción especificada no existe.', 16, 1);
            RETURN;
        END;

        -- Crear la compañía
        INSERT INTO [admin].[Companies] (
            company_name, tax_identification_type, tax_id, email, num_employees, 
            company_type, address, phone, status, subscription_id, created_at, active
        )
        VALUES (
            @company_name, @tax_identification_type, @tax_id, @email, @num_employees, 
            @company_type, @address, @phone, 'Active', @subscription_id, GETDATE(), 1
        );

        SET @company_id = SCOPE_IDENTITY();

        -- Asignar la suscripción a la compañía
        INSERT INTO [admin].[EmpresaSubscripciones] (
            EmpresaID, SubscripcionID, FechaInicio, FechaFin
        )
        VALUES (
            @company_id, @subscription_id, GETDATE(), DATEADD(DAY, 75, GETDATE())
        );

        -- Obtener rol administrador
        SELECT @role_id = role_id
        FROM [admin].[Roles]
        WHERE role_id = 1;

        IF @role_id IS NULL
        BEGIN
            RAISERROR('El rol con ID 1 no existe.', 16, 1);
            RETURN;
        END;

        -- Crear usuario administrador
        INSERT INTO [admin].[Users] (
            company_id, role_id, email, password_hash, first_name, last_name, created_at, active
        )
        VALUES (
            @company_id, @role_id, @email, @password, @company_name, @company_name, GETDATE(), 1
        );

        SET @new_user_id = SCOPE_IDENTITY();

        -- Asignar rol al usuario
        INSERT INTO [admin].[UsuariosRoles] (
            UsuarioID, RolID
        )
        VALUES (
            @new_user_id, @role_id
        );		

        COMMIT TRANSACTION;

		SET @status_message = 'Success';
        SET @result_message = CONCAT(
            'Compañía: "', @company_name, '" creada exitosamente. ',
            'Usuario: "', @email, '" creado exitosamente.'
        );
        

    END TRY
    BEGIN CATCH
		IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
		INSERT INTO admin.error_logs(
            error_message,
            error_severity,
            error_state,
            timestamp
        )
        VALUES(
            ERROR_MESSAGE(),
            ERROR_SEVERITY(),
            ERROR_STATE(),
            GETDATE()
        );
        
        -- Retornar el error como resultado
        SELECT @status_message AS status, @result_message AS message;
    END CATCH
END;
