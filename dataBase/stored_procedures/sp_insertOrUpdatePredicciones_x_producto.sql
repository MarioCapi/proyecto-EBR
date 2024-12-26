CREATE OR ALTER PROCEDURE Admin.sp_InsertOrUpdatePredicciones_x_producto
    @NIT_Empresa NVARCHAR(20),
    @Codigo_Producto NVARCHAR(50),
	@Nombre_Producto NVARCHAR(100),
    @JsonData NVARCHAR(MAX), -- Bloque de datos en formato JSON
    @Usuario NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Crear una tabla temporal para almacenar los datos del JSON
        CREATE TABLE #TempPredicciones (
            Año INT,
            Mes INT,
            Presupuesto_Predicho DECIMAL(18,2)
        );

        -- Procesar el JSON y cargarlo en la tabla temporal
        INSERT INTO #TempPredicciones (Año, Mes, Presupuesto_Predicho)
        SELECT 
            CAST(JSON_VALUE(value, '$.anio') AS INT) AS Año,
            CAST(JSON_VALUE(value, '$.mes') AS INT) AS Mes,
            CAST(JSON_VALUE(value, '$.prediccion') AS DECIMAL(18,2)) AS Presupuesto_Predicho
        FROM OPENJSON(@JsonData);

        -- Insertar o actualizar registros en la tabla "PrediccioneEmpresa_x_Producto"
        MERGE INTO Admin.PrediccioneEmpresa_x_Producto AS Target
        USING #TempPredicciones AS Source
        ON Target.NIT_Empresa = @NIT_Empresa
           AND Target.Codigo_Producto = @Codigo_Producto
           AND Target.Año = Source.Año
           AND Target.Mes = Source.Mes
        WHEN MATCHED THEN
            -- Actualizar el registro existente
            UPDATE SET 
                Presupuesto_Predicho = Source.Presupuesto_Predicho,
                Fecha_Actualizacion = GETDATE(),
                Usuario_Actualizador = @Usuario
        WHEN NOT MATCHED THEN
            -- Insertar un nuevo registro
            INSERT (NIT_Empresa, Codigo_Producto, Nombre_Producto, Año, Mes, Presupuesto_Predicho, Fecha_Creacion, Usuario_Creador)
            VALUES (@NIT_Empresa, @Codigo_Producto, @Nombre_Producto, Source.Año, Source.Mes, Source.Presupuesto_Predicho, GETDATE(), @Usuario);

        -- Limpiar la tabla temporal
        DROP TABLE #TempPredicciones;

    END TRY
    BEGIN CATCH
        -- Manejo de errores
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO
