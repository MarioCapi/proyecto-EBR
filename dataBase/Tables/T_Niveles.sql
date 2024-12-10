
-- Crear tabla de niveles dentro del esquema 'Admin'
CREATE TABLE Admin.Niveles (
    NivelID INT PRIMARY KEY IDENTITY(1,1),
    Descripcion NVARCHAR(50) NOT NULL
);
