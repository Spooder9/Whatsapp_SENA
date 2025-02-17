-- ! ================================================================================================================================================
-- !                                                        SQL PARA INSERTAR DATOS
-- ! ================================================================================================================================================
-- @author Brayan Josue Yanez Gonzalez (30 Septiembre de 2024)
-- @lastModified Brayan Josue Yanez Gonzalez (30 de Septiembre de 2024)
-- @version 1.0.0
-- seeds/data_tables.sql

-- Selecciona la base de datos específica
USE dbp_what_sena;

-- ! INSERTAR DATOS EN LAS TABLAS
-- * TABLA DE USUARIOS
INSERT INTO `tbl_usuarios` (`USU_CNOMBRE`, `USU_CDOCUMENTO`, `USU_CUSUARIO`, `USU_RRHH_ID`, `USU_CUSUARIO_AD`, `USU_CROL`, `USU_CPASSWORD`, `USU_CCAMPANA`, `USU_CESTADO`, `USU_TIPO_LOGUEO`, `USU_CIDIOMA`, `USU_NCHATS`, `USU_DETALLE`) VALUES ('USUARIO DE PRUEBAS', '1.111.111.111', 'Brayan Yanez', 'brayan.yanez', 'brayan.yanez', 'ADMINISTRADOR', 'Colombia2525x', 'COS', 'ACTIVO', 'DA', 'es', '0', 'Usuario de pruebas para desarrollo.');

-- * TABLA DE LINE PROFILING
INSERT INTO `tbl_line_profiling` (`LIPR_WHATSAPP_NUM`) VALUES ('573054818254');

