from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .connection import Base

class Empresa(Base):
    __tablename__ = 'Empresas'
    __table_args__ = {'schema': 'Admin'}

    EmpresaID = Column(Integer, primary_key=True, autoincrement=True)
    NombreEmpresa = Column(String(255), nullable=False)
    NIT = Column(String(50), nullable=False)

    archivos = relationship("Archivo", back_populates="empresa")

class Archivo(Base):
    __tablename__ = 'Archivos'
    __table_args__ = {'schema': 'Admin'}

    ArchivoID = Column(Integer, primary_key=True, autoincrement=True)
    NombreArchivo = Column(String(255), nullable=False)
    EmpresaID = Column(Integer, ForeignKey('Admin.Empresas.EmpresaID'), nullable=False)
    Periodo = Column(String(50), nullable=False)
    FechaCarga = Column(DateTime, server_default=func.getdate())

    empresa = relationship("Empresa", back_populates="archivos")
    datos_contables = relationship("DatoContable", back_populates="archivo")

class Nivel(Base):
    __tablename__ = 'Niveles'
    __table_args__ = {'schema': 'Admin'}

    NivelID = Column(Integer, primary_key=True, autoincrement=True)
    Descripcion = Column(String(50), nullable=False)

class DatoContable(Base):
    __tablename__ = 'DatosContables'
    __table_args__ = {'schema': 'Admin'}

    DatoID = Column(Integer, primary_key=True, autoincrement=True)
    ArchivoID = Column(Integer, ForeignKey('Admin.Archivos.ArchivoID'), nullable=False)
    NivelID = Column(Integer, ForeignKey('Admin.Niveles.NivelID'), nullable=False)
    Transaccional = Column(Boolean, nullable=False)
    CodigoCuenta = Column(String(50), nullable=False)
    NombreCuenta = Column(String(255), nullable=False)
    SaldoInicial = Column(Numeric(18,2), nullable=False)
    Debito = Column(Numeric(18,2), nullable=False)
    Credito = Column(Numeric(18,2), nullable=False)
    SaldoFinal = Column(Numeric(18,2), nullable=False)

    archivo = relationship("Archivo", back_populates="datos_contables")
    nivel = relationship("Nivel")