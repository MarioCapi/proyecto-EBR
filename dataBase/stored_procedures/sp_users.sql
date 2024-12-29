-- SP para crear un usuario
ALTER PROCEDURE [admin].[CreateUser]
    @company_id INT,
    @first_name NVARCHAR(50),
    @last_name NVARCHAR(50),
    @email NVARCHAR(100),
    @password_hash NVARCHAR(255),
    @role_id INT,
    @active BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Validar si el company_id existe
        IF NOT EXISTS (SELECT 1 FROM admin.Companies WHERE company_id = @company_id AND active = 1)
        BEGIN
            RAISERROR('La compañía especificada no existe o no está activa.', 16, 1);
            RETURN;
        END

        -- Validar si el role_id existe
        IF NOT EXISTS (SELECT 1 FROM admin.Roles WHERE role_id = @role_id)
        BEGIN
            RAISERROR('El rol especificado no existe.', 16, 1);
            RETURN;
        END

        -- Validar si ya existe un usuario con ese email
        IF EXISTS (SELECT 1 FROM admin.Users WHERE email = @email AND active = 1)
        BEGIN
            RAISERROR('Ya existe un usuario con ese correo electrónico.', 16, 1);
            RETURN;
        END

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
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;

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
