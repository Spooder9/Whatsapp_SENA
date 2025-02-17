const Handlebars = require("handlebars");

Handlebars.registerHelper("isSupervisorOrAdministrator", (value) => {
  return (value === "ADMINISTRADOR" || value === "SUPERVISOR");
});

Handlebars.registerHelper("isAdministrador", (value) => {
  return value === "ADMINISTRADOR";
});

Handlebars.registerHelper("isSupervisor", (value) => {
  return value === "SUPERVISOR";
});

Handlebars.registerHelper("isAgente", (value) => {
  return value === "AGENTE";
});