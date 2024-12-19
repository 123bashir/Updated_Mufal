-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: mufal
-- ------------------------------------------------------
-- Server version	8.0.39

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
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `CustomerId` varchar(30) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `createdAt` varchar(80) NOT NULL,
  `Price` int DEFAULT '0',
  `transactionPin` varchar(255) DEFAULT '000',
  `fingerprint` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`CustomerId`),
  UNIQUE KEY `CustomerId_UNIQUE` (`CustomerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES ('1022756025506724','turai2@gmail.com','basheer123khaleepha','$2b$12$XR1Bl6Y0OXQkNBwdWsIv5eqTddYIDYCLPNJNIZjWH87XSHySXmAi6','https://res.cloudinary.com/dghi878zc/image/upload/v1728343394/avatars/lphdvtzg6lacdhemvwbs.jpg','2024-11-04 00:00:00',10933,'$2b$12$9ISrVJmAQXSIVQiwNZHfD.5ol.BJ4n8/5XKKVsO9e3BLBoz7b95Xi',NULL),('1073595762705561','Maryam0112@gmail.com','Maryam','$2b$12$5Vy7dI0BWJ8PEqf60WNkweV5znIf1xN2Nk6TntENgVyiQo0iFtCiS',NULL,'2024-11-04 00:00:00',10933,NULL,NULL),('1080472338585491','basheeryusufagge012@gmail.com','basheer','$2b$12$9Nzynq8D.iSxqBaN3pTfcO1JYtlP6QUyuyaJJk8dAmq96vDmJtqRi',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('1110168514659943','haleephhha@gmail.com','hauwa','$2b$12$84Y.apiT0oXXInMkSIdnmu5GpIWy/T49nH6GbT6DqgcdXxwcBALuS',NULL,'2024-11-04 00:00:00',10933,'$2b$12$sWxAwNKog0EaXYR3FrLiquTIx03VmLHh0Se2yTRspevceE.aJxZmC',NULL),('1126115758600764','test@gmail.com','test','$2b$12$c3HQFPWMl0FxWWhoPe07AOoxzTOMmNv7HsCDZTGAsrrcXLZ.b.2Vi',NULL,'2024-11-04 00:00:00',10933,'000',NULL),('117410822597087','basheeryusufaggecfgcfgfgf012@gmail.com','basheer','$2b$12$yxRnyRA0FJhGV.zhe6arqe2S1Rpk9tByC8XvoowEECKOY7KXyum8a',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('1174561313219256','basheerygcfgfgcfgusufagge012@gmail.com','basheer','$2b$12$yc3UX.OoWoreS7TWzrULuOo7fH2dmkgfcrvaby96Ii1uAzBMIVwDS',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('1177581625738155','bashheeryusufagggfgfge012@gmail.com','anwarry','$2b$12$IYb3qORFIk7naeJRFxMWnOMpn4n.czZREcVIX9Fzg4LfOuOAETaf6',NULL,'2024-11-04 00:00:00',10933,'000',NULL),('1196018806941567','basheervccfcfyusufaggecfgcfgfgf012@gmail.com','basheerc vxdfcfg','$2b$12$L7H2/IFQQn.wQFhw1q4BL.Dev0mNCgXFHfhWHVf0yS3PlZINwV9la',NULL,'2024-11-04 00:00:00',10933,NULL,NULL),('120317407596969','yusufagge012@gmail.com','anwar22','bash',NULL,'2024-11-23 00:00:00',10933,'$2b$12$2oUBtCjaq0XIg3.RJgTLte7weiX0QxtIex7HHRaD7wHkdCeOEgn/m',NULL),('1209979251355231','basheeryffusufagge012@gmail.com','basheer','$2b$12$Ej36Z/99ovTVuZ7Mc7qEtOd9j62sTtdDQdDUDsRtzLci.yZSri9L2',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('130756238573239','Maryam012@gmail.com','Maryam','$2b$10$FK90NGdMkMc37lF6HSU09eXbf4Z9Q7UCvJhScdCBx5KGWRzAy8.Ra',NULL,'2024-11-04 00:00:00',10933,NULL,NULL),('149589587351915','basheeryusufagge01hhghgh2@gmail.com','basheer','$2b$12$jw1gVGJp8xfiqsjGXOcxtuvG1zPU3I2eoJMBWouDFbMrP4E4LlcKG',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('157421091284447','oobasheeryusufagge012@gmail.com','yaroo','$2b$12$E4xOGKGNp9zlD0s2Ohp9ZOQerVNKuJuWFZUQvgj9sl//R4Au7tHwa',NULL,'2024-11-04 00:00:00',10933,'$2b$12$gqWdI5tEckhRWzSzKp3rG.ehNNuRbUIt3/8wwXFtV/ZffA7/aAzLe',NULL),('168293075566722','basheeryusufagge0555512@gmail.com','basheer555','$2b$12$.FeSKBnYzWva6nDyfjCuF.PvHhTBWYc4syVKao340ORD0mhB8xiom',NULL,'2024-11-04 00:00:00',10933,NULL,NULL),('169877632890082','basheeryusufagge012@trgmail.com','basheer','$2b$12$k8o2c.d6HyJ01jTgejtbQ.QMwwUeKPAvq5k8NaKqmOs04//5P0qCW',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('178500195145999','bkahasheeryusufagge012@gmail.com','khadijata','$2b$12$cyWVCchIJsPDn0b0BpdRFuHNjC9IODI8aG.i7gmiNN85hiw4iebKi',NULL,'2024-11-04 00:00:00',10933,NULL,NULL),('180117492006956','basheeryusufagge05512@gmail.com','basheer','$2b$12$aRSO5ugs20MDfQx.AzwIbOJIg1GFt0GNHQqYkhPMebBfVdoD8QmJq',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('255925955875263','basheeryutttsufagge012@gmail.com','ishaq','$2b$12$vhzSH9HnhNMbfz3bLfgdj.CyGWjGtbQ1m8GCP2O/dklfyRe3jzCSC',NULL,'2024-11-23 00:00:00',10933,'000',NULL),('296863331153849','yusufa2gge012@gmail.com','Yusuf','$2b$10$i1hF4J891Vy.VYTONm9vne9TWnM.uP5DJ3usNpYqWjGxA0RHBrvPy',NULL,'2024-11-25 00:00:00',10933,'$2b$12$X5PbV9GHaw3c571shGZ9EeSUGVDDq02w5hip1RV/qg6szXL8/FGLu',NULL),('3480031095328','Ahma333d@gmail.com','abbas','$2b$12$diZh0xt8Q1znx8QPOPHJs.6kX1xoe.hjlivmztJuLV/Bs6UF1VAqa',NULL,'2024-11-23 00:00:00',10933,'000',NULL),('368877817233080','basheeryusufaghhge012@gmail.com','basheer','$2b$12$jfpQ/4gNeRKxXZOIoe8.y.YPMJLzuToczucNj1bgYa45WuB5lw1b.',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('371551770975352','basheeryusufabbgge012@gmail.com','basheer','$2b$12$qhSIU5AEbs68n7WXKngYf.PbLyiNxoJ0qSxx619uwgoSGihjVURKa',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('433770633893891','basheeryusufagge012@gmail.comrr','rr','$2b$12$0RiRNrxqhfWymWmUC6mdaeRHd3w3f2vOkMbfhvbrN65oK1eSPKT5e',NULL,'2024-11-04 00:00:00',10933,NULL,NULL),('448910995006265','Usam23a@gmail.com','Usamaa','$2b$12$AQvLw6gXBSnHkk9CFMQPEejYnI9eJt6lVNH.8kwkuXFMsRtm8trNm',NULL,'2024-11-04 00:00:00',10933,'$2b$12$yC6ADUX5avQAQ5Qx/krNa.P6v/NP5nI3HV0GhkEFnQ2kiOUY2k7K6',NULL),('466549153149881','basheeryusufaghhjjge012@gmail.com','basheer90','$2b$12$5iQOTMFckU7J.MWtKO5RV.3Vhybk0TOxUUZfeJSAOL0L9nMUMBEPW',NULL,'2024-11-04 00:00:00',10933,NULL,NULL),('488880060418044','fagge@gmail.com','Umarr','$2b$10$jXx0bIrJBHTuRRIyChVMfOuFxGtD3OFYs0LV28DH0jrsTLFVO/ULO','https://res.cloudinary.com/dghi878zc/image/upload/v1729128832/avatars/qomnuc7jyp3vtssja7dg.png','2024-11-04 00:00:00',10933,'$2b$12$fu8ZiB3bF8NK5hGNVmGFy.OxTIcGigMhQ98G1XBvl2jFfpgcS2lky',NULL),('506950548228533','basheeryusufagge012@gmail.comgg','Mufaldatasub','$2b$12$Dvx.HddAnv68gQkjvSN8EuZreqUXD2LrSROOiyxfKQEIwXQk7Hz7W',NULL,'2024-11-04 00:00:00',10933,'$2b$12$KeMx155u4FABWc.2IX1rxeHGlYqX2Gul822WTFDgqjGSVhrBJM/7.',NULL),('516039621996017','Usama@gmail.com','Usama','$2b$12$FCtiWi0VEotb7xP9d7vcVuMx1n3bBVvJru54WVCZdLAZyb2Lkvtom',NULL,'2024-11-04 00:00:00',10933,NULL,NULL),('516370299348061','baasheeryusufagge012@gmail.com','basheer','$2b$12$vWsIHIpYLdzd1ilG1Pl3pO4vh11Ehl.Dagn2omlGnVZ7NGov2SiCG',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('519198606804424','algeria@gmail.com','Algeria','$2b$12$HLFu2/OjSfwlQ0XrN6x9N.pP.iII5Xl2COs7WPyqocbRtv67/QXXe',NULL,'2024-12-9   2:2:39',10933,'$2b$12$MUbpbq9I95HrIoCLbjXmE.ynx39GFSxa2i/LGSrdJMZEPNGKTOzRC',NULL),('541340772382728','Ahmasddsghd@gmail.com','09037073249','$2b$12$2F.1lPt.BMQ3/mtuFSAsAO0nnCls6ZC2Dmc3fPy4soUl7GHn7DsIa',NULL,'2024-11-23 00:00:00',10933,'000',NULL),('547819660666270','Maryam0ww112@gmail.com','Maryam12','$2b$12$iRPsy19FmeNxixk9EvDu7eAmuLwZZ.tEfNQqh/u39gQJaj51nQ30C',NULL,'2024-11-04 00:00:00',10933,'$2b$12$y6JqZd7n0gOvfGsjiA5nK.fJfxBwE1KjlFa1sZ6yeBzh3KrM7N5xK',NULL),('574854292009170','usman@gmail.com','usman','$2b$12$QU9G8ShrGC5653sryN./WOhDnCKUqtlCL/9kXTDwUNOpEw05ONziu',NULL,'2024-11-04 00:00:00',10933,'000',NULL),('584367346252694','ibrahim@gmail.com','ibrahim','$2b$12$gopESYpTLxOvXFFakXDyCeAWqt6CrRPtns2UAoKKbfhtDQbsYVrM6',NULL,'2024-11-04 00:00:00',10933,'$2b$12$3QCV3dZqienHwmTBHsKYruLRnwk1EaHp7/hD7ml5HFhlEp/.XkrwS',NULL),('589661259006195','basheeryusufagge012@gmail.coma','khadijaa','$2b$12$jLkNyPWeA6nzkw85IO76leZ90sXcIo5Tu2DNV68H6ohQCAyuSSKuS',NULL,'2024-11-04 00:00:00',10933,'$2b$12$VPEyQv20pRgJvvXw7UsHm.0UPDQLi6KfyGafhZEDg290Ea9pQ9wVS',NULL),('590542831625347','basheeryuseeufagge012@gmail.com','basheer','$2b$12$sPEZJ79TpPeRKuZVyLtAie1llLgPa.z54QArxSYNl7A8x8uGc.gh.',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('592364290173803','abubakattr@gmail.com','Umartt','$2b$12$.RwV/ELI9QIf/s4QxAzlu./c//Z4F.HQH.t1OCZpDUA79FRR/jGYW',NULL,'2024-11-15 00:00:00',10933,'000',NULL),('60088211618491','Ahmad22@gmail.com','Umar12','$2b$12$RZ4xqNKw6uiOkVlcuzPbiuwP397DwdcWK6jC1PLZw2S0XvgNj0mPG',NULL,'2024-11-25 00:00:00',10933,'000',NULL),('606422027336794','basheeryfgfgfusufagge012@gmail.com','Hamza','$2b$12$e49686RsyTeVNhfaTPmrn.6.AyCqCryfpvIGGsphGLFG6T53mHLp.',NULL,'2024-11-04 00:00:00',10933,'$2b$12$9jt/h.LPDRAEWpYfZSjrHO.hvf3JLvGgOZiDuYEODHIz/YiMEUDS.',NULL),('608007409689225','bwasheeryusufagge012@gmail.com','basheer','$2b$12$AM4t3MPNHpdcMeka7Lnule2WeipPwU5Gka/oR2dVD4LcxtDW63BZu',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('621576291565974','YusufMuhammad@gmail.com','YUSUF mUhahmd','$2b$10$RnIOrWYPpY5zY0nleRlHMeMEUtbb1F4LiPSJ8Y//NTYEwiwxod8c2','https://res.cloudinary.com/dghi878zc/image/upload/v1728048274/avatars/cpytbhzjt4ejkylzvmip.jpg','2024-11-04 00:00:00',10933,'$2b$12$QZCu4aqYd0qtItPuv85Y3urYEFMkNey7LpZtgFmNHyPd.22uAPxWm',NULL),('623042083392541','tukur@gmail.com','Tukur','$2b$10$sZvLEprXxXLlH/4S.8YMzuWYPq76llW9GpE5pNKVJOsBf7PK1ycIG',NULL,'2024-11-25 00:00:00',10933,'$2b$12$TuxCoY0Eym8CsrIwjHA/1.hiHKU86XOcy1jdj9sZiRK/0gxGRn77e',NULL),('623118743615430','basheeryusufagg444e012@gmail.com','basheer','$2b$12$/.ewDYYRRaC.IEYqqLp9IeCor4Eh6bHcpUyxPpGtsepUQf6kSuzZG',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('626280035318017','khalil@gmail.com','yahaya','$2b$10$JKVVeeclCWzFXGipejB0q.OqrOXdrbTzaqWEtnSesK8HDIcTFrCGq','https://res.cloudinary.com/dghi878zc/image/upload/v1728328835/avatars/m8nwqvgnwdjmeidt1a4k.jpg','2024-11-04 00:00:00',10933,'$2b$12$.yBlom/bpIh9Hb.uVXswbupjEW37.safSizjDKqEApZmMrFFnuGny',NULL),('627972118359552','Yaro@gmail.com','Yaro','$2b$12$2eFxjmXTLSLkwA/na4p.zOaM1idWdU1lGTWHbAqnuYrwPC6FbP4D6',NULL,'2024-11-04 00:00:00',10933,'$2b$12$Fj09fh1pzaYCHKyFMLsK9uDfiI4MIZKQx0NIhxOYWHBLEq6MLSzLO',NULL),('635508082683006','kalifa@gmail.com','Khalifa','$2b$12$Y5uKa8eo/vaWa4AEYaPlGeuSIVQp1TVsaqZpVrYHpqhXfY/1RE8u.',NULL,'2024-12-09 00:00:00',10933,'000',NULL),('635521438476000','basheeryuggsufagge012@gmail.com','ilham','$2b$12$I6hvPQ9HVSmo7CINki1oiOpOF3BwgCzRqx1hg21qFIiKMgGUskccG',NULL,'2024-11-04 00:00:00',10933,'$2b$12$N.fLrUb0ivHdWLQcpy/2G..68y6KVpcX3ZOsfb97VHDGYQpImFZJC',NULL),('635966863067290','basheeryusufagge0fgftf12@gmail.com','Umar','kk',NULL,'2024-11-21 00:00:00',10933,'$2b$12$QG8VjVjHKUHHpBzJ4Du4Fe7wwqB4Ah.dsjxsfGjBXSU7aeWmD59Ne',NULL),('636445288449704','Muhammmad@gmail.com','Muhammadu','$2b$12$vqvaD0bOuJWuto7fA1eOOuU7DWVDYsLZJ5w15o/01zEFOHWtTQcEu',NULL,'2024-11-04 00:00:00',10933,NULL,NULL),('667178883245163','walid@gmail.comm','walid','$2b$12$tUWWqFapspEjndO5Ohvns.AOfmTNXueb2IUi.LDTUXoGBBZISO4we','https://res.cloudinary.com/dghi878zc/image/upload/v1728612189/avatars/krgcllft7xk7vwueylfq.jpg','2024-11-04 00:00:00',10933,'$2b$12$N3F2SKSB//P7rZUDnt9KHuQPyat.H4IZP2fQ0M9JxfgPTItFPVd46',NULL),('668443333085343','basheeryusufagge012@gmail.comdd','bash','$2b$10$PsbTt6FYNwr7ZIozrLZ.RO989EtNUCwfeK.D.3ur9RhT2exY6hzOW',NULL,'2024-11-25 00:00:00',10933,'$2b$12$OWC5CDBV1l93Suxwy8xIFuNe7a9OGUpN7NME4AoW.R1NJAwq8ORwi',NULL),('700175732630606','ladodii@gmail.com','ladidi','$2b$12$LN3HTD7KRrDdmtggwi1yrOOWTvH/ps3I7eeYckYiS4GGuPs4QVhpe',NULL,'2024-11-04 00:00:00',10933,'$2b$12$pu34S4CAilxWbwA7XjeFl.fnwWRxmKWrFFwKjy9.xuVmhh.Vi24bW',NULL),('701526262918239','kabiryumsuk@gmail.com','Kabir','$2b$10$7KNPGklKJ09Xurb0gAcbneDg3X8CZZbhNesm/k1p1DYBsOdOZT7ay',NULL,'2024-11-25 00:00:00',10933,'$2b$12$ifGqc/J2PWwgnxRoaPPuRODGw6CrS.d2BhgzRdVmN7VT.2/kPdLV.',NULL),('713125176422844','basheerrrryusufagge012@gmail.com','basheer','$2b$12$06N2dR380ywZbHreMNcIqe9yQgCFPrmTtUQIaXOWWIS2Q7Cfbp6CG',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('721341711840584','muhammerreerad4rf34rlawal@gmail.com','0903707324933','$2b$12$qCKgXh.yQw8gne6.tuedI.hYo3wr3MTSlB75aADqptSRDtf833kx6',NULL,'2024-11-23 00:00:00',10933,'000',NULL),('726421875957984','mustapha@gmail.com','mustapha','$2b$12$S5yxwpiug8miCC1QKMPJY.73cnsws0uQG9.VA3HvlWQGyLjXnXp7S','https://res.cloudinary.com/dghi878zc/image/upload/v1728422262/avatars/pk18ivigfejapqjzntvp.jpg','2024-11-04 00:00:00',10933,'$2b$12$b7gxNn7SvOiIyYoDz3x3/.nn.grTV2p1pDqtM4qtfrdxaUnRJ2E4y',NULL),('739101010764798','basheeryusufagge012@gmail.comsdds','Aliyu','$2b$12$PxABlWz/xxABLbrGVdvm..YATxJRJIVGgzPOEh7kgEP8BVXB/FOny',NULL,'2024-11-04 00:00:00',10933,NULL,NULL),('775750140874696','has@ff','Umar','$2b$12$c/QUsioRfQWd3p3iIG8tseO2wTesJOcC0V8if5UQpj3qQw/UFvrv.',NULL,'2024-11-04 00:00:00',10933,'000',NULL),('785534890347777','samira@gmail.com','samira','$2b$12$gMWo4a98nEJHFpj/0UgbcejjOHGhc4/Npj/R/L.J2iIfxAcP//9mG',NULL,'2024-11-04 00:00:00',10933,'$2b$12$ziiuOWzmDSLihTvu98dJWee68q97RF4earjOS2/xgAMUgofCAKGru',NULL),('797769636997593','SANIMUSA@gmail.comm','sani','$2b$10$45IZE8kVrHQ3d/W0IhDe..Uth1j.Emkn8BQWuBQoFRlM3JreYE1Hm',NULL,'2024-11-04 00:00:00',10933,'$2b$12$b2pE/gbppQcEisnwHHMJ0OiDneMJK83nhrcxXHDQGUAo/MAOAC7KS',NULL),('800218012874800','abubakar@gmail.com','Umar','$2b$12$b7iEWD77Mxiyj94iu5zY3u.seX2bd66KmBTGeo0.Z3z0I45681X1u',NULL,'2024-11-15 00:00:00',10933,'000',NULL),('801321008776391','basheeryusufagge013@gmail.com','gff','$2b$12$J2RLJ.MV0suhr8ANM8NcJ.Ytcgx1jiSu.R7GZiU8YbTmPg9iBUZii',NULL,'2024-11-23 00:00:00',10933,'000',NULL),('80925263946789','basheeryusufagge012@gmail.comaaaa','yahya','$2b$12$IW4ZUkfuWXYt02TclD1fFOwRZ/xOpuj9CSjXA3VC8m1AX6bXApHou',NULL,'2024-11-04 00:00:00',10933,'000',NULL),('825475226835570','ilhamBash@gmail.com','Maryam@Bashir','$2b$10$d7t.N69UtF.J2cIT5fSfT.trPYKB3Uf3vI8ZytE4AmFvnmQJY1tWy','https://res.cloudinary.com/dghi878zc/image/upload/v1732718868/avatars/mkfxdfba3e5wliuvogn1.jpg','2024-11-26 00:00:00',10933,'$2b$12$DtEa08pjjXtLc93Hk8SPk.EdcUMkFNqJuwB6.kqicuu8gFXWUzd0K',NULL),('86498430890211','Umaryusuf@gmail.com','Umar','$2b$12$Ob0N.FR7/v0I2t38HmUYduXd.qsV3VyGDs6N0MWds9Fxf8HLrQI2y','https://res.cloudinary.com/dghi878zc/image/upload/v1728836951/avatars/mspqkdc73n2ijvt9esv6.png','2024-11-04 00:00:00',10933,'$2b$12$I2QZTZlbN9dPqljJrfIWtujQxJ6vBRUYaeV20l3zGRTGrv1MStRna',NULL),('86578329170391','bara@gmail.com','bara','$2b$12$HTIaYcRH9kZYj6/cV.xDM.nef4/OJ0J7tQAfiamqXhdQSVNY31fjW',NULL,'2024-11-04 00:00:00',10933,NULL,NULL),('8798464641949','basheeryusufagge012@gmail.comm','basheer','$2b$12$Tc2LN0fBrLFMpIaXr/WzdeYA6.aNoI1WuBufc6wwDPiiCQKIb1ZRy',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('898645608013237','basheeryusufagddfsdge012@gmail.com','basheer','$2b$12$cLNYlaMrHed2p777YPM1SecG2nqDuckTzdPWBzMPCvi9JaEwpAEl6',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('917454892210450','biasheeryusufagge012@gmail.com','inshalllah','$2b$12$iUERL/cg6xtLOvpRpHH8T.56Oj.p3LTk0RPjkkEdt3UdlIq.kHvvO',NULL,'2024-11-04 00:00:00',10933,'$2b$12$3M6l4MDAFN.0R/bbTkbs3eh1so5lYtGrrt.02r4XQjeEMpQO4KAhm',NULL),('917486680641440','bashheeryusufagge012@gmail.com','anwar','$2b$12$Je2Vg2X4Kirb6.kiInmEAOEZW7uc07iwgFIJRdZmkUjWiS8Mw8pW6',NULL,'2024-11-04 00:00:00',10933,'$2b$12$2RlbissY51E739nkw921DeMKd.vCXtFiKDQ2mrlIIKFq48wP19apS',NULL),('931495434099991','suleimanasani175@gmail.com','sasgloballinks','$2b$12$.RjuC3ponWwjtKhWgNplBu05NU/MoZSSYV/ajku6EZMZBkfQPo46C',NULL,'2024-11-07 00:00:00',10933,'$2b$12$Xh6pJYo1P8CT.VUQDznBf.HAhQFnldyHsere3vwmNEAZT8IKgMYHi',NULL),('94314442315804','Ahmad@gmail.com','Ahmad','$2b$12$p5eAzvX0K5grdph4UObxPenTtu5CGqxCDahxZ/Im6JtOqUE7Cw3mS',NULL,'2024-11-20 00:00:00',10933,'$2b$12$ct5O7l65t/7sKJz0bV0Du.RMg0.DZQw2WSOZ.T2gzX0uoxl21D2xK',NULL),('947680411841932','shaka@gmail.com','shaka','$2b$12$neauxmBS2XbAMeRq.wpoX.qlhIqY6BrOrLJysT2LxSGEYZ0GS1vMe',NULL,'2024-11-04 00:00:00',10933,'$2b$12$fzDN.cNt5BYAhnvFexGZxujxU.0Jnbb0cZ1N78SanrTbV73bDYovO',NULL),('960101691211750','aishayahaya@gmail.com','Aisha','$2b$12$YjmafJtuShNRSgKUZThLVug.GkfbvEEKryZAcNnhii2UmUnqk.nJW',NULL,'2024-11-04 00:00:00',10933,'$2b$12$SRXtREP/w4Vym7dI80zLBuz2tbUO6Ke1s76Hd3ZjBmwKfno.tjn2a',NULL),('966936101980180','anwar@gmail.com','anwar','$2b$12$wKravjbQwblTGy8xgIJj1.9wXm9JWkNVuL45PxkWEFBPWy5N9uCu2','https://res.cloudinary.com/dghi878zc/image/upload/v1728836406/avatars/xoo9kglf9fzyqu6ag0bn.jpg','2024-11-04 00:00:00',10933,'$2b$12$uRF7dFqZZLamuPXn9tgrwOuQq5giS4rWnRuhhMBcW7VdPNuS.FVAO',NULL),('968713072689771','sunusi@gmail.com','sunusi','$2b$12$zFA4D0OrnD5Mqh9oXHHS2.XOaxRqtzaWd0eS0P.4v.oUgyMpN71Qe',NULL,'2024-11-04 00:00:00',10933,'$2b$12$Ogx0CNk70o6P.g0Fm.4f7uBHdhlaxS3QoguZhCljy.i6JhYEux236',NULL),('969241940588858','basheeryusufagge012dftrtr@gmail.com','basheer','$2b$12$5HiDP4eqYRRMWGbmvETauOvDvr3XUDI7BLEfHOWnOPMjhytPvFyhG',NULL,'2024-11-04 00:00:00',10933,'34334',NULL),('971072622435304','basddddheeryusufagge012@gmail.com','Usama','$2b$12$V0vudd0Xl8A7oWTi/anmROZrAWcKRMcS0uXl7byOI9wEj7.9QrEbG',NULL,'2024-11-04 00:00:00',10933,NULL,NULL),('973517620926945','ilham@gmail.com','Maryam','$2b$12$kn29pUFhAsLsgZAvdzD2keFjW.NFa88zFXMRpOMn6A3CZLUOBvYZm',NULL,'2024-11-26 00:00:00',10933,'000',NULL),('975254397715286','MaryamBashir@gmail.com','MaryamBashir','$2b$12$iGmUvfhcCIi6Z55yOi4pWePyG6hRua2auQvzodrXyXgDTAiL4m7M.',NULL,'2024-11-30 00:00:00',10933,'$2b$12$dbNmBH0Mgq/S9/ycn.KEPec6CXFWpyZizXhKEjMTmnfR2pynw2KSe',NULL),('992473696660695','muhsin@gmail.com','muhsin','$2b$12$VsLtU00aWjUToUWat8pv5eRWwRqr5zqfGlKNrC7Tu2Ycc5fq91Y.a',NULL,'2024-11-04 00:00:00',10933,'$2b$12$F.J6d548xnz78gc9A7GOl.KR1TVAaZh1KY0YpTsZz4ZPQFsIrk7qe',NULL);
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dataprice`
--

DROP TABLE IF EXISTS `dataprice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dataprice` (
  `MuhDID` int DEFAULT NULL,
  `mtnsme500` int DEFAULT NULL,
  `mtnsme1gb` int DEFAULT NULL,
  `mtnsme2gb` int DEFAULT NULL,
  `mtnsme3gb` int DEFAULT NULL,
  `mtnsme5gb` int DEFAULT NULL,
  `mtnsme10gb` int DEFAULT NULL,
  `mtnsme2500mb` int DEFAULT NULL,
  `mtnsme21gb` int DEFAULT NULL,
  `mtnsme21p5` int DEFAULT NULL,
  `mtnsme22gb` int DEFAULT NULL,
  `mtnsme23gb` int DEFAULT NULL,
  `mtnsme24gb` int DEFAULT NULL,
  `mtnsme25gb` int DEFAULT NULL,
  `mtnsme210gb` int DEFAULT NULL,
  `mtndatashare1gb` int DEFAULT NULL,
  `mtndatashare2gb` int DEFAULT NULL,
  `mtndatashare3gb` int DEFAULT NULL,
  `mtndatashare5gb` int DEFAULT NULL,
  `mtndatashare500mb` int DEFAULT NULL,
  `cooperate500mb` int DEFAULT NULL,
  `cooperate250mb` int DEFAULT NULL,
  `cooperate1gb` int DEFAULT NULL,
  `cooperate2gb` int DEFAULT NULL,
  `cooperate3gb` int DEFAULT NULL,
  `cooperate5gb` int DEFAULT NULL,
  `cooperate10gb` int DEFAULT NULL,
  `mtngifting500mb` int DEFAULT NULL,
  `mtngifting1gb` int DEFAULT NULL,
  `mtngifting1p5gb` int DEFAULT NULL,
  `mtngifting2p5gb` int DEFAULT NULL,
  `mtngifting3p5gb` int DEFAULT NULL,
  `mtngifting15gb` int DEFAULT NULL,
  `airtelgifting1gb` int DEFAULT NULL,
  `airtelgifting3gb` int DEFAULT NULL,
  `airtelgifting10gb` int DEFAULT NULL,
  `airtelcooperate300mb` int DEFAULT NULL,
  `airtelcooperate500mb` int DEFAULT NULL,
  `airtelcooperate1gb` int DEFAULT NULL,
  `airtelcooperate2gb` int DEFAULT NULL,
  `airtelcooperate5gb` int DEFAULT NULL,
  `airtelcooperate10gb` int DEFAULT NULL,
  `airtelcooperate15gb` int DEFAULT NULL,
  `glo200mb` int DEFAULT NULL,
  `glo500mb` int DEFAULT NULL,
  `glo1gb` int DEFAULT NULL,
  `glo2gb` int DEFAULT NULL,
  `glo3gb` int DEFAULT NULL,
  `glo5gb` int DEFAULT NULL,
  `glo10gb` int DEFAULT NULL,
  `nine200mb` int DEFAULT NULL,
  `nine500mb` int DEFAULT NULL,
  `nine1gb` int DEFAULT NULL,
  `nine2gb` int DEFAULT NULL,
  `nine3gb` int DEFAULT NULL,
  `nine5gb` int DEFAULT NULL,
  `nine10gb` int DEFAULT NULL,
  `nine15gb` int DEFAULT NULL,
  `DialogMessage` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dataprice`
--

LOCK TABLES `dataprice` WRITE;
/*!40000 ALTER TABLE `dataprice` DISABLE KEYS */;
INSERT INTO `dataprice` VALUES (38271764,2000,200,3200,200,200,200,200,200,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,1,2,3,4,5,6,7,8,9,10,1,4344,4344,1,1,4344,4344,1,4344,4344,4344,4344,4344,4344,4344,'Alhamdulillah ,All Praise Be To Almighty Allah ,Alhamdulillah Finally It Done');
/*!40000 ALTER TABLE `dataprice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fundinghistory`
--

DROP TABLE IF EXISTS `fundinghistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fundinghistory` (
  `UserID` varchar(30) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `username` varchar(255) DEFAULT NULL,
  `Amount` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `UserID_UNIQUE` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fundinghistory`
--

LOCK TABLES `fundinghistory` WRITE;
/*!40000 ALTER TABLE `fundinghistory` DISABLE KEYS */;
INSERT INTO `fundinghistory` VALUES ('76236325235563','2024-11-04 23:27:49','basheer','200naira'),('762363257863','2024-11-04 23:28:54','yahya','211naira'),('762363342327863','2024-11-04 23:30:14','aminu','4000naira'),('76236334343','2024-11-04 23:30:14','muhammad','900naira'),('76434363276863','2024-11-04 23:30:14','aisha','9000 naira');
/*!40000 ALTER TABLE `fundinghistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactionhistory`
--

DROP TABLE IF EXISTS `transactionhistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactionhistory` (
  `transactionId` varchar(255) NOT NULL,
  `transactionType` varchar(255) DEFAULT NULL,
  `createdAT` varchar(45) DEFAULT NULL,
  `transactionStatus` varchar(255) DEFAULT NULL,
  `RecipientNumber` varchar(255) NOT NULL,
  `tansactionAmount` int NOT NULL,
  `userId` varchar(255) DEFAULT NULL,
  `PlanName` varchar(45) DEFAULT NULL,
  `NetworkPlan` varchar(45) DEFAULT NULL,
  `TodayDate` varchar(45) DEFAULT 'null',
  PRIMARY KEY (`transactionId`),
  UNIQUE KEY `transactionId_UNIQUE` (`transactionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactionhistory`
--

LOCK TABLES `transactionhistory` WRITE;
/*!40000 ALTER TABLE `transactionhistory` DISABLE KEYS */;
INSERT INTO `transactionhistory` VALUES ('0',NULL,'2024-12-04','0','0',0,'825475226835570',NULL,NULL,'2024-12-12'),('MDS00099','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS1104678127854899','Data Sub','2024-12-12','successful','09037073249 ',17,'825475226835570','3GB','MTN DATASHARE','2024-12-12'),('MDS11200099','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS11256500099','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS158836749862052','Data Sub','2024-12-12','successful','09037073249 ',17,'825475226835570','3GB','MTN DATASHARE','2024-12-12'),('MDS38231656565','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS3823331656565','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS382333221656565','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS3837634565634','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS383763463434','GLO','2024-12-04','pending','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS38411111233','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS384111656565','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS3841117776','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS384344343434','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS384344565634','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS3890000','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS389000099','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS3891656565','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS38991656565','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS389991656565','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS3899981656565','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS411843235','Airtel ','2024-12-04','Successfull','07060913899',200,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS4118445445','Airtel ','2024-12-04','Successfull','07060913899',200,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS41522028557530','Data Sub','2024-12-12','successful','09037073249 ',17,'825475226835570','3GB','MTN DATASHARE','2024-12-12'),('MDS419730375848587','Data Sub','2024-12-12','successful','09037073249 ',17,'825475226835570','3GB','MTN DATASHARE','2024-12-12'),('MDS4378444847','Data Sub','2024-12-04','Successfull','07060913899',200,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS4378445445','Data Sub','2024-12-04','Successfull','07060913899',200,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS437845457847','Data Sub','2024-12-04','Successfull','07060913899',200,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS4378455847','Data Sub','2024-12-04','Successfull','07060913899',200,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS437847447847','Data Sub','2024-12-04','Successfull','07060913899',200,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS437847837847','Data Sub','2024-12-04','Successfull','07060913899',200,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS463831162910887','Data Sub','2024-12-12','successful','09037073249 ',17,'825475226835570','3GB','MTN DATASHARE','2024-12-12'),('MDS503416133216774','Data Sub','2024-12-12','successful','09037073249 ',17,'825475226835570','3GB','MTN DATASHARE','2024-12-12'),('MDS569453599385676','Data Sub','2024-12-12','successful','07036222249 ',17,'825475226835570','3GB','MTN DATASHARE','2024-12-12'),('MDS729219219371667','Data Sub','2024-12-12','successful','09037073249 ',17,'825475226835570','3GB','MTN DATASHARE','2024-12-12'),('MDS753906470808345','Data Sub','2024-12-12','successful','07036222249 ',17,'825475226835570','3GB','MTN DATASHARE','2024-12-12'),('MDS802875383282201','Data Sub','2024-12-12','successful','09037073249 ',17,'825475226835570','3GB','MTN DATASHARE','2024-12-12'),('MDS835772450668218','Data Sub','2024-12-12','successful','09037073249 ',17,'825475226835570','3GB','MTN DATASHARE','2024-12-12'),('MDS850578293329201','Data Sub','2024-12-12','successful','07036222249 ',17,'825475226835570','3GB','MTN DATASHARE','2024-12-12'),('MDS907000099','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS90700900099','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS90767600099','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS9078091200099','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS90789700099','MTN','2024-12-04','SUCCESSFULL','08160851388',500,'825475226835570','200 Naira','mtn data','2024-12-12'),('MDS921987952979486','Data Sub','2024-12-12','successful','07036222249 ',17,'825475226835570','3GB','MTN DATASHARE','2024-12-12');
/*!40000 ALTER TABLE `transactionhistory` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-13 17:31:28
