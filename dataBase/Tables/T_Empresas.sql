
-- Crear tabla de empresas dentro del esquema 'Admin'
CREATE TABLE Admin.Empresas (
    EmpresaID INT PRIMARY KEY IDENTITY(1,1),
    NombreEmpresa NVARCHAR(255) NOT NULL,
    NIT NVARCHAR(50) NOT NULL
);