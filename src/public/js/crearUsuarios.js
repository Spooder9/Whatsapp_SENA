document.addEventListener("DOMContentLoaded", () => {
  $("select").formSelect();
  const usuario_nombre = document.getElementById("usuario_nombre");
  inputsMayus([usuario_nombre]);

  const usuario_documento = document.getElementById("usuario_documento");
  inputsMayus([usuario_documento]);

  const usuario_nombreUsuario = document.getElementById("usuario_redUsuario");
  inputsMayus([usuario_nombreUsuario]);

  const usuario_emailUsuario = document.getElementById("usuario_emailUsuario");
  inputsMayus([usuario_emailUsuario]);
});
