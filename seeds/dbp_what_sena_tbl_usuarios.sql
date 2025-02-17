CREATE DATABASE  IF NOT EXISTS `dbp_what_sena` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `dbp_what_sena`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: dbp_what_sena
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tbl_usuarios`
--

DROP TABLE IF EXISTS `tbl_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_usuarios` (
  `PKUSU_NCODIGO` int NOT NULL AUTO_INCREMENT,
  `USU_CNOMBRE` varchar(45) DEFAULT NULL,
  `USU_CDOCUMENTO` varchar(45) DEFAULT NULL,
  `USU_CUSUARIO` varchar(45) DEFAULT NULL,
  `USU_CUSUARIO_AD` varchar(250) DEFAULT NULL,
  `USU_CROL` varchar(45) DEFAULT NULL,
  `USU_CPASSWORD` varchar(45) DEFAULT NULL,
  `USU_TOKEN` varchar(45) DEFAULT NULL,
  `USU_AUTH_TOKEN` varchar(250) DEFAULT NULL,
  `USU_CESTADO` varchar(45) DEFAULT NULL,
  `USU_TIPO_LOGUEO` varchar(45) DEFAULT NULL,
  `USU_CAUXILIAR` varchar(45) DEFAULT NULL,
  `USU_LAST_ACTIVITY` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `USU_CIDIOMA` varchar(3) DEFAULT 'es',
  `USU_CORREO` varchar(45) DEFAULT NULL,
  `USU_NCHATS` int DEFAULT '60',
  `USU_DETALLE` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`PKUSU_NCODIGO`),
  UNIQUE KEY `USU_CUSUARIO_UNIQUE` (`USU_CUSUARIO`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trigger_cambio_auxiliar` BEFORE UPDATE ON `tbl_usuarios` FOR EACH ROW BEGIN
	IF OLD.USU_CAUXILIAR <> NEW.USU_CAUXILIAR THEN
		SET NEW.USU_CFECHA_CAMBIO_AUXILIAR = now();
   
		INSERT INTO tbl_registro_usuarios (FKREGU_PKUSU_NCODIGO,REGU_CUSUARIO, REGU_CDOCUMENTO, REGU_CAUXILIAR,REGU_FECHA_INICIO, REGU_FECHA_FIN,REGU_TIEMPO)
		values (OLD.PKUSU_NCODIGO, OLD.USU_CUSUARIO, OLD.USU_CDOCUMENTO, OLD.USU_CAUXILIAR, OLD.USU_CFECHA_CAMBIO_AUXILIAR, NOW(),TIMEDIFF(NOW(), OLD.USU_CFECHA_CAMBIO_AUXILIAR));
        
     END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-11  8:44:06
