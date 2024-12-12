

-- Crear tabla de archivos dentro del esquema 'Admin'
CREATE TABLE Admin.Archivos (
    ArchivoID INT PRIMARY KEY IDENTITY(1,1),
    NombreArchivo NVARCHAR(255) NOT NULL,
    EmpresaID INT NOT NULL,
    Periodo DATE NOT NULL,
    FechaCarga DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (EmpresaID) REFERENCES Admin.Empresas(EmpresaID)
);
