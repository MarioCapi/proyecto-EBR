/*
Test:

exec Admin.sp_get_Predicciones_empresa_producto '901292126', '41350105', '2024'
exec Admin.sp_get_Predicciones_empresa_producto '901292126', 'null', '2024'
exec Admin.sp_get_Predicciones_empresa_producto '901292126', 'null', null

*/
-- Crear el procedimiento almacenado

CREATE or alter PROCEDURE Admin.sp_get_Predicciones_empresa_producto
    @NIT_Empresa NVARCHAR(20),                  -- Obligatorio
    @Codigo_Producto NVARCHAR(50) = NULL,      -- Opcional
    @Año INT = NULL                            -- Opcional
AS
BEGIN
    BEGIN TRY        
        BEGIN TRANSACTION;                
        IF @NIT_Empresa IS NULL
        BEGIN
            RAISERROR('El parámetro @NIT_Empresa es obligatorio.', 16, 1);
            RETURN;
        END

        -- Construir la consulta dinámica con los parámetros
        SELECT 
            ID_Prediccion,
            NIT_Empresa,
            Codigo_Producto,
			Nombre_Producto,
            Año,
            Mes,
            Presupuesto_Predicho,
            Fecha_Creacion,
            Usuario_Creador,
            Fecha_Actualizacion,
            Usuario_Actualizador
        FROM Admin.PrediccioneEmpresa_x_Producto
        WHERE 
            NIT_Empresa = @NIT_Empresa
            AND (@Codigo_Producto IS NULL OR Codigo_Producto = @Codigo_Producto)
            AND (@Año IS NULL OR Año = @Año);

        -- Confirmar la transacción
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Manejo de errores
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION; -- Revertir la transacción en caso de error
        END

        -- Obtener información del error
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        -- Mostrar el mensaje de error
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO
