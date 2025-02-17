const fs = require('fs');
const path = require('path');
const passport = require("passport");
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../global.config.json')));
const { DB_NAME } = config.database;
const LocalStratregy = require("passport-local").Strategy;
const connMySQL = require("../../public/database");
const crypto = require('crypto');
const ActiveDirectory = require("activedirectory2").promiseWrapper;
const helpers = require("./helper");

// * logueo Local
passport.use("local.login", new LocalStratregy(
	  {
		usernameField: "username",
		passwordField: "password",
		passReqToCallback: true,
	  },
	  async (req, username, password, done) => {
		try {
  
		  // Busca si existe usuario en la base de datos
		  const sqlSelect = `SELECT * FROM ${DB_NAME}.tbl_usuarios WHERE USU_CUSUARIO_AD = ?`;
		  const [dataUserSQL] = await connMySQL.promise().query(sqlSelect, [username,]);

		  if (dataUserSQL.length > 0 && dataUserSQL[0].USU_CESTADO !== "ACTIVO") {
			return done(null, false, req.flash("messageError", "Usuario deshabilitado"));
		  }
		  else if (dataUserSQL.length > 0 && dataUserSQL[0].USU_CESTADO === "ACTIVO" && dataUserSQL[0].USU_CUSUARIO === username && dataUserSQL[0].USU_CPASSWORD === password) {
			const token = Math.round(Math.random() * 999999);
			const authToken = crypto.randomBytes(48).toString("hex");
			const tipoLogueo = "LOCAL";
			const dataNuevoEstado = {
			  USU_CAUXILIAR: "CONNECTED",
			  USU_TOKEN: token,
			  USU_AUTH_TOKEN: authToken,
			  USU_NCHATS: dataUserSQL[0].USU_NCHATS, // los que diga la DB
			  USU_TIPO_LOGUEO: tipoLogueo,
			};
  
			// Se actualiza el estado del usuario
			const sqlUpdate = `UPDATE ${DB_NAME}.tbl_usuarios SET ? WHERE PKUSU_NCODIGO = ?`;
			await connMySQL
			  .promise()
			  .query(sqlUpdate, [dataNuevoEstado, dataUserSQL[0].PKUSU_NCODIGO]);
  
			const user = {
			  Nombre: dataUserSQL[0].USU_CNOMBRE,
			  Documento: dataUserSQL[0].USU_CDOCUMENTO,
			  Usuario: dataUserSQL[0].USU_CUSUARIO,
			  Rol: dataUserSQL[0].USU_CROL,
			  Idioma: dataUserSQL[0].USU_CIDIOMA,
			  PKusu: dataUserSQL[0].PKUSU_NCODIGO,
			  ChatsNumber: dataUserSQL[0].USU_NCHATS,
			  authToken: authToken,
			  rrhh_id: `login_manual_${Date.now()}`,
			  idConversacion: `login_manual_${Date.now()}`,
			  idCampana: `login_manual_${Date.now()}`,
			  tipoLogueo,
			  idForm: "0",
			};
			return done(null, user, req.flash("messageSuccess", "Welcome"));
		  }
		  else{return done(null, false, req.flash("messageError", "Usuario no registrado en el sistema"));}
  
		  

		} catch (error) {
		  console.error("░░░▒▒▒▓▓▓ Error en passport local.login", error);
		  return done(error);
		}
	  }
	)
  );
  

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser(async (user, done) => {
	done(null, user);
})
