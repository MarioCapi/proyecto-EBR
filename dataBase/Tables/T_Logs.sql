/*
Mejorar esta tabla para relacionarla a la de usuarios y/o empresas
*/
CREATE TABLE Admin.logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    timestamp DATETIME DEFAULT GETDATE(), -- Fecha y hora actual en SQL Server
    --user_id INT FOREIGN KEY REFERENCES users(id), -- Relación con la tabla users
	user_id INT, -- Relación con la tabla users
    action_type NVARCHAR(50), -- Tipo de acción
    action_details NVARCHAR(MAX), -- Detalles adicionales de la acción
    ip_address NVARCHAR(45), -- Dirección IP del usuario
    user_agent NVARCHAR(MAX), -- Información del navegador/dispositivo
    error BIT DEFAULT 0, -- Indica si es un error (0 = FALSE, 1 = TRUE)
    error_details NVARCHAR(MAX) -- Descripción del error (si aplica)
);
