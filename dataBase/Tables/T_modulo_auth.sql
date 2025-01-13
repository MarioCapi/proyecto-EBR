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

-- Crear las tablas

-- Tabla principal de suscripciones
CREATE TABLE admin.subscription (
    id_subscription INT IDENTITY(1,1) PRIMARY KEY,
    subscription_name NVARCHAR(20) NOT NULL,
    description_time NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE()
);
-- Tabla de Roles en esquema admin
CREATE TABLE admin.Roles (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(200),
    id_subscription INT,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Roles_Subscription FOREIGN KEY (id_subscription) 
    REFERENCES admin.subscription(id_subscription)
);

-- Tabla de compañías con referencia a suscripción
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
    subscription_id INT NOT NULL, -- Hacemos obligatoria la referencia
    subscription_end_date DATE,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    active BIT DEFAULT 1,
    CONSTRAINT UQ_tax_id_type UNIQUE (tax_identification_type, tax_id),
    CONSTRAINT FK_Companies_Subscription FOREIGN KEY (subscription_id) 
    REFERENCES admin.subscription(id_subscription)
);

-- Tabla de usuarios con referencias a compañías y suscripción
CREATE TABLE admin.Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    company_id INT NOT NULL,
    role_id INT NOT NULL,
    subscription_id INT NOT NULL, -- Agregamos referencia a suscripción
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
    CONSTRAINT FK_Users_Subscription FOREIGN KEY (subscription_id) 
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

-- 1. Primero eliminamos las tablas que dependen de PresupuestoSugerido_anual
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[admin].[PresupuestoIngreso]'))
    DROP TABLE [admin].[PresupuestoIngreso];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[admin].[PresupuestoGasto]'))
    DROP TABLE [admin].[PresupuestoGasto];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[admin].[PresupuestoCosto]'))
    DROP TABLE [admin].[PresupuestoCosto];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[admin].[PresupuestoSugerido]'))
    DROP TABLE [admin].[PresupuestoSugerido];

-- 2. Eliminamos PresupuestoSugerido_anual que tiene FK a Companies
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[admin].[PresupuestoSugerido_anual]'))
    DROP TABLE [admin].[PresupuestoSugerido_anual];

-- 3. Eliminamos DatosContables que depende de Archivos
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Admin].[DatosContables]'))
    DROP TABLE [Admin].[DatosContables];

-- 4. Eliminamos Archivos que tiene FK a Companies
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Admin].[Archivos]'))
    DROP TABLE [Admin].[Archivos];

-- 5. Eliminamos AuditLog que depende de Users
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[admin].[AuditLog]'))
    DROP TABLE [admin].[AuditLog];

-- 6. Eliminamos Users que tiene FK a Companies
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[admin].[Users]'))
    DROP TABLE [admin].[Users];

-- 7. Finalmente podemos eliminar Companies
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[admin].[Companies]'))
    DROP TABLE [admin].[Companies];

--Insertar subscriptions 
INSERT INTO admin.subscription (subscription_name, description_time)
VALUES 
	('freemium', 'Suscripción demo'),
    ('Basic', 'Suscripción básica'),
    ('Premium', 'Suscripción premium'),
    ('Enterprise', 'Suscripción empresarial');

-- Insertar roles con sus respectivas subscripciones
INSERT INTO admin.Roles (role_name, description, id_subscription)
SELECT 'Admin', 'Rol por defecto para usuario freemium', id_subscription
FROM admin.subscription WHERE subscription_name = 'Freemium';

INSERT INTO admin.Roles (role_name, description, id_subscription)
SELECT 'Gerente', 'Administrador del sistema con acceso total', id_subscription
FROM admin.subscription WHERE subscription_name = 'Premium';

INSERT INTO admin.Roles (role_name, description, id_subscription)
SELECT 'Contador', 'Administrador de empresa cliente', id_subscription
FROM admin.subscription WHERE subscription_name = 'Premium';

INSERT INTO admin.Roles (role_name, description, id_subscription)
SELECT 'Analista contable y financiero', 'Usuario regular del sistema', id_subscription
FROM admin.subscription WHERE subscription_name = 'Premium';

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

