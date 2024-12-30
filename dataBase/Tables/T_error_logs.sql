CREATE TABLE Admin.error_logs (
    id INT IDENTITY PRIMARY KEY,
    error_message NVARCHAR(4000),
    error_severity INT,
    error_state INT,
    timestamp DATETIME DEFAULT GETDATE()
);
