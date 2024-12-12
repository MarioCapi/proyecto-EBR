USE ebr;
GO

-- Procedimiento para crear una nueva empresa
CREATE OR ALTER PROCEDURE admin.sp_CreateCompany
    @company_name NVARCHAR(100),
    @tax_id NVARCHAR(20),
    @address NVARCHAR(200) = NULL,
    @phone NVARCHAR(20) = NULL,
    @subscription_type NVARCHAR(20) = 'BASIC',
    @subscription_end_date DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM admin.Companies WHERE tax_id = @tax_id)
            THROW 50000, 'El ID fiscal ya existe en el sistema.', 1;

        INSERT INTO admin.Companies (
            company_name,
            tax_id,
            address,
            phone,
            subscription_type,
            subscription_end_date
        )
        VALUES (
            @company_name,
            @tax_id,
            @address,
            @phone,
            @subscription_type,
            @subscription_end_date
        );

        SELECT SCOPE_IDENTITY() as company_id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

-- Procedimiento para obtener una empresa por ID
CREATE OR ALTER PROCEDURE admin.sp_GetCompanyById
    @company_id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        company_id,
        company_name,
        tax_id,
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
END;
GO

-- Procedimiento para listar empresas con filtros
CREATE OR ALTER PROCEDURE admin.sp_GetCompanies
    @status NVARCHAR(20) = NULL,
    @subscription_type NVARCHAR(20) = NULL,
    @search_term NVARCHAR(100) = NULL,
    @page_number INT = 1,
    @page_size INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        company_id,
        company_name,
        tax_id,
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
             OR tax_id LIKE '%' + @search_term + '%')
    ORDER BY company_name
    OFFSET (@page_number - 1) * @page_size ROWS
    FETCH NEXT @page_size ROWS ONLY;
END;
GO

-- Procedimiento para actualizar una empresa
CREATE OR ALTER PROCEDURE admin.sp_UpdateCompany
    @company_id INT,
    @company_name NVARCHAR(100),
    @tax_id NVARCHAR(20),
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

        IF EXISTS (SELECT 1 FROM admin.Companies WHERE tax_id = @tax_id AND company_id != @company_id)
            THROW 50000, 'El ID fiscal ya existe para otra empresa.', 1;

        UPDATE admin.Companies
        SET 
            company_name = @company_name,
            tax_id = @tax_id,
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