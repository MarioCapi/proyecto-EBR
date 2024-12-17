
CREATE TABLE Admin.DatosContables (
    DatoID INT PRIMARY KEY IDENTITY(1,1),
    ArchivoID INT NOT NULL,
    NivelID NVARCHAR(100) NOT NULL,
    Transaccional BIT NOT NULL,
    CodigoCuenta NVARCHAR(50) NOT NULL,
    NombreCuenta NVARCHAR(255) NOT NULL,
    SaldoInicial DECIMAL(18, 2) NOT NULL,
    Debito DECIMAL(18, 2) NOT NULL,
    Credito DECIMAL(18, 2) NOT NULL,
    SaldoFinal DECIMAL(18, 2) NOT NULL,
    FOREIGN KEY (ArchivoID) REFERENCES Admin.Archivos(ArchivoID)    
);