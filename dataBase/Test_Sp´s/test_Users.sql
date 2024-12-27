--Test de SP para crear un usuario
BEGIN TRANSACTION;

EXEC admin.CreateUser
    @tax_id = '7777777777',         -- tax_id existente en admin.Companies
    @first_name = 'Juan',
    @last_name = 'Pérez',
    @email = 'juan.perez@prueba.com',
    @password_hash = 'password123',   -- Contraseña en texto plano
    @role_id = 1,                     -- Rol existente
    @active = 1;


--test para actualizar usuario
BEGIN TRANSACTION;

EXEC admin.UpdateUser
    @tax_id = '7777777777',         -- tax_id existente en admin.Companies
    @first_name = 'Mario',   -- Nuevo nombre
    @last_name = 'Barragan',   -- Nuevo apellido
    @email = 'mariocapi90mym@gmail.com',    -- Nuevo correo electrónico
    @role_id = 1,                     -- Nuevo rol existente en admin.Roles
    @active = 0;                      -- Cambiar el estado a inactivo





