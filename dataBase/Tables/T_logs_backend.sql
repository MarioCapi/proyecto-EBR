CREATE TABLE Admin.logs_bakend (
    id INT IDENTITY(1,1) PRIMARY KEY,
    timestamp DATETIME DEFAULT GETDATE(), -- Fecha y hora actual en SQL Server
	user_id INT, -- Relación con la tabla users
    action_type NVARCHAR(50), -- Tipo de acción
    action_details NVARCHAR(MAX), -- Detalles adicionales de la acción        
    error BIT DEFAULT 0, -- Indica si es un error (0 = FALSE, 1 = TRUE)
    error_details NVARCHAR(MAX) -- Descripción del error (si aplica)
);
