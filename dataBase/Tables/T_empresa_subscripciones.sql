
	CREATE TABLE admin.EmpresaSubscripciones (
    EmpresaSubscripcionID INT PRIMARY KEY IDENTITY(1,1),
    EmpresaID INT NOT NULL,
    SubscripcionID INT NOT NULL,
    FechaInicio DATETIME NOT NULL DEFAULT GETDATE(),
    FechaFin DATETIME,
    FOREIGN KEY (EmpresaID) REFERENCES admin.Companies(company_id),
    FOREIGN KEY (SubscripcionID) REFERENCES admin.subscription(id_subscription)
);