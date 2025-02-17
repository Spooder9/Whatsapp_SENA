/*==================== SHOW NAVBAR ====================*/
const showMenu = (headerToggle, navbarId) => {
  const toggleBtn = document.getElementById(headerToggle),
    nav = document.getElementById(navbarId);

  // Validate that variables exist
  if (headerToggle && navbarId && toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      // We add the show-menu class to the div tag with the nav__menu class
      nav.classList.toggle("show-menu");
      // change icon
      toggleBtn.classList.toggle("bx-x");
    });
  }
};
showMenu("header-toggle", "navbar");

/*==================== LINK ACTIVE ====================*/
const linkColor = document.querySelectorAll(".nav__link");

function colorLink() {
  linkColor.forEach((l) => l.classList.remove("active"));
  this.classList.add("active");
}

linkColor.forEach((l) => l.addEventListener("click", colorLink));

/*==================== MODAL CAMBIAR PASS ====================*/

// document.getElementById("btnCambiarPassword").addEventListener("click", function(event){
//   event.preventDefault()
//   passwordActual = document.getElementById("passwordActual").value;
//   passwordNueva1 = document.getElementById("passwordNueva1").value;
//   passwordNueva2 = document.getElementById("passwordNueva2").value;

//   if (passwordNueva1 != passwordNueva2){
//     alertaSwal.fire({
//       icon: 'error',
//       title: "La contraseña nueva debe ser igual en los dos campos"
//     });
//   }else if(passwordNueva1 == "" || passwordActual == "" || passwordNueva2 == ""){
//     alertaSwal.fire({
//       icon: 'error',
//       title: "Los campos no pueden estar vacios"
//     });
//   }else{
//     document.forms["formCambiarPassword"].submit();
//   }
//   document.getElementById("passwordActual").value = "";
//   document.getElementById("passwordNueva1").value = "";
//   document.getElementById("passwordNueva2").value = "";

// });

/*==================== MODAL MIS ESTADISTICAS ====================*/
try {
  document.getElementById("misEstadisticas").addEventListener("click", async function (e) {
    let interacciones = await postData("/reportes/getInteraccionesPorUsuario");
    bodyChatsAtendidos = "";
    if (interacciones.length > 0) {
      document.getElementById("chatsAtendidos").innerHTML = interacciones.length;
      let hora = 0;
      let minuto = 0;
      let segundo = 0;
      let totalSegundos = 0;

      interacciones.forEach((chat) => {
        bodyChatsAtendidos += "<tr>";
        bodyChatsAtendidos += "<td>" + chat.cliente + "</td>";
        bodyChatsAtendidos += "<td>" + chat.tipificacion + "</td>";
        bodyChatsAtendidos += "<td>" + chat.fechaInicio + "</td>";
        bodyChatsAtendidos += "<td>" + chat.fechaFin + "</td>";
        bodyChatsAtendidos += "<td>" + chat.tiempo + "</td>";
        bodyChatsAtendidos += "</tr>";

        hora += parseInt(chat.tiempo.split(":")[0]);
        minuto += parseInt(chat.tiempo.split(":")[1]);
        segundo += parseInt(chat.tiempo.split(":")[2]);
      })
      totalSegundos = (hora * 60 * 60) + (minuto * 60) + (segundo)
      document.getElementById("tiempoPromedio").innerHTML = secondsToString(totalSegundos / interacciones.length);
    } else {
      document.getElementById("chatsAtendidos").innerHTML = 0;
      document.getElementById("tiempoPromedio").innerHTML = 0;

      bodyChatsAtendidos += "<tr>";
      bodyChatsAtendidos += "<td> No data</td>";
      bodyChatsAtendidos += "<td> No data</td>";
      bodyChatsAtendidos += "<td> No data</td>";
      bodyChatsAtendidos += "<td> No data</td>";
      bodyChatsAtendidos += "<td> No data</td>";
      bodyChatsAtendidos += "</tr>";
    }
    document.getElementById("bodyChatsAtendidos").innerHTML = bodyChatsAtendidos;
  })
} catch (error) {
  console.log("No es Agente: " + error);
}

