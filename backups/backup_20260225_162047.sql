-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: db    Database: pfg
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `body_type`
--

DROP TABLE IF EXISTS `body_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `body_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `body_type`
--

LOCK TABLES `body_type` WRITE;
/*!40000 ALTER TABLE `body_type` DISABLE KEYS */;
INSERT INTO `body_type` VALUES (44,'SUV'),(45,'Sedán'),(46,'Compacto'),(47,'Cabrio'),(48,'Familiar');
/*!40000 ALTER TABLE `body_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brand`
--

DROP TABLE IF EXISTS `brand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brand` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brand`
--

LOCK TABLES `brand` WRITE;
/*!40000 ALTER TABLE `brand` DISABLE KEYS */;
INSERT INTO `brand` VALUES (50,'BMW',NULL),(51,'Audi',NULL),(52,'Mercedes',NULL),(53,'Volkswagen',NULL),(54,'Toyota',NULL),(55,'Ford',NULL);
/*!40000 ALTER TABLE `brand` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `color`
--

DROP TABLE IF EXISTS `color`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `color` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `hex_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `color`
--

LOCK TABLES `color` WRITE;
/*!40000 ALTER TABLE `color` DISABLE KEYS */;
INSERT INTO `color` VALUES (52,'Blanco',NULL),(53,'Negro','#000000'),(54,'Rojo','#FE0000'),(55,'Azul','#0011ff'),(56,'Gris',NULL),(57,'Plata',NULL),(58,'Amarillo','#eeff00');
/*!40000 ALTER TABLE `color` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation`
--

DROP TABLE IF EXISTS `conversation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contact_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `contact_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `vehicle_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `reservation_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_8A8E26E9B83297E7` (`reservation_id`),
  KEY `IDX_8A8E26E9545317D1` (`vehicle_id`),
  KEY `IDX_8A8E26E9A76ED395` (`user_id`),
  CONSTRAINT `FK_8A8E26E9545317D1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`id`),
  CONSTRAINT `FK_8A8E26E9A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_8A8E26E9B83297E7` FOREIGN KEY (`reservation_id`) REFERENCES `reservation` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation`
--

LOCK TABLES `conversation` WRITE;
/*!40000 ALTER TABLE `conversation` DISABLE KEYS */;
INSERT INTO `conversation` VALUES (4,'salma.ruelas@ybarra.es','salma.ruelas@ybarra.es','640503310','2026-01-30 13:39:41','2026-01-30 13:39:41','READ',423,NULL,NULL),(5,'Fernando','jimena.tijerina@miramontes.com','+34 679 601269','2026-01-30 13:45:09','2026-01-30 13:45:10','READ',423,216,NULL),(6,'Víctor','aragon.martina@lopez.com','+34 614-44-1615','2026-01-30 13:54:56','2026-01-30 13:55:21','READ',422,221,NULL),(7,'Víctor','aragon.martina@lopez.com','+34 614-44-1615','2026-01-30 13:57:53','2026-01-30 13:57:53','READ',420,221,NULL),(8,'Víctor','aragon.martina@lopez.com','+34 614-44-1615','2026-01-30 14:04:52','2026-02-08 20:26:10','READ',391,221,NULL),(9,'Lola Santacruz','ander.sanchez@saavedra.net','+34 633-653943','2026-02-08 18:07:56','2026-02-08 18:24:33','READ',420,NULL,21),(10,'Lola Santacruz','ander.sanchez@saavedra.net','+34 633-653943','2026-02-08 18:11:59','2026-02-08 18:25:57','READ',420,NULL,22),(11,'Lola Santacruz','ander.sanchez@saavedra.net','+34 633-653943','2026-02-08 18:25:29','2026-02-08 18:26:05','READ',420,NULL,23),(12,'Lola Santacruz','ander.sanchez@saavedra.net','+34 633-653943','2026-02-08 18:39:33','2026-02-08 18:41:34','READ',420,NULL,24),(13,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 18:40:53','2026-02-08 18:41:52','READ',420,NULL,25),(14,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 18:47:56','2026-02-08 18:48:15','READ',391,NULL,26),(15,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 18:48:46','2026-02-08 18:48:58','READ',391,NULL,27),(16,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 18:51:31','2026-02-08 18:51:57','READ',391,NULL,28),(17,'Lola Santacruz','ander.sanchez@saavedra.net','+34 633-653943','2026-02-08 18:52:14','2026-02-08 18:52:25','READ',391,NULL,29),(18,'Encarnación','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 18:57:01','2026-02-08 18:57:01','READ',423,215,NULL),(19,'Encarnación','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 19:15:42','2026-02-08 19:15:42','READ',419,215,NULL),(20,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 19:25:32','2026-02-08 19:26:05','READ',420,NULL,30),(21,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 19:40:53','2026-02-08 19:46:51','READ',401,NULL,31),(22,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 19:47:01','2026-02-08 19:47:42','READ',391,NULL,32),(23,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 19:52:07','2026-02-08 19:52:25','READ',391,NULL,33),(24,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 19:53:28','2026-02-08 19:55:25','READ',391,NULL,34),(25,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 19:54:57','2026-02-08 19:55:30','READ',391,NULL,35),(26,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 19:56:47','2026-02-08 19:58:52','READ',391,NULL,36),(27,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 19:59:02','2026-02-08 19:59:56','READ',391,NULL,37),(28,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 20:00:59','2026-02-08 20:04:17','READ',391,NULL,38),(29,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 20:04:01','2026-02-08 20:04:21','READ',391,NULL,39),(30,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 20:04:58','2026-02-08 20:06:09','READ',391,NULL,40),(31,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 20:06:21','2026-02-08 20:10:10','READ',391,NULL,41),(32,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 20:10:43','2026-02-08 20:11:24','READ',391,NULL,42),(33,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 20:11:38','2026-02-08 20:12:03','READ',391,NULL,43),(34,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 20:12:25','2026-02-08 20:13:49','READ',420,NULL,44),(35,'Encarnación','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 20:21:49','2026-02-08 20:25:54','READ',422,215,NULL),(36,'Rayan','ander.pichardo@cuellar.es','605-152513','2026-02-08 20:31:56','2026-02-08 20:31:56','READ',418,230,NULL),(37,'Encarnación','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 20:32:04','2026-02-08 20:32:04','READ',418,215,NULL),(38,'Rayan','ander.pichardo@cuellar.es','605-152513','2026-02-08 20:47:31','2026-02-08 20:47:31','READ',422,230,NULL),(39,'Rayan','ander.pichardo@cuellar.es','605-152513','2026-02-08 21:02:15','2026-02-08 21:02:15','READ',424,230,NULL),(40,'Encarnación','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 21:02:24','2026-02-08 21:02:24','READ',424,215,NULL),(41,'Rayan','ander.pichardo@cuellar.es','605-152513','2026-02-08 21:13:36','2026-02-08 21:13:36','READ',425,230,NULL),(42,'Encarnación','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 21:13:48','2026-02-08 21:13:48','READ',425,215,NULL),(43,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-08 21:15:37','2026-02-08 21:15:47','READ',425,NULL,45),(44,'Encarnación','rayan.tello@latinmail.com','+34 673-003282','2026-02-10 12:11:18','2026-02-10 12:14:27','READ',422,215,NULL),(45,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-10 13:22:12','2026-02-10 13:22:24','READ',401,NULL,46),(46,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-10 13:23:00','2026-02-10 14:04:49','READ',401,NULL,47),(47,'Encarnación','rayan.tello@latinmail.com','+34 673-003282','2026-02-10 13:57:34','2026-02-10 13:57:34','READ',419,215,NULL),(48,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-10 14:00:05','2026-02-10 14:00:17','READ',391,NULL,48),(49,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-10 14:03:46','2026-02-10 14:04:09','READ',391,NULL,49),(50,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-10 14:06:16','2026-02-10 14:32:59','READ',420,NULL,50),(51,'Encarnación','rayan.tello@latinmail.com','+34 673-003282','2026-02-15 20:00:14','2026-02-15 20:01:39','READ',395,215,NULL),(52,'Encarnación','rayan.tello@latinmail.com','+34 673-003282','2026-02-15 20:02:03','2026-02-15 20:06:02','READ',424,215,NULL),(53,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-15 20:06:43','2026-02-25 16:15:57','READ',420,NULL,51),(54,'Encarnación Calvillo','rayan.tello@latinmail.com','+34 673-003282','2026-02-15 20:11:13','2026-02-25 15:58:36','READ',425,NULL,52),(55,'Encarnación','rayan.tello@latinmail.com','+34 673-003282','2026-02-15 20:11:46','2026-02-15 20:50:03','READ',424,215,NULL),(56,'Sergio','sergiothd50@gmail.com','640503310','2026-02-17 13:35:06','2026-02-17 13:35:07','READ',419,NULL,NULL),(57,'Sergio','sergioramirezmoron@gmail.com','640503310','2026-02-21 13:26:40','2026-02-21 13:26:40','READ',418,240,NULL),(58,'Sergio','sergio@sergio.com','72364363','2026-02-24 21:07:24','2026-02-24 21:07:27','READ',419,241,NULL),(59,'Juan José','gvaldivia@live.com','+34 683-11-1795','2026-02-25 15:59:13','2026-02-25 15:59:13','READ',419,217,NULL);
/*!40000 ALTER TABLE `conversation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctrine_migration_versions`
--

DROP TABLE IF EXISTS `doctrine_migration_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctrine_migration_versions` (
  `version` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int DEFAULT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctrine_migration_versions`
--

LOCK TABLES `doctrine_migration_versions` WRITE;
/*!40000 ALTER TABLE `doctrine_migration_versions` DISABLE KEYS */;
INSERT INTO `doctrine_migration_versions` VALUES ('DoctrineMigrations\\Version20251227220500','2025-12-27 23:05:10',40),('DoctrineMigrations\\Version20260224170723',NULL,NULL);
/*!40000 ALTER TABLE `doctrine_migration_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enviromental_badge`
--

DROP TABLE IF EXISTS `enviromental_badge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enviromental_badge` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enviromental_badge`
--

LOCK TABLES `enviromental_badge` WRITE;
/*!40000 ALTER TABLE `enviromental_badge` DISABLE KEYS */;
INSERT INTO `enviromental_badge` VALUES (40,'B',NULL),(41,'C',NULL),(42,'ECO',NULL),(43,'0 Emisiones',NULL);
/*!40000 ALTER TABLE `enviromental_badge` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorite`
--

DROP TABLE IF EXISTS `favorite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `user_id` int NOT NULL,
  `vehicle_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_FAVORITE_USER_VEHICLE` (`user_id`,`vehicle_id`),
  KEY `IDX_68C58ED9A76ED395` (`user_id`),
  KEY `IDX_68C58ED9545317D1` (`vehicle_id`),
  CONSTRAINT `FK_68C58ED9545317D1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`id`),
  CONSTRAINT `FK_68C58ED9A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorite`
--

LOCK TABLES `favorite` WRITE;
/*!40000 ALTER TABLE `favorite` DISABLE KEYS */;
INSERT INTO `favorite` VALUES (10,'2026-02-24 16:54:09',206,419),(11,'2026-02-24 16:54:20',215,419),(13,'2026-02-24 16:57:49',215,400),(14,'2026-02-24 16:57:56',215,418),(15,'2026-02-24 16:58:36',207,425),(16,'2026-02-24 17:29:18',206,400),(17,'2026-02-24 17:29:27',206,425),(19,'2026-02-24 17:37:28',207,420),(20,'2026-02-24 21:06:54',241,419);
/*!40000 ALTER TABLE `favorite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fuel`
--

DROP TABLE IF EXISTS `fuel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fuel` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fuel`
--

LOCK TABLES `fuel` WRITE;
/*!40000 ALTER TABLE `fuel` DISABLE KEYS */;
INSERT INTO `fuel` VALUES (39,'Gasolina'),(40,'Diesel'),(41,'Híbrido'),(42,'Eléctrico');
/*!40000 ALTER TABLE `fuel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message`
--

DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `is_admin` tinyint(1) NOT NULL,
  `conversation_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_B6BD307F9AC0396` (`conversation_id`),
  CONSTRAINT `FK_B6BD307F9AC0396` FOREIGN KEY (`conversation_id`) REFERENCES `conversation` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
INSERT INTO `message` VALUES (1,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-01-30 13:39:41',0,4),(2,'Hola, me interesa','2026-01-30 13:45:10',0,5),(3,'Holaa, que chulo el coche eh','2026-01-30 13:54:56',0,6),(4,'sip, está durisimo','2026-01-30 13:55:21',1,6),(5,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-01-30 13:57:53',0,7),(6,'lo quiero','2026-01-30 14:04:52',0,8),(7,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 24/02/2026 al 26/02/2026\n💰 Total: 286€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 18:07:56',0,9),(8,'hola','2026-02-08 18:08:31',1,9),(9,'no podemos gestionar tu reserva actualmente','2026-02-08 18:08:39',1,9),(10,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 27/02/2026 al 28/02/2026\n💰 Total: 143€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 18:11:59',0,10),(11,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 18:24:33',1,9),(12,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 28/02/2026 al 01/03/2026\n💰 Total: 143€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 18:25:29',0,11),(13,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 18:25:57',1,10),(14,'✅ He aceptado tu solicitud. El vehículo queda reservado.','2026-02-08 18:26:05',1,11),(15,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 19/02/2026 al 21/02/2026\n💰 Total: 286€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 18:39:33',0,12),(16,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 19/02/2026 al 21/02/2026\n💰 Total: 286€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 18:40:53',0,13),(17,'✅ He aceptado tu solicitud. El vehículo queda reservado.','2026-02-08 18:41:34',1,12),(18,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 18:41:52',1,13),(19,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 18/02/2026 al 20/02/2026\n💰 Total: 198€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 18:47:56',0,14),(20,'✅ He aceptado tu solicitud. El vehículo queda reservado para ti.','2026-02-08 18:48:15',1,14),(21,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 21/02/2026 al 22/02/2026\n💰 Total: 99€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 18:48:46',0,15),(22,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 18:48:58',1,15),(23,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 21/02/2026 al 24/02/2026\n💰 Total: 297€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 18:51:31',0,16),(24,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 18:51:57',1,16),(25,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 21/02/2026 al 23/02/2026\n💰 Total: 198€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 18:52:14',0,17),(26,'✅ He aceptado tu solicitud. El vehículo queda reservado para ti.','2026-02-08 18:52:25',1,17),(27,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-08 18:57:01',0,18),(28,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-08 19:15:42',0,19),(29,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 24/02/2026 al 26/02/2026\n💰 Total: 286€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 19:25:32',0,20),(30,'✅ He aceptado tu solicitud. El vehículo queda reservado para ti.','2026-02-08 19:26:05',1,20),(31,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 10/02/2026 al 12/02/2026\n💰 Total: 122€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 19:40:53',0,21),(32,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 19:46:51',1,21),(33,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 24/02/2026 al 25/02/2026\n💰 Total: 99€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 19:47:01',0,22),(34,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 19:47:42',1,22),(35,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 26/02/2026 al 27/02/2026\n💰 Total: 99€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 19:52:07',0,23),(36,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 19:52:25',1,23),(37,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 24/02/2026 al 26/02/2026\n💰 Total: 198€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 19:53:28',0,24),(38,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 27/02/2026 al 28/02/2026\n💰 Total: 99€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 19:54:57',0,25),(39,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 19:55:25',1,24),(40,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 19:55:30',1,25),(41,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 24/02/2026 al 25/02/2026\n💰 Total: 99€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 19:56:47',0,26),(42,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 19:58:51',1,26),(43,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 26/02/2026 al 28/02/2026\n💰 Total: 198€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 19:59:02',0,27),(44,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 19:59:56',1,27),(45,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 24/02/2026 al 25/02/2026\n💰 Total: 99€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 20:00:59',0,28),(46,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 26/02/2026 al 27/02/2026\n💰 Total: 99€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 20:04:01',0,29),(47,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 20:04:17',1,28),(48,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 20:04:21',1,29),(49,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 24/02/2026 al 25/02/2026\n💰 Total: 99€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 20:04:58',0,30),(50,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 20:06:09',1,30),(51,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 10/02/2026 al 11/02/2026\n💰 Total: 99€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 20:06:21',0,31),(52,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 20:10:10',1,31),(53,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 25/02/2026 al 26/02/2026\n💰 Total: 99€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 20:10:43',0,32),(54,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 20:11:24',1,32),(55,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 25/02/2026 al 26/02/2026\n💰 Total: 99€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 20:11:38',0,33),(56,'❌ Lo siento, no podemos aceptar la reserva en estas fechas.','2026-02-08 20:12:03',1,33),(57,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 12/02/2026 al 13/02/2026\n💰 Total: 143€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 20:12:25',0,34),(58,'✅ He aceptado tu solicitud. El vehículo queda reservado para ti.','2026-02-08 20:13:49',1,34),(59,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-08 20:21:49',0,35),(60,'no','2026-02-08 20:25:27',1,35),(61,'putada','2026-02-08 20:25:35',0,35),(62,'se','2026-02-08 20:25:54',1,35),(63,'negrete','2026-02-08 20:26:10',1,8),(64,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-08 20:31:56',0,36),(65,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-08 20:32:04',0,37),(66,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-08 20:47:31',0,38),(67,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-08 21:02:15',0,39),(68,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-08 21:02:24',0,40),(69,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-08 21:13:36',0,41),(70,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-08 21:13:48',0,42),(71,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 11/02/2026 al 12/02/2026\n💰 Total: 20€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-08 21:15:37',0,43),(72,'✅ He aceptado tu solicitud. El vehículo queda reservado para ti.','2026-02-08 21:15:47',1,43),(73,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-10 12:11:18',0,44),(74,'no','2026-02-10 12:11:40',1,44),(75,'kiki du yu love mi','2026-02-10 12:14:27',1,44),(76,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 11/02/2026 al 13/02/2026\n💰 Total: 122€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-10 13:22:12',0,45),(77,'✅ Hemos aceptado tu solicitud. El vehículo está reservado para ti.','2026-02-10 13:22:24',1,45),(78,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 17/02/2026 al 18/02/2026\n💰 Total: 61€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-10 13:23:00',0,46),(79,'❌ Lo siento, no hemos podido aceptar la reserva.','2026-02-10 13:24:34',1,46),(80,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-10 13:57:34',0,47),(81,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 25/02/2026 al 27/02/2026\n💰 Total: 198€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-10 14:00:05',0,48),(82,'❌ Lo siento, no hemos podido aceptar la reserva.','2026-02-10 14:00:17',1,48),(83,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 12/02/2026 al 14/02/2026\n💰 Total: 198€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-10 14:03:46',0,49),(84,'✅ Hemos aceptado tu solicitud. El vehículo está reservado para ti.','2026-02-10 14:04:01',1,49),(85,'lñmñl','2026-02-10 14:04:09',1,49),(86,',m,lkmlk','2026-02-10 14:04:49',0,46),(87,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 14/02/2026 al 15/02/2026\n💰 Total: 143€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-10 14:06:16',0,50),(88,'❌ Lo siento, no hemos podido aceptar la reserva.','2026-02-10 14:16:41',1,50),(89,'lalsdasd','2026-02-10 14:16:47',1,50),(90,'gitanico','2026-02-10 14:22:37',1,50),(91,'payo patuno','2026-02-10 14:22:47',1,50),(92,'a','2026-02-10 14:25:35',1,50),(93,'as','2026-02-10 14:26:39',0,50),(94,'putila','2026-02-10 14:26:51',0,50),(95,'ad','2026-02-10 14:30:26',1,50),(96,'asd','2026-02-10 14:32:53',1,50),(97,'nene','2026-02-10 14:32:59',1,50),(98,'yepa','2026-02-15 20:01:39',1,51),(99,'osu','2026-02-15 20:04:53',0,52),(100,'yei','2026-02-15 20:05:36',1,52),(101,'gitanito','2026-02-15 20:06:01',0,52),(102,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 22/02/2026 al 23/02/2026\n💰 Total: 143€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-15 20:06:43',0,53),(103,'✅ Hemos aceptado tu solicitud. El vehículo está reservado para ti.','2026-02-15 20:06:59',1,53),(104,'🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 16/02/2026 al 18/02/2026\n💰 Total: 40€\n\nPor favor, revisa la disponibilidad y acepta o rechaza la solicitud.','2026-02-15 20:11:13',0,54),(105,'❌ Lo siento, no hemos podido aceptar la reserva.','2026-02-15 20:11:25',1,54),(106,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-15 20:11:47',0,55),(107,'as','2026-02-15 20:50:03',1,55),(108,'hola','2026-02-17 12:43:17',1,54),(109,'si no?','2026-02-17 12:44:04',0,54),(110,'qdise','2026-02-17 12:44:12',0,54),(111,'hola','2026-02-17 12:47:31',0,54),(112,'que tal','2026-02-17 12:47:38',0,54),(113,'no','2026-02-17 12:47:58',1,54),(114,'que tal','2026-02-17 12:52:18',0,54),(115,'hola','2026-02-17 12:55:24',0,54),(116,'hola bro','2026-02-17 12:59:46',1,54),(117,'hola','2026-02-17 13:00:09',1,54),(118,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-17 13:35:07',0,56),(119,'Me interesa sii','2026-02-21 13:26:40',0,57),(120,'hola','2026-02-22 15:17:38',0,54),(121,'hola q tal','2026-02-22 15:17:51',1,54),(122,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-24 21:07:27',0,58),(123,'ey','2026-02-25 15:58:23',0,54),(124,'que tal?','2026-02-25 15:58:36',0,54),(125,'Hola, estoy interesado en este vehículo. ¿Sigue disponible?','2026-02-25 15:59:13',0,59),(126,'hola backup','2026-02-25 16:15:57',1,53);
/*!40000 ALTER TABLE `message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messenger_messages`
--

DROP TABLE IF EXISTS `messenger_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messenger_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `body` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `headers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `queue_name` varchar(190) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `available_at` datetime NOT NULL,
  `delivered_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_75EA56E0FB7336F0` (`queue_name`),
  KEY `IDX_75EA56E0E3BD61CE` (`available_at`),
  KEY `IDX_75EA56E016BA31DB` (`delivered_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messenger_messages`
--

LOCK TABLES `messenger_messages` WRITE;
/*!40000 ALTER TABLE `messenger_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messenger_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model`
--

DROP TABLE IF EXISTS `model`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `model` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `brand_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_D79572D944F5D008` (`brand_id`),
  CONSTRAINT `FK_D79572D944F5D008` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=193 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model`
--

LOCK TABLES `model` WRITE;
/*!40000 ALTER TABLE `model` DISABLE KEYS */;
INSERT INTO `model` VALUES (171,'Serie 1',50),(172,'Serie 3',50),(173,'X5',50),(174,'M4',50),(175,'A3',51),(176,'A4',51),(177,'Q7',51),(178,'RS6',51),(179,'Clase A',52),(180,'Clase C',52),(181,'GLA',52),(182,'AMG GT',52),(183,'Golf',53),(184,'Polo',53),(185,'Tiguan',53),(186,'Corolla',54),(187,'Yaris',54),(188,'RAV4',54),(189,'Focus',55),(190,'Fiesta',55),(191,'Mustang',55);
/*!40000 ALTER TABLE `model` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `province`
--

DROP TABLE IF EXISTS `province`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `province` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `province`
--

LOCK TABLES `province` WRITE;
/*!40000 ALTER TABLE `province` DISABLE KEYS */;
INSERT INTO `province` VALUES (109,'Madrid'),(110,'Barcelona'),(111,'Valencia'),(112,'Sevilla'),(113,'Málaga'),(114,'Granada'),(115,'Bilbao');
/*!40000 ALTER TABLE `province` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservation`
--

DROP TABLE IF EXISTS `reservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `total_price` double NOT NULL,
  `vehicle_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_42C84955545317D1` (`vehicle_id`),
  KEY `IDX_42C84955A76ED395` (`user_id`),
  CONSTRAINT `FK_42C84955545317D1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`id`),
  CONSTRAINT `FK_42C84955A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservation`
--

LOCK TABLES `reservation` WRITE;
/*!40000 ALTER TABLE `reservation` DISABLE KEYS */;
INSERT INTO `reservation` VALUES (11,'2026-01-24','2026-01-28','CONFIRMED',724,358,230),(12,'2026-01-30','2026-02-04','CONFIRMED',380,375,238),(13,'2026-01-25','2026-01-29','CONFIRMED',684,386,230),(14,'2026-01-25','2026-01-30','CONFIRMED',385,393,217),(15,'2026-01-31','2026-02-05','CONFIRMED',370,399,221),(16,'2026-02-02','2026-02-05','CONFIRMED',390,403,226),(17,'2026-01-24','2026-01-31','CONFIRMED',735,411,238),(19,'2026-02-03','2026-02-06','FINISHED',429,420,213),(20,'2026-02-16','2026-02-18','CONFIRMED',286,420,206),(21,'2026-02-24','2026-02-26','REJECTED',286,420,219),(22,'2026-02-27','2026-02-28','REJECTED',143,420,219),(23,'2026-02-28','2026-03-01','CONFIRMED',143,420,219),(24,'2026-02-19','2026-02-21','CONFIRMED',286,420,219),(25,'2026-02-19','2026-02-21','REJECTED',286,420,215),(26,'2026-02-18','2026-02-20','CONFIRMED',198,391,215),(27,'2026-02-21','2026-02-22','REJECTED',99,391,215),(28,'2026-02-21','2026-02-24','REJECTED',297,391,215),(29,'2026-02-21','2026-02-23','CONFIRMED',198,391,219),(30,'2026-02-24','2026-02-26','CONFIRMED',286,420,215),(31,'2026-02-10','2026-02-12','REJECTED',122,401,215),(32,'2026-02-24','2026-02-25','REJECTED',99,391,215),(33,'2026-02-26','2026-02-27','REJECTED',99,391,215),(34,'2026-02-24','2026-02-26','REJECTED',198,391,215),(35,'2026-02-27','2026-02-28','REJECTED',99,391,215),(36,'2026-02-24','2026-02-25','REJECTED',99,391,215),(37,'2026-02-26','2026-02-28','REJECTED',198,391,215),(38,'2026-02-24','2026-02-25','REJECTED',99,391,215),(39,'2026-02-26','2026-02-27','REJECTED',99,391,215),(40,'2026-02-24','2026-02-25','REJECTED',99,391,215),(41,'2026-02-10','2026-02-11','REJECTED',99,391,215),(42,'2026-02-25','2026-02-26','REJECTED',99,391,215),(43,'2026-02-25','2026-02-26','REJECTED',99,391,215),(44,'2026-02-12','2026-02-13','CONFIRMED',143,420,215),(45,'2026-02-11','2026-02-12','CONFIRMED',20,425,215),(46,'2026-02-11','2026-02-13','CONFIRMED',122,401,215),(47,'2026-02-17','2026-02-18','REJECTED',61,401,215),(48,'2026-02-25','2026-02-27','REJECTED',198,391,215),(49,'2026-02-12','2026-02-14','CONFIRMED',198,391,215),(50,'2026-02-14','2026-02-15','REJECTED',143,420,215),(51,'2026-02-22','2026-02-23','CONFIRMED',143,420,215),(52,'2026-02-16','2026-02-18','REJECTED',40,425,215);
/*!40000 ALTER TABLE `reservation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transmission`
--

DROP TABLE IF EXISTS `transmission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transmission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transmission`
--

LOCK TABLES `transmission` WRITE;
/*!40000 ALTER TABLE `transmission` DISABLE KEYS */;
INSERT INTO `transmission` VALUES (19,'Manual'),(20,'Automático');
/*!40000 ALTER TABLE `transmission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `roles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `surname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `province_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_IDENTIFIER_EMAIL` (`email`),
  KEY `IDX_8D93D649E946114A` (`province_id`),
  CONSTRAINT `FK_8D93D649E946114A` FOREIGN KEY (`province_id`) REFERENCES `province` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=242 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (206,'admin@concesionario.com','[\"ROLE_ADMIN\"]','$2y$13$1Z.Nhcmg18DSwFEeMPM4WO3T48Bn9SFX9FF/7S8cCiy7ksrPmYyQW','Admin','Gerente','',NULL),(207,'ventas1@concesionario.com','[\"ROLE_USER\",\"ROLE_SALES\"]','$2y$13$UzxHX5YPdSsxVNHABLSdy.YOlk1ZO2qPARleCLLbQVP/O6Rzm5dOO','Vendedor','1',NULL,NULL),(208,'ventas2@concesionario.com','[\"ROLE_USER\",\"ROLE_SALES\"]','$2y$13$A/QPNZSULhEKUUVmf4OviOf1q2Gs0dNETa5S2gXISLDMJujWtuBju','Vendedor','2',NULL,NULL),(209,'ventas3@concesionario.com','[\"ROLE_USER\",\"ROLE_SALES\"]','$2y$13$sZ3bDEVMn4G5EBpYF0QZtubIzmYZlkjMl.rPS3jxl0iKDImio9ZMa','Vendedor','3',NULL,NULL),(210,'salma.ruelas@ybarra.es','[\"ROLE_USER\"]','$2y$13$yfCFurDEXVouz8dKEPcnTOSYjpBABKSQz0mHwddT.NN1Si8IF3n/m','Cristian','Rascón','699-263093',NULL),(211,'erik.osorio@ruiz.es','[\"ROLE_USER\"]','$2y$13$NziDveZax7gAYrMZRFWUduzY64Md/Sn3IKwVwKOtxIBpp1LplBWgW','Pedro','Polo','+34 673-353014',NULL),(212,'alonso.mendez@yahoo.es','[\"ROLE_USER\"]','$2y$13$JfSWSOHSKSvz1L9pO7gQKetbzoHhwVmg7wT81fJrksW6pnIETO4.2','Gabriel','Ávila','630-65-9499',NULL),(213,'rjaime@marroquin.net','[\"ROLE_USER\"]','$2y$13$g37v//6h1kkk9VCC9gJvDeE7lB60uUjlhWHJMKLqpCdOk6lTAWrRK','Daniela','Merino','633-108191',NULL),(214,'sara84@latinmail.com','[\"ROLE_USER\"]','$2y$13$a1IoTd3ctvrY.ceWLMC9jOsxqWuGw/lqNSW63ksvPac0UBS2gzUJ.','Carlota','Godoy','675-88-6749',NULL),(215,'rayan.tello@latinmail.com','[\"ROLE_USER\"]','$2y$13$FJnpcrs2ednpblbIF8YHZ.domLSGl5KrM1NGsLiLp9Bk8wlDGvmSa','Encarnación','Calvillo','+34 673-003282',NULL),(216,'jimena.tijerina@miramontes.com','[\"ROLE_USER\"]','$2y$13$VVdskjCjc5fgrHLiT2fc/eSRIV0hFPjq68hhuaimVZvmEvkNkUrYi','Fernando','Cruz','+34 679 601269',NULL),(217,'gvaldivia@live.com','[\"ROLE_USER\"]','$2y$13$wu/sQOoRcqyMS1YzLlrA5e8vsnac09ldDP/wcYp3D.3b0ptaqZ5xe','Juan José','Valles','+34 683-11-1795',NULL),(218,'yolanda74@hotmail.com','[\"ROLE_USER\"]','$2y$13$OkFc461CAJqwTa3gVLN6BOj8nX8gSkvyAfJXvIQqgfatwfPja3dEa','Manuela','Vallejo','647 95 1707',NULL),(219,'ander.sanchez@saavedra.net','[\"ROLE_USER\"]','$2y$13$Knnl043GaxBkgo/0pkevj.aelUqA91Wj4IB4WghxFtSiFWs4ejMmC','Lola','Santacruz','+34 633-653943',NULL),(220,'tgranados@mendez.org','[\"ROLE_USER\"]','$2y$13$1jeqX7SEmzCjtOqBZyYL7.DxkQp84EqG1xh4RlT0EfinkPlDpzpuW','Pablo','Cantú','664-06-3876',NULL),(221,'aragon.martina@lopez.com','[\"ROLE_USER\"]','$2y$13$w4cEMHNi89MazIKluvUpM.U2uiVfhBpql5.7OeV/wMp66lRXvlWdy','Víctor','Ruíz','+34 614-44-1615',NULL),(222,'natalia.urrutia@terra.com','[\"ROLE_USER\"]','$2y$13$ootYlPWyLM/p6RCxJ1eBT.BXbgMpQ7yRgIH8OfUMrf41m24wF.eFO','Hugo','Matos','624 06 3275',NULL),(223,'valenzuela.mario@lucas.es','[\"ROLE_USER\"]','$2y$13$Uzl/LI/vnGMGRtUeZYrCiOr5lWjw1DTTrYKtGp1i9P92HFq2fg9ja','Naiara','Costa','620845307',NULL),(224,'sofia06@live.com','[\"ROLE_USER\"]','$2y$13$SrVaYbxStOr/odwDW2VcVeBUlkAPcAXsXnQyHuxanhRNcX9rIqH1m','Sandra','Cuevas','+34 658 46 1510',NULL),(225,'berta.serrato@munguia.com','[\"ROLE_USER\"]','$2y$13$I4Ge2bN7QjLqr5TQaaKMkuniuhCK9kL3Xdnd9CFRoLJbXSVgN3hZy','Julia','Mondragón','685 40 0087',NULL),(226,'juanjose.molina@gmail.com','[\"ROLE_USER\"]','$2y$13$RB1a2lJ9dpeWDKcHCtqYheZVUfz51pPBekPOO9XG40XEIKK9HHboy','Luisa','Sierra','683-505361',NULL),(227,'ngimeno@ordonez.com','[\"ROLE_USER\"]','$2y$13$462Nu0iYg9epxRNSQtFgQOGclTZETNxOElX9Kw/eTzvHCFjNhaKPS','Rodrigo','Arevalo','644-31-4944',NULL),(228,'patricia05@hotmail.es','[\"ROLE_USER\"]','$2y$13$84293aOu4JF8n8e4mDI.Mubqb7yE8xfaFFsclc1Jl8lwabGVNZYA.','Alonso','Carrión','601-12-4607',NULL),(229,'lucia.villar@mojica.es','[\"ROLE_USER\"]','$2y$13$6irNBYaRZMui08zbojbc3ec930JKpk4MmhsuKzW9b3X0aezDJcfha','Jan','Ballesteros','643 821146',NULL),(230,'ander.pichardo@cuellar.es','[\"ROLE_USER\"]','$2y$13$yExQsRVTbfjoWAoC/fWtdeXGCoRT/R1UVMBmhgsdtPiIH/4wEdyau','Rayan','Zelaya','605-152513',NULL),(231,'juana.saiz@millan.es','[\"ROLE_USER\"]','$2y$13$WWI4lCZXo78nYUZSOSPyD.L9tsmLFyY.ajRW8zHolkBRoASc9j5yS','Miguel Ángel','Farías','692842926',NULL),(232,'jimena13@yahoo.es','[\"ROLE_USER\"]','$2y$13$92BbASE3wSofL0bGMAWimOesxG8gi7Rzm2UFPymSc/ZtVejCKeSxu','Rayan','Cantú','+34 684 075236',NULL),(233,'villalba.luisa@hotmail.com','[\"ROLE_USER\"]','$2y$13$15WcfdukznWZeoKqNp6uYuBzv0jQ53lQOi5Wqkl8K0zinC3XJOJDK','Oriol','Loera','+34 658-55-3646',NULL),(234,'madrigal.hector@gmail.com','[\"ROLE_USER\"]','$2y$13$Y9S0/bkxLHiC0IV.dNj.N.UnNXGxK1k6n7msvCY65J/cZTXdojrlm','Nicolás','Portillo','+34 615330106',NULL),(235,'aitana.santacruz@gallardo.es','[\"ROLE_USER\"]','$2y$13$KKyPHDaQkLTnUbbyPDUVL.UszPpRjbzUqpbvbejbtipk/AsTDL1fi','África','Cedillo','+34 670 39 4459',NULL),(236,'fernando82@yahoo.es','[\"ROLE_USER\"]','$2y$13$sDLZ2dBxJt4XY/LZMbeH1egNFr95TcaJFyRx3GFmD.kNiTLsvh.a6','Cristina','Vallejo','+34 668-988070',NULL),(237,'maria65@hotmail.es','[\"ROLE_USER\"]','$2y$13$VzbuiK6iDNt.bMfUjKfT9uORYHbOQ6nqKYhrqjRAojNNvAMVmhcA.','Jorge','Méndez','+34 682305754',NULL),(238,'tamez.joel@yahoo.com','[\"ROLE_USER\"]','$2y$13$Xv2w5R2ylx/ZArqK7GWyU.YfAxmQzZMsBu4cxA0mxC1aJblDPiu76','Andrea','Ontiveros','+34 660 10 9451',NULL),(239,'ucepeda@hotmail.com','[\"ROLE_USER\"]','$2y$13$5qAgMyDCwLGJYNnpC6Y5p.pc5jLFhBoIO8syhCLZ4njwopM5EgCba','Pedro','Valadez','623-893583',NULL),(240,'sergioramirezmoron@gmail.com','[\"ROLE_USER\"]','$2y$13$np2SUeyFXJJfY6/mcFDDxeaDUoA6o0tMjTPs9zqwnrVdSj3iQNPaK','Sergio','Ramírez Morón','640503310',114),(241,'sergio@sergio.com','[\"ROLE_USER\"]','$2y$13$MbNcyb91j1reaOODQ9/tOeb9Iw1Kq95hGLAOFMVmMN19x9VPY/ZLu','Sergio','Ramirez','72364363',110);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle`
--

DROP TABLE IF EXISTS `vehicle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `price` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `year` int NOT NULL,
  `kilometres` int NOT NULL,
  `power` int NOT NULL,
  `displacement` int DEFAULT NULL,
  `doors` int DEFAULT NULL,
  `owners` int NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `brand_id` int NOT NULL,
  `model_id` int NOT NULL,
  `fuel_type_id` int NOT NULL,
  `transmission_id` int NOT NULL,
  `body_type_id` int DEFAULT NULL,
  `enviromental_badge_id` int DEFAULT NULL,
  `color_id` int DEFAULT NULL,
  `visible` tinyint(1) NOT NULL,
  `province_id` int DEFAULT NULL,
  `type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `daily_price` decimal(6,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_1B80E48644F5D008` (`brand_id`),
  KEY `IDX_1B80E4867975B7E7` (`model_id`),
  KEY `IDX_1B80E4866A70FE35` (`fuel_type_id`),
  KEY `IDX_1B80E48678D28519` (`transmission_id`),
  KEY `IDX_1B80E4862CBA3505` (`body_type_id`),
  KEY `IDX_1B80E48664F6DB96` (`enviromental_badge_id`),
  KEY `IDX_1B80E4867ADA1FB5` (`color_id`),
  KEY `IDX_1B80E486E946114A` (`province_id`),
  CONSTRAINT `FK_1B80E4862CBA3505` FOREIGN KEY (`body_type_id`) REFERENCES `body_type` (`id`),
  CONSTRAINT `FK_1B80E48644F5D008` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`id`),
  CONSTRAINT `FK_1B80E48664F6DB96` FOREIGN KEY (`enviromental_badge_id`) REFERENCES `enviromental_badge` (`id`),
  CONSTRAINT `FK_1B80E4866A70FE35` FOREIGN KEY (`fuel_type_id`) REFERENCES `fuel` (`id`),
  CONSTRAINT `FK_1B80E48678D28519` FOREIGN KEY (`transmission_id`) REFERENCES `transmission` (`id`),
  CONSTRAINT `FK_1B80E4867975B7E7` FOREIGN KEY (`model_id`) REFERENCES `model` (`id`),
  CONSTRAINT `FK_1B80E4867ADA1FB5` FOREIGN KEY (`color_id`) REFERENCES `color` (`id`),
  CONSTRAINT `FK_1B80E486E946114A` FOREIGN KEY (`province_id`) REFERENCES `province` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=426 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle`
--

LOCK TABLES `vehicle` WRITE;
/*!40000 ALTER TABLE `vehicle` DISABLE KEYS */;
INSERT INTO `vehicle` VALUES (357,'31833',2018,133896,290,2000,5,2,'Odit deserunt facere ut delectus consequuntur. Et commodi odit quis explicabo voluptas aut.','AVAILABLE','2026-01-23 12:42:30',NULL,55,190,40,20,47,41,55,1,115,'SALE',NULL),(358,NULL,2023,78467,169,3000,3,2,'Consequatur natus ut qui rerum. Quis quis voluptates magni placeat.','AVAILABLE','2026-01-23 12:42:30',NULL,53,185,41,19,47,40,57,1,111,'RENT',181.00),(359,'62698',2021,67032,137,3000,3,3,'Est earum sit perferendis maiores. Eligendi quae et nostrum molestias architecto voluptatem quo. Ut modi magni qui nisi non eum et dicta.','AVAILABLE','2026-01-23 12:42:30',NULL,52,179,40,19,46,40,53,1,109,'SALE',NULL),(360,'25581',2024,145044,115,3000,3,2,'Et sit ut et accusamus. Non quia facilis voluptate ut adipisci quisquam ratione sequi.','AVAILABLE','2026-01-23 12:42:30',NULL,54,187,40,19,48,41,55,1,109,'SALE',NULL),(361,'65507',2021,47932,109,1500,3,3,'Quos et ut ullam repudiandae iure quis. Accusantium quibusdam animi enim voluptatem ad facere enim.','AVAILABLE','2026-01-23 12:42:30',NULL,50,174,41,20,46,42,57,1,115,'SALE',NULL),(362,'61153',2018,50182,216,1500,3,1,'Officiis tenetur fuga possimus. Harum voluptatibus occaecati qui natus.','AVAILABLE','2026-01-23 12:42:30',NULL,55,189,40,19,45,43,57,1,113,'SALE',NULL),(363,'15365',2024,15691,191,1500,5,1,'Odio sapiente blanditiis temporibus laudantium voluptas debitis totam. A autem temporibus excepturi dolorem.','AVAILABLE','2026-01-23 12:42:30',NULL,52,180,39,19,45,41,56,1,112,'SALE',NULL),(364,'55343',2024,58742,399,2000,5,3,'Aut animi cumque molestiae nihil omnis. Nam laborum odio qui labore voluptate ut iste.','AVAILABLE','2026-01-23 12:42:30',NULL,52,180,42,20,44,40,57,1,113,'SALE',NULL),(365,'65966',2020,72355,130,3000,3,3,'Harum est repudiandae incidunt iste tempora maxime est. Adipisci ex autem aut autem.','SOLD','2026-01-23 12:42:30',NULL,50,172,39,20,48,40,53,1,109,'SALE',NULL),(366,'50256',2023,56442,126,1500,3,2,'Esse nostrum commodi delectus tenetur hic magni repellendus in. Molestiae non magni voluptas quod est dolor.','AVAILABLE','2026-01-23 12:42:30',NULL,51,175,41,19,46,43,53,1,112,'SALE',NULL),(367,NULL,2019,101420,241,3000,5,2,'Est est ad minima molestiae. Tempore beatae reiciendis debitis cumque enim nobis. Libero illum quisquam totam accusantium ea maiores.','AVAILABLE','2026-01-23 12:42:30',NULL,50,172,41,20,47,43,57,1,115,'RENT',109.00),(368,NULL,2020,122622,165,1500,5,1,'Consequuntur accusamus quae nisi est assumenda doloribus incidunt. Aut alias accusamus cupiditate rerum cum incidunt.','SOLD','2026-01-23 12:42:30',NULL,55,190,39,20,46,43,52,1,109,'RENT',191.00),(369,NULL,2019,120783,242,1500,3,2,'Numquam qui minima veniam natus. Delectus quia commodi et quia sit maxime ex. Nulla reiciendis quia iste quisquam occaecati nostrum qui.','SOLD','2026-01-23 12:42:30',NULL,51,178,42,20,47,42,56,1,115,'RENT',127.00),(370,'57320',2024,52575,214,2000,5,2,'Vel rerum magni impedit commodi mollitia similique alias. Est maiores itaque cupiditate ut voluptatem possimus commodi.','AVAILABLE','2026-01-23 12:42:30',NULL,51,176,40,19,47,40,56,1,114,'SALE',NULL),(371,'68839',2024,85266,287,1500,3,1,'Qui saepe perspiciatis sed occaecati. Accusantium deserunt ea cumque.','AVAILABLE','2026-01-23 12:42:30',NULL,54,186,39,20,45,41,55,1,109,'SALE',NULL),(372,'41340',2023,62095,183,1500,5,2,'Culpa facere maiores laborum praesentium hic debitis sint. Itaque quisquam fuga nihil repellat.','AVAILABLE','2026-01-23 12:42:30',NULL,52,179,41,19,44,42,57,1,113,'SALE',NULL),(373,NULL,2021,11207,235,2000,3,3,'Qui delectus doloremque iure expedita modi. Unde facilis libero dignissimos molestias odit. Consequuntur ut corporis unde quos voluptas repellat iste.','AVAILABLE','2026-01-23 12:42:30',NULL,51,178,40,19,44,41,54,1,114,'RENT',174.00),(374,'64481',2024,22828,239,2000,3,1,'Rerum laborum aut ea ab voluptate. Aut qui nisi commodi deleniti.','AVAILABLE','2026-01-23 12:42:30',NULL,50,173,41,20,47,42,56,1,112,'SALE',NULL),(375,NULL,2021,128513,123,1500,3,3,'Accusamus id voluptatem sit voluptate maiores. Assumenda inventore id labore illo. Non eos quo alias quas.','AVAILABLE','2026-01-23 12:42:30',NULL,51,177,39,20,45,42,52,1,113,'RENT',76.00),(376,'54717',2023,147643,329,2000,3,1,'Ea commodi commodi aperiam odio nisi eos in. Accusamus hic laborum et magni debitis et rerum.','AVAILABLE','2026-01-23 12:42:30',NULL,53,185,40,19,48,43,56,1,115,'SALE',NULL),(377,NULL,2022,23524,243,2000,3,3,'Facilis aperiam nesciunt unde vero optio. Sit necessitatibus nihil aut atque eum.','AVAILABLE','2026-01-23 12:42:30',NULL,52,179,40,19,47,42,53,1,115,'RENT',94.00),(378,'70061',2022,92695,147,3000,5,2,'Aperiam ea corrupti earum veritatis modi corrupti. Est sunt aspernatur quaerat vel at mollitia expedita. Consectetur ut consequuntur vitae quia non modi ab.','AVAILABLE','2026-01-23 12:42:30',NULL,55,189,39,20,44,42,55,1,110,'SALE',NULL),(379,NULL,2018,123086,273,1500,3,2,'Quis unde eum sit. Consectetur ad amet iure a rerum.','AVAILABLE','2026-01-23 12:42:30',NULL,51,178,40,19,45,42,57,1,115,'RENT',125.00),(380,'74805',2021,16755,195,1500,3,2,'Rerum consequatur maxime magni est. Aspernatur laborum dolores ut est.','AVAILABLE','2026-01-23 12:42:30',NULL,53,183,40,20,45,40,56,1,111,'SALE',NULL),(381,'79341',2022,21817,205,1500,3,3,'Voluptas quisquam totam dolore debitis quasi qui. Aliquid reprehenderit corrupti nihil est. Iste a est unde aut qui at harum.','AVAILABLE','2026-01-23 12:42:30',NULL,54,186,42,20,44,42,53,1,115,'SALE',NULL),(382,'60498',2019,76070,133,2000,5,3,'Omnis non recusandae quae consequuntur. Incidunt sit fugit et necessitatibus. Quidem esse quasi rerum voluptatem magni porro.','AVAILABLE','2026-01-23 12:42:30',NULL,54,186,42,20,46,40,55,1,115,'SALE',NULL),(383,'73671',2023,68500,222,3000,5,1,'Quam consequuntur impedit aperiam minus in. Molestias consectetur esse eos enim ex veritatis ducimus. Aut veniam dicta debitis vitae minus et accusantium eligendi.','AVAILABLE','2026-01-23 12:42:30',NULL,50,174,39,19,44,43,55,1,109,'SALE',NULL),(384,NULL,2018,93475,118,1500,5,1,'Dolore perspiciatis molestias error deleniti in sequi. Aliquam molestiae dolorem quia dolore dolor natus dolor.','SOLD','2026-01-23 12:42:30',NULL,52,180,41,19,47,41,55,1,109,'RENT',115.00),(385,'36181',2022,58526,327,3000,3,1,'Quis omnis aperiam sit quia reiciendis qui. In quia et nam ea dolore.','AVAILABLE','2026-01-23 12:42:30',NULL,51,176,41,19,44,43,56,1,115,'SALE',NULL),(386,NULL,2020,29624,198,1500,3,1,'Doloribus sed maiores ullam dolores nemo dolorem. Fuga neque consectetur sapiente pariatur sed. Eos velit consequuntur est qui sed.','AVAILABLE','2026-01-23 12:42:30',NULL,54,188,40,20,46,43,53,1,109,'RENT',171.00),(387,'55268',2019,46970,216,1500,3,1,'Rem sequi fuga alias ex vel ut dolores. Qui quaerat dolorem sed aliquid maxime hic.','AVAILABLE','2026-01-23 12:42:30',NULL,51,175,42,20,45,42,55,1,114,'SALE',NULL),(388,NULL,2022,84909,330,3000,3,2,'Aliquam accusantium sunt dicta consequatur magnam recusandae natus. Quaerat perferendis est esse qui dolore cupiditate.','SOLD','2026-01-23 12:42:30',NULL,50,174,39,19,48,43,56,1,112,'RENT',126.00),(389,NULL,2020,146517,316,3000,3,3,'Ipsam animi distinctio necessitatibus corporis ratione animi. Commodi itaque tempora ea non occaecati et sequi.','AVAILABLE','2026-01-23 12:42:30',NULL,55,191,40,20,45,42,52,1,109,'RENT',77.00),(390,'33786',2020,67816,310,2000,5,1,'Dolorem repellendus distinctio sint explicabo et. Facilis aspernatur in voluptates eaque autem quo. Excepturi doloribus voluptate quod esse dolor tempore.','AVAILABLE','2026-01-23 12:42:30',NULL,55,189,40,19,46,40,52,1,113,'SALE',NULL),(391,NULL,2021,105373,233,3000,3,3,'Ullam optio sapiente saepe vel. Hic incidunt saepe voluptatem ea id ipsam ut.','AVAILABLE','2026-01-23 12:42:30',NULL,50,172,42,19,46,42,54,1,115,'RENT',99.00),(392,'68371',2019,149941,312,1500,3,3,'Itaque voluptas exercitationem quae inventore rerum praesentium quisquam exercitationem. Iste et eligendi laborum repudiandae necessitatibus aut asperiores. Ut odit perspiciatis consequatur porro minima voluptatum.','AVAILABLE','2026-01-23 12:42:30',NULL,51,176,42,20,47,41,53,1,109,'SALE',NULL),(393,NULL,2019,15635,297,3000,5,2,'Occaecati porro explicabo dicta et ab. Qui mollitia qui corrupti quia eius quasi.','AVAILABLE','2026-01-23 12:42:30',NULL,55,189,41,20,46,40,52,1,110,'RENT',77.00),(394,'34700',2024,39008,311,2000,5,2,'Sit sed repudiandae ut voluptatum impedit et. Nihil maiores aut at est ullam.','AVAILABLE','2026-01-23 12:42:30',NULL,50,172,42,20,45,41,57,1,113,'SALE',NULL),(395,'71507',2023,86298,286,2000,3,3,'Rerum et facilis et labore cumque fugit saepe alias. Placeat eveniet expedita asperiores esse cupiditate. Sunt nihil similique ut et et consequuntur.','AVAILABLE','2026-01-23 12:42:30',NULL,54,188,39,19,45,42,56,1,111,'SALE',NULL),(396,NULL,2019,149960,120,2000,3,3,'Magni voluptatem consequuntur omnis ipsa. Voluptas quos atque accusantium cupiditate sint voluptatem excepturi porro. Rerum ut exercitationem harum modi.','AVAILABLE','2026-01-23 12:42:30',NULL,50,174,40,19,44,40,55,1,109,'RENT',172.00),(397,'37650',2021,62923,219,2000,5,2,'Ipsum optio voluptates ex eos explicabo rem dolores. Nostrum enim voluptatem porro molestiae cupiditate quos sint.','AVAILABLE','2026-01-23 12:42:30',NULL,52,180,41,20,48,42,54,1,113,'SALE',NULL),(398,NULL,2024,77944,126,2000,5,2,'Sed ut eos et animi earum ut. Voluptatem quas molestiae velit impedit eum nisi. Corporis rem aut minima et cumque veritatis.','AVAILABLE','2026-01-23 12:42:30',NULL,50,174,39,20,45,40,57,1,110,'RENT',159.00),(399,NULL,2021,80129,251,1500,3,2,'Nemo accusantium omnis maxime magnam assumenda ex quis. Est molestiae et expedita eos qui possimus laboriosam. Et sapiente voluptatem debitis.','AVAILABLE','2026-01-23 12:42:30',NULL,55,189,41,19,45,41,54,1,112,'RENT',74.00),(400,'33259',2023,79908,342,1500,5,2,'Sint occaecati vero eaque veritatis velit placeat veniam. Distinctio ut asperiores modi vero. Cumque commodi dicta provident omnis inventore sit.','AVAILABLE','2026-01-23 12:42:30',NULL,50,174,40,19,48,43,54,1,112,'SALE',NULL),(401,NULL,2024,100234,180,2000,5,3,'Enim nobis quasi doloribus ipsum tempora aspernatur. Cupiditate veritatis sint sunt ut. Tempore aut enim suscipit sit consectetur.','AVAILABLE','2026-01-23 12:42:30',NULL,50,173,40,19,47,40,55,1,110,'RENT',61.00),(402,NULL,2019,57828,267,3000,5,2,'Non facere officiis quis est hic voluptas excepturi. Ab optio eius sequi omnis est.','AVAILABLE','2026-01-23 12:42:30',NULL,51,176,41,19,44,42,54,1,111,'RENT',78.00),(403,NULL,2019,115698,221,1500,5,3,'Dolorem ut sit dolorum voluptas est ut. Deserunt ab iste placeat eligendi et harum.','AVAILABLE','2026-01-23 12:42:30',NULL,50,174,42,19,47,43,57,1,110,'RENT',130.00),(404,'44285',2023,104485,158,2000,3,2,'Corrupti sint nulla sit reprehenderit. Rerum delectus aperiam nemo adipisci dolores.','AVAILABLE','2026-01-23 12:42:30',NULL,50,171,39,20,47,42,52,1,112,'SALE',NULL),(405,'42290',2018,86969,294,2000,5,3,'Ex non officiis ab perspiciatis ab et. Eaque explicabo est similique eos praesentium est quia. Voluptas incidunt voluptas quo.','AVAILABLE','2026-01-23 12:42:30',NULL,51,178,41,20,47,43,53,1,113,'SALE',NULL),(406,'36662',2018,11452,394,1500,5,3,'Quo saepe officiis rem totam eaque. Est sit voluptatem quis rerum.','AVAILABLE','2026-01-23 12:42:30',NULL,54,188,39,19,44,41,54,1,113,'SALE',NULL),(407,'42685',2022,56324,357,1500,3,1,'Hic voluptatem voluptatum sit. Consequuntur laborum consequatur inventore nemo tempore repellat inventore ipsa. Provident non sed fugit totam.','AVAILABLE','2026-01-23 12:42:30',NULL,52,181,39,20,45,43,57,1,109,'SALE',NULL),(408,NULL,2022,119919,220,3000,5,2,'Sit qui minus aspernatur doloremque et rem alias. Placeat repellat facilis est odio aut vero ipsam.','AVAILABLE','2026-01-23 12:42:30',NULL,55,189,40,19,46,41,53,1,114,'RENT',73.00),(409,NULL,2024,4464,257,2000,5,1,'Omnis harum iusto neque alias soluta. Quas voluptatem sunt nihil impedit rem itaque. Eius ipsum rerum aut facilis autem illum quis dolores.','AVAILABLE','2026-01-23 12:42:30',NULL,53,184,39,19,46,40,55,1,109,'RENT',87.00),(410,'45101',2024,81705,395,3000,5,3,'Aut exercitationem nihil dolorum facere. Ullam qui et velit culpa voluptatem culpa.','AVAILABLE','2026-01-23 12:42:30',NULL,52,179,39,19,47,43,57,1,114,'SALE',NULL),(411,NULL,2020,84600,396,3000,5,2,'Similique sint consequatur et eos. Itaque nesciunt omnis dolor. Fuga quia ducimus modi quo sint error dolores.','AVAILABLE','2026-01-23 12:42:30',NULL,53,184,42,20,47,43,54,1,113,'RENT',105.00),(412,'69171',2021,144725,189,1500,5,3,'Voluptatem sunt ad qui velit fuga omnis. Et magnam odit autem illum aliquam quis aut. Explicabo consectetur odio nostrum aut id.','AVAILABLE','2026-01-23 12:42:30',NULL,52,180,42,20,46,43,57,1,114,'SALE',NULL),(414,'19800',2019,142864,116,2000,5,1,'¡El compacto por excelencia en un estado impecable!\n\nSe vende Volkswagen Golf en su versión Sport, una de las más equilibradas de la gama. Este motor 1.5 TSI de 150 CV destaca por su suavidad de marcha y un consumo muy contenido gracias al sistema de gestión activa de cilindros (ACT).\n\nEquipamiento Destacado:\n\nDigital Cockpit: Cuadro de instrumentos totalmente digital y personalizable.\n\nApp-Connect: Apple CarPlay y Android Auto para que lleves tu música y mapas siempre contigo.\n\nFaros LED: Máxima visibilidad nocturna y estética moderna.\n\nControl de crucero adaptativo (ACC): Conducción más segura y relajada en autopista.\n\nSensores de aparcamiento: Delanteros y traseros con ayuda visual en pantalla.\n\nEstado del coche:\nVehículo procedente de único propietario, siempre guardado en garaje y con libro de revisiones al día en servicio oficial. Pintura original sin arañazos y neumáticos al 80%.\n\nSe entrega revisado, con transferencia incluida y 12 meses de garantía premium.','AVAILABLE','2026-01-23 12:42:30',NULL,53,183,39,19,46,41,53,1,112,'SALE',NULL),(415,'53674',2023,96847,251,3000,5,3,'Placeat quibusdam est itaque facilis cum. Error veniam maxime ratione. Et dolorem recusandae voluptate voluptatem quisquam.','SOLD','2026-01-23 12:42:30',NULL,52,180,40,20,47,43,57,1,114,'SALE',NULL),(416,'66028',2018,36762,262,2000,3,2,'Provident voluptate ut velit ipsam. Ut dolores rerum quaerat provident aliquam voluptatibus. Excepturi quia sed et qui.','AVAILABLE','2026-01-23 12:42:30',NULL,54,186,39,20,45,40,53,1,109,'SALE',NULL),(418,'14000',2015,140000,150,2000,3,3,'Un Audi A4 super guapo de gitanillo asi del almanjayar','AVAILABLE','2026-01-24 13:16:44',NULL,51,176,40,19,45,42,53,1,114,'SALE',NULL),(419,'43000',2026,487263,150,234234,5,1,'asdadadasd','RESERVED','2026-01-24 13:20:37',NULL,51,175,42,19,45,41,53,1,112,'SALE',NULL),(420,NULL,2026,2342343,233,2333,5,1,'dfsfsdfsfsdf','AVAILABLE','2026-01-24 13:31:10',NULL,52,179,41,19,44,41,54,1,111,'RENT',143.00),(421,NULL,2026,45345,156,2000,5,1,'fssfdsfddfsfsdfsddfs','DELETED','2026-01-24 13:36:21',NULL,52,179,40,19,45,40,53,1,114,'RENT',167.00),(422,'42500',2022,21500,150,2000,3,2,'Un mercedes clase C tremendo no?','SOLD','2026-01-27 13:13:19',NULL,52,180,39,19,45,41,53,1,114,'SALE',NULL),(423,'50000',2026,20000,150,2000,5,3,'opaaa','SOLD','2026-01-28 21:10:45',NULL,52,180,41,19,48,41,54,1,111,'SALE',NULL),(424,'45000',2026,10000,100,1000,5,1,'asdasdasd','SOLD','2026-02-08 21:02:03',NULL,51,177,39,20,46,42,55,1,113,'SALE',NULL),(425,NULL,2020,82000,150,2500,5,2,'Elegancia, tecnología y eficiencia en un estado excepcional.\n\nPonemos a la venta esta unidad de Audi A4 con el acabado deportivo S-Line, la combinación perfecta entre una berlina de lujo y un toque dinámico. Gracias a su motorización Microhíbrida (MHEV), este vehículo disfruta de las ventajas de la etiqueta ECO, permitiéndote circular sin restricciones y con unos consumos sorprendentemente bajos en carretera (aprox. 4,8 l/100km).\n\nEquipamiento Premium Seleccionado:\n\nPaquete Interior/Exterior S-Line: Asientos deportivos en combinación cuero/tela y paragolpes específicos.\n\nAudi Virtual Cockpit Plus: Pantalla de 12,3\" de alta resolución con mapas en 3D.\n\nCambio Automático S-Tronic: Transmisión de doble embrague para cambios instantáneos y suaves.\n\nNavegador MMI Plus: Con pantalla táctil de gran formato y servicios conectados.\n\nCámara de Marcha Atrás: Con guías dinámicas para un aparcamiento milimétrico.\n\nClimatizador Tri-zona: Confort independiente para conductor, acompañante y plazas traseras.\n\nEstado del coche:\nVehículo de renting nacional con historial de mantenimiento completo en concesionario oficial Audi. Neumáticos Michelin recién instalados. Carrocería en perfecto estado, libre de golpes y con el brillo de la pintura original.','AVAILABLE','2026-02-08 21:13:25',NULL,51,176,40,19,45,42,52,1,110,'RENT',21.00);
/*!40000 ALTER TABLE `vehicle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_image`
--

DROP TABLE IF EXISTS `vehicle_image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_image` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_main` tinyint(1) NOT NULL,
  `vehicle_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_A79284B3545317D1` (`vehicle_id`),
  CONSTRAINT `FK_A79284B3545317D1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=182 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_image`
--

LOCK TABLES `vehicle_image` WRITE;
/*!40000 ALTER TABLE `vehicle_image` DISABLE KEYS */;
INSERT INTO `vehicle_image` VALUES (3,'https://placehold.co/800x600?text=Ford+Fiesta+1',1,357),(4,'https://placehold.co/800x600?text=Ford+Fiesta+2',0,357),(5,'https://placehold.co/800x600?text=Ford+Fiesta+3',0,357),(6,'https://placehold.co/800x600?text=Volkswagen+Tiguan+1',1,358),(7,'https://placehold.co/800x600?text=Mercedes+Clase+A+1',1,359),(8,'https://placehold.co/800x600?text=Toyota+Yaris+1',1,360),(9,'https://placehold.co/800x600?text=BMW+M4+1',1,361),(10,'https://placehold.co/800x600?text=BMW+M4+2',0,361),(11,'https://placehold.co/800x600?text=Ford+Focus+1',1,362),(12,'https://placehold.co/800x600?text=Mercedes+Clase+C+1',1,363),(13,'https://placehold.co/800x600?text=Mercedes+Clase+C+2',0,363),(14,'https://placehold.co/800x600?text=Mercedes+Clase+C+3',0,363),(15,'https://placehold.co/800x600?text=Mercedes+Clase+C+1',1,364),(16,'https://placehold.co/800x600?text=Mercedes+Clase+C+2',0,364),(17,'https://placehold.co/800x600?text=Mercedes+Clase+C+3',0,364),(18,'https://placehold.co/800x600?text=BMW+Serie+3+1',1,365),(19,'https://placehold.co/800x600?text=Audi+A3+1',1,366),(20,'https://placehold.co/800x600?text=Audi+A3+2',0,366),(21,'https://placehold.co/800x600?text=BMW+Serie+3+1',1,367),(22,'https://placehold.co/800x600?text=BMW+Serie+3+2',0,367),(23,'https://placehold.co/800x600?text=BMW+Serie+3+3',0,367),(24,'https://placehold.co/800x600?text=Ford+Fiesta+1',1,368),(25,'https://placehold.co/800x600?text=Ford+Fiesta+2',0,368),(26,'https://placehold.co/800x600?text=Audi+RS6+1',1,369),(27,'https://placehold.co/800x600?text=Audi+RS6+2',0,369),(28,'https://placehold.co/800x600?text=Audi+RS6+3',0,369),(29,'https://placehold.co/800x600?text=Audi+A4+1',1,370),(30,'https://placehold.co/800x600?text=Audi+A4+2',0,370),(31,'https://placehold.co/800x600?text=Audi+A4+3',0,370),(32,'https://placehold.co/800x600?text=Toyota+Corolla+1',1,371),(33,'https://placehold.co/800x600?text=Toyota+Corolla+2',0,371),(34,'https://placehold.co/800x600?text=Toyota+Corolla+3',0,371),(35,'https://placehold.co/800x600?text=Mercedes+Clase+A+1',1,372),(36,'https://placehold.co/800x600?text=Mercedes+Clase+A+2',0,372),(37,'https://placehold.co/800x600?text=Audi+RS6+1',1,373),(38,'https://placehold.co/800x600?text=Audi+RS6+2',0,373),(39,'https://placehold.co/800x600?text=BMW+X5+1',1,374),(40,'https://placehold.co/800x600?text=BMW+X5+2',0,374),(41,'https://placehold.co/800x600?text=BMW+X5+3',0,374),(42,'https://placehold.co/800x600?text=Audi+Q7+1',1,375),(43,'https://placehold.co/800x600?text=Audi+Q7+2',0,375),(44,'https://placehold.co/800x600?text=Audi+Q7+3',0,375),(45,'https://placehold.co/800x600?text=Volkswagen+Tiguan+1',1,376),(46,'https://placehold.co/800x600?text=Volkswagen+Tiguan+2',0,376),(47,'https://placehold.co/800x600?text=Volkswagen+Tiguan+3',0,376),(48,'https://placehold.co/800x600?text=Mercedes+Clase+A+1',1,377),(49,'https://placehold.co/800x600?text=Mercedes+Clase+A+2',0,377),(50,'https://placehold.co/800x600?text=Mercedes+Clase+A+3',0,377),(51,'https://placehold.co/800x600?text=Ford+Focus+1',1,378),(52,'https://placehold.co/800x600?text=Ford+Focus+2',0,378),(53,'https://placehold.co/800x600?text=Audi+RS6+1',1,379),(54,'https://placehold.co/800x600?text=Volkswagen+Golf+1',1,380),(55,'https://placehold.co/800x600?text=Volkswagen+Golf+2',0,380),(56,'https://placehold.co/800x600?text=Toyota+Corolla+1',1,381),(57,'https://placehold.co/800x600?text=Toyota+Corolla+2',0,381),(58,'https://placehold.co/800x600?text=Toyota+Corolla+1',1,382),(59,'https://placehold.co/800x600?text=Toyota+Corolla+2',0,382),(60,'https://placehold.co/800x600?text=Toyota+Corolla+3',0,382),(61,'https://placehold.co/800x600?text=BMW+M4+1',1,383),(62,'https://placehold.co/800x600?text=BMW+M4+2',0,383),(63,'https://placehold.co/800x600?text=BMW+M4+3',0,383),(64,'https://placehold.co/800x600?text=Mercedes+Clase+C+1',1,384),(65,'https://placehold.co/800x600?text=Mercedes+Clase+C+2',0,384),(66,'https://placehold.co/800x600?text=Mercedes+Clase+C+3',0,384),(67,'https://placehold.co/800x600?text=Audi+A4+1',1,385),(68,'https://placehold.co/800x600?text=Audi+A4+2',0,385),(69,'https://placehold.co/800x600?text=Toyota+RAV4+1',1,386),(70,'https://placehold.co/800x600?text=Toyota+RAV4+2',0,386),(71,'https://placehold.co/800x600?text=Audi+A3+1',1,387),(72,'https://placehold.co/800x600?text=Audi+A3+2',0,387),(73,'https://placehold.co/800x600?text=Audi+A3+3',0,387),(74,'https://placehold.co/800x600?text=BMW+M4+1',1,388),(75,'https://placehold.co/800x600?text=BMW+M4+2',0,388),(76,'https://placehold.co/800x600?text=Ford+Mustang+1',1,389),(77,'https://placehold.co/800x600?text=Ford+Mustang+2',0,389),(78,'https://placehold.co/800x600?text=Ford+Mustang+3',0,389),(79,'https://placehold.co/800x600?text=Ford+Focus+1',1,390),(80,'https://placehold.co/800x600?text=Ford+Focus+2',0,390),(81,'https://placehold.co/800x600?text=Ford+Focus+3',0,390),(82,'https://placehold.co/800x600?text=BMW+Serie+3+1',1,391),(83,'https://placehold.co/800x600?text=Audi+A4+1',1,392),(84,'https://placehold.co/800x600?text=Audi+A4+2',0,392),(85,'https://placehold.co/800x600?text=Audi+A4+3',0,392),(86,'https://placehold.co/800x600?text=Ford+Focus+1',1,393),(87,'https://placehold.co/800x600?text=Ford+Focus+2',0,393),(88,'https://placehold.co/800x600?text=BMW+Serie+3+1',1,394),(89,'https://placehold.co/800x600?text=BMW+Serie+3+2',0,394),(90,'https://placehold.co/800x600?text=Toyota+RAV4+1',1,395),(91,'https://placehold.co/800x600?text=Toyota+RAV4+2',0,395),(92,'https://placehold.co/800x600?text=BMW+M4+1',1,396),(93,'https://placehold.co/800x600?text=BMW+M4+2',0,396),(94,'https://placehold.co/800x600?text=BMW+M4+3',0,396),(95,'https://placehold.co/800x600?text=Mercedes+Clase+C+1',1,397),(96,'https://placehold.co/800x600?text=Mercedes+Clase+C+2',0,397),(97,'https://placehold.co/800x600?text=Mercedes+Clase+C+3',0,397),(98,'https://placehold.co/800x600?text=BMW+M4+1',1,398),(99,'https://placehold.co/800x600?text=BMW+M4+2',0,398),(100,'https://placehold.co/800x600?text=BMW+M4+3',0,398),(101,'https://placehold.co/800x600?text=Ford+Focus+1',1,399),(102,'https://placehold.co/800x600?text=Ford+Focus+2',0,399),(103,'https://placehold.co/800x600?text=Ford+Focus+3',0,399),(104,'https://placehold.co/800x600?text=BMW+M4+1',1,400),(105,'https://placehold.co/800x600?text=BMW+M4+2',0,400),(106,'https://placehold.co/800x600?text=BMW+M4+3',0,400),(107,'https://placehold.co/800x600?text=BMW+X5+1',1,401),(108,'https://placehold.co/800x600?text=Audi+A4+1',1,402),(109,'https://placehold.co/800x600?text=Audi+A4+2',0,402),(110,'https://placehold.co/800x600?text=BMW+M4+1',1,403),(111,'https://placehold.co/800x600?text=BMW+M4+2',0,403),(112,'https://placehold.co/800x600?text=BMW+Serie+1+1',1,404),(113,'https://placehold.co/800x600?text=BMW+Serie+1+2',0,404),(114,'https://placehold.co/800x600?text=Audi+RS6+1',1,405),(115,'https://placehold.co/800x600?text=Toyota+RAV4+1',1,406),(116,'https://placehold.co/800x600?text=Mercedes+GLA+1',1,407),(117,'https://placehold.co/800x600?text=Mercedes+GLA+2',0,407),(118,'https://placehold.co/800x600?text=Mercedes+GLA+3',0,407),(119,'https://placehold.co/800x600?text=Ford+Focus+1',1,408),(120,'https://placehold.co/800x600?text=Ford+Focus+2',0,408),(121,'https://placehold.co/800x600?text=Ford+Focus+3',0,408),(122,'https://placehold.co/800x600?text=Volkswagen+Polo+1',1,409),(123,'https://placehold.co/800x600?text=Volkswagen+Polo+2',0,409),(124,'https://placehold.co/800x600?text=Volkswagen+Polo+3',0,409),(125,'https://placehold.co/800x600?text=Mercedes+Clase+A+1',1,410),(126,'https://placehold.co/800x600?text=Mercedes+Clase+A+2',0,410),(127,'https://placehold.co/800x600?text=Volkswagen+Polo+1',1,411),(128,'https://placehold.co/800x600?text=Volkswagen+Polo+2',0,411),(129,'https://placehold.co/800x600?text=Volkswagen+Polo+3',0,411),(130,'https://placehold.co/800x600?text=Mercedes+Clase+C+1',1,412),(131,'https://placehold.co/800x600?text=Mercedes+Clase+C+2',0,412),(132,'https://placehold.co/800x600?text=Mercedes+Clase+C+3',0,412),(139,'https://placehold.co/800x600?text=Mercedes+Clase+C+1',1,415),(140,'https://placehold.co/800x600?text=Toyota+Corolla+1',1,416),(141,'https://placehold.co/800x600?text=Toyota+Corolla+2',0,416),(142,'6974b098f40f1.png',0,NULL),(143,'6974b09937ed1.png',1,NULL),(144,'6974b0dd2598f.png',1,NULL),(145,'6974b0dd3fcd9.jpg',0,NULL),(146,'6974b1cfab72f.png',1,NULL),(147,'6974b1cfc9b51.jpg',0,NULL),(148,'6974b24bec76f.png',1,NULL),(149,'6974b24c10aee.png',0,NULL),(150,'6974b2cfca25f.png',1,NULL),(151,'6974b2cfdc600.png',0,NULL),(152,'6974b3e678d86.png',0,NULL),(153,'6974b3e695424.png',1,NULL),(154,'6974b4ae87087.png',0,NULL),(155,'6974b4aea3825.png',1,NULL),(156,'6974b5c9d7da5.png',0,NULL),(157,'6974b5ca29882.png',1,NULL),(158,'6974b61543716.jpg',1,NULL),(159,'6974b61564957.jpg',0,NULL),(162,'6974b82ca1062.jpg',1,418),(163,'6974b82cc2b11.jpg',0,418),(164,'6974b8a88be99.jpg',1,NULL),(165,'6974b8a8a98f3.jpg',0,NULL),(166,'6974b8f75596d.jpg',1,NULL),(167,'6974b8f772c7c.jpg',0,NULL),(168,'6974b915812e4.jpg',0,419),(169,'6974b915a2aa1.jpg',1,419),(170,'6974bb8db7bbd.jpg',1,420),(171,'6974bb8dd7842.jpg',0,420),(172,'6974bcc5280a0.jpg',1,421),(173,'6974bcc546774.jpg',0,421),(174,'6978abde5eacc.jpg',1,422),(175,'6978abdeb7476.jpg',0,422),(176,'697a6d4506fc5.jpg',0,423),(177,'699c9e42159ec.jpg',0,414),(178,'699c9e424e280.jpg',0,414),(179,'699c9e4269fe8.jpg',0,414),(180,'699c9f24aa3a1.jpg',0,425),(181,'699c9f24c8c6d.jpg',0,425);
/*!40000 ALTER TABLE `vehicle_image` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-25 16:20:47
