const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../global.config.json')));
const { DB_NAME } = config.database;
const router = require("express").Router();
const connMySQL = require("../../public/database");
const { isSupervisorOrAdministrator } = require("../lib/auth");
const { getRealPhone, getNameGroup } = require('../helpers/global');



router.get("/", isSupervisorOrAdministrator, async (req, res) => {
  res.render("app/dashboard", { title: "Dashboard" });
});

router.get("/actualizarDashboard", isSupervisorOrAdministrator, async (req, res) => {
  try {

    sqlAsaColaGeneral = `select DATE_FORMAT(GES_CHORA_INICIO_GESTION, '%T') as hora, coalesce(timediff(GES_CFECHA_ASIGNACION, GES_CHORA_INICIO_GESTION), timediff(now(), GES_CHORA_INICIO_GESTION))as ASA FROM ${DB_NAME}.tbl_chats_management where GES_CHORA_INICIO_GESTION between DATE_FORMAT(now(), '%Y-%m-%d 00:00:00') AND DATE_FORMAT(now(), '%Y-%m-%d 23:59:59') order by  PKGES_CODIGO asc`;
    let [datasqlAsaColaGeneral] = await connMySQL.promise().query(sqlAsaColaGeneral);

    sqlChatsEspera = `SELECT * FROM ${DB_NAME}.view_chats_espera`;
    let [datasqlChatsEspera] = await connMySQL.promise().query(sqlChatsEspera);

    for (let i = 0; i < datasqlChatsEspera.length; i++) {
      const chat = datasqlChatsEspera[i];
      const resRealPhone = await getRealPhone({ codigo: chat.cliente });
      datasqlChatsEspera[i].userLabel = resRealPhone.userLabel;
      datasqlChatsEspera[i].isWeb = resRealPhone.isWeb;
    }

    sqlChatsActivos = `SELECT * FROM ${DB_NAME}.view_chats_activos`;
    let [datasqlChatsActivos] = await connMySQL.promise().query(sqlChatsActivos);

    for (let i = 0; i < datasqlChatsActivos.length; i++) {
      const chat = datasqlChatsActivos[i];
      const resRealPhone = await getRealPhone({ codigo: chat.cliente });
      datasqlChatsActivos[i].userLabel = resRealPhone.userLabel;
      datasqlChatsActivos[i].isWeb = resRealPhone.isWeb;
    }

    //CHATS Grupos 
    sqlChatsGrupos = `SELECT * FROM ${DB_NAME}.view_chats_kpis_grupos`;
    let [datasqlChatsGrupos] = await connMySQL.promise().query(sqlChatsGrupos);
    console.log(datasqlChatsGrupos)

    sqlChatsEstado = `SELECT * FROM ${DB_NAME}.view_chats_estado`;
    let [datasqlChatsEstado] = await connMySQL.promise().query(sqlChatsEstado);

    sqlAgentesConectados = `SELECT * FROM ${DB_NAME}.view_agentes_conectados`;
    let [datasqlAgentesConectados] = await connMySQL.promise().query(sqlAgentesConectados);

    sqlAgentesEstado = `SELECT * FROM ${DB_NAME}.view_agentes_estado`;
    let [datasqlAgentesEstado] = await connMySQL.promise().query(sqlAgentesEstado);

    res.json({ datasqlChatsEspera, datasqlChatsActivos, datasqlChatsGrupos, datasqlChatsEstado, datasqlAgentesConectados, datasqlAgentesEstado, datasqlAsaColaGeneral });

  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.get("/bot", isSupervisorOrAdministrator, async (req, res) => {
  res.render("app/dashboardBot", { title: "Dashboard" });
});

router.get("/actualizarDashboardBot", isSupervisorOrAdministrator, async (req, res) => {
  try {

    sqlInteraccionesBot = `SELECT * FROM ${DB_NAME}.view_chats_arbol WHERE Inicio between DATE_FORMAT(now(), '%Y-%m-%d 00:00:00') AND DATE_FORMAT(now(), '%Y-%m-%d 23:59:59')`;
    let [datasqlInteraccionesBot] = await connMySQL.promise().query(sqlInteraccionesBot);

    sqlInteraccionesAbiertasBot = `SELECT * FROM ${DB_NAME}.tbl_chats_management where GES_ESTADO_CASO like 'OPEN' AND GES_CULT_MSGBOT like '%MSG_MENU%' AND GES_CHORA_INICIO_GESTION between DATE_FORMAT(now(), '%Y-%m-%d 00:00:00') AND DATE_FORMAT(now(), '%Y-%m-%d 23:59:59') order by PKGES_CODIGO desc`;
    let [datasqlInteraccionesAbiertasBot] = await connMySQL.promise().query(sqlInteraccionesAbiertasBot);

    sqlOpcionesAgentes = `SELECT BTREE_TIPO_MSG FROM ${DB_NAME}.tbl_bot_tree WHERE BTREE_TEXTO like '%3009108496%'`;
    let [datasqlOpcionesAgentes] = await connMySQL.promise().query(sqlOpcionesAgentes);

    sqlArbol = `SELECT * FROM ${DB_NAME}.tbl_bot_tree  where BTREE_OPTION_NUM not like 'aviso'`;
    let [datasqlArbol] = await connMySQL.promise().query(sqlArbol);

    sqlOpcionPrimaria = `SELECT count(substring(OpcionArbol, 17, 1)) as cantidad, substring(OpcionArbol, 17, 1) as opcionPrimaria FROM ${DB_NAME}.view_chats_arbol where inicio between DATE_FORMAT(now(), '%Y-%m-%d 00:00:00') AND DATE_FORMAT(now(), '%Y-%m-%d 23:59:59') group by substring(OpcionArbol, 17, 1) order by substring(OpcionArbol, 17, 1) asc`;
    let [datasqlOpcionPrimaria] = await connMySQL.promise().query(sqlOpcionPrimaria);

    sqlOpcionSecundaria = `SELECT count(OpcionArbol) as cantidad, OpcionArbol as opcionSecundaria FROM ${DB_NAME}.view_chats_arbol where inicio between DATE_FORMAT(now(), '%Y-%m-%d 00:00:00') AND DATE_FORMAT(now(), '%Y-%m-%d 23:59:59') group by OpcionArbol order by OpcionArbol asc`;
    let [datasqlOpcionSecundaria] = await connMySQL.promise().query(sqlOpcionSecundaria);


    res.json({ datasqlInteraccionesBot, datasqlOpcionesAgentes, datasqlInteraccionesAbiertasBot, datasqlOpcionPrimaria, datasqlArbol, datasqlOpcionSecundaria });

  } catch (error) {
    console.log(`ERROR::`, error);
  }
});


router.post("/enviarMensajeAsesor", isSupervisorOrAdministrator, async (req, res) => {
  const nuevoMensajeAdminAgente =
  {
    FK_GES_CODIGO: req.body.data.codigoChat,
    MES_BODY: req.body.data.mensaje,
    MES_CHANNEL: "ADMIN",
    MES_USER: req.user.Usuario,
    MES_SMS_STATUS: 'received'
  }

  const sqlMensajeAdminAgente = `INSERT INTO ${DB_NAME}.tbl_messages SET ?`;
  await connMySQL.promise().query(sqlMensajeAdminAgente, [nuevoMensajeAdminAgente]);
  res.json("Recibido");
});

router.post("/cerrarSesionAgente", isSupervisorOrAdministrator, async (req, res) => {
  try {
    const { agentePrimaryKey, agenteNombre } = req.body;

    const sqlMensajeAdminAgente = `UPDATE ${DB_NAME}.tbl_usuarios SET USU_CAUXILIAR = 'DISCONNECTED' WHERE PKUSU_NCODIGO = ?`;
    await connMySQL.promise().query(sqlMensajeAdminAgente, [agentePrimaryKey]);
    await connMySQL.promise().query(`DELETE FROM ${DB_NAME}.sessions WHERE data like '%${agenteNombre}%'`);
    res.json({ result: 'OK' });
  } catch (error) {
    res.json({ result: 'ERROR' });
  }
});



module.exports = router;
