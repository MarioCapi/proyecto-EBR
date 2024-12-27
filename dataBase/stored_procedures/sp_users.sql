-- SP para crear un usuario
CREATE OR ALTER PROCEDURE admin.CreateUser
    @company_id INT,                  -- ID de la compañía
    @first_name NVARCHAR(50),         -- Nombre del usuario
    @last_name NVARCHAR(50),          -- Apellido del usuario
    @email NVARCHAR(100),             -- Correo electrónico
    @password_hash NVARCHAR(255),     -- Contraseña
    @role_id INT,                     -- Relación con admin.Roles
    @active BIT = 1                   -- Estado activo/inactivo
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Validar si el company_id existe
        IF NOT EXISTS (SELECT 1 FROM admin.Companies WHERE company_id = @company_id AND active = 1)
        BEGIN
            SELECT 
                0 as success,
                NULL as user_id,
                'La compañía especificada no existe o no está activa.' as message
            RETURN;
        END

        -- Validar si el role_id existe
        IF NOT EXISTS (SELECT 1 FROM admin.Roles WHERE role_id = @role_id)
        BEGIN
            SELECT 
                0 as success,
                NULL as user_id,
                'El rol especificado no existe.' as message
            RETURN;
        END

        -- Validar si ya existe un usuario con ese email
        IF EXISTS (SELECT 1 FROM admin.Users WHERE email = @email AND active = 1)
        BEGIN
            SELECT 
                0 as success,
                NULL as user_id,
                'Ya existe un usuario con ese correo electrónico.' as message
            RETURN;
        END

        DECLARE @NewUserId INT

        -- Insertar el nuevo usuario
        INSERT INTO admin.Users (
            company_id, 
            role_id,
            email, 
            password_hash,
            first_name, 
            last_name, 
            active,
            created_at,
            updated_at
        )
        VALUES (
            @company_id,
            @role_id,
            @email,
            @password_hash,
            @first_name,
            @last_name,
            @active,
            GETDATE(),
            GETDATE()
        );

        SET @NewUserId = SCOPE_IDENTITY()

        SELECT 
            1 as success,
            @NewUserId as user_id,
            'Usuario creado exitosamente' as message

    END TRY
    BEGIN CATCH
        SELECT 
            0 as success,
            NULL as user_id,
            ERROR_MESSAGE() as message
    END CATCH
END;
GO

-- SP para actualizar el usuario
CREATE OR ALTER PROCEDURE admin.UpdateUser
    @user_id INT,                     -- ID del usuario a actualizar
    @first_name NVARCHAR(50),         -- Nuevo nombre del usuario
    @last_name NVARCHAR(50),          -- Nuevo apellido del usuario
    @email NVARCHAR(100),             -- Nuevo correo electrónico
    @role_id INT,                     -- Nuevo rol
    @active BIT                       -- Nuevo estado (activo o inactivo)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Validar si el usuario existe
        IF NOT EXISTS (SELECT 1 FROM admin.Users WHERE user_id = @user_id)
            THROW 50000, 'El usuario especificado no existe.', 1;

        -- Validar si el role_id existe
        IF NOT EXISTS (SELECT 1 FROM admin.Roles WHERE role_id = @role_id)
            THROW 50000, 'El rol especificado no existe.', 1;

        -- Validar si el nuevo email ya existe para otro usuario
        IF EXISTS (SELECT 1 FROM admin.Users WHERE email = @email AND user_id != @user_id)
            THROW 50000, 'Ya existe otro usuario con ese correo electrónico.', 1;

        -- Actualizar los datos del usuario
        UPDATE admin.Users
        SET
            first_name = @first_name,
            last_name = @last_name,
            email = @email,
            role_id = @role_id,
            active = @active,
            updated_at = GETDATE()
        WHERE user_id = @user_id;

        -- Devolver el ID del usuario actualizado
        SELECT @user_id as user_id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO
