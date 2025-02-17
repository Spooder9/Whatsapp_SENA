-- ! ================================================================================================================================================
-- !                                                        SQL PARA CREAR VISTAS
-- ! ================================================================================================================================================
-- @author Brayan Josue Yanez Gonzalez (30 Septiembre de 2024)
-- @lastModified Brayan Josue Yanez Gonzalez (30 de Septiembre de 2024)
-- @version 1.0.0
-- migrations/views/create_views.sql

-- Selecciona la base de datos específica
USE dbp_what_sena;

-- ! CREAR LAS VISTAS DE LA BASE DE DATOS
-- * VISTA DE AGENTES CONECTADOS
CREATE ALGORITHM=UNDEFINED
DEFINER=`root`@`localhost`
SQL SECURITY DEFINER
VIEW `view_agentes_conectados` AS

SELECT 
  `a`.`PKUSU_NCODIGO` AS `primaryKey`,
  `a`.`USU_CUSUARIO` AS `agente`,
  `a`.`USU_CNOMBRE` AS `nombre`,
  `a`.`USU_CAUXILIAR` AS `estado`,
  TIMEDIFF(NOW(), `a`.`USU_CFECHA_CAMBIO_AUXILIAR`) AS `tiempo`,
  COALESCE(
    (
      SELECT COUNT(`tbl_chats_management`.`FKGES_NUSU_CODIGO`)
      FROM (`tbl_usuarios` JOIN `tbl_chats_management`)
      WHERE (
        `tbl_chats_management`.`GES_ESTADO_CASO` IN ('ATENDING', 'ATTENDING')
        AND `tbl_chats_management`.`FKGES_NUSU_CODIGO` = `tbl_usuarios`.`PKUSU_NCODIGO`
        AND `a`.`PKUSU_NCODIGO` = `tbl_usuarios`.`PKUSU_NCODIGO`
      )
    ),
    0
  ) AS `chats`

FROM `tbl_usuarios` `a`

WHERE (
  `a`.`USU_CAUXILIAR` IN ('CONNECTED', 'ONLINE', 'LUNCH', 'BATHROOM', 'BREAK', 'TRAINING')
  AND `a`.`USU_CROL` LIKE 'AGENTE'
)

ORDER BY 
  COALESCE(
    (
      SELECT COUNT(`tbl_chats_management`.`FKGES_NUSU_CODIGO`)
      FROM (`tbl_usuarios` JOIN `tbl_chats_management`)
      WHERE (
        `tbl_chats_management`.`GES_ESTADO_CASO` IN ('ATENDING', 'ATTENDING')
        AND `tbl_chats_management`.`FKGES_NUSU_CODIGO` = `tbl_usuarios`.`PKUSU_NCODIGO`
        AND `a`.`PKUSU_NCODIGO` = `tbl_usuarios`.`PKUSU_NCODIGO`
      )
    ),
    0
  ) DESC,
  TIMEDIFF(NOW(), `a`.`USU_CFECHA_CAMBIO_AUXILIAR`) DESC,
  `a`.`USU_CAUXILIAR`;

-- * VISTA DE AGENTES ESTADO
CREATE ALGORITHM=UNDEFINED
DEFINER=`root`@`localhost`
SQL SECURITY DEFINER
VIEW `view_agentes_estado` AS

SELECT 
  `a`.`agentesActivos` AS `agentesActivos`,
  `b`.`agentesPausa` AS `agentesPausa`

FROM (
  (
    SELECT 
      COUNT(`tbl_usuarios`.`PKUSU_NCODIGO`) AS `agentesActivos`
    FROM 
      `tbl_usuarios`
    WHERE (
      `tbl_usuarios`.`USU_CROL` LIKE 'AGENTE'
      AND `tbl_usuarios`.`USU_CAUXILIAR` LIKE 'ONLINE'
    )
  ) `a`

  JOIN (
    SELECT 
      COUNT(`tbl_usuarios`.`PKUSU_NCODIGO`) AS `agentesPausa`
    FROM 
      `tbl_usuarios`
    WHERE (
      `tbl_usuarios`.`USU_CROL` LIKE 'AGENTE'
      AND `tbl_usuarios`.`USU_CAUXILIAR` IN (
        'CONNECTED',
        'LUNCH',
        'BATHROOM',
        'BREAK',
        'TRAINING'
      )
    )
  ) `b`
);

