
	CREATE TABLE admin.Funcionalidades (
    FuncionalidadID INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(255) NOT NULL,
    Descripcion NVARCHAR(500)
);

CREATE TABLE Admin.SubscripcionFuncionalidades (
    SubscripcionFuncionalidadID INT PRIMARY KEY IDENTITY(1,1),
    SubscripcionID INT NOT NULL,
    FuncionalidadID INT NOT NULL,
    FOREIGN KEY (SubscripcionID) REFERENCES admin.Subscription(id_subscription),
    FOREIGN KEY (FuncionalidadID) REFERENCES Admin.Funcionalidades(FuncionalidadID)
);
