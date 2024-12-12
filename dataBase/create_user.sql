USE [EBR]
GO

/****** Object:  User [_EBR_Admin_User_]    Script Date: 12/10/2024 4:08:41 PM ******/
CREATE USER [_EBR_Admin_User_] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[Admin]
GO




USE master;
GO
-- Habilitar autenticación de base de datos contenida a nivel de servidor
sp_configure 'contained database authentication', 1;
RECONFIGURE;
GO
ALTER DATABASE EBR 
SET CONTAINMENT = PARTIAL;
GO

-- Crear login
CREATE LOGIN EBR_Admin_Super 
WITH PASSWORD = '1028494065!',
DEFAULT_DATABASE = EBR
GO
-- Cambiar al contexto base de datos EBR
USE EBR
GO

-- Crear usuario con el mismo nombre del login
CREATE USER EBR_Admin_Super FOR LOGIN EBR_Admin_Super
GO

ALTER ROLE db_owner ADD MEMBER EBR_Admin_Super
GO


--========== Consultar ========== --

USE EBR
GO


SELECT SUSER_SNAME(owner_sid) AS db_owner
FROM sys.databases
WHERE name = 'EBR'



SELECT name, type_desc 
FROM sys.database_principals 
WHERE type IN ('S', 'U')
.
