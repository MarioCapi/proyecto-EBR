-- SP para crear un usuario
CREATE OR ALTER PROCEDURE admin.CreateUser
    @company_id INT,
    @first_name NVARCHAR(50),
    @last_name NVARCHAR(50),
    @email NVARCHAR(100),
    @password_hash NVARCHAR(255),
    @role_id INT,
    @subscription_id INT,  
    @active BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validar que el subscription_id exista
        IF NOT EXISTS (SELECT 1 FROM admin.subscription WHERE id_subscription = @subscription_id)
        BEGIN
            RAISERROR('El ID de suscripción proporcionado no existe.', 16, 1);
            RETURN;
        END

        -- Validar que el email no exista ya
        IF EXISTS (SELECT 1 FROM admin.Users WHERE email = @email AND active = 1)
        BEGIN
            RAISERROR('Ya existe un usuario con este correo electrónico.', 16, 1);
            RETURN;
        END

        INSERT INTO admin.Users (
            company_id,
            first_name,
            last_name,
            email,
            password_hash,
            role_id,            
            active,
            created_at,
            updated_at
        )
        VALUES (
            @company_id,
            @first_name,
            @last_name,
            @email,
            @password_hash,
            @role_id,            
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
