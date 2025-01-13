CREATE OR ALTER PROCEDURE admin.sp_GetSubscriptionNames
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT 
            id_subscription,
            subscription_name
        FROM 
            admin.subscription
        ORDER BY 
            id_subscription ASC;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

-- Para ejecutar:
-- EXEC admin.sp_GetSubscriptionNames;

--Sp para obtener id y nombre de subscripcion
CREATE OR ALTER PROCEDURE admin.sp_GetSubscriptionByName
    @subscription_name NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        id_subscription,
        subscription_name
    FROM 
        admin.subscription
    WHERE 
        UPPER(subscription_name) = UPPER(@subscription_name);
END;