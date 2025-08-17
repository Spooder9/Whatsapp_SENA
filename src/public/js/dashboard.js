document.addEventListener("DOMContentLoaded", () => {
  inicio();

  // ! ============================================================================================================================================================
  // !                                                     MODULO ACTUALIZACION DASHBOARD
  // ! ============================================================================================================================================================
  function actualizarDashboard() {
    return new Promise((resolve) => {
      getData("/dashboard/actualizarDashboard").then((res) => {

        document.getElementById("clientesTotal").innerHTML = res.datasqlChatsEstado[0].totalChats;

        // TODO: =============================================================================================
        // TODO:                              TABLA CHATS INDIVIDUALES
        // TODO: =============================================================================================
        bodyChatsActivos = "";
        if (res.datasqlChatsActivos.length > 0) {

          res.datasqlChatsActivos.forEach((chat) => {
            tiempoAmarilloEnviado = false;
            tiempoRojoEnviado = false;
            tiempoAzulEnviado = false;

            tiempoAmarilloRecibido = false;
            tiempoRojoRecibido = false;
            tiempoAzulRecibido = false;

            tiempoAmarilloEsperaASA = false;
            tiempoRojoEsperaASA = false;

            tiempoAmarilloAgenteASA = false;
            tiempoRojoAgenteASA = false;

            bodyChatsActivos += "<tr>";
            bodyChatsActivos += `<td> ${chat.cliente} </td>`;
            bodyChatsActivos += "<td>" + chat.fecha + "</td>";
            bodyChatsActivos += `<td class='center'> <div ${tiempoRojoRecibido ? 'class="tiempoRojo"' : tiempoAmarilloRecibido ? 'class="tiempoAmarillo"' : tiempoAzulRecibido ? 'class="tiempoAzul"' : 'class="tiempoVerde"'} > ${chat.tiempoUltimoRecibido} </div></td>`;
            bodyChatsActivos += `<td class='center'> <div ${tiempoRojoEnviado ? 'class="tiempoRojo"' : tiempoAmarilloEnviado ? 'class="tiempoAmarillo"' : tiempoAzulEnviado ? 'class="tiempoAzul"' : 'class="tiempoVerde"'} > ${chat.tiempoUltimoEnviado} </div></td>`;
            bodyChatsActivos += "<td class='center'>" + chat.tiempoTotal + "</td>";
            bodyChatsActivos += `<td class='center'>
           <a id='cerrarChat' href='javascript:void(0);' verChat='${chat.idchat}' numeroCliente="${chat.cliente}"> <i class='material-icons'>cancel</i></a>
           </td>`;
            bodyChatsActivos += "</tr>";
          });
        } else {
          bodyChatsActivos += "<tr>";
          bodyChatsActivos += "<td> No data </td>";
          bodyChatsActivos += "<td> No data </td>";
          bodyChatsActivos += "<td> No data </td>";
          bodyChatsActivos += "<td> No data </td>";
          bodyChatsActivos += "<td> No data </td>";
          bodyChatsActivos += "<td> No data </td>";
          bodyChatsActivos += "</tr>";
        }
        document.getElementById("bodyChatsEspera").innerHTML = bodyChatsActivos;

        //VER CHAT ONLINE
        document.querySelectorAll("a#verChatOnline").forEach((botonVerChat) => {
          botonVerChat.addEventListener("click", async function (e) {
            e.preventDefault(); // Prevenir comportamiento por defecto del enlace

            try {
              // Inicializar el modal manualmente si Materialize no lo detecta
              const modal = document.getElementById('modalVerChat');
              const instance = M.Modal.getInstance(modal);
              if (!instance) {
                M.Modal.init(modal);
              }

              //Fix Modal duplicate events ver chat online
              document.getElementById("divFooterModalVerChat").innerHTML = `<input type="text" placeholder="" id="inputEnviarMensajeAgente" class="col s7  ml-2 message mb-0">
      <a class="col s2 ml-2 btn waves-effect waves-light send center" id="enviarMensajeAsesor"><span data-i18n="Enviar">Enviar</span></a>
      <a class="col s2 ml-2 modal-action modal-close waves-effect waves-light btn border-round red center"
          id="cerrarModalVerChat"><span data-i18n="Cerrar">Cerrar</span></a>`
              //Fin fix modal duplicate eventsver chat online

              // Verificar que el placeholder element existe antes de acceder
              const placeholderElement = document.querySelector('[data-i18n="Escribe un mensaje para el agente"]');
              const inputElement = document.querySelector("#modalVerChat > div.modal-footer > input");

              if (placeholderElement && inputElement) {
                inputElement.placeholder = placeholderElement.textContent;
              }
              // fin traduccion

              let codigoChat = this.getAttribute("verChat");
              let cliente = this.getAttribute("cliente");
              let agente = this.getAttribute("agente");

              let chat = "";
              document.getElementById("contenedorChat").innerHTML = "Cargando mensajes...";

              // Abrir el modal manualmente
              const modalInstance = M.Modal.getInstance(modal);
              modalInstance.open();

              let interaccion = await postData("/reportes/getInteraccion", { data: codigoChat });
              let cantidadChats = interaccion.length;

              let arrImgTypes = ['jpeg', 'png', 'webp', 'jpg'],
                arrVideoTypes = ['mp4'],
                arrDocsTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xlx', 'xlxs', 'txt', 'csv'];

              interaccion.forEach((element) => {
                let isFileImg = false,
                  isFileDoc = false,
                  isFileVideo = false,
                  isFileAudio = false;

                if (Boolean(element.MES_MEDIA_TYPE) && element.MES_MEDIA_TYPE != "Null" && element.MES_MEDIA_TYPE != "None") {

                  if (arrImgTypes.includes(element.MES_MEDIA_TYPE)) isFileImg = true;
                  if (arrDocsTypes.includes(element.MES_MEDIA_TYPE)) isFileDoc = true;
                  if (arrVideoTypes.includes(element.MES_MEDIA_TYPE)) isFileVideo = true;
                  if (element.MES_MEDIA_TYPE.includes('ogg')) isFileAudio = true;

                  if (element.MES_CHANNEL == "RECEIVED") {
                    if (isFileImg) element.MES_BODY = `<img class="imgChatReceive" src="${element.MES_MESSAGE_ID}.${element.MES_MEDIA_TYPE}"> ${element.MES_BODY}`;
                    if (isFileDoc) element.MES_BODY = `<a target="_blank" href="${element.MES_MESSAGE_ID}.${element.MES_MEDIA_TYPE}"> <b>File <i class="bx bx-file"></i></b></a> ${element.MES_BODY}`;
                    if (isFileVideo) element.MES_BODY = `<video class="imgChatReceive" src="${element.MES_MESSAGE_ID}.${element.MES_MEDIA_TYPE}" type="audio/mp3" controls></video> ${element.MES_BODY}`;
                    if (isFileAudio) element.MES_BODY = `<audio src="${element.MES_MESSAGE_ID}.${element.MES_MEDIA_TYPE}" type="audio/mp3" controls></audio> ${element.MES_BODY}`;
                  }
                  else if (element.MES_CHANNEL == "SEND") {
                    if (isFileImg) element.MES_BODY = `<img class="imgChatReceive" src="${element.MES_MEDIA_URL}"> ${element.MES_BODY}`;
                    if (isFileDoc) element.MES_BODY = `<a target="_blank" href="${element.MES_MEDIA_URL}"> <b>File <i class="bx bx-file"></i></b></a> ${element.MES_BODY}`;
                    if (isFileVideo) element.MES_BODY = `<video class="imgChatReceive" src="${element.MES_MEDIA_URL}" type="audio/mp3" controls></video> ${element.MES_BODY}`;
                    if (isFileAudio) element.MES_BODY = `<audio src="${element.MES_MEDIA_URL}" type="audio/mp3" controls></audio> ${element.MES_BODY}`;
                  }
                }

                if (element.MES_CHANNEL == "RECEIVED") {
                  chat += ` 
          <div>
            <div class="col s9 mt-1 mb-1 chatRecibido">
              <p class="left">${element.MES_AUTHOR} - ${element.MES_CREATION_DATE} :</p>
              <br>
              <p class="left">${element.MES_BODY}</p>
            </div>
          </div>
          `;
                } else if (element.MES_CHANNEL == "SEND") {
                  chat += ` 
          <div>
            <div class="col s9 offset-s3 mt-1 mb-1 chatEnviado">
              <p class="left">${element.MES_AUTHOR} - ${element.MES_CREATION_DATE} :</p>
              <br>
              <p class="left">${element.MES_BODY}</p>
            </div>
          </div>
          `;
                } else if (element.MES_CHANNEL == "ADMIN") {
                  chat += ` 
          <div>
            <div class="col s9 mt-1 mb-1 chatRecibidoAdmin">
              <p class="left">${element.MES_USER}  - ${element.MES_CREATION_DATE} :</p>
              <br>
              <p class="left">${element.MES_BODY}</p>
            </div>
          </div>
          `;
                }
              });
              document.getElementById("contenedorChat").innerHTML = chat;

              let intervaloconsultarmensajes = setInterval(async function () {
                let interaccion = await postData("/reportes/getInteraccion", { data: codigoChat });

                if (interaccion.length == cantidadChats) {
                  return;
                }

                cantidadChats += 1;
                let nuevoMensaje = interaccion.at(-1);

                isFileImg = false;
                isFileDoc = false;
                isFileVideo = false;
                isFileAudio = false;

                if (Boolean(nuevoMensaje.MES_MEDIA_TYPE) && nuevoMensaje.MES_MEDIA_TYPE != "Null" && nuevoMensaje.MES_MEDIA_TYPE != "None") {

                  if (arrImgTypes.includes(nuevoMensaje.MES_MEDIA_TYPE)) isFileImg = true;
                  if (arrDocsTypes.includes(nuevoMensaje.MES_MEDIA_TYPE)) isFileDoc = true;
                  if (arrVideoTypes.includes(nuevoMensaje.MES_MEDIA_TYPE)) isFileVideo = true;
                  if (nuevoMensaje.MES_MEDIA_TYPE.includes('ogg')) isFileAudio = true;

                  if (nuevoMensaje.MES_CHANNEL == "RECEIVED") {
                    if (isFileImg) nuevoMensaje.MES_BODY = `<img class="imgChatReceive" src="${nuevoMensaje.MES_MESSAGE_ID}.${nuevoMensaje.MES_MEDIA_TYPE}"> ${nuevoMensaje.MES_BODY}`;
                    if (isFileDoc) nuevoMensaje.MES_BODY = `<a target="_blank" href="${nuevoMensaje.MES_MESSAGE_ID}.${nuevoMensaje.MES_MEDIA_TYPE}"> <b>File <i class="bx bx-file"></i></b></a> ${nuevoMensaje.MES_BODY}`;
                    if (isFileVideo) nuevoMensaje.MES_BODY = `<video class="imgChatReceive" src="${nuevoMensaje.MES_MESSAGE_ID}.${nuevoMensaje.MES_MEDIA_TYPE}" type="audio/mp3" controls></video> ${nuevoMensaje.MES_BODY}`;
                    if (isFileAudio) nuevoMensaje.MES_BODY = `<audio src="${nuevoMensaje.MES_MESSAGE_ID}.${nuevoMensaje.MES_MEDIA_TYPE}" type="audio/mp3" controls></audio> ${nuevoMensaje.MES_BODY}`;
                  }
                  else if (nuevoMensaje.MES_CHANNEL == "SEND") {
                    if (isFileImg) nuevoMensaje.MES_BODY = `<img class="imgChatReceive" src="${nuevoMensaje.MES_MEDIA_URL}"> ${nuevoMensaje.MES_BODY}`;
                    if (isFileDoc) nuevoMensaje.MES_BODY = `<a target="_blank" href="${nuevoMensaje.MES_MEDIA_URL}"> <b>File <i class="bx bx-file"></i></b></a> ${nuevoMensaje.MES_BODY}`;
                    if (isFileVideo) nuevoMensaje.MES_BODY = `<video class="imgChatReceive" src="${nuevoMensaje.MES_MEDIA_URL}" type="audio/mp3" controls></video> ${nuevoMensaje.MES_BODY}`;
                    if (isFileAudio) nuevoMensaje.MES_BODY = `<audio src="${nuevoMensaje.MES_MEDIA_URL}" type="audio/mp3" controls></audio> ${nuevoMensaje.MES_BODY}`;
                  }
                }

                if (nuevoMensaje.MES_CHANNEL == "RECEIVED") {
                  chat += ` 
          <div>
            <div class="col s9 mt-1 mb-1 chatRecibido">
              <p class="left">${cliente} - ${nuevoMensaje.MES_CREATION_DATE} :</p>
              <br>
              <p class="left">${nuevoMensaje.MES_BODY}</p>
            </div>
          </div>
          `;
                } else if (nuevoMensaje.MES_CHANNEL == "SEND") {
                  chat += ` 
          <div>
            <div class="col s9 offset-s3 mt-1 mb-1 chatEnviado">
              <p class="left">${nuevoMensaje.MES_USER} - ${nuevoMensaje.MES_CREATION_DATE} :</p>
              <br>
              <p class="left">${nuevoMensaje.MES_BODY}</p>
            </div>
          </div>
          `;
                } else if (nuevoMensaje.MES_CHANNEL == "ADMIN") {
                  chat += ` 
          <div>
            <div class="col s9 mt-1 mb-1 chatRecibidoAdmin">
              <p class="left">${nuevoMensaje.MES_USER} - ${nuevoMensaje.MES_CREATION_DATE} :</p>
              <br>
              <p class="left">${nuevoMensaje.MES_BODY}</p>
            </div>
          </div>
          `;
                }
                document.getElementById("contenedorChat").innerHTML = chat;
              }, 2500);

              document.getElementById("cerrarModalVerChat").addEventListener("click", function () {
                clearInterval(intervaloconsultarmensajes);
              });

              //Enviar mensaje al asesor desde la admin ver chat
              document.getElementById("enviarMensajeAsesor").addEventListener("click", function () {
                if (document.getElementById("inputEnviarMensajeAgente").value != "") {
                  let data = {
                    codigoChat: codigoChat,
                    mensaje: document.getElementById("inputEnviarMensajeAgente").value
                  }
                  postData("/dashboard/enviarMensajeAsesor", { data });
                  document.getElementById("inputEnviarMensajeAgente").value = "";
                }
              });

              //Enviar mensaje al asesor desde la admin ver chat ENTER
              document.getElementById("inputEnviarMensajeAgente").addEventListener("keyup", (e) => {
                if (e.key === 'Enter') {
                  if (document.getElementById("inputEnviarMensajeAgente").value != "") {
                    let data = {
                      codigoChat: codigoChat,
                      mensaje: document.getElementById("inputEnviarMensajeAgente").value
                    }
                    postData("/dashboard/enviarMensajeAsesor", { data });
                    document.getElementById("inputEnviarMensajeAgente").value = "";
                  }
                }
              });

              let currentLanguage = localStorage.getItem("localIdioma");
              i18next.changeLanguage(currentLanguage, function (err, t) {
                $("html").localize();
              });

            } catch (error) {
              console.error("Error al abrir modal:", error);
            }
          });
        });
        //VER CHAT ONLINE

        //TRANSFERIR CHAT
        document.querySelectorAll("a#transferirChat").forEach((botonTransferirChat) => {
          botonTransferirChat.addEventListener("click", function (e) {

            //Fix Modal duplicate events 
            document.getElementById("divBtnEnviarTransfer").innerHTML = `<div class="col s12"><a class="waves-effect waves-light btn-small right" id="btnEnviarTransfer"><span data-i18n="Enviar">Enviar</span></a></div>`;
            //Fin fix modal duplicate eventsver 

            let codigoChat = this.getAttribute("verChat");
            const MotivoTransferencia = document.getElementById("MotivoTransferencia");
            const selectModalAvalibleUsers = document.getElementById("selectModalAvalibleUsers");
            const ObservacionTransferencia = document.getElementById("ObservacionTransferencia");
            getData("mensajeria/availableUsers").then(async (res) => {
              options = `<option value="" disabled selected><span data-i18n="Seleccione el usuario">Seleccione el usuario</span></option>`;
              if (res.selectUsers.length > 0) {
                let array = res.selectUsers;
                array.forEach((element) => {
                  options += `<option value="${element.PKUSU_NCODIGO}" >${element.USU_CUSUARIO}</option>`;
                });
                selectModalAvalibleUsers.innerHTML = options;
                var elemsSelect = document.querySelectorAll(".select");
                M.FormSelect.init(elemsSelect);
              }

              let currentLanguage = localStorage.getItem("localIdioma");
              i18next.changeLanguage(currentLanguage, function (err, t) {
                $("html").localize();
              });
            });

            document.getElementById("btnEnviarTransfer").addEventListener("click", function () {
              let validador = true;
              if (MotivoTransferencia.value == null || MotivoTransferencia.value == "") {
                validador = false;
                M.toast({ html: "Digite motivo de transferencia" });
              }
              if (selectModalAvalibleUsers.value == null || selectModalAvalibleUsers.value == "") {
                validador = false;
                M.toast({ html: "Seleccione usuario a transferir" });
              }

              if (validador === true) {
                const data = {
                  chatID: codigoChat,
                  MotivoTransferencia: MotivoTransferencia.value,
                  selectModalAvalibleUsers: selectModalAvalibleUsers.value,
                  ObservacionTransferencia: ObservacionTransferencia.value,
                };

                postData("mensajeria/transferir", { data }).then(async (res) => {
                  if (res == "ok") {
                    Swal.fire({
                      position: "center",
                      icon: "success",
                      title: document.querySelector('[data-i18n="Chat transferido con exito"]').textContent,
                      showConfirmButton: true,
                      confirmButtonText: document.querySelector('[data-i18n="Aceptar"]').textContent,
                      allowOutsideClick: false,
                      allowEscapeKey: false,
                    }).then((result) => {
                      if (result.isConfirmed) {
                        location.reload();
                      }
                    });
                  }
                });
              }
            });
          });
        });
        //TRANSFERIR CHAT

        //CERRAR CHAT
        document.querySelectorAll("a#cerrarChat").forEach((botonCerrarChat) => {
          botonCerrarChat.addEventListener("click", function (e) {
            let codigoChat = this.getAttribute("verChat");
            let numeroCliente = this.getAttribute("numeroCliente");
            Swal.fire({
              position: "center",
              icon: "warning",
              title: document.querySelector('[data-i18n="¿Seguro que quiere cerrar el chat?"]').textContent,
              showConfirmButton: true,
              showCancelButton: true,
              confirmButtonText: document.querySelector('[data-i18n="Aceptar"]').textContent,
              confirmButtonColor: "rgb(202, 5, 29)",
              cancelButtonText: document.querySelector('[data-i18n="Cancelar"]').textContent,
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then((result) => {
              if (result.isConfirmed) {
                postData("mensajeria/cerrarChatAdmin", { chatIDHeader: codigoChat, numeroCliente: numeroCliente }).then(async (res) => {
                  if (res == "ok") {
                    Swal.fire({
                      position: "center",
                      icon: "success",
                      title: document.querySelector('[data-i18n="Chat cerrado con exito"]').textContent,
                      showConfirmButton: true,
                      confirmButtonText: document.querySelector('[data-i18n="Aceptar"]').textContent,
                      allowOutsideClick: false,
                      allowEscapeKey: false,
                    }).then((result) => {
                      if (result.isConfirmed) {
                        location.reload();
                      }
                    });
                  }
                });
              }
            });
          });
        });
        //CERRAR CHAT

        resolve();
      });
    });
  }

  setInterval(() => {
    actualizarDashboard();
  }, 10000);

  async function inicio() {
    document.getElementById("loaderGeneral").style.display = "flex";
    await actualizarDashboard();
    document.getElementById("loaderGeneral").style.display = "none";
  }
});

function mostrarModalCierreSesion(agentePrimaryKey, agenteNombre, agenteChats) {
  if (agenteChats == 0) {
    Swal.fire({
      position: "center",
      icon: "warning",
      title: "¿Seguro que quiere cerrar la sesion?",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      confirmButtonColor: "rgb(202, 5, 29)",
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        postData("dashboard/cerrarSesionAgente", { agentePrimaryKey, agenteNombre }).then(async (res) => {
          console.log(res);
          if (res.result == "OK") {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Chat cerrado con exito",
              showConfirmButton: true,
              confirmButtonText: "Aceptar",
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then((result) => {
              if (result.isConfirmed) {
                location.reload();
              }
            });
          }
        });
      }
    });
  } else {
    Swal.fire({
      position: "center",
      icon: "error",
      title: "No puede cerrar la sesion, el usuario tiene chats asignados",
      showConfirmButton: true,
      confirmButtonText: "Aceptar",
      allowOutsideClick: false,
      allowEscapeKey: false,
    })
  }
}
