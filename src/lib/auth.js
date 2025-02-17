module.exports = {
  isLoggedIn(req, res, next) {
    // * Valida si esta logeado, de lo contrario manda al Login
    if (req.isAuthenticated()) {
      return next();
    } else {
      return res.redirect("/login");
    }
  },
  isNotLoggedIn(req, res, next) {
    // * SI ya esta logeado y va al Login lo manda al Inicio    
    if (!req.isAuthenticated()) {
      return next();
    } else {
      return res.redirect("/redirect");
    }
  },

  // Si la pagina no existe lo manda por defecto a error404
  error404(req, res) {
    res.status(404).render("auth/err404", { err404: true, title: "Error 404" });
  },


  isSupervisorOrAdministrator(req, res, next) {
    let rol = req.user.Rol;
    if (rol === "ADMINISTRADOR" || rol === "SUPERVISOR") {
      next();
    } else {
      res.status(401).render("auth/accessDenied", { title: "Accesso denegado" });
    }
  },

  isAdministrator(req, res, next) {
    let rol = req.user.Rol;
    if (rol === "ADMINISTRADOR") {
      next();
    } else {
      res.status(401).render("auth/accessDenied", { title: "Accesso denegado" });
    }
  },

  isSupervisor(req, res, next) {
    let rol = req.user.Rol;
    if (rol === "SUPERVISOR") {
      next();
    } else {
      res.status(401).render("auth/accessDenied", { title: "Accesso denegado" });
    }
  },

  isAgente(req, res, next) {
    let rol = req.user.Rol;
    if (rol === "AGENTE") {
      next();
    } else {
      res.status(401).render("auth/accessDenied", { title: "Accesso denegado" });
    }
  },
};