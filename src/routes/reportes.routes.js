const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../global.config.json')));
const { DB_NAME } = config.database;
const router = require("express").Router();
const connMySQL = require("../../public/database");
const { isSupervisorOrAdministrator } = require("../lib/auth");

router.get("/reporteInteracciones", isSupervisorOrAdministrator, async (req, res) => {

  sqlListaAgentes = `SELECT PKUSU_NCODIGO, USU_CUSUARIO  FROM ${DB_NAME}.tbl_usuarios where  USU_CROL like 'AGENTE'`;
  let [datasqlListaAgentes] = await connMySQL.promise().query(sqlListaAgentes);

  res.render("app/reporteInteracciones", { title: "Reporte interacciones", datasqlListaAgentes });
});

router.get("/reporteAgentes", isSupervisorOrAdministrator, async (req, res) => {

  sqlListaAgentes = `SELECT PKUSU_NCODIGO, USU_CUSUARIO  FROM ${DB_NAME}.tbl_usuarios where  USU_CROL like 'AGENTE'`;
  let [datasqlListaAgentes] = await connMySQL.promise().query(sqlListaAgentes);

  res.render("app/reporteAgentes", { title: "Reporte agentes", datasqlListaAgentes });
});


router.post("/getReporteAgentes", isSupervisorOrAdministrator, async (req, res) => {
  if (req.body.data.listaAgentes != 0) {
    fechaInicial = req.body.data.fechaInicial + " 00:00:00"
    fechaFinal = req.body.data.fechaFinal + " 23:59:59"

    sqlReporteEstadoAgentes = `SELECT * FROM ${DB_NAME}.tbl_registro_usuarios WHERE (REGU_FECHA_INICIO BETWEEN ? AND ?) AND FKREGU_PKUSU_NCODIGO = ?`;
    let [datasqlReporteEstadoAgentes] = await connMySQL.promise().query(sqlReporteEstadoAgentes, [fechaInicial, fechaFinal, req.body.data.listaAgentes]);

    res.json(datasqlReporteEstadoAgentes);
  } else {

    fechaInicial = req.body.data.fechaInicial + " 00:00:00"
    fechaFinal = req.body.data.fechaFinal + " 23:59:59"

    sqlReporteEstadoAgentes = `SELECT * FROM ${DB_NAME}.tbl_registro_usuarios WHERE (REGU_FECHA_INICIO BETWEEN ? AND ?) ORDER BY REGU_CUSUARIO`;
    let [datasqlReporteEstadoAgentes] = await connMySQL.promise().query(sqlReporteEstadoAgentes, [fechaInicial, fechaFinal]);

    res.json(datasqlReporteEstadoAgentes);
  }
});


// ! ================================================================================================================================================
// !                                                           CONSULTAR REPORTE DE TIPIFICACIONES
// ! ================================================================================================================================================
router.post("/getReporteInteracciones", isSupervisorOrAdministrator, async (req, res) => {
  // * OBTENGO LA DATA
  const fecha_inicial = req.body.data.fechaInicial + " 00:00:00";
  const fecha_final = req.body.data.fechaFinal + " 23:59:59";
  sqlRepoteInteracciones = `SELECT * FROM ${DB_NAME}.tbl_typifications WHERE (TYP_CFECHA_REGISTRO BETWEEN ? AND ?);`;
  let [datasqlRepoteInteracciones] = await connMySQL.promise().query(sqlRepoteInteracciones, [fecha_inicial, fecha_final]);

  res.json(datasqlRepoteInteracciones);
});

router.post("/getInteraccion", isSupervisorOrAdministrator, async (req, res) => {

  sqlGetInteraccion = `SELECT MES_BODY, MES_CHANNEL, MES_MEDIA_TYPE, MES_MEDIA_URL, MES_MESSAGE_ID, MES_CREATION_DATE, MES_USER, MES_AUTHOR FROM ${DB_NAME}.tbl_messages WHERE FK_GES_CODIGO = ? order by MES_CREATION_DATE asc`;
  let [datasqlGetInteraccion] = await connMySQL.promise().query(sqlGetInteraccion, [req.body.data]);

  res.json(datasqlGetInteraccion);
});

//llamado por USU_CROL "USUARIO"
router.post("/getInteraccionesPorUsuario", async (req, res) => {

  sqlReporteInteraccionesPorUsuario = `SELECT * FROM ${DB_NAME}.view_reporte_interacciones where PKUSU_NCODIGO = ? AND (fechaFin between DATE_FORMAT(now(), '%Y-%m-%d 00:00:00' ) AND DATE_FORMAT(now(), '%Y-%m-%d 23:59:59' ))`;

  let [datasqlReporteInteraccionesPorUsuario] = await connMySQL.promise().query(sqlReporteInteraccionesPorUsuario, [req.user.PKusu]);

  console.log(datasqlReporteInteraccionesPorUsuario)
  res.json(datasqlReporteInteraccionesPorUsuario);
});

router.get('/reporte-gestiones', isSupervisorOrAdministrator, async (req, res) => {
  res.render("app/reporteGestiones", { title: "Reporte gestiones" });
});

router.post('/reporte-gestiones', async (req, res) => {

  const { fechaInicial, fechaFinal, noDocumento } = req.body;
  let stringSQL = '';

  if (fechaInicial.length && fechaFinal.length === 0) return res.json({ msg: 'Indique fecha final', data: [] });

  if (fechaFinal.length && fechaInicial.length === 0) return res.json({ msg: 'Indique fecha inicial', data: [] });

  if (!fechaFinal.length && !fechaInicial.length && !noDocumento.length) return res.json({ msg: 'Indique algún parámetro', data: [] });

  if (fechaFinal.length && fechaInicial.length && noDocumento.length === 0) {
    // solo se busca fechas rangos
    stringSQL = `GES_CHORA_INICIO_GESTION BETWEEN '${fechaInicial} 00:00:00' AND '${fechaFinal} 23:59:59'`;
  }

  if (fechaFinal.length === 0 && fechaInicial.length === 0 && noDocumento.length) {
    // solo busca por documento
    stringSQL = `GES_DOCUMENTO_PACIENTE = '${noDocumento.trim()}'`;
  }

  if (fechaFinal.length && fechaInicial.length && noDocumento.length) {
    // Se busca por todos
    stringSQL = `GES_CHORA_INICIO_GESTION BETWEEN '${fechaInicial} 00:00:00' AND '${fechaFinal} 23:59:59' AND GES_DOCUMENTO_PACIENTE = '${noDocumento.trim()}'`;
  }

  const sqlSelect = `SELECT * FROM ${DB_NAME}.tbl_chats_management WHERE ${stringSQL}`;
  let [resSqlSelect] = await connMySQL.promise().query(sqlSelect);

  if (resSqlSelect.length === 0) {
    return res.json({ msg: 'No se encontraron registros', data: [] });
  }

  if (resSqlSelect.length) {
    res.json({ msg: '', data: resSqlSelect })
  }
});

module.exports = router;
