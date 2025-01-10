-- Crear la base de datos
USE master;
GO

-- Eliminar conexiones existentes a la base de datos si existe
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'ebr')
BEGIN
    ALTER DATABASE ebr SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE ebr;
END
GO

-- Crear la base de datos
CREATE DATABASE ebr;
GO

-- Usar la base de datos
USE ebr;
GO

-- Crear esquema para administración
CREATE SCHEMA admin;
GO


CREATE TABLE admin.subscription (
    id_subscription INT IDENTITY(1,1) PRIMARY KEY,
    subscription_name NVARCHAR(20) NOT NULL,
    description_time NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
);


-- Crear las tablas
CREATE TABLE admin.Companies (
    company_id INT IDENTITY(1,1) PRIMARY KEY,
    company_name NVARCHAR(100) NOT NULL,
    tax_identification_type NVARCHAR(10) NOT NULL,
    tax_id NVARCHAR(20) NOT NULL,
    email NVARCHAR(100),
    num_employees INT,
    company_type NVARCHAR(50),
    address NVARCHAR(200),
    phone NVARCHAR(20),
    status NVARCHAR(20) DEFAULT 'ACTIVE',
    subscription_type NVARCHAR(50) NOT NULL,
    subscription_id INT, 
    subscription_end_date DATE,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    active BIT DEFAULT 1,
    CONSTRAINT UQ_tax_id_type UNIQUE (tax_identification_type, tax_id),
    CONSTRAINT FK_Companies_Subscription FOREIGN KEY (subscription_id) 
    REFERENCES admin.subscription(id_subscription)
);
ALTER TABLE admin.Companies
ADD CONSTRAINT UQ_tax_id UNIQUE (tax_id);


-- Tabla de Roles en esquema admin
CREATE TABLE admin.Roles (
    role_id INT IDENTITY(1,1) PRIMARY KEY, -- Identificador único para cada rol
    role_name NVARCHAR(50) NOT NULL UNIQUE, -- Nombre del rol único
    description NVARCHAR(200), -- Descripción del rol
    created_at DATETIME DEFAULT GETDATE() -- Fecha de creación
);

CREATE TABLE admin.Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    company_id INT NOT NULL,
    role_id INT NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(50),
    last_name NVARCHAR(50),
    last_login DATETIME,
    login_attempts INT DEFAULT 0,
    password_reset_token NVARCHAR(255),
    password_reset_expires DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    active BIT DEFAULT 1,
    CONSTRAINT FK_Users_Companies FOREIGN KEY (company_id) 
    REFERENCES admin.Companies(company_id),
    CONSTRAINT FK_Users_Roles FOREIGN KEY (role_id) 
    REFERENCES admin.Roles(role_id),
    CONSTRAINT FK_Users_Subscription FOREIGN KEY (role_id) 
    REFERENCES admin.subscription(id_subscription)
);

-- Tabla de Permisos en esquema admin
CREATE TABLE admin.Permissions (
    permission_id INT IDENTITY(1,1) PRIMARY KEY,
    permission_name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(200),
    created_at DATETIME DEFAULT GETDATE()
);

-- Tabla de relación Roles-Permisos en esquema admin
CREATE TABLE admin.RolePermissions (
    role_id INT,
    permission_id INT,
    created_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES admin.Roles(role_id),
    FOREIGN KEY (permission_id) REFERENCES admin.Permissions(permission_id)
);

-- Tabla de Auditoría en esquema admin
CREATE TABLE admin.AuditLog (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    action_type NVARCHAR(50) NOT NULL,
    table_name NVARCHAR(50) NOT NULL,
    record_id NVARCHAR(50),
    old_value NVARCHAR(MAX),
    new_value NVARCHAR(MAX),
    ip_address NVARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES admin.Users(user_id)
);





-- Eliminar tablas en orden por dependencias
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[admin].[AuditLog]'))
    DROP TABLE [admin].[AuditLog]

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[admin].[RolePermissions]'))
    DROP TABLE [admin].[RolePermissions]

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[admin].[Permissions]'))
    DROP TABLE [admin].[Permissions]

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[admin].[Users]'))
    DROP TABLE [admin].[Users]

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[admin].[Companies]'))
    DROP TABLE [admin].[Companies]

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[admin].[Roles]'))
    DROP TABLE [admin].[Roles]

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[admin].[subscription]'))
    DROP TABLE [admin].[subscription]

--Insertar subscriptions 
INSERT INTO admin.subscription (subscription_name, description_time)
VALUES 
	('FREMIUM', 'Suscripción demo'),
    ('BASIC', 'Suscripción básica'),
    ('PREMIUM', 'Suscripción premium'),
    ('ENTERPRISE', 'Suscripción empresarial');

-- Insertar roles básicos
INSERT INTO admin.Roles (role_name, description)
VALUES 
    ('Gerente', 'Administrador del sistema con acceso total'),
    ('Contador', 'Administrador de empresa cliente'),
    ('Analista contable y financiero', 'Usuario regular del sistema');

-- Insertar permisos básicos
INSERT INTO admin.Permissions (permission_name, description)
VALUES 
    ('USER_CREATE', 'Crear usuarios'),
    ('USER_READ', 'Ver usuarios'),
    ('USER_UPDATE', 'Actualizar usuarios'),
    ('USER_DELETE', 'Eliminar usuarios'),
    ('COMPANY_MANAGE', 'Gestionar empresas'),
    ('REPORTS_VIEW', 'Ver reportes'),
    ('SETTINGS_MANAGE', 'Gestionar configuraciones'); 

