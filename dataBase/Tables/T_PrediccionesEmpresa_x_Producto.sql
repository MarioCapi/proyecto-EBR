-- Crear el esquema "Admin" si no existe
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Admin')
BEGIN
    EXEC('CREATE SCHEMA Admin');
END;
GO

-- Crear la tabla "PrediccioneEmpresa_x_Producto"
CREATE TABLE Admin.PrediccioneEmpresa_x_Producto (
    ID_Prediccion INT IDENTITY(1,1) PRIMARY KEY,         -- Identificador único de la predicción
    NIT_Empresa NVARCHAR(20) NOT NULL,                  -- Identificación de la empresa
    Codigo_Producto NVARCHAR(50) NOT NULL,              -- Código del producto
    Año INT NOT NULL,                                   -- Año de la predicción
    Mes INT NOT NULL CHECK (Mes BETWEEN 1 AND 12),      -- Mes de la predicción (1: Enero, 12: Diciembre)
    Presupuesto_Predicho DECIMAL(18,2) NOT NULL,        -- Valor predicho del presupuesto
    Fecha_Creacion DATETIME NOT NULL DEFAULT GETDATE(), -- Fecha de creación del registro
    Usuario_Creador NVARCHAR(100) NOT NULL,             -- Usuario que creó el registro
    Fecha_Actualizacion DATETIME NULL,                  -- Fecha de la última actualización
    Usuario_Actualizador NVARCHAR(100) NULL             -- Usuario que realizó la última actualización
);
GO

-- Crear índice para facilitar consultas por NIT
CREATE INDEX IX_NIT_Empresa
ON Admin.PrediccioneEmpresa_x_Producto (NIT_Empresa);
GO

-- Crear índice para facilitar consultas por ID de la predicción
CREATE INDEX IX_ID_Prediccion
ON Admin.PrediccioneEmpresa_x_Producto (ID_Prediccion);
GO
