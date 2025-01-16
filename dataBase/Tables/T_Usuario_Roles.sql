
-- Tabla de relación entre Usuarios y Roles
CREATE TABLE admin.UsuariosRoles (
    UsuarioRolID INT PRIMARY KEY IDENTITY(1,1),
    UsuarioID INT NOT NULL,
    RolID INT NOT NULL,
    FOREIGN KEY (UsuarioID) REFERENCES Admin.Users(user_id),
    FOREIGN KEY (RolID) REFERENCES admin.Roles(role_id)
);