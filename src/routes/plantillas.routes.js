const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../global.config.json')));
const { DB_NAME } = config.database;
const router = require("express").Router();
const connMySQL = require("../../public/database");
const Class2 = require("../../public/Class2");
const { isSupervisorOrAdministrator } = require("../lib/auth");

router.get("/crearPlantilla", isSupervisorOrAdministrator, async (req, res) => {
  res.render("app/crearPlantilla", { title: "Crear plantilla" });
});

router.get("/listarPlantillas", isSupervisorOrAdministrator, async (req, res) => {
  try {
    sqlListaPlantillas = `SELECT * FROM ${DB_NAME}.tbl_plantillas`;
    let [datasqlListaPlantillas] = await connMySQL.promise().query(sqlListaPlantillas);

    for (let i = 0; i < datasqlListaPlantillas.length; i++) {
      datasqlListaPlantillas[i].EnCrypt = Class2.Encrypt(`${datasqlListaPlantillas[i].PKPLA_NCODIGO}`);
    }

    res.render("app/listarPlantillas", { title: "listado plantillas", listaPlantillas: datasqlListaPlantillas });
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.get("/actualizarPlantilla/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    sqlActualizarPlantilla = `SELECT * FROM ${DB_NAME}.tbl_plantillas where PKPLA_NCODIGO = ?`;
    let [datasqlActualizarPlantilla] = await connMySQL.promise().query(sqlActualizarPlantilla, [id]);
    datasqlActualizarPlantilla[0].EnCrypt = req.params.id;

    res.render("app/actualizarPlantilla", { title: "Actualizar plantilla", plantilla: datasqlActualizarPlantilla[0] });
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.post("/actualizarPlantilla/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    console.log("entro");
    const { plantilla_nombre, plantilla_contenido } = req.body;

    const modificarPlantilla = {
      PLA_CNOMBRE: plantilla_nombre,
      PLA_CCONTENIDO: plantilla_contenido,
    };

    sqlModificarPlantilla = `UPDATE ${DB_NAME}.tbl_plantillas SET ? where PKPLA_NCODIGO = ?`;
    await connMySQL.promise().query(sqlModificarPlantilla, [modificarPlantilla, id]);

    req.flash("messageSuccess", `Template modified successfully`);
    res.redirect("/plantillas/listarPlantillas");
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.get("/eliminarPlantilla/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    sqlEliminarPlantilla = `DELETE FROM ${DB_NAME}.tbl_plantillas where PKPLA_NCODIGO = ?`;
    await connMySQL.promise().query(sqlEliminarPlantilla, [id]);
    res.json(true);
  } catch (error) {
    res.json(false);
    console.log("ERROR::", error);
  }
});

router.post("/crearPlantilla", isSupervisorOrAdministrator, async (req, res) => {
  try {
    const { plantilla_nombre, plantilla_contenido } = req.body;

    const nuevaPlantilla = {
      PLA_CNOMBRE: plantilla_nombre,
      PLA_CCONTENIDO: plantilla_contenido,
    };

    const sqlNuevaPlantilla = `INSERT INTO ${DB_NAME}.tbl_plantillas SET ?`;
    await connMySQL.promise().query(sqlNuevaPlantilla, [nuevaPlantilla]);

    req.flash("messageSuccess", `Template registered successfully`);
    res.redirect("/plantillas/crearPlantilla");
  } catch (error) {
    console.log("ERROR::", error);
    req.flash("messageError", `error, Please, try again`);
    res.redirect("/plantillas/crearPlantilla");
  }
});


//llamado por USU_CROL "USUARIO"
router.post("/getPlantillas", async (req, res) => {
  try {
    const sqlGetPlantillas = `SELECT * FROM ${DB_NAME}.tbl_plantillas`;
    let [datasqlGetPlantillas] = await connMySQL.promise().query(sqlGetPlantillas);

    res.json(datasqlGetPlantillas);
  } catch (error) {
    console.log("ERROR::", error);
  }
});
//llamado por USU_CROL "USUARIO"
router.post("/getPlantilla", async (req, res) => {
  try {
    const { PKPLA_NCODIGO } = req.body;

    const sqlGetPlantilla = `SELECT plantilla_contenido FROM ${DB_NAME}.tbl_plantillas where PKPLA_NCODIGO = ?`;
    let [datasqlGetPlantilla] = await connMySQL.promise().query(sqlGetPlantilla, [PKPLA_NCODIGO]);

    res.json(datasqlGetPlantilla[0]);
  } catch (error) {
    console.log("ERROR::", error);
  }
});

module.exports = router;
