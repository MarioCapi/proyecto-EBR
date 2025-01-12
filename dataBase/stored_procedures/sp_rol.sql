-- Procedimiento almacenado para obtener el role_id basado en la subscription
CREATE OR ALTER PROCEDURE admin.GetRoles
    @id_subscription INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validar que la subscription exista
        IF NOT EXISTS (SELECT 1 FROM admin.subscription WHERE id_subscription = @id_subscription)
        BEGIN
            THROW 50001, 'La subscripción especificada no existe.', 1;
        END

        -- Declaramos variable para almacenar el role_id
        DECLARE @role_id INT;
        
        -- Obtenemos el role_id correspondiente a la subscription
        SELECT @role_id = role_id
        FROM admin.Roles
        WHERE id_subscription = @id_subscription;
        
        -- Si no encontramos un rol específico para la subscription, asignamos el rol Admin por defecto
        IF @role_id IS NULL
        BEGIN
            SELECT @role_id = role_id
            FROM admin.Roles r
            INNER JOIN admin.subscription s ON r.id_subscription = s.id_subscription
            WHERE r.role_name = 'Admin';
        END
        
        -- Retornamos el role_id y información adicional útil
        SELECT 
            r.role_id,
            r.role_name,
            s.subscription_name
        FROM admin.Roles r
        INNER JOIN admin.subscription s ON r.id_subscription = s.id_subscription
        WHERE r.role_id = @role_id;
        
    END TRY
    BEGIN CATCH
        SELECT  
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_MESSAGE() AS ErrorMessage;
    END CATCH
END;