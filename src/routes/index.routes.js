const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../global.config.json')));
const { DB_NAME } = config.database;
const connMySQL = require('../../public/database');
const router = require("express").Router();
const { isSupervisorOrAdministrator, isSupervisor} = require("../lib/auth");


router.get("/", (req, res) => {
  res.redirect("/login");
});

router.post("/cambiarIdioma", async (req, res) => {
  try {
    let id = req.user.PKusu;
    const modificarIdioma = {
      USU_CIDIOMA: req.body.currentLanguage,
    }
    sqlCambiarIdioma = `UPDATE ${DB_NAME}.tbl_usuarios SET ? where PKUSU_NCODIGO = ?`;
    await connMySQL.promise().query(sqlCambiarIdioma, [modificarIdioma, id]);

  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.get('/select/tipificacion', async (req, res) => {
  try {
    const categoria = req.query.categoria;

    const sql = `SELECT OP_ID, OP_OPCION FROM ${DB_NAME}.tbl_opt_select WHERE OP_CATEGORIA = ? AND OP_ESTADO = ? ORDER BY OP_OPCION`;
    const [rows] = await connMySQL.promise().query(sql, [categoria, 'Activo']);
    res.json(rows);

  } catch (error) {
    console.log("ERROR::", error);
  }

});


router.get('/viewQR', isSupervisorOrAdministrator, (req, res) => {
  res.render('app/viewQR');
});


router.get('/QR', isSupervisorOrAdministrator, async (req, res) => {
  try {
    let data 
    const sql = `SELECT LIPR_QR_STATUS, LIPR_QR_STRING FROM ${DB_NAME}.tbl_line_profiling WHERE PKLIPR_NCODE = ?`;
    const [rows] = await connMySQL.promise().query(sql, ['1']);
    // console.log(rows, typeof (rows),rows.length)
    // console.log("llega a get qr", rows[0].LIPR_QR_STATUS, rows[0].LIPR_QR_STATUS)
    if (rows.length > 0) {
      if (rows[0].LIPR_QR_STATUS == "SOLICITANDO" || rows[0].LIPR_QR_STATUS =="INICIANDO") {
        data = { "qr": rows[0].LIPR_QR_STRING ,"state": rows[0].LIPR_QR_STATUS}
        res.json(data);
      } else if (rows[0].LIPR_QR_STATUS == "EMPAREJADO") {
        data = { "qr": "conectado" ,"state": rows[0].LIPR_QR_STATUS}
        res.json(data)

      }else{
        if (rows[0].LIPR_QR_STRING == null){
          data = { "qr": '',"state": rows[0].LIPR_QR_STATUS }
        }else{
          data = { "qr": rows[0].LIPR_QR_STRING,"state": rows[0].LIPR_QR_STATUS }
        }
        
        res.json(data)

      }
    }
  } catch (error) {
    console.log("ERROR::", error);
  }
});
module.exports = router;
