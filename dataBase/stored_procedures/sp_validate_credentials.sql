-- Procedimiento para verificar credenciales
CREATE OR ALTER PROCEDURE [admin].[sp_validateUsersCredentials]
    @email NVARCHAR(100),
    @password NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Verificar si existe el usuario con las credenciales proporcionadas
        IF NOT EXISTS (
            SELECT 1 
            FROM admin.Users 
            WHERE email = @email 
            AND password_hash = @password 
            AND active = 1
        )
        BEGIN
            -- Si no existe, lanzar error
            THROW 50001, 'Credenciales inválidas', 1;
            RETURN;
        END

        -- Si existe, retornar los datos específicos solicitados
        SELECT 
            u.user_id,
            u.company_id,
            u.role_id,
            u.email,
            u.created_at,
            c.company_name,
            c.tax_id,
			'free' as subscription_type, 
			1 as subscription_id
            --c.subscription_type
            --c.subscription_id
        FROM admin.Users u
        INNER JOIN admin.Companies c ON u.company_id = c.company_id
        WHERE u.email = @email 
        AND u.active = 1
        AND c.active = 1;

        -- Retornar código de éxito
        RETURN 0;
    END TRY
    BEGIN CATCH
        THROW;
        RETURN -1;
    END CATCH
END;
GO