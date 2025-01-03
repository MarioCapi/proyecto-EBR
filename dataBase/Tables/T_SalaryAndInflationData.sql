CREATE TABLE Admin.SalaryAndInflationData (
    Id INT IDENTITY(1,1) PRIMARY KEY,                 -- Identificador único
    Anio INT NOT NULL,                                -- Año
    ValorSalario DECIMAL(18,2) NOT NULL,             -- Valor del salario
    PorcentajeIncremento DECIMAL(5,2) NOT NULL,      -- Porcentaje de incremento
    ValorSubsidioTransporte DECIMAL(18,2) NOT NULL,  -- Valor del subsidio de transporte
    PorcentajeInflacion DECIMAL(5,2) NOT NULL        -- Porcentaje de inflación
);




INSERT INTO Admin.SalaryAndInflationData (Anio, ValorSalario, PorcentajeIncremento, PorcentajeInflacion,ValorSubsidioTransporte)
VALUES 
(2010, 515000, 3.64, 3.17, 61500),
(2011, 535600, 4.00, 3.73, 63600),
(2012, 566700, 5.80, 2.44, 67800),
(2013, 589000, 4.02, 1.94, 70500),
(2014, 616000, 4.50, 3.66, 72000),
(2015, 644350, 4.60, 6.77, 74000),
(2016, 689455, 7.00, 5.75, 77700),
(2017, 737717, 7.00, 4.09, 83140),
(2018, 781242, 5.90, 3.18, 88211),
(2019, 828116, 6.00, 3.80, 97032),
(2020, 877803, 6.00, 1.61, 102854),
(2021, 908526, 3.50, 3.47, 106454),
(2022, 1000000, 10.07, 12.53, 117172),
(2023, 1160000, 16.00, 13.12, 140606),
(2024, 1300000, 12.07, 12.53, 162000),
(2025, 1423500, 9.54, 12.53, 200000);