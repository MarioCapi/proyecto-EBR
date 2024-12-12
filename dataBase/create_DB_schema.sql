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

-- Tabla de Empresas en esquema admin
CREATE TABLE admin.Companies (
    company_id INT IDENTITY(1,1) PRIMARY KEY,
    company_name NVARCHAR(100) NOT NULL,
    tax_id NVARCHAR(20) NOT NULL UNIQUE,
    address NVARCHAR(200),
    phone NVARCHAR(20),
    status NVARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE, SUSPENDED, CANCELLED
    subscription_type NVARCHAR(20) DEFAULT 'BASIC',  -- BASIC, PREMIUM, ENTERPRISE
    subscription_end_date DATE,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    active BIT DEFAULT 1
);

-- Tabla de Usuarios en esquema admin
CREATE TABLE admin.Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    company_id INT,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(50),
    last_name NVARCHAR(50),
    role NVARCHAR(20) NOT NULL,  -- SUPER_ADMIN, COMPANY_ADMIN, USER
    last_login DATETIME,
    login_attempts INT DEFAULT 0,
    password_reset_token NVARCHAR(255),
    password_reset_expires DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    active BIT DEFAULT 1,
    FOREIGN KEY (company_id) REFERENCES admin.Companies(company_id)
);

-- Tabla de Permisos en esquema admin
CREATE TABLE admin.Permissions (
    permission_id INT IDENTITY(1,1) PRIMARY KEY,
    permission_name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(200),
    created_at DATETIME DEFAULT GETDATE()
);

-- Tabla de Roles en esquema admin
CREATE TABLE admin.Roles (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name NVARCHAR(50) NOT NULL UNIQUE,
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

-- Insertar roles básicos
INSERT INTO admin.Roles (role_name, description)
VALUES 
    ('SUPER_ADMIN', 'Administrador del sistema con acceso total'),
    ('COMPANY_ADMIN', 'Administrador de empresa cliente'),
    ('USER', 'Usuario regular del sistema');

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