-- * VISTA DE CHATS ACTIVOS
CREATE ALGORITHM = UNDEFINED
DEFINER = `root`@`localhost`
SQL SECURITY DEFINER
VIEW `view_chats_activos` AS
SELECT
    g.PKGES_CODIGO AS idchat,
    g.GES_NOMBRE_COMUNICA AS cliente,
    U.USU_CNOMBRE AS agente,
    g.GES_CHORA_INICIO_GESTION AS fecha,

    -- Tiempo desde el último mensaje enviado por el agente
    (
        SELECT TIMEDIFF(NOW(), MAX(tbl_messages.MES_CREATION_DATE))
        FROM tbl_messages
        WHERE tbl_messages.MES_CHANNEL LIKE 'SEND'
        AND tbl_messages.FK_GES_CODIGO = g.PKGES_CODIGO
    ) AS tiempoUltimoEnviado,

    -- Tiempo desde el último mensaje recibido del cliente
    (
        SELECT TIMEDIFF(NOW(), MAX(tbl_messages.MES_CREATION_DATE))
        FROM tbl_messages
        WHERE tbl_messages.MES_CHANNEL LIKE 'RECEIVED'
        AND tbl_messages.FK_GES_CODIGO = g.PKGES_CODIGO
    ) AS tiempoUltimoRecibido,

    -- Tiempo en cola antes de asignación al agente
    COALESCE(
        TIMEDIFF(g.GES_CFECHA_ASIGNACION, g.GES_CFECHA_PASOASESOR),
        TIMEDIFF(NOW(), g.GES_CFECHA_PASOASESOR)
    ) AS asaCola,

    -- Tiempo desde la asignación hasta el primer mensaje enviado por el agente
    COALESCE(
        (
            SELECT TIMEDIFF(tbl_messages.MES_CREATION_DATE, g.GES_CFECHA_ASIGNACION)
            FROM tbl_messages
            WHERE tbl_messages.FK_GES_CODIGO = g.PKGES_CODIGO
            AND tbl_messages.MES_CHANNEL = 'SEND'
            AND tbl_messages.MES_USER <> 'BOT'
            AND tbl_messages.MES_USER IS NOT NULL
            ORDER BY tbl_messages.MES_CREATION_DATE
            LIMIT 1
        ),
        (
            SELECT TIMEDIFF(NOW(), g.GES_CFECHA_ASIGNACION)
            FROM tbl_messages
            WHERE tbl_messages.FK_GES_CODIGO = g.PKGES_CODIGO
            ORDER BY tbl_messages.MES_CREATION_DATE
            LIMIT 1
        )
    ) AS asaAgente,

    -- Tiempo total desde el inicio de la gestión
    TIMEDIFF(NOW(), g.GES_CHORA_INICIO_GESTION) AS tiempoTotal

FROM
    tbl_chats_management g
JOIN
    tbl_usuarios U
ON
    g.FKGES_NUSU_CODIGO = U.PKUSU_NCODIGO
WHERE
    g.GES_ESTADO_CASO IN ('ATENDING', 'ATTENDING', 'TRANSFERRED')
    AND g.GES_TIPO_CHAT = 'INDIVIDUAL';

-- * VISTA DE CHATS ARBOL
CREATE ALGORITHM = UNDEFINED
DEFINER = `root`@`localhost`
SQL SECURITY DEFINER
VIEW `view_chats_arbol` AS
SELECT
    tbl_chats_management.PKGES_CODIGO AS idChat,
    tbl_chats_management.GES_NUMERO_COMUNICA AS cliente,
    tbl_chats_management.GES_CHORA_INICIO_GESTION AS Inicio,
    tbl_chats_management.GES_CHORA_FIN_GESTION AS Fin,
    TIMEDIFF(tbl_chats_management.GES_CHORA_FIN_GESTION, tbl_chats_management.GES_CHORA_INICIO_GESTION) AS Duracion,
    tbl_chats_management.GES_CDETALLE_ADICIONAL AS OpcionArbol
FROM
    tbl_chats_management
WHERE
    tbl_chats_management.GES_ESTADO_CASO LIKE 'CLOSE'
    AND tbl_chats_management.GES_CULT_MSGBOT LIKE 'MSG_FIN'
    AND tbl_chats_management.GES_CDETALLE_ADICIONAL LIKE '%BOT%';

-- * VISTA DE CHATS EN ESPERA
CREATE ALGORITHM = UNDEFINED
DEFINER = `root`@`localhost`
SQL SECURITY DEFINER
VIEW `view_chats_espera` AS
SELECT
    tbl_chats_management.GES_NUMERO_COMUNICA AS cliente,
    tbl_chats_management.GES_CHORA_INICIO_GESTION AS fecha,
    TIMEDIFF(NOW(), tbl_chats_management.GES_CHORA_INICIO_GESTION) AS espera
FROM
    tbl_chats_management
WHERE
    tbl_chats_management.GES_ESTADO_CASO LIKE 'OPEN'
    AND tbl_chats_management.GES_CULT_MSGBOT LIKE 'MSG_FIN';

-- * VISTA DE CHATS ESTADO
CREATE ALGORITHM = UNDEFINED
DEFINER = `root`@`localhost`
SQL SECURITY DEFINER
VIEW `view_chats_estado` AS
SELECT
    a.chatsActivos AS chatsActivos,
    b.chatsEspera AS chatsEspera
FROM
    (
        SELECT COUNT(tbl_chats_management.GES_ESTADO_CASO) AS chatsActivos
        FROM tbl_chats_management
        WHERE tbl_chats_management.GES_ESTADO_CASO IN ('ATENDING', 'ATTENDING')
    ) a
JOIN
    (
        SELECT COUNT(tbl_chats_management.GES_ESTADO_CASO) AS chatsEspera
        FROM tbl_chats_management
        WHERE tbl_chats_management.GES_ESTADO_CASO LIKE 'OPEN'
        AND tbl_chats_management.GES_CULT_MSGBOT LIKE 'MSG_FIN'
    ) b;

-- * VISTA DE CHATS KPIS GRUPOS
CREATE ALGORITHM = UNDEFINED
DEFINER = `root`@`localhost`
SQL SECURITY DEFINER
VIEW `view_chats_kpis_grupos` AS
SELECT
    IFNULL(c.PKGES_CODIGO, '-') AS vct_id,
    IFNULL(U.USU_CUSUARIO, '-') AS vtc_agente,
    IFNULL(t.TYP_NOMBRE_AGENTE, '-') AS vct_usuario,
    IFNULL(t.TYP_FECHA_HORA_INICIO_TIPIFICACION, '-') AS vtc_fecha_inicial_mensaje,
    IFNULL(SEC_TO_TIME(TIME_TO_SEC(TIMEDIFF(t.TYP_FECHA_HORA_INICIO_TIPIFICACION, t.TYP_FECHA_HORA_INICIO_MENSAJE))), '-') AS vtc_asa_cola,
    IFNULL(SEC_TO_TIME(TIME_TO_SEC(TIMEDIFF(t.TYP_CFECHA_REGISTRO, t.TYP_FECHA_HORA_INICIO_MENSAJE))), '-') AS vtc_asa_agente,
    IFNULL(t.TYP_TMO, '-') AS vtc_tmo,
    IFNULL(g.grp_nombre, '-') AS vct_grupo,
    IFNULL(
        (SELECT TIMEDIFF(NOW(), MAX(tbl_messages.MES_CREATION_DATE))
         FROM tbl_messages
         WHERE tbl_messages.MES_CHANNEL LIKE 'RECEIVED'
         AND tbl_messages.FK_GES_CODIGO = c.PKGES_CODIGO), '-') AS vtc_tiempo_ult_recibido,
    IFNULL(
        (SELECT TIMEDIFF(NOW(), MAX(tbl_messages.MES_CREATION_DATE))
         FROM tbl_messages
         WHERE tbl_messages.MES_CHANNEL LIKE 'SEND'
         AND tbl_messages.FK_GES_CODIGO = c.PKGES_CODIGO), '-') AS vtc_tiempo_ult_enviado
FROM
    tbl_chats_management c
JOIN
    tbl_typifications t ON c.PKGES_CODIGO = t.FKTYP_NGES_CODIGO
JOIN
    tbl_usuarios U ON c.FKGES_NUSU_CODIGO = U.PKUSU_NCODIGO
JOIN
    (SELECT MAX(tbl_typifications.TYP_FECHA_HORA_INICIO_TIPIFICACION) AS max_fecha_tipificacion,
            tbl_typifications.FKTYP_NGES_CODIGO
     FROM tbl_typifications
     GROUP BY tbl_typifications.FKTYP_NGES_CODIGO) last_tipif
    ON t.FKTYP_NGES_CODIGO = last_tipif.FKTYP_NGES_CODIGO
    AND t.TYP_FECHA_HORA_INICIO_TIPIFICACION = last_tipif.max_fecha_tipificacion
JOIN
    tbl_grupo g ON g.grp_numero = c.GES_NUMERO_COMUNICA
WHERE
    c.GES_TIPO_CHAT = 'GRUPAL';

-- * VISTA DE REPORTE INTERACCIONES
CREATE ALGORITHM = UNDEFINED
DEFINER = `root`@`localhost`
SQL SECURITY DEFINER
VIEW `view_reporte_interacciones` AS
SELECT
    a.PKGES_CODIGO AS PKGES_CODIGO,
    tbl_usuarios.PKUSU_NCODIGO AS PKUSU_NCODIGO,
    tbl_usuarios.USU_CUSUARIO AS agente,
    a.GES_NUMERO_COMUNICA AS cliente,
    b.TYP_OBSERVACION AS tipificacion,
    a.GES_CHORA_INICIO_GESTION AS fechaInicio,
    a.GES_CHORA_FIN_GESTION AS fechaFin,
    TIMEDIFF(a.GES_CHORA_FIN_GESTION, a.GES_CHORA_INICIO_GESTION) AS tiempo
FROM
    tbl_usuarios
JOIN
    tbl_chats_management a ON a.FKGES_NUSU_CODIGO = tbl_usuarios.PKUSU_NCODIGO
JOIN
    tbl_typifications b ON a.PKGES_CODIGO = b.FKTYP_NGES_CODIGO
WHERE
    a.GES_ESTADO_CASO LIKE 'CLOSE'
ORDER BY
    a.PKGES_CODIGO;


