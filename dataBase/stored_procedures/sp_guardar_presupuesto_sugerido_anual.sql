CREATE or alter PROCEDURE admin.SP_guardar_presupuesto_sugerido_anual
    @AnioPresupuesto INT,
    @NIT NVARCHAR(20),
    @Total DECIMAL(18,2),
    @UsuarioInsercion NVARCHAR(50),
    @JsonCosto NVARCHAR(MAX),
    @JsonGasto NVARCHAR(MAX),
    @JsonIngreso NVARCHAR(MAX),
    @JsonSugerido NVARCHAR(MAX)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Insertar en la tabla PresupuestoSugerido_anual
        INSERT INTO admin.PresupuestoSugerido_anual (NIT, AnioPresupuesto, Total, usuario_insercion, fecha_insercion)
        VALUES (@NIT, @AnioPresupuesto, @Total, @UsuarioInsercion, GETDATE());

        -- Procesar JSON para PresupuestoCosto
        INSERT INTO admin.PresupuestoCosto (NIT, Producto, Enero, Febrero, Marzo, Abril, Mayo, Junio, Julio, Agosto, Septiembre, Octubre, Noviembre, Diciembre, Total, usuario_insercion, fecha_insercion, AnioPresupuesto)
        SELECT 
            JSON_VALUE(value, '$.Nit_Empresa') AS NIT,
            JSON_VALUE(value, '$.Producto') AS Producto,
            JSON_VALUE(value, '$.enero') AS Enero,
            JSON_VALUE(value, '$.febrero') AS Febrero,
            JSON_VALUE(value, '$.marzo') AS Marzo,
            JSON_VALUE(value, '$.abril') AS Abril,
            JSON_VALUE(value, '$.mayo') AS Mayo,
            JSON_VALUE(value, '$.junio') AS Junio,
            JSON_VALUE(value, '$.julio') AS Julio,
            JSON_VALUE(value, '$.agosto') AS Agosto,
            JSON_VALUE(value, '$.septiembre') AS Septiembre,
            JSON_VALUE(value, '$.octubre') AS Octubre,
            JSON_VALUE(value, '$.noviembre') AS Noviembre,
            JSON_VALUE(value, '$.diciembre') AS Diciembre,
            JSON_VALUE(value, '$.total') AS Total,
            @UsuarioInsercion AS usuario_insercion,
            GETDATE() AS fecha_insercion,
            @AnioPresupuesto AS AnioPresupuesto
        FROM OPENJSON(@JsonCosto);

        -- Procesar JSON para PresupuestoGasto
        INSERT INTO admin.PresupuestoGasto (NIT, Producto, Enero, Febrero, Marzo, Abril, Mayo, Junio, Julio, Agosto, Septiembre, Octubre, Noviembre, Diciembre, Total, usuario_insercion, fecha_insercion, AnioPresupuesto)
        SELECT 
            JSON_VALUE(value, '$.Nit_Empresa') AS NIT,
            JSON_VALUE(value, '$.Producto') AS Producto,
            JSON_VALUE(value, '$.enero') AS Enero,
            JSON_VALUE(value, '$.febrero') AS Febrero,
            JSON_VALUE(value, '$.marzo') AS Marzo,
            JSON_VALUE(value, '$.abril') AS Abril,
            JSON_VALUE(value, '$.mayo') AS Mayo,
            JSON_VALUE(value, '$.junio') AS Junio,
            JSON_VALUE(value, '$.julio') AS Julio,
            JSON_VALUE(value, '$.agosto') AS Agosto,
            JSON_VALUE(value, '$.septiembre') AS Septiembre,
            JSON_VALUE(value, '$.octubre') AS Octubre,
            JSON_VALUE(value, '$.noviembre') AS Noviembre,
            JSON_VALUE(value, '$.diciembre') AS Diciembre,
            JSON_VALUE(value, '$.total') AS Total,
            @UsuarioInsercion AS usuario_insercion,
            GETDATE() AS fecha_insercion,
            @AnioPresupuesto AS AnioPresupuesto
        FROM OPENJSON(@JsonGasto);

        -- Procesar JSON para PresupuestoIngreso
        INSERT INTO admin.PresupuestoIngreso (NIT, Producto, Enero, Febrero, Marzo, Abril, Mayo, Junio, Julio, Agosto, Septiembre, Octubre, Noviembre, Diciembre, Total, usuario_insercion, fecha_insercion, AnioPresupuesto)
        SELECT 
            JSON_VALUE(value, '$.Nit_Empresa') AS NIT,
            JSON_VALUE(value, '$.Producto') AS Producto,
            JSON_VALUE(value, '$.enero') AS Enero,
            JSON_VALUE(value, '$.febrero') AS Febrero,
            JSON_VALUE(value, '$.marzo') AS Marzo,
            JSON_VALUE(value, '$.abril') AS Abril,
            JSON_VALUE(value, '$.mayo') AS Mayo,
            JSON_VALUE(value, '$.junio') AS Junio,
            JSON_VALUE(value, '$.julio') AS Julio,
            JSON_VALUE(value, '$.agosto') AS Agosto,
            JSON_VALUE(value, '$.septiembre') AS Septiembre,
            JSON_VALUE(value, '$.octubre') AS Octubre,
            JSON_VALUE(value, '$.noviembre') AS Noviembre,
            JSON_VALUE(value, '$.diciembre') AS Diciembre,
            JSON_VALUE(value, '$.total') AS Total,
            @UsuarioInsercion AS usuario_insercion,
            GETDATE() AS fecha_insercion,
            @AnioPresupuesto AS AnioPresupuesto
        FROM OPENJSON(@JsonIngreso);

        -- Procesar JSON para PresupuestoSugerido
        INSERT INTO admin.PresupuestoSugerido (NIT, Producto, Enero, Febrero, Marzo, Abril, Mayo, Junio, Julio, Agosto, Septiembre, Octubre, Noviembre, Diciembre, Total, usuario_insercion, fecha_insercion, AnioPresupuesto)
        SELECT 
            JSON_VALUE(value, '$.Nit_Empresa') AS NIT,
            JSON_VALUE(value, '$.Producto') AS Producto,
            JSON_VALUE(value, '$.enero') AS Enero,
            JSON_VALUE(value, '$.febrero') AS Febrero,
            JSON_VALUE(value, '$.marzo') AS Marzo,
            JSON_VALUE(value, '$.abril') AS Abril,
            JSON_VALUE(value, '$.mayo') AS Mayo,
            JSON_VALUE(value, '$.junio') AS Junio,
            JSON_VALUE(value, '$.julio') AS Julio,
            JSON_VALUE(value, '$.agosto') AS Agosto,
            JSON_VALUE(value, '$.septiembre') AS Septiembre,
            JSON_VALUE(value, '$.octubre') AS Octubre,
            JSON_VALUE(value, '$.noviembre') AS Noviembre,
            JSON_VALUE(value, '$.diciembre') AS Diciembre,
            JSON_VALUE(value, '$.total') AS Total,
            @UsuarioInsercion AS usuario_insercion,
            GETDATE() AS fecha_insercion,
            @AnioPresupuesto AS AnioPresupuesto
        FROM OPENJSON(@JsonSugerido);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
