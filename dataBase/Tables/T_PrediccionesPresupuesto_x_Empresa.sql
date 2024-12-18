CREATE TABLE Admin.PrediccionesPresupuesto_x_Empresa (
    Nit_Empresa NVARCHAR(20) NOT NULL,
    Anio_Prediccion INT NOT NULL,
    Mes NVARCHAR(20) NOT NULL,
    Valor_Predicho DECIMAL(18, 2) NOT NULL,
    Tendencia NVARCHAR(50) NOT NULL,
    Coeficiente_Diferencia DECIMAL(18, 2) NOT NULL,
    Fecha_Generacion DATETIME NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY (Nit_Empresa, Anio_Prediccion, Mes)
);
