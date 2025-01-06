USE ebr;
GO
CREATE OR ALTER PROCEDURE [admin].[sp_CreateCompany]
    @company_name NVARCHAR(100),
    @tax_identification_type NVARCHAR(10),
    @tax_id NVARCHAR(20),
    @email NVARCHAR(100) = NULL,
    @num_employees INT = NULL,
    @company_type NVARCHAR(50) = NULL,
    @address NVARCHAR(200) = NULL,
    @phone NVARCHAR(20) = NULL,
    @subscription_type NVARCHAR(20),
    @subscription_id INT = NULL,
    @subscription_end_date DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @NewCompanyId INT;

    BEGIN TRY
        -- Verificar si ya existe la combinación de tipo y número de identificación fiscal
        IF EXISTS (
            SELECT 1 
            FROM admin.Companies 
            WHERE tax_identification_type = @tax_identification_type 
            AND tax_id = @tax_id
            AND active = 1
        )
        BEGIN
            RAISERROR('La combinación de tipo y número de identificación fiscal ya existe.', 16, 1);
            RETURN;
        END

        -- Verificar si ya existe el email (si no es nulo)
        IF @email IS NOT NULL AND EXISTS (
            SELECT 1 
            FROM admin.Companies 
            WHERE email = @email 
            AND active = 1
        )
        BEGIN
            RAISERROR('Ya existe una empresa con este correo electrónico.', 16, 1);
            RETURN;
        END

        -- Insertar la nueva compañía
        INSERT INTO admin.Companies (
            company_name,
            tax_identification_type,
            tax_id,
            email,
            num_employees,
            company_type,
            address,
            phone,
            subscription_type,
            subscription_id,
            subscription_end_date,
            status,
            active
        )
        VALUES (
            @company_name,
            @tax_identification_type,
            @tax_id,
            @email,
            @num_employees,
            @company_type,
            @address,
            @phone,
            @subscription_type,
            @subscription_id, 
            @subscription_end_date,
            'ACTIVE',
            1
        );

        SET @NewCompanyId = SCOPE_IDENTITY();
        
        -- Retornar solo el ID de la compañía
        SELECT @NewCompanyId as company_id;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;





-- Procedimiento combinado para obtener empresas
CREATE OR ALTER PROCEDURE admin.sp_GetCompanies
    @company_id INT = NULL,
    @status NVARCHAR(20) = NULL,
    @subscription_type NVARCHAR(20) = NULL,
    @search_term NVARCHAR(100) = NULL,
    @page_number INT = 1,
    @page_size INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Si se proporciona un ID específico, devolver solo esa empresa
    IF @company_id IS NOT NULL
    BEGIN
        SELECT 
            company_id,
            company_name,
            tax_identification_type,
            tax_id,
            email,
            num_employees,
            company_type,
            address,
            phone,
            status,
            subscription_type,
            subscription_end_date,
            created_at,
            updated_at,
            active
        FROM admin.Companies
        WHERE company_id = @company_id AND active = 1;
        RETURN;
    END

    -- Si no se proporciona ID, devolver lista filtrada
    SELECT 
        company_id,
        company_name,
        tax_identification_type,
        tax_id,
        email,
        num_employees,
        company_type,
        address,
        phone,
        status,
        subscription_type,
        subscription_end_date,
        created_at,
        updated_at,
        active,
        COUNT(*) OVER() as total_records
    FROM admin.Companies
    WHERE 
        active = 1
        AND (@status IS NULL OR status = @status)
        AND (@subscription_type IS NULL OR subscription_type = @subscription_type)
        AND (@search_term IS NULL 
             OR company_name LIKE '%' + @search_term + '%' 
             OR tax_id LIKE '%' + @search_term + '%'
             OR email LIKE '%' + @search_term + '%')
    ORDER BY company_name
    OFFSET (@page_number - 1) * @page_size ROWS
    FETCH NEXT @page_size ROWS ONLY;
END;
GO

-- Procedimiento para actualizar una empresa
CREATE OR ALTER PROCEDURE admin.sp_UpdateCompany
    @company_id INT,
    @company_name NVARCHAR(100),
    @tax_identification_type NVARCHAR(10),
    @tax_id NVARCHAR(20),
    @email NVARCHAR(100) = NULL,
    @num_employees INT = NULL,
    @company_type NVARCHAR(50) = NULL,
    @address NVARCHAR(200) = NULL,
    @phone NVARCHAR(20) = NULL,
    @status NVARCHAR(20) = NULL,
    @subscription_type NVARCHAR(20) = NULL,
    @subscription_end_date DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM admin.Companies WHERE company_id = @company_id)
            THROW 50000, 'La empresa no existe.', 1;

        IF EXISTS (SELECT 1 FROM admin.Companies 
                  WHERE tax_identification_type = @tax_identification_type 
                  AND tax_id = @tax_id 
                  AND company_id != @company_id)
            THROW 50000, 'La combinación de tipo y número de identificación fiscal ya existe para otra empresa.', 1;

        UPDATE admin.Companies
        SET 
            company_name = @company_name,
            tax_identification_type = @tax_identification_type,
            tax_id = @tax_id,
            email = @email,
            num_employees = @num_employees,
            company_type = @company_type,
            address = @address,
            phone = @phone,
            status = ISNULL(@status, status),
            subscription_type = ISNULL(@subscription_type, subscription_type),
            subscription_end_date = ISNULL(@subscription_end_date, subscription_end_date),
            updated_at = GETDATE()
        WHERE company_id = @company_id;

        SELECT @company_id as company_id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

-- Procedimiento para eliminar una empresa (borrado lógico)
CREATE OR ALTER PROCEDURE admin.sp_DeleteCompany
    @company_id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM admin.Companies WHERE company_id = @company_id AND active = 1)
            THROW 50000, 'La empresa no existe o ya está eliminada.', 1;

        -- Verificar si hay usuarios asociados
        IF EXISTS (SELECT 1 FROM admin.Users WHERE company_id = @company_id AND active = 1)
            THROW 50000, 'No se puede eliminar la empresa porque tiene usuarios activos asociados.', 1;

        UPDATE admin.Companies
        SET 
            active = 0,
            updated_at = GETDATE(),
            status = 'CANCELLED'
        WHERE company_id = @company_id;

        SELECT @company_id as company_id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

-- Procedimiento para cambiar el estado de una empresa
CREATE OR ALTER PROCEDURE admin.sp_ChangeCompanyStatus
    @company_id INT,
    @status NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM admin.Companies WHERE company_id = @company_id)
            THROW 50000, 'La empresa no existe.', 1;

        IF @status NOT IN ('ACTIVE', 'SUSPENDED', 'CANCELLED')
            THROW 50000, 'Estado no válido. Los estados permitidos son: ACTIVE, SUSPENDED, CANCELLED', 1;

        UPDATE admin.Companies
        SET 
            status = @status,
            updated_at = GETDATE()
        WHERE company_id = @company_id;

        SELECT @company_id as company_id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO 