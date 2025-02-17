const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../global.config.json')));
const { DB_NAME } = config.database;
const router = require('express').Router();
const connMySQL = require('../../public/database');
const Class2 = require('../../public/Class2');
const { isSupervisorOrAdministrator } = require("../lib/auth");
const tabla_arbol = "tbl_bot_tree"

router.get("/arbolBot", isSupervisorOrAdministrator, async (req, res) => {
  try {
    const sqlArbol = `SELECT * FROM ${DB_NAME}.${tabla_arbol} WHERE BTREE_ESTADO='Activo'`;
    connMySQL.promise()
      .query(sqlArbol)
      .then(([resultArbol, fields]) => {
        for (let i = 0; i < resultArbol.length; i++) {
          resultArbol[i].EnCrypt = Class2.EnCrypt(`${resultArbol[i].PKBTREE_NCODIGO}`);
        }

        res.render("app/arbolBot", { title: "Árbol BOT", arbol: resultArbol });
      })
  } catch (error) {
    console.log("ERROR::", error);
  }


});

router.get("/actualizarTextoGuionBOT/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    console.log('id', id);
    const sqlTextoGuion = `SELECT * FROM ${DB_NAME}.${tabla_arbol} WHERE PKBTREE_NCODIGO=?`;
    connMySQL.promise()
      .query(sqlTextoGuion, id)
      .then(([resultTextoGuion, fields]) => {
        console.log('resultTextoGuion', resultTextoGuion);

        res.render("app/actualizarTextoGuionBOT", { title: "Editar Texto Guion BOT", texto: resultTextoGuion[0], idTextEncrypt: req.params.id });
      })
  } catch (error) {
    console.log("ERROR::", error);
  }


});

router.post("/actualizarTextoGuionBOT", isSupervisorOrAdministrator, async (req, res) => {
  try {

    const { idText, textoBot } = req.body;
    let id = Class2.DeCrypt(idText);
    console.log("entro", id);
    console.log("textoBot", textoBot);

    const updateTextBot = {
      BTREE_TEXTO: textoBot,
    };

    const sqlTextoGuion = `UPDATE ${DB_NAME}.${tabla_arbol} SET ?  WHERE PKBTREE_NCODIGO=?`;
    await connMySQL.promise().query(sqlTextoGuion, [updateTextBot, id]);

    // req.flash("messageSuccess", `Text modified successfully`);
    // res.redirect("/textoBot/arbolBot");
    res.json('ok')
  } catch (error) {
    console.log("ERROR:", error);
  }

});



module.exports = router;
