CREATE or alter PROCEDURE Admin.SaveLog
    @user_id INT = NULL,
    @action_type NVARCHAR(50),
    @action_details NVARCHAR(MAX) = NULL,
    @ip_address NVARCHAR(45) = NULL,
    @user_agent NVARCHAR(MAX) = NULL,
    @error BIT = 0,
    @error_details NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Validación de parámetros obligatorios
        IF @action_type IS NULL OR LTRIM(RTRIM(@action_type)) = ''
        BEGIN
            RAISERROR('El campo action_type es obligatorio.', 16, 1);
            RETURN;
        END

        -- Inserción en la tabla logs
        INSERT INTO Admin.logs (user_id, action_type, action_details, ip_address, user_agent, error, error_details)
        VALUES (@user_id, @action_type, @action_details, @ip_address, @user_agent, @error, @error_details);
    END TRY
    BEGIN CATCH
        -- Capturar detalles del error
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        -- Opcional: Insertar en una tabla de errores (Admin.error_logs)
        IF OBJECT_ID('Admin.error_logs') IS NOT NULL
        BEGIN
            INSERT INTO Admin.error_logs (error_message, error_severity, error_state, timestamp)
            VALUES (@ErrorMessage, @ErrorSeverity, @ErrorState, GETDATE());
        END

        -- Lanzar el error capturado
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;