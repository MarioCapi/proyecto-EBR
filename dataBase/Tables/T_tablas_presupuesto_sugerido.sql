CREATE TABLE admin.PresupuestoIngreso (
    ID INT PRIMARY KEY IDENTITY(1,1),  
    NIT NVARCHAR(20) NOT NULL,
    Producto NVARCHAR(50),           
    Enero DECIMAL(18,2),                 
    Febrero DECIMAL(18,2),               
    Marzo DECIMAL(18,2),                 
    Abril DECIMAL(18,2),                 
    Mayo DECIMAL(18,2),                  
    Junio DECIMAL(18,2),                 
    Julio DECIMAL(18,2),                 
    Agosto DECIMAL(18,2),                
    Septiembre DECIMAL(18,2),           
    Octubre DECIMAL(18,2),               
    Noviembre DECIMAL(18,2),             
    Diciembre DECIMAL(18,2),             
    Total DECIMAL(18,2),                 
    usuario_insercion NVARCHAR(50) NOT NULL,  
    fecha_insercion DATETIME2 NOT NULL,  
    AnioPresupuesto INT NOT NULL,  -- Añadido el campo AnioPresupuesto
    FOREIGN KEY (NIT, AnioPresupuesto) REFERENCES admin.PresupuestoSugerido_anual(NIT, AnioPresupuesto) -- Relación con la tabla PresupuestoSugerido_anual
);

CREATE TABLE admin.PresupuestoGasto (
    ID INT PRIMARY KEY IDENTITY(1,1),
    NIT NVARCHAR(20) NOT NULL,    
    Producto NVARCHAR(50),       
    Enero DECIMAL(18,2),
    Febrero DECIMAL(18,2),
    Marzo DECIMAL(18,2),
    Abril DECIMAL(18,2),
    Mayo DECIMAL(18,2),
    Junio DECIMAL(18,2),
    Julio DECIMAL(18,2),
    Agosto DECIMAL(18,2),
    Septiembre DECIMAL(18,2),
    Octubre DECIMAL(18,2),
    Noviembre DECIMAL(18,2),
    Diciembre DECIMAL(18,2),
    Total DECIMAL(18,2),
    usuario_insercion NVARCHAR(50) NOT NULL,  
    fecha_insercion DATETIME2 NOT NULL,  
    AnioPresupuesto INT NOT NULL,  -- Añadido el campo AnioPresupuesto
    FOREIGN KEY (NIT, AnioPresupuesto) REFERENCES admin.PresupuestoSugerido_anual(NIT, AnioPresupuesto) 
);

CREATE TABLE admin.PresupuestoCosto (
    ID INT PRIMARY KEY IDENTITY(1,1),
    NIT NVARCHAR(20) NOT NULL,    
    Producto NVARCHAR(50),       
    Enero DECIMAL(18,2),
    Febrero DECIMAL(18,2),
    Marzo DECIMAL(18,2),
    Abril DECIMAL(18,2),
    Mayo DECIMAL(18,2),
    Junio DECIMAL(18,2),
    Julio DECIMAL(18,2),
    Agosto DECIMAL(18,2),
    Septiembre DECIMAL(18,2),
    Octubre DECIMAL(18,2),
    Noviembre DECIMAL(18,2),
    Diciembre DECIMAL(18,2),
    Total DECIMAL(18,2),
    usuario_insercion NVARCHAR(50) NOT NULL,  
    fecha_insercion DATETIME2 NOT NULL,  
    AnioPresupuesto INT NOT NULL,  -- Añadido el campo AnioPresupuesto
    FOREIGN KEY (NIT, AnioPresupuesto) REFERENCES admin.PresupuestoSugerido_anual(NIT, AnioPresupuesto) 
);

CREATE TABLE admin.PresupuestoSugerido (
    ID INT PRIMARY KEY IDENTITY(1,1),
    NIT NVARCHAR(20) NOT NULL,           
    Producto NVARCHAR(50),
    Enero DECIMAL(18,2),
    Febrero DECIMAL(18,2),
    Marzo DECIMAL(18,2),
    Abril DECIMAL(18,2),
    Mayo DECIMAL(18,2),
    Junio DECIMAL(18,2),
    Julio DECIMAL(18,2),
    Agosto DECIMAL(18,2),
    Septiembre DECIMAL(18,2),
    Octubre DECIMAL(18,2),
    Noviembre DECIMAL(18,2),
    Diciembre DECIMAL(18,2),
    Total DECIMAL(18,2),
    usuario_insercion NVARCHAR(50) NOT NULL,  
    fecha_insercion DATETIME2 NOT NULL,  
    AnioPresupuesto INT NOT NULL,  -- Añadido el campo AnioPresupuesto
    FOREIGN KEY (NIT, AnioPresupuesto) REFERENCES admin.PresupuestoSugerido_anual(NIT, AnioPresupuesto) 
);

CREATE TABLE admin.PresupuestoSugerido_anual (
    NIT NVARCHAR(20) NOT NULL,                     
    AnioPresupuesto INT NOT NULL,                   
    Total DECIMAL(18,2),                            
    usuario_insercion NVARCHAR(50) NOT NULL,       
    fecha_insercion DATETIME2 NOT NULL,            
    PRIMARY KEY (NIT, AnioPresupuesto),            -- Clave primaria compuesta
    CONSTRAINT FK_PresupuestoSugerido_anual_NIT FOREIGN KEY (NIT) REFERENCES admin.companies(tax_id)
);