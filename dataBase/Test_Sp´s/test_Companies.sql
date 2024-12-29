USE ebr;
GO

-- Test para sp_CreateCompany
PRINT 'Probando sp_CreateCompany'
BEGIN
    BEGIN TRY
        -- Test 1: Crear empresa con datos válidos
        PRINT 'Test 1: Creando empresa'
        DECLARE @result1 TABLE (
            success BIT,
            company_id INT,
            message NVARCHAR(MAX)
        )
        
        INSERT INTO @result1
        EXEC admin.sp_CreateCompany 
            @company_name = 'Empresa Test 1',
            @tax_identification_type = 'NIT',
            @tax_id = '123456789',
            @email = 'test1@empresa.com',
            @num_employees = 50,
            @company_type = 'TECNOLOGÍA',
            @address = 'Calle Test 123',
            @phone = '1234567890',
            @subscription_type = 'BASIC',
            @subscription_end_date = '2025-12-31'
    END TRY
    BEGIN CATCH
        PRINT 'Error en tests: ' + ERROR_MESSAGE()
    END CATCH
END
GO

-- Test para sp_GetCompanies
PRINT 'Probando sp_GetCompanies'
BEGIN
    BEGIN TRY
        -- Crear varias empresas de prueba
        DECLARE @company_id1 INT, @company_id2 INT, @company_id3 INT

        -- Test 1: Obtener una empresa específica por ID
        PRINT 'Test 1: Obtener empresa específica'
        EXEC admin.sp_GetCompanies @company_id = @company_id1

        -- Test 2: Listado de todas las empresas
        PRINT 'Test 2: Listado de todas las empresas'
        EXEC admin.sp_GetCompanies

        -- Test 3: Buscar empresa que no existe
        PRINT 'Test 3: Buscar empresa que no existe'
        EXEC admin.sp_GetCompanies @company_id = 99999

        PRINT 'Tests de sp_GetCompanies completados exitosamente'
    END TRY
    BEGIN CATCH
        PRINT 'Error en tests de sp_GetCompanies: ' + ERROR_MESSAGE()
    END CATCH
END
GO

-- Test para sp_UpdateCompany
PRINT 'Probando sp_UpdateCompany'
BEGIN
    BEGIN TRY
        -- Actualizar la empresa con ID 1 (asumiendo que existe)
        EXEC admin.sp_UpdateCompany
            @company_id = 1,
            @company_name = 'Empresa Test Actualizada',
            @tax_identification_type = 'NIT',
            @tax_id = '900123456',
            @email = 'nuevo@empresatest.com',
            @num_employees = 60,
            @company_type = 'TECNOLOGÍA Y SERVICIOS',
            @address = 'Nueva Dirección de Prueba',
            @phone = '1234567890',
            @subscription_type = 'PREMIUM'

        -- Verificar la actualización
        EXEC admin.sp_GetCompanies @company_id = 1

        IF @@ERROR = 0
            PRINT 'Test completado exitosamente: Empresa actualizada'
        ELSE
            PRINT 'Error al actualizar la empresa'

    END TRY
    BEGIN CATCH
        PRINT 'Error en test de sp_UpdateCompany: ' + ERROR_MESSAGE()
    END CATCH
END
GO

-- Test para sp_DeleteCompany
PRINT 'Probando sp_DeleteCompany - Eliminación por ID'
BEGIN
    BEGIN TRY
        -- Eliminar la empresa con ID 1 (asumiendo que existe)
        EXEC admin.sp_DeleteCompany 
            @company_id = 1

        IF @@ERROR = 0
            PRINT 'Test completado exitosamente: Empresa eliminada'
        ELSE
            PRINT 'Error al eliminar la empresa'

    END TRY
    BEGIN CATCH
        PRINT 'Error en test de sp_DeleteCompany: ' + ERROR_MESSAGE()
    END CATCH
END
GO

-- Test para sp_ChangeCompanyStatus
PRINT 'Probando sp_ChangeCompanyStatus - Cambio de estado'
BEGIN
    BEGIN TRY
        -- Cambiar estado a SUSPENDED para la empresa con ID 1 (asumiendo que existe)
        EXEC admin.sp_ChangeCompanyStatus 
            @company_id = 1,
            @status = 'SUSPENDED'

        IF @@ERROR = 0
            PRINT 'Test completado exitosamente: Estado de empresa actualizado a SUSPENDED'
        ELSE
            PRINT 'Error al actualizar el estado de la empresa'

    END TRY
    BEGIN CATCH
        PRINT 'Error en test de sp_ChangeCompanyStatus: ' + ERROR_MESSAGE()
    END CATCH
END
GO

-- Limpiar datos de prueba (opcional)
-- DELETE FROM admin.Companies WHERE company_name LIKE '%Test%'
