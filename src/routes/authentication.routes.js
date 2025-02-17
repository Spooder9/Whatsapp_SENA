const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../global.config.json')));
const { DB_NAME } = config.database;
const router = require("express").Router();
const passport = require("passport");
const connMySQL = require("../../public/database");
const { isNotLoggedIn } = require("../lib/auth");
const { isLoggedIn, error404 } = require('../lib/auth');

router.post("/preLogin", (req, res, next) => {
  passport.authenticate("local.login", {
    successRedirect: "/redirect",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/login", (req, res) => {
  if (req.user) return res.redirect("/redirect"); // por si ya se encuentra logueado

  res.render("auth/login", { title: "Login", login: true });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local.login", {
    successRedirect: "/redirect",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/redirect", isLoggedIn, (req, res, next) => {

  // console.log('---------------->', 'Estoy en /redirect - authentication.js y el user es', req.user);
  if (req.user.Rol == "SUPERVISOR" || req.user.Rol == "ADMINISTRADOR") {
    res.redirect("/dashboard");
  } else if (req.user.Rol == "AGENTE") {
    res.redirect("/mensajeria");
  }
});

router.get("/logout", isLoggedIn, async (req, res) => {

  const cambiarEstado =
  {
    USU_CAUXILIAR: "DISCONNECTED"
  }
  sqlCambiarEstado = `UPDATE ${DB_NAME}.tbl_usuarios SET ? WHERE PKUSU_NCODIGO = ?`;
  await connMySQL.promise().query(sqlCambiarEstado, [cambiarEstado, req.user.PKusu]);

  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

module.exports = router;
