-- ! ================================================================================================================================================
-- !                                                        SQL PARA CREAR TABLAS
-- ! ================================================================================================================================================
-- @author Brayan Josue Yanez Gonzalez (30 Septiembre de 2024)
-- @lastModified Brayan Josue Yanez Gonzalez (30 de Septiembre de 2024)
-- @version 1.0.0
-- migrations/tables/create_tables.sql

-- Selecciona la base de datos específica
USE dbp_what_sena;

-- ! CREAR LAS TABLAS DE LA BASE DE DATOS
-- * TABLA DE SESIONES
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- * TABLA DE USUARIOS
DROP TABLE IF EXISTS `tbl_usuarios`;
CREATE TABLE `tbl_usuarios` (
  `PKUSU_NCODIGO` int NOT NULL AUTO_INCREMENT,
  `USU_CNOMBRE` varchar(45) DEFAULT NULL,
  `USU_CDOCUMENTO` varchar(45) DEFAULT NULL,
  `USU_CUSUARIO` varchar(45) DEFAULT NULL,
  `USU_RRHH_ID` varchar(255) DEFAULT NULL,
  `USU_CUSUARIO_AD` varchar(250) DEFAULT NULL,
  `USU_CROL` varchar(45) DEFAULT NULL,
  `USU_CPASSWORD` varchar(45) DEFAULT NULL,
  `USU_TOKEN` varchar(45) DEFAULT NULL,
  `USU_AUTH_TOKEN` varchar(250) DEFAULT NULL,
  `USU_CCAMPANA` varchar(45) DEFAULT NULL,
  `USU_CESTADO` varchar(45) DEFAULT NULL,
  `USU_TIPO_LOGUEO` varchar(45) DEFAULT NULL,
  `USU_CAUXILIAR` varchar(45) DEFAULT NULL,
  `USU_CFECHA_CAMBIO_AUXILIAR` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `USU_LAST_ACTIVITY` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `USU_CIDIOMA` varchar(3) DEFAULT 'es',
  `USU_CORREO` varchar(45) DEFAULT NULL,
  `USU_NCHATS` int DEFAULT '60',
  `USU_DETALLE` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`PKUSU_NCODIGO`),
  UNIQUE KEY `USU_CUSUARIO_UNIQUE` (`USU_CUSUARIO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ? TRIGGER DE CAMBIO DE AUXILIAR
DELIMITER $$
CREATE TRIGGER trigger_cambio_auxiliar
BEFORE UPDATE ON tbl_usuarios FOR EACH ROW
BEGIN
	IF OLD.USU_CAUXILIAR <> NEW.USU_CAUXILIAR THEN
		SET NEW.USU_CFECHA_CAMBIO_AUXILIAR = now();
   
		INSERT INTO tbl_registro_usuarios (FKREGU_PKUSU_NCODIGO,REGU_CUSUARIO, REGU_CDOCUMENTO, REGU_CAUXILIAR,REGU_FECHA_INICIO, REGU_FECHA_FIN,REGU_TIEMPO)
		values (OLD.PKUSU_NCODIGO, OLD.USU_CUSUARIO, OLD.USU_CDOCUMENTO, OLD.USU_CAUXILIAR, OLD.USU_CFECHA_CAMBIO_AUXILIAR, NOW(),TIMEDIFF(NOW(), OLD.USU_CFECHA_CAMBIO_AUXILIAR));
        
     END IF;
END $$
DELIMITER ;

-- * TABLA DE ARBOL
DROP TABLE IF EXISTS `tbl_bot_tree`;
CREATE TABLE `tbl_bot_tree` (
  `PKBTREE_NCODIGO` int NOT NULL AUTO_INCREMENT,
  `FKBTREE_NCODIGO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `BTREE_TIPO_MSG` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `BTREE_OPTION_NUM` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `BTREE_TEXTO` varchar(4000) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `BTREE_REGRESAR` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `BTREE_ESTADO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `tbl_bot_treecol` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `GES_CFECHA_REGISTRO` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `GES_CFECHA_MODIFICACION` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `FECHA_REGISTRO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT 'CURRENT_TIMESTAMP',
  `FECHA_MODIFICACION` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PKBTREE_NCODIGO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- * TABLA DE CHATS
DROP TABLE IF EXISTS `tbl_chats_management`;
CREATE TABLE `tbl_chats_management` (
  `PKGES_CODIGO` int NOT NULL AUTO_INCREMENT,
  `GES_TIPO_CHAT` varchar(45) COLLATE utf8mb4_bin DEFAULT '-',
  `FKGES_NUSU_CODIGO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `GES_ESTADO_CASO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `GES_CULT_MSGBOT` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `GES_POLITICA` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `GES_NUMERO_COMUNICA` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `GES_ULT_INTERACCION` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `GES_TIPO_CANAL` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `GES_CHORA_INICIO_GESTION` timestamp NULL DEFAULT NULL,
  `GES_CHORA_FIN_GESTION` timestamp NULL DEFAULT NULL,
  `GES_CFECHA_REGISTRO` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `GES_CFECHA_MODIFICACION` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `GES_CFECHA_ASIGNACION` timestamp NULL DEFAULT NULL,
  `GES_NOMBRE_COMUNICA` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `GES_DOCUMENTO_PACIENTE` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `GES_CTIPO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `GES_SOLICITUD` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `GES_ESTADO_SOLICITUD` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `GES_NUMERO_PEDIDO` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `GES_CDETALLE_ADICIONAL` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `GES_CESTADO` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT 'NA',
  `GES_ULTIMO_ENVIADO` timestamp NULL DEFAULT NULL,
  `GES_ULTIMO_RECIBIDO` timestamp NULL DEFAULT NULL,
  `GES_PRIMERO_AGENTE` timestamp NULL DEFAULT NULL,
  `GES_CFECHA_PASOASESOR` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`PKGES_CODIGO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- * TABLA DE CLIENTES
DROP TABLE IF EXISTS `tbl_client`;
CREATE TABLE `tbl_client` (
  `PK_CLI_NCODE` int NOT NULL AUTO_INCREMENT,
  `CLI_NAME` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLI_IDENTIFICATION_TYPE` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLI_IDENTIFICATION_NUMBER` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLI_CELLPHONE_NUMBER` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLI_TELEFONO2` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLI_EMAIL` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLI_DIRECCION` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLI_REGISTRATION_DATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `CLI_MODIFICATION_DATE` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `CLI_STATUS` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`PK_CLI_NCODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- * TABLA DE CLIENTES DATA
DROP TABLE IF EXISTS `tbl_client_data`;
CREATE TABLE `tbl_client_data` (
  `PKCLDT_NCODIGO` int NOT NULL AUTO_INCREMENT,
  `CLDT_TIPO_DOCUMENTO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLDT_CEDULA` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLDT_NOMBRE_COMPLETO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLDT_TELEFONO` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLDT_NUM_COMUNICACION` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLDT_DEATALLES` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLDT_EMAIL` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLDT_NUM_POLIZA` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLDT_FECHA_VENCIMIENTO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLDT_PRIMA_MENSUAL` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLDT_PRIMA_ANUAL` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CLDT_FECHA_REGISTRO` datetime DEFAULT CURRENT_TIMESTAMP,
  `CLDT_FECHA_MODIFICACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CLDT_ESTADO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT 'Activo',
  PRIMARY KEY (`PKCLDT_NCODIGO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- * TABLA DE DIRECTORIO CONTACTO
DROP TABLE IF EXISTS `tbl_directorio_contacto`;
CREATE TABLE `tbl_directorio_contacto` (
  `drcont_id` int NOT NULL AUTO_INCREMENT,
  `drcont_fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `drcont_num_contacto` varchar(45) NOT NULL DEFAULT '-',
  `drcont_nombres_apellidos_contacto` varchar(255) NOT NULL DEFAULT '-',
  `drcont_tipo_estado` varchar(45) NOT NULL DEFAULT '-',
  `drcont_actualizacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `drcont_fk_usuarios` varchar(45) NOT NULL DEFAULT '-',
  PRIMARY KEY (`drcont_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- * TABLA DE GRUPO
DROP TABLE IF EXISTS `tbl_grupo`;
CREATE TABLE `tbl_grupo` (
  `grp_id` int NOT NULL AUTO_INCREMENT,
  `grp_fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `grp_numero` varchar(255) NOT NULL DEFAULT '-',
  `grp_nombre` varchar(255) NOT NULL DEFAULT '-',
  `grp_detalle` varchar(255) NOT NULL DEFAULT '-',
  `grp_tipo_estado` varchar(45) NOT NULL DEFAULT 'Activo',
  `grp_actualizacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `grp_fk_usuarios` varchar(45) NOT NULL DEFAULT '-',
  PRIMARY KEY (`grp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- * TABLA DE HOMOLOGACION
DROP TABLE IF EXISTS `tbl_homologacion`;
CREATE TABLE `tbl_homologacion` (
  `PKHOM_CODIGO` int NOT NULL AUTO_INCREMENT,
  `HOM_CAMPO_DB` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `HOM_NOMBRE` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `HOM_NUMERO` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `HOM_DESCRIPCION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`PKHOM_CODIGO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- * TABLA DE LINE PROFILING
DROP TABLE IF EXISTS `tbl_line_profiling`;
CREATE TABLE `tbl_line_profiling` (
  `PKLIPR_NCODE` int NOT NULL AUTO_INCREMENT,
  `LIPR_WHATSAPP_NUM` varchar(45) DEFAULT NULL,
  `LIPR_CLIENTWP_STATUS` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LIPR_SESIONWP_STATUS` varchar(45) DEFAULT NULL,
  `LIPR_COUNTRY` varchar(45) DEFAULT NULL,
  `LIPR_ACCOUNT_ID` longtext,
  `LIPR_API_KEY` longtext,
  `LIPR_PROJECT_ROUTE` varchar(255) DEFAULT NULL,
  `LIPR_CREATION_DATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `LIPR_LAST_MODIFICATION_DATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `LIPR_URL_BOT` varchar(225) DEFAULT NULL,
  `LIPR_VERSION_WPWEB` varchar(45) DEFAULT NULL,
  `LIPR_QR_STATUS` varchar(45) DEFAULT NULL,
  `LIPR_QR_STRING` varchar(500) DEFAULT NULL,
  `LIPR_SESIONWP_MSG` varchar(550) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `LIPR_INICIO_APP_DATETIME` timestamp NULL DEFAULT NULL,
  `LIPR_FIN_INICIO_APP_DATETIME` timestamp NULL DEFAULT NULL,
  `LIPR_STATUS_APP` varchar(45) DEFAULT NULL,
  `LIPR_MSG_INICIO_APP` varchar(550) DEFAULT NULL,
  `LIPR_STATUS` varchar(45) DEFAULT 'true',
  `LIPR_CFECHA_REGISTRO` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `LIPR_CFECHA_MODIFICACION` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PKLIPR_NCODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- * TABLA DE MESSAGES
DROP TABLE IF EXISTS `tbl_messages`;
CREATE TABLE `tbl_messages` (
  `PK_MES_NCODE` int NOT NULL AUTO_INCREMENT,
  `FK_GES_CODIGO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_ACCOUNT_SID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_API_VERSION` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_BODY` longtext COLLATE utf8mb4_unicode_ci,
  `MES_FROM` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_TO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_AUTHOR` varchar(4000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MES_CHANNEL` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_MEDIA_TYPE` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_MEDIA_URL` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `MES_MESSAGE_ID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_NUM_MEDIA` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_NUM_SEGMENTS` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_PROFILE_NAME` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_REFFAL_NUM_MEDIA` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_SMS_MESSAGE_SID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_SMS_SID` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_SMS_STATUS` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_WAID` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_CREATION_DATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `MES_LAST_MODIFICATION_DATE` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `MES_DATE_SENT__MESSAGE` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_DATE_CREATED_MESSAGE` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_DATE_UPDATED_MESSAGE` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_DATE_DELIVERED` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_DATE_READ` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `MES_USER` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `MES_MESSAGE_SHOW` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `MES_TIPO_GESTION` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `MES_IDSOUL_CONVERSACION` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `MES_IDSOUL_CAMPANA` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `MES_IDRRHH` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `MES_ESTADO_ENVIO_SOUL` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `MES_MSG_ENVIO` varchar(550) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `MES_SMS_STATUS2` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  PRIMARY KEY (`PK_MES_NCODE`),
  KEY `idx_FK_GES_CODIGO` (`FK_GES_CODIGO`),
  KEY `idx_PK_MES_NCODE` (`PK_MES_NCODE`),
  KEY `idx_FK_GES_CODIGO_PK_MES_NCODE` (`FK_GES_CODIGO`,`PK_MES_NCODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- * TABLA DE OPCIONES
DROP TABLE IF EXISTS `tbl_opt_select`;
CREATE TABLE `tbl_opt_select` (
  `PKOP_CODIGO` int NOT NULL AUTO_INCREMENT,
  `OP_CATEGORIA` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `OP_ID` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `OP_OPCION` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `OP_ESTADO` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT 'Activo',
  PRIMARY KEY (`PKOP_CODIGO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- * TABLA DE PLANTILLAS
DROP TABLE IF EXISTS `tbl_plantillas`;
CREATE TABLE `tbl_plantillas` (
  `PKPLA_NCODIGO` int NOT NULL AUTO_INCREMENT,
  `PLA_CNOMBRE` varchar(45) DEFAULT NULL,
  `PLA_CCONTENIDO` mediumtext,
  PRIMARY KEY (`PKPLA_NCODIGO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- * TABLA DE REGISTRO DE USUARIOS
DROP TABLE IF EXISTS `tbl_registro_usuarios`;
CREATE TABLE `tbl_registro_usuarios` (
  `PKREGU_NCODIGO` int NOT NULL AUTO_INCREMENT,
  `FKREGU_PKUSU_NCODIGO` int DEFAULT NULL,
  `REGU_CUSUARIO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `REGU_CDOCUMENTO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `REGU_CAUXILIAR` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `REGU_FECHA_INICIO` timestamp NULL DEFAULT NULL,
  `REGU_FECHA_FIN` timestamp NULL DEFAULT NULL,
  `REGU_TIEMPO` time DEFAULT NULL,
  PRIMARY KEY (`PKREGU_NCODIGO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- * TABLA DE TEMPLATES
DROP TABLE IF EXISTS `tbl_template`;
CREATE TABLE `tbl_template` (
  `TEM_NCODIGO` int NOT NULL AUTO_INCREMENT,
  `TEM_TEMPLATE_NAME` varchar(255) DEFAULT NULL,
  `TEM_MESSAGE_TEXT` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `TEM_LENGUAGE` varchar(255) DEFAULT NULL,
  `TEM_STATUS` varchar(50) DEFAULT NULL,
  `TEN_FECHA_REGISTRO` datetime DEFAULT CURRENT_TIMESTAMP,
  `TEM_FECHA_MODIFICACION` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `TEM_ESTADO` varchar(50) DEFAULT 'Activo',
  PRIMARY KEY (`TEM_NCODIGO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- * TABLA DE TRANSFERENCIAS
DROP TABLE IF EXISTS `tbl_transfers`;
CREATE TABLE `tbl_transfers` (
  `PKTRA_NCODIGO` int NOT NULL AUTO_INCREMENT,
  `FKTRA_NUSU_CODIGO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `FKTRA_NUSU_TRANSFERIDO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `FKTRA_NGES_CODIGO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TRA_MOTIVO` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TRA_OBSERVACION` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TRA_CFECHA_REGISTRO` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `TRA_CFECHA_MODIFICACION` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `TYP_CESTADO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`PKTRA_NCODIGO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- * TABLA DE TIPIFICACIONES
DROP TABLE IF EXISTS `tbl_typifications`;
CREATE TABLE `tbl_typifications` (
  `PKTYP_CODIGO` int NOT NULL AUTO_INCREMENT,
  `FKTYP_NGES_CODIGO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `FKTYP_NUSU_CODIGO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TYP_ORIGEN` varchar(45) COLLATE utf8mb4_general_ci DEFAULT 'INDIVIDUAL',
  `TYP_FECHA_HORA_INICIO_TIPIFICACION` varchar(45) COLLATE utf8mb4_general_ci DEFAULT '-',
  `TYP_NOMBRE_AGENTE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TYP_CNUMERO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TYP_OBSERVACION` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TYP_NUMEROCASO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TYP_FECHA_HORA_INICIO_MENSAJE` varchar(45) COLLATE utf8mb4_general_ci DEFAULT '-',
  `TYP_HORA_INCIO_CHAT` varchar(45) COLLATE utf8mb4_general_ci DEFAULT '-',
  `TYP_FECHA_HORA_FIN_MENSAJE` varchar(45) COLLATE utf8mb4_general_ci DEFAULT '-',
  `TYP_HORA_FIN_CHAT` varchar(45) COLLATE utf8mb4_general_ci DEFAULT '-',
  `TYP_TMO` varchar(45) COLLATE utf8mb4_general_ci DEFAULT '00:00:00',
  `TYP_CFECHA_REGISTRO` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `TYP_CFECHA_MODIFICACION` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `TYP_CESTADO` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'Activo',
  PRIMARY KEY (`PKTYP_CODIGO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


