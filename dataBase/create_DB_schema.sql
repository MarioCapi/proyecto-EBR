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

-- Eliminar las restricciones de clave foránea si existen
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK__Users__company_i__*')
    ALTER TABLE admin.Users DROP CONSTRAINT FK__Users__company_i__;
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK__AuditLog__user_i__*')
    ALTER TABLE admin.AuditLog DROP CONSTRAINT FK__AuditLog__user_i__;

-- Eliminar las tablas si existen (en orden inverso a las dependencias)
IF OBJECT_ID('admin.AuditLog', 'U') IS NOT NULL DROP TABLE admin.AuditLog;
IF OBJECT_ID('admin.RolePermissions', 'U') IS NOT NULL DROP TABLE admin.RolePermissions;
IF OBJECT_ID('admin.Permissions', 'U') IS NOT NULL DROP TABLE admin.Permissions;
IF OBJECT_ID('admin.Roles', 'U') IS NOT NULL DROP TABLE admin.Roles;
IF OBJECT_ID('admin.Users', 'U') IS NOT NULL DROP TABLE admin.Users;
IF OBJECT_ID('admin.Companies', 'U') IS NOT NULL DROP TABLE admin.Companies;

-- Crear las tablas
CREATE TABLE admin.Companies (
    company_id INT IDENTITY(1,1) PRIMARY KEY,
    company_name NVARCHAR(100) NOT NULL,
    tax_identification_type NVARCHAR(10) NOT NULL,
    tax_id NVARCHAR(20) NOT NULL,
    address NVARCHAR(200),
    phone NVARCHAR(20),
    status NVARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE, SUSPENDED, CANCELLED
    subscription_type NVARCHAR(20) DEFAULT 'BASIC',  -- BASIC, PREMIUM, ENTERPRISE
    subscription_end_date DATE,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    active BIT DEFAULT 1,
    CONSTRAINT UQ_tax_id_type UNIQUE (tax_identification_type, tax_id)
);

-- Resto de las tablas con sus claves foráneas
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