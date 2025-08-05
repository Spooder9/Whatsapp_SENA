const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../global.config.json')));
const { DB_NAME } = config.database;
const router = require("express").Router();
const connMySQL = require("../../public/database");
const Class2 = require("../../public/Class2");
const { isSupervisorOrAdministrator } = require("../lib/auth");

router.get("/crearUsuario", isSupervisorOrAdministrator, async (req, res) => {
  res.render("app/crearUsuario", { title: "Crear usuario" });
});

router.post("/crearUsuario", isSupervisorOrAdministrator, async (req, res) => {
  try {
    // console.log("creaNDO USER",req.body)
    const { usuario_red, usuario_documento, usuario_rol, usuario_redUsuario } = req.body;

    const usuario_nombre = usuario_red.replace('.', ' ');

    const nuevoUsuario = {
      USU_CNOMBRE: usuario_redUsuario,
      USU_CDOCUMENTO: usuario_documento,
      USU_CROL: usuario_rol,
      USU_CUSUARIO: usuario_red,
      USU_CUSUARIO_AD: usuario_red,
      USU_CESTADO: "ACTIVO",
      USU_NCHATS: 30
    };

    const sqlNuevoUsuario = `INSERT INTO ${DB_NAME}.tbl_usuarios SET ?`;
    await connMySQL.promise().query(sqlNuevoUsuario, [nuevoUsuario]);

    req.flash("messageSuccess", `User created successfully`);
    res.redirect("/usuarios/crearUsuario");
  } catch (error) {
    console.log("ERROR::", error);
    if (error.message.includes("Duplicate entry")) {
      req.flash("messageError", `Error, User already exists`);
      res.redirect("/usuarios/crearUsuario");
    } else {
      req.flash("messageError", `Error, Please, try again`);
      res.redirect("/usuarios/crearUsuario");
    }
  }
});

router.get("/listarUsuarios", isSupervisorOrAdministrator, async (req, res) => {
  try {

    sqlListaUsuarios = `SELECT * FROM ${DB_NAME}.tbl_usuarios WHERE USU_CROL NOT LIKE 'ADMINISTRADOR' order by USU_CUSUARIO asc`;
    let [datasqlListaUsuarios] = await connMySQL.promise().query(sqlListaUsuarios);

    for (let i = 0; i < datasqlListaUsuarios.length; i++) {
      datasqlListaUsuarios[i].EnCrypt = Class2.Encrypt(`${datasqlListaUsuarios[i].PKUSU_NCODIGO}`);
    }

    res.render("app/listarUsuarios", { title: "listado usuarios", listaUsuarios: datasqlListaUsuarios });
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.get("/actualizarUsuario/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    sqlActualizarUsuario = `SELECT * FROM ${DB_NAME}.tbl_usuarios where PKUSU_NCODIGO = ?`;
    let [datasqlActualizarUsuario] = await connMySQL.promise().query(sqlActualizarUsuario, [id]);
    datasqlActualizarUsuario[0].EnCrypt = req.params.id;

    res.render("app/actualizarUsuario", { title: "Actualizar usuario", usuario: datasqlActualizarUsuario[0] });
  } catch (error) {
    console.log("ERROR::", error);
  }
});

router.post("/actualizarUsuario/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    var idEncrypt = req.params.id;
    let id = Class2.DeCrypt(req.params.id);

    const { usuario_red, usuario_documento, usuario_rol, usuario_nombreUsuario, usuario_estado, usuario_chats } = req.body;
    const usuario_nombre = usuario_red.replace('.', ' ');

    const modificarUsuario = {
      USU_CUSUARIO_AD: usuario_red,
      USU_CNOMBRE: usuario_nombreUsuario,
      USU_CDOCUMENTO: usuario_documento,
      USU_CROL: usuario_rol,
      USU_CUSUARIO: usuario_red,
      USU_CESTADO: usuario_estado,
      USU_NCHATS: usuario_chats
    };

    sqlModificarUsuario = `UPDATE ${DB_NAME}.tbl_usuarios SET ? where PKUSU_NCODIGO = ?`;
    await connMySQL.promise().query(sqlModificarUsuario, [modificarUsuario, id]);

    req.flash("messageSuccess", `User modified successfully`);
    res.redirect("/usuarios/listarUsuarios");
  } catch (error) {
    console.log("ERROR::", error);
    if (error.message.includes("Duplicate entry")) {
      req.flash("messageError", `Error, User already exists`);
      res.redirect("/usuarios/actualizarUsuario/" + idEncrypt);
    } else {
      req.flash("messageError", `Error, Please, try again`);
      res.redirect("/usuarios/actualizarUsuario/" + idEncrypt);
    }
  }
});

router.get("/eliminarUsuarios/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    sqlEliminarUsuario = `DELETE FROM ${DB_NAME}.tbl_usuarios where PKUSU_NCODIGO = ?`;
    await connMySQL.promise().query(sqlEliminarUsuario, [id]);
    res.json(true);
  } catch (error) {
    res.json(false);
    console.log("ERROR::", error);
  }
});

router.get("/disableUser/:id", isSupervisorOrAdministrator, async (req, res) => {
  try {
    let id = Class2.DeCrypt(req.params.id);
    sqlDisableUser = `UPDATE ${DB_NAME}.tbl_usuarios SET USU_CESTADO = 'NO ACTIVO' where PKUSU_NCODIGO = ?`;
    await connMySQL.promise().query(sqlDisableUser, [id]);
    res.json(true);
  } catch (error) {
    res.json(false);
    console.log("ERROR::", error);
  }
});

//Llamado por cualquiera cambiar password
router.post("/cambiarPassword", async (req, res) => {
  try {
    const { PKusu } = req.user;
    const { passwordActual, passwordNueva1 } = req.body;

    const cambiarPassword = {
      USU_CPASSWORD: passwordNueva1,
    };

    sqlCambiarPassword = `UPDATE ${DB_NAME}.tbl_usuarios SET ? where PKUSU_NCODIGO = ? and USU_CPASSWORD = ?`;
    await connMySQL
      .promise()
      .query(sqlCambiarPassword, [cambiarPassword, PKusu, passwordActual])
      .then((conn) => {
        if (conn[0].changedRows == 0) {
          throw "Contraseña incorrecta";
        }
      });

    if (req.user.Rol == "AGENTE") {
      req.flash("messageSuccess", `Password updated successfully`);
      res.redirect("/mensajeria");
    } else {
      req.flash("messageSuccess", `Password updated successfully`);
      res.redirect("/dashboard");
    }
  } catch (error) {
    if (req.user.Rol == "AGENTE") {
      req.flash("messageError", `An error occurred, wrong password`);
      res.redirect("/mensajeria");
    } else {
      req.flash("messageError", `An error occurred, wrong password`);
      res.redirect("/dashboard");
    }
  }
});

//Llamado por cualquiera para verificar si la session esta repetida
router.post("/verificarLogin", async (req, res) => {
  try {
    sqlVerificarLogin = `SELECT * FROM ${DB_NAME}.sessions WHERE session_id like ?`;
    let [datasqlVerificarLogin] = await connMySQL.promise().query(sqlVerificarLogin, [req.sessionID])
    if (datasqlVerificarLogin.length > 0) {
      res.json(true);
    }
    else {
      res.json(false);
    }
  } catch (error) {
    console.log("ERROR::" + error);
  }
});

router.post('/actualizar-actividad', async (req, res) => {
  const { PKusu } = req.user;

  try {
    const updateDatetimeActividad = `UPDATE ${DB_NAME}.tbl_usuarios SET USU_LAST_ACTIVITY = NOW() WHERE PKUSU_NCODIGO = ?`;
    await connMySQL.promise().query(updateDatetimeActividad, [PKusu]);

    res.json({ msg: 'ok' })
  } catch (error) {
    console.log('Error en ruta usuarios: /actualizar-actividad', error);
  }
});


const vigilaActividad = async () => {
  // vigila si su ultima interacción fue hace más de 5 minutos, si es así lo desconecta
  const selectUsers = `SELECT * FROM ${DB_NAME}.tbl_usuarios WHERE USU_CAUXILIAR != ? AND TIME_TO_SEC(TIMEDIFF(now(), USU_LAST_ACTIVITY)) > 300`;
  const [resSelectUsers] = await connMySQL.promise().query(selectUsers, ['DISCONNECTED']);

  if (resSelectUsers.length) {
    for (const key in resSelectUsers) {
      const OBJ_REGISTRO_DB = resSelectUsers[key];
      const { PKUSU_NCODIGO } = OBJ_REGISTRO_DB;
      const updateDisconnected = `UPDATE ${DB_NAME}.tbl_usuarios SET USU_CAUXILIAR = ? WHERE PKUSU_NCODIGO = ?`;
      const [resUpdateDisconnected] = await connMySQL.promise().query(updateDisconnected, ['DISCONNECTED', PKUSU_NCODIGO]);

      const deleteSession = `DELETE FROM ${DB_NAME}.sessions WHERE data LIKE '%"PKusu":${PKUSU_NCODIGO},%'`;
      await connMySQL.promise().query(deleteSession);
    }
  }
}

vigilaActividad();
/* setInterval(() => { vigilaActividad() }, 300000); */ // cada 5 minutos

module.exports = router;
