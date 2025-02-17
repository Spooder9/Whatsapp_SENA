document.addEventListener('DOMContentLoaded', async () => {
	// const socket = io();

	var elemsSelect = document.querySelectorAll('.select');
	M.FormSelect.init(elemsSelect);
	var modal = document.querySelectorAll('.modal');
	M.Modal.init(modal);

	localStorage.setItem('idChatActual', '');

	const btnEstadoUser = document.querySelectorAll('.estadoUser');
	const nameUserEstado = document.getElementById('nameUserEstado');
	// ? el agente no usa la barra de navegación izq, por eso es mejor darle todo ese espacio sobrante al chat
	document.querySelector('#main').style.paddingLeft = '0px';

	document.querySelector('#formAdjunto').action = `${URB_API_ENVIAR_MSG}/sendMessage`;

	for (let i = 0; i < btnEstadoUser.length; i++) {
		btnEstadoUser[i].style.color = 'black';
		btnEstadoUser[i].addEventListener('click', function () {
			let estadoUser = btnEstadoUser[i].textContent.toUpperCase();
			nameUserEstado.innerHTML = `${estadoUser}`;
			estadoUser === 'DISCONNECTED' ? nameUserEstado.style.color = '#DD674C' : nameUserEstado.style.color = '#00B347';
			// console.log('EL ESTADO', estadoUser);
			postData('mensajeria/estadosUser', { estadoUser }).then(async (res) => { });
		});
	}

	// * poner el estado en ONLINE
	nameUserEstado.innerHTML = 'ONLINE';
	await postData('mensajeria/estadosUser', { estadoUser: 'ONLINE' })

	const traerPlantillas = () => {
		getData('/mensajeria/traerPlantillas').then(async (res) => {
			// console.log('res PLANTILLAS', res);
			if (res.length > 0) localStorage.setItem('plantillas', JSON.stringify(res));
		});
	};

	//  document.querySelector('.search-area').style.width = '100%';

	traerPlantillas();

	// ! revisar mensajes nuevos de todos los chats de agente para dar alerta
	// clearInterval(idInterval1);
	const checkNewMessages = async () => {
		try {
			let attendingChats = JSON.parse(localStorage.getItem('AttendingChats')) || [];

			// Añadir IDs predeterminados al array de attendingChats
			let defaultChatIDs = ['5A6D526D41475A355A6D4E3D', '5A6D526D41475A355A6D523D', '5A6D526D41475A355A6D563D', '5A6D526D41475A355A6D5A3D', '5A6D526D41475A355A6D443D', '5A6D526D41475A355A6D483D', '5A6D526D41475A355A6D4C3D', '5A6D526D41475A355A6D703D', '5A6D526D41475A355A6D743D', '5A6D526D41775A6B5A6D783D',
				'5A6D526D41475A355A6D783D', '5A6D526D41775A6A5A6D4E3D', '5A6D526D41775A6A5A6D523D', '5A6D526D41775A6A5A6D563D', '5A6D526D41775A6A5A6D5A3D', '5A6D526D41775A6A5A6D443D', '5A6D526D41775A6A5A6D483D', '5A6D526D41775A6A5A6D4C3D', '5A6D526D41775A6A5A6D703D', '5A6D526D41775A6A5A6D743D', '5A6D526D41775A6A5A6D783D', '5A6D526D41775A6B5A6D4E3D', '5A6D526D41775A6B5A6D743D'];
			attendingChats = [...new Set([...attendingChats, ...defaultChatIDs])]; // Evita duplicados

			// await showAlertNewMessages(attendingChats);
		} finally {
			// ? LLAMAR CADA 3 SEGUNDOS
			idInterval1 = setTimeout(() => {
				checkNewMessages();
			}, 3000);
		}
	};

	// ? SIMULAMOS CLICK SOBRE EL CONTENEDOR DE CHATS
	// ESTO SE HACE PARA SALTAR EL PREVENT DEFAULT QUE TIENE EL NAVEGADOR PARA REPRODUCIR SONIDOS SIN INTERACCION PREVIA DEL USUARIO
	// DOMException: play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD
	document.getElementById('contenedor_chats').click();
	// ? MONITOREAR NUEVOS MENSAJES CADA 3 SEGUNDOS
	checkNewMessages();
});
let idInterval;

const name_user_log = document.getElementById('name_user_log').innerText;
const nombreDeUsuario = document.getElementById('userUsuario').innerText;
const authToken = document.getElementById('authToken').innerText;

const cerrarChat = async () => {
	// console.log('entra a cerrar chat');
	// const chatIDHeader = document.getElementById('chatIDHeader').textContent;
	const chatIDHeader = localStorage.getItem('idChatActual');
	const numChatActual = localStorage.getItem('numChatActual');
	postData('mensajeria/cerrarChat', { chatIDHeader: chatIDHeader }).then(async (res) => {
		if (res == 'ok') {
			console.log('Vamos a cerrar el chat', chatIDHeader);
			let sectionChatMenu = document.getElementById('sectionChatMenu');
			const mainContainerChat = document.getElementById('mainContainerChat');
			const mainContainerTipificar = document.getElementById('mainContainerTipificar');
			const chat = document.getElementById(chatIDHeader);
			// * REMOVER EL DIV list_info_chat_${chat}
			document.getElementById(`list_info_chat_${chatIDHeader}`).remove();
			// sectionChatMenu.removeChild(chat);
			mainContainerChat.innerHTML = ` <div style="width: 98%; padding-top: 98%; position: relative; display: flex; align-items: center; justify-content: center;"><img style="position: absolute; max-width: 40%; max-height: 40%; width: auto; height: auto; top: 50%; left: 50%; transform: translate(-50%, -50%);" src="/img/chat4.png" alt="fondo"></div>`;
			mainContainerTipificar.innerHTML = ``;

			const chatID = localStorage.getItem('idChatActual');
			let arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
			const filterChats = arrayAttendingChats.filter((item) => item !== chatID);
			localStorage.setItem('AttendingChats', JSON.stringify(filterChats));

			// * Se le envia al usaurio mensae de cierre de interacción y mensaje de encuesta
			var msgCierreInteraccion = 'Cierre de interacción, 👋 Gracias por contactarnos, nos estaremos viendo en próximas ocasiones.\n'

			M.toast({ html: document.querySelector('[data-i18n="Chat cerrado con éxito"]').textContent });
			const UserId = localStorage.getItem('UserId');
			// const resMessage = await postData(`${URB_API_ENVIAR_MSG}/sendMessage`, { To: numChatActual, body: msgCierreInteraccion, GestionID: chatIDHeader, usuario: nombreDeUsuario, nombreDeUsuario, authToken, UserId })
			// document.getElementById('message_to_send').value = '';

			// if (resMessage.error) {
			//   M.toast({ html: 'Se genero un error, intente de nuevo' });
			//   console.log('Error /sendMessage', resMessage.msg);
			// }

			showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));
		}
		// document.getElementById('message_to_send').value = '';
	});
};

function imgZoom(MES_MEDIA_URL) {

	// console.log('entra a imgZoom',MES_MEDIA_URL);
	const modalZoomImg = document.getElementById('modalZoomImg');
	let modalContent = document.createElement('div');
	let modalFooter = document.createElement('div');
	modalContent.setAttribute('class', 'modal-content');
	modalFooter.setAttribute('class', 'modal-footer');

	modalZoomImg.innerHTML = ``;
	// const main = document.getElementById('main');
	// let containerImg = document.createElement('div');
	// containerImg.setAttribute('style', 'border: 1px solid black;position:fixed');
	modalContent.innerHTML = `
    <div style="width:100%; height:100%">
      <img src="${MES_MEDIA_URL}" />   
    </div>
  `;
	modalFooter.innerHTML = `
      <a class="modal-close waves-effect waves-green btn-flat"><span data-i18n="Cerrar">Cerrar</span></a>
  `;

	modalZoomImg.appendChild(modalContent);
	modalZoomImg.appendChild(modalFooter);
}

// enviar mensaje
async function sendMessage(cellPhoneNumber, gestionID) {
	const inputMessage = document.getElementById('messageToSend');
	const messageToSend = inputMessage.value;
	const UserId = localStorage.getItem('UserId');

	if (messageToSend.length > 0) {
		try {
			const resMessage = await postData(`${URB_API_ENVIAR_MSG}/sendMessage`, { To: cellPhoneNumber, body: messageToSend, GestionID: gestionID, usuario: nombreDeUsuario, nombreDeUsuario, authToken, UserId });
			showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));
			inputMessage.value = '';

			if (resMessage.error) {
				M.toast({ html: 'Se genero un error, intente de nuevo' });
				console.log('Error /sendMessage', resMessage.msg);
			}
		} catch (error) {
			M.toast({ html: 'Se genero un error, intente de nuevo' });
			console.log('Error fn sendMessage\n', error);
		}
	}
}

const shwoInfoUser = (cellPhoneNumber) => {
	const modalInfoCliente = document.getElementById('modalInfoCliente');
	let modal = document.createElement('div');
	let modalFooter = document.createElement('div');
	modal.setAttribute('class', 'modal-content');
	modalFooter.setAttribute('class', 'modal-footer');

	modalInfoCliente.innerHTML = ``;
	postData('mensajeria/searchInfoUser', { cellPhoneNumber: cellPhoneNumber }).then(async (res) => {
		if (res.length > 0) {
			modal.innerHTML = `
      <h4 data-i18n="Informacion del cliente">Información del cliente</h4>

          <div class="row">
              <div class="input-field col s12">
                  <i class="material-icons prefix">account_circle</i>
                  <input id="ModalNameClient" type="text" class="validate"
                      value="${res[0].CLI_NAME}" disabled>
                  
              </div>
              <div class="input-field col s6">
                  <i class="material-icons prefix">phone</i>
                  <input id="ModalCelClient" type="tel" class="validate" disabled
                      value="${res[0].CLI_CELLPHONE_NUMBER}">
                  
              </div>
              <div class="input-field col s6">
                  <i class="material-icons prefix">mail</i>
                  <input id="ModalCorreoClient" type="tel" class="validate" value="${res[0].CLI_EMAIL}" disabled>
                  
              </div>
          </div>
      `;
			modalFooter.innerHTML = `
      <a href="#!" class="modal-close waves-effect waves-green btn-flat"><span data-i18n="Cerrar"><span data-i18n="Cerrar">Cerrar</span></span></a>
      `;
			// modalFooter.innerHTML = `
			// <a class="modal-close waves-effect waves-green btn-flat" onclick="updateInfoClient('${cellPhoneNumber}','${res[0].EnCryptId}');">Actualizar</a>
			// `
			modalInfoCliente.appendChild(modal);
			modalInfoCliente.appendChild(modalFooter);
		} else {
			modal.innerHTML = `
      <h4 data-i18n="No hay informacion">No hay información</h4>

          
      `;
			modalFooter.innerHTML = `
      <a href="#!" class="modal-close waves-effect waves-green btn-flat"><span data-i18n="Cerrar">Cerrar</span></a>
      `;
			modalInfoCliente.appendChild(modal);
			modalInfoCliente.appendChild(modalFooter);
		}
		let currentLanguage = localStorage.getItem('localIdioma');
		i18next.changeLanguage(currentLanguage, function (err, t) {
			$('html').localize();
		});
	});
};

const showInfoGestion = async (idGestion) => {
	const modalInfoCliente = document.getElementById('modalInfoCliente');
	let modal = document.createElement('div');
	let modalFooter = document.createElement('div');
	modal.setAttribute('class', 'modal-content');
	modalFooter.setAttribute('class', 'modal-footer');

	modalInfoCliente.innerHTML = ``;
	const data = await getData(`mensajeria/info-gestion?idGestion=${idGestion}`);

	if (data.length) {
		modal.innerHTML = `
      <h4 data-i18n="Respuestas conversación">Respuestas conversación</h4> 
      <br/>
      <div class="row">
        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpNombreSeComunica" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_NOMBRE_COMUNICA || 'N/A'}" readonly>
          <label for="inpNombreSeComunica">Nombre del que se comunica</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpTipoDocPaciente" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_TIPO_DOC_PACIENTE || 'N/A'}" readonly>
          <label for="inpTipoDocPaciente">Tipo documento paciente</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpDocPaciente" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_DOCUMENTO_PACIENTE || 'N/A'}" readonly>
          <label for="inpDocPaciente">Documento paciente</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpNombrePaciente" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_NOMBRE_PACIENTE || 'N/A'}" readonly>
          <label for="inpNombrePaciente">Nombre paciente</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpParentesco" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_PARENTESCO || 'N/A'}" readonly>
          <label for="inpParentesco">Parentesco</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpNumerosTelefono" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_NUMEROS_TELEFONO || 'N/A'}" readonly>
          <label for="inpNumerosTelefono">Números de telefono</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">email</i>
          <input id="inpCorreo" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_CORREO || 'N/A'}" readonly>
          <label for="inpCorreo">Correo</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpPacienteHospitalizado" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_PACIENTE_HOSPITALIZADO || 'N/A'}" readonly>
          <label for="inpPacienteHospitalizado">Paciente hospitalizado</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpSede" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_SEDE || 'N/A'}" readonly>
          <label for="inpSede">¿A sede lo están remitiendo?</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpSolicitud" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_SOLICITUD || 'N/A'}" readonly>
          <label for="inpSolicitud">Tipo de solicitud</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpConsultaMedicinaEsp" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_CONSULTA_MEDICINA_ESP || 'N/A'}" readonly>
          <label for="inpConsultaMedicinaEsp">Consulta medicina especializada</label>
        </div>
        
        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpConsultaExterna" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_CONSULTA_EXTERNA || 'N/A '}" readonly>
          <label for="inpConsultaExterna">Medico de preferencia</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpConsultaEs" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_CONSULTA_ES || 'N/A'}" readonly>
          <label for="inpConsultaEs">La consulta es?</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpCualPrograma" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_CUAL_PROGRAMA || 'N/A'}" readonly>
          <label for="inpCualPrograma">Que especialidad o consulta solicita programar?</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpEPSRemite" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_EPS_REMITE || 'N/A'}" readonly>
          <label for="inpEPSRemite">EPS que remite</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpFechaExpedicion" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_STRFECHA_EXPEDICION || 'N/A'}" readonly>
          <label for="inpFechaExpedicion">Fecha de expedición autorización</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpFechaVencimiento" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_STR_FECHA_VENCIMIENTO || 'N/A'}" readonly>
          <label for="inpFechaVencimiento">Fecha de vencimiento o vigencia autorización</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpRangoFechas" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_STR_RANGO_FECHAS_CITA || 'N/A'}" readonly>
          <label for="inpRangoFechas">Rando de fechas que desea la cita</label>
        </div>

        <div class="input-field col s6">
          <i class="material-icons prefix">account_circle</i>
          <input id="inpMedicoPreferencia" type="text" class="able-to-copy" style="cursor: pointer" value="${data[0].GES_MEDICO_PREFERENCIA || 'N/A'}" readonly>
          <label for="inpMedicoPreferencia">Medico de preferencia</label>
        </div>
      </div>
    `;

		modalFooter.innerHTML = `
      <a href="#!" class="modal-close waves-effect waves-green btn-flat">
        <span data-i18n="Cerrar">
          <span data-i18n="Cerrar">Cerrar</span>
        </span>
      </a>
    `;

		M.updateTextFields();
		activarCopiadoClickInputs();
	}

	if (!data.length) {
		modal.innerHTML = `<h4 data-i18n="No hay informacion">No hay información</h4>`;
		modalFooter.innerHTML = `
      <a href="#!" class="modal-close waves-effect waves-green btn-flat">
        <span data-i18n="Cerrar">
          <span data-i18n="Cerrar">Cerrar</span>
        </span>
      </a>
    `;
	}

	modalInfoCliente.appendChild(modal);
	modalInfoCliente.appendChild(modalFooter);
}

const drawChatContent = (data) => {

	const { tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL, MES_AUTHOR } = data;
	const srcFile = MES_MEDIA_URL;
	const classTime = `time-${MES_CHANNEL.toLowerCase()}`;


	if (tipoMsg === 'text') {
		return `<p>${MES_BODY} <span class="chat-time ${classTime}">${formatearHora({ hora: MES_CREATION_DATE })}</span></p>`
	}

	if (MES_MEDIA_TYPE !== null && tipoMsg === 'img') {
		const classImg = MES_CHANNEL === 'RECEIVED' ? 'imgChatReceive' : 'imgChatSend';

		return `
    <p>
      <img href="#modalZoomImg" onclick="imgZoom('${MES_MEDIA_URL}')" class="${classImg} modal-trigger" src="${srcFile}" style="cursor:pointer;" />
      ${MES_BODY !== null ? `${MES_BODY}    ` : ''}
      ${MES_CHANNEL === 'RECEIVED' || MES_CHANNEL === 'SEND' ? `<span class="chat-time ${classTime}">${formatearHora({ hora: MES_CREATION_DATE })}</span>` : ''}
      </p>
      `;
	}

	if (MES_MEDIA_TYPE !== null && tipoMsg === 'doc') {
		return `
    <p>
      <a target="_blank" href="${srcFile}"=><b>File <i class="bx bx-file"></i></b></a>
      <span class="chat-time ${classTime}">${formatearHora({ hora: MES_CREATION_DATE })}</span>
    </p>`;
	}

	if (MES_MEDIA_TYPE !== null && tipoMsg === 'audio') {
		return `
    <p>
      <audio src="${srcFile}" type="audio/mp3" controls></audio><br>
      <span class="chat-time ${classTime}">${formatearHora({ hora: MES_CREATION_DATE })}</span>
    </p>`
	}

	if (MES_MEDIA_TYPE !== null && tipoMsg === 'video') {
		return `
    <p>
      <video src="${srcFile}" type="audio/mp3" controls style="width: 100%"></video>
      <span class="chat-time ${classTime}">${formatearHora({ hora: MES_CREATION_DATE })}</span>
    </p>`
	}
}

//busca los mensajes del chat seleccinado y los muestra
// let idInterval = 0;
// let idInterval1 = 0;
function checkScrollPosition(chatID, cellPhoneNumber) {


	var chatWindow = document.querySelector('.chat-area.ps.ps--active-y');
	var oldHeight = chatWindow.scrollHeight;
	//console.log("altura del scroll actual: ", oldHeight)
	let oldChatsWindow = document.createElement('div');
	oldChatsWindow.setAttribute('class', 'chats');
	oldChatsWindow.setAttribute('id', 'chatContaineroldchats');
	oldChatsWindow.setAttribute('style', 'overflow-y:auto');
	if (chatWindow.scrollTop === 0) {
		console.log('El scroll está en la parte superior.');
		localStorage.setItem('idChatActual', chatID);
		let idfirstmessage = localStorage.getItem('idfirstmessage')
		//console.log("el idmessage es: ", idfirstmessage)
		postData(`${URL_API_CONSULTAR}/ActualizarMensajesAntiguos`, { chatID, nombreDeUsuario, authToken, idfirstmessage }).then(async (res) => {
			let conversations = res.conversation;
			console.log("length: ", conversations)
			if (conversations.length > 0) {
				console.log("SI HAY COVERSAS");
				localStorage.setItem('idfirstmessage', conversations[0].PK_MES_NCODE);
			}
			let arrImgTypes = ['jpeg', 'png', 'webp', 'jpg'],
				arrVideoTypes = ['mp4', 'mpeg'],
				arrDocsTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv'],
				arrAudioTypes = ['ogg', 'oga', 'mp3'];
			// chat content
			if (conversations.length > 0) {
				console.log(conversations, "ZOnas");

				//chatWindow.scrollTop = 650;
				for (let i = 0; i < conversations.length; i++) {
					// * Validar tipo de mensaje
					const MES_MEDIA_TYPE = conversations[i].MES_MEDIA_TYPE;
					const MES_MEDIA_URL = conversations[i].MES_MEDIA_URL;
					const MES_MESSAGE_ID = conversations[i].MES_MESSAGE_ID;
					const MES_BODY = conversations[i].MES_BODY;
					const MES_CHANNEL = conversations[i].MES_CHANNEL;
					const MES_CREATION_DATE = conversations[i].MES_CREATION_DATE;
					const MES_AUTHOR = conversations[i].MES_AUTHOR
					let autor_mensaje_entrante = '';

					if (MES_AUTHOR && MES_AUTHOR !== '.') {
						autor_mensaje_entrante = MES_AUTHOR;
					} else {
						autor_mensaje_entrante = 'Usuario';
					}

					// if (MES_MEDIA_TYPE !== null && arrImgTypes.includes(MES_MEDIA_TYPE)) isFileImg = true;
					// if (MES_MEDIA_TYPE !== null && arrDocsTypes.includes(MES_MEDIA_TYPE)) isFileDoc = true;
					// if (MES_MEDIA_TYPE !== null && arrVideoTypes.includes(MES_MEDIA_TYPE)) isFileVideo = true;
					// if (MES_MEDIA_TYPE !== null && MES_MEDIA_TYPE.includes('ogg')) isFileAudio = true;

					let tipoMsg = 'text';

					if (MES_MEDIA_TYPE !== null && arrImgTypes.includes(MES_MEDIA_TYPE)) tipoMsg = 'img';
					if (MES_MEDIA_TYPE !== null && arrDocsTypes.includes(MES_MEDIA_TYPE)) tipoMsg = 'doc';
					if (MES_MEDIA_TYPE !== null && arrVideoTypes.includes(MES_MEDIA_TYPE)) tipoMsg = 'video';
					if (MES_MEDIA_TYPE !== null && ['ogg', 'mp3'].includes(MES_MEDIA_TYPE)) tipoMsg = 'audio';


					if (conversations[i].MES_CHANNEL == 'RECEIVED') {
						oldChatsWindow.innerHTML += `
                <div class="chat">
                  <div class="chat-body">
                  <span style="font-weight: bold; color: blue;">${autor_mensaje_entrante} Dice:</span>
                    <div class="chat-text${tipoMsg === 'audio' ? 'F' : ''}" ${MES_MEDIA_TYPE === null ? '' : tipoMsg === 'img' ? 'style="max-width: 350px;"' : ''}>
                      ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL, MES_AUTHOR })}
                    </div>
                  </div>
                </div>`;
					}

					if (conversations[i].MES_CHANNEL == 'SEND') {
						oldChatsWindow.innerHTML += `
                <div class="chat chat-right">
                  <div class="chat-body">
                  <span style="font-weight: bold; color: green;">${autor_mensaje_entrante} Dice:</span>
                    <div class="chat-text" ${MES_MEDIA_TYPE === null ? '' : tipoMsg === 'img' ? 'style="max-width: 350px"' : ''}>
                      ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL })}
                    </div>
                  </div>
                </div>`;
					}

					if (conversations[i].MES_CHANNEL == 'ADMIN') {
						oldChatsWindow.innerHTML += `
                <div class="chat chatRecibidoAdminAgente">
                  <div class="chat-body">
                  <span style="font-weight: bold; color: green;">${autor_mensaje_entrante} Dice:</span>
                    <div class="chat-text">
                      ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL })}
                    </div>
                  </div>
                </div>`;
					}
				}
				chatWindow.insertBefore(oldChatsWindow, chatWindow.firstChild);
				chatWindow.scrollTop = (chatWindow.scrollHeight - oldHeight) - 30;
			}
		});
	}
}










// ! ======================================================================================================================================================================
// !                                          FUNCION PARA ACTIVAR LA CONVERSACION DEL CHAT ABIERTO POR EL USUARIO → FUNCION activar_conversacion_chat
// ! ======================================================================================================================================================================
/**
 * @author Brayan Yanez
 * @created 14 de Mayo de 2024
 * @lastModified 14 de Mayo de 2024
 * @version 1.0.0
 */
async function activar_conversacion_chat(ID_CHAT, TIPO_CHAT, WHATSAPP_FROM, CONTACTO_INTERNO) {
	// * OBTENER TODOS LOS ELEMENTOS DE LA CLASE list_info_chat
	let list_info_chat = document.querySelectorAll(`.list_info_chat`);

	// * RECORRER TODOS LOS ELEMENTOS DE LA CLASE list_info_chat Y MANTENER UN CONTROL VISUAL SOBRE LOS CHATS ACTIVOS
	list_info_chat.forEach((element) => {
		if (element.id === ID_CHAT) {
			// ? AGREGAR LA CLASE active AL ELEMENTO ACTUAL
			// Establecer la clase active al elemento actual
			element.classList.add('active');
		} else {
			// ? REMOVER LA CLASE active A LOS ELEMENTOS QUE NO SEAN EL ACTUAL
			element.classList.remove('active');

		}
	});


	// * VARIABLES
	let ICON_CHAT = '';
	let FORMULARIO_TIPIFICACION_CHAT = '';






	let chatID = ID_CHAT;
	let cellPhoneNumber = WHATSAPP_FROM;
	let nombre_contacto_chat = CONTACTO_INTERNO;

	if (!nombre_contacto_chat) {
		nombre_contacto_chat = cellPhoneNumber.substring(2, 13);
	}

	// * CONTROL FORMULARIO DE TIPIFICACION SEGUN TIPO DE CHAT
	if (TIPO_CHAT === 'GRUPAL') {
		// ? ICONO DEL CHAT GRUPAL
		ICON_CHAT = 'group';
	} else {
		// ? ICONO DEL CHAT INDIVIDUAL
		ICON_CHAT = 'person';
	}

	document.getElementById("loaderGeneral").style.display = "flex";
	localStorage.setItem('numChatActual', cellPhoneNumber);
	localStorage.setItem('idChatActual', chatID);
	const mainContainerChat = document.getElementById('mainContainerChat');
	const mainContainerTipificar = document.getElementById('mainContainerTipificar');
	mainContainerChat.innerHTML = ``;
	mainContainerTipificar.innerHTML = ``;

	let nombreCliente = document.createElement('div');
	let chatWindow = document.createElement('div');
	let secondChatWindow = document.createElement('div');
	let thirdChatWindow = document.createElement('div');
	let chatFooter = document.createElement('div');

	//seccion del chat =>chatWindow
	chatWindow.setAttribute('class', 'chat-area ps ps--active-y');
	chatWindow.setAttribute('style', 'overflow-y:auto !important');
	chatWindow.setAttribute('id', 'seccionChat');
	secondChatWindow.setAttribute('class', 'chats');
	thirdChatWindow.setAttribute('class', 'chats');
	thirdChatWindow.setAttribute('id', 'chatContainer');
	thirdChatWindow.setAttribute('style', 'overflow-y:auto');
	chatFooter.setAttribute('class', 'chat-footer');
	chatWindow.addEventListener('scroll', () => {
		checkScrollPosition(chatID, cellPhoneNumber);
	});
	secondChatWindow.appendChild(thirdChatWindow);
	chatWindow.appendChild(secondChatWindow);
	postData(`${URL_API_CONSULTAR}/searchConversation`, { chatID, cellPhoneNumber, nombreDeUsuario, authToken }).then(async (res) => {
		// console.log(res);
		const seccionChat = document.getElementById('seccionChat');
		let infoClientActual = {
			id: '',
			direccion: '',
			nombre: '',
			tipoDocumento: '',
			numDocumento: '',
			celular: '',
			telefono2: '',
			correo: '',
		};

		let arrImgTypes = ['jpeg', 'png', 'webp', 'jpg'],
			arrVideoTypes = ['mp4'],
			arrDocsTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xlx', 'xlxs', 'txt', 'csv'];

		// * Guardar Numero de mensajes del chat
		localStorage.setItem('countMessages', res.conversation.length);
		if (res.conversation.length > 0) {
			//buscar informacion del cliente
			postData('mensajeria/searchInfoUser', { cellPhoneNumber: cellPhoneNumber }).then(async (resInfo) => {
				if (resInfo.length > 0) {
					infoClientActual = {
						id: resInfo[0].EnCryptId,
						direccion: resInfo[0].CLI_DIRECCION || '',
						nombre: resInfo[0].CLI_NAME || '',
						tipoDocumento: resInfo[0].CLI_IDENTIFICATION_TYPE || '',
						numDocumento: resInfo[0].CLI_IDENTIFICATION_NUMBER || '',
						celular: resInfo[0].CLI_CELLPHONE_NUMBER || '',
						telefono2: resInfo[0].CLI_TELEFONO2 || '',
						correo: resInfo[0].CLI_EMAIL || '',
					};
				}
				// ? NAV CHAT SINGLE O INDIVIDUAL
				nombreCliente.innerHTML = `
        <div class="chat-header">
          <div class="row valign-wrapper" id="nombreCliente">
            <div class="col media-image online pr-0">
              <i class="material-icons circle z-depth-2 responsive-img" style="font-size: 33px; color: #276e90; padding:6px;">${ICON_CHAT}</i>
            </div>
            <div class="col">
              <p class="m-0 blue-grey-text text-darken-4 font-weight-700" id="celularCliente">${nombre_contacto_chat}</p>
              <p id="chatIDHeader" style="display: none">${chatID}</p>
            </div>
          </div>
          <span class="option-icon">
            <i class="material-icons modal-trigger tooltipped" id="btn_modal_directorio_contactos_single" style="text-align: right" href="#modal_directorio_contactos" data-poasition="top" data-tooltip="Directorio Contactos" onclick="ctrl_modal_directorio_contactos();">contacts</i>

            <span style="margin: 0 3px"></span>

            <!-- <i class="material-icons modal-trigger" id="searchInfoClient" style="text-align: right" href="#modalInfoCliente" onclick="shwoInfoUser(${cellPhoneNumber});">info_outline</i> -->

            <ul id="dropdown2" class="dropdown-content" style="width: 150px; text-align: center">
              <li style="line-height: 0.5rem; min-height: 20px">
                <a class="modal-trigger" href="#modalTransferir" style="font-size: 13px; padding: 3px 3px; text-align: center; color: #707070" onclick="showModaltransferir();"><span data-i18n="Transferir">Transferir</span></a>
              </li>
            </ul>
          </span>
        </div>`;
				let conversations = res.conversation;
				localStorage.setItem('idfirstmessage', conversations[0].PK_MES_NCODE);
				// chat content
				for (let i = 0; i < conversations.length; i++) {
					// * Validar tipo de mensaje
					const MES_MEDIA_TYPE = conversations[i].MES_MEDIA_TYPE;
					const MES_MEDIA_URL = conversations[i].MES_MEDIA_URL;
					const MES_MESSAGE_ID = conversations[i].MES_MESSAGE_ID;
					const MES_BODY = conversations[i].MES_BODY;
					const MES_CHANNEL = conversations[i].MES_CHANNEL;
					const MES_CREATION_DATE = conversations[i].MES_CREATION_DATE;
					const MES_AUTHOR = conversations[i].MES_AUTHOR

					let autor_mensaje_entrante = '';

					if (MES_AUTHOR && MES_AUTHOR !== '.') {
						autor_mensaje_entrante = MES_AUTHOR;
					} else {
						autor_mensaje_entrante = 'Usuario';
					}
					// if (MES_MEDIA_TYPE !== null && arrImgTypes.includes(MES_MEDIA_TYPE)) isFileImg = true;
					// if (MES_MEDIA_TYPE !== null && arrDocsTypes.includes(MES_MEDIA_TYPE)) isFileDoc = true;
					// if (MES_MEDIA_TYPE !== null && arrVideoTypes.includes(MES_MEDIA_TYPE)) isFileVideo = true;
					// if (MES_MEDIA_TYPE !== null && MES_MEDIA_TYPE.includes('ogg')) isFileAudio = true;

					let tipoMsg = 'text';

					if (MES_MEDIA_TYPE !== null && arrImgTypes.includes(MES_MEDIA_TYPE)) tipoMsg = 'img';
					if (MES_MEDIA_TYPE !== null && arrDocsTypes.includes(MES_MEDIA_TYPE)) tipoMsg = 'doc';
					if (MES_MEDIA_TYPE !== null && arrVideoTypes.includes(MES_MEDIA_TYPE)) tipoMsg = 'video';
					if (MES_MEDIA_TYPE !== null && ['ogg', 'mp3'].includes(MES_MEDIA_TYPE)) tipoMsg = 'audio';


					if (conversations[i].MES_CHANNEL == 'RECEIVED') {
						thirdChatWindow.innerHTML += `
              <div class="chat">
                <div class="chat-body">
                <span style="font-weight: bold; color: blue;">${autor_mensaje_entrante} Dice:</span>
                  <div class="chat-text${tipoMsg === 'audio' ? 'F' : ''}" ${MES_MEDIA_TYPE === null ? '' : tipoMsg === 'img' ? 'style="max-width: 350px;"' : ''}>
                    ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL })}
                  </div>
                </div>
              </div>`;
					}

					if (conversations[i].MES_CHANNEL == 'SEND') {
						thirdChatWindow.innerHTML += `
              <div class="chat chat-right">
                <div class="chat-body">
                <span style="font-weight: bold; color: green;">${autor_mensaje_entrante} Dice:</span>
                  <div class="chat-text" ${MES_MEDIA_TYPE === null ? '' : tipoMsg === 'img' ? 'style="max-width: 350px"' : ''}>
                    ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL })}
                  </div>
                </div>
              </div>`;
					}

					if (conversations[i].MES_CHANNEL == 'ADMIN') {
						thirdChatWindow.innerHTML += `
              <div class="chat chatRecibidoAdminAgente">
                <div class="chat-body">
                <span style="font-weight: bold; color: green;">${autor_mensaje_entrante} Dice:</span>
                  <div class="chat-text">
                    ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL })}
                  </div>
                </div>
              </div>`;
					}
				}

				const tipoCanal = res.tipoCanal;
				//footer chat
				chatFooter.innerHTML = `
          <form onsubmit="" action="javascript:void(0);" class="chat-input" enctype="multipart/form-data" autocomplete="off">
            <i class="material-icons modal-trigger tooltipped" style="cursor: pointer;" id="iconSendFile" href="#modalSendFile" data-position="top" data-tooltip="Adjuntos">attach_file</i>
            <i class="material-icons modal-trigger tooltipped" onclick="showPlantillas();" id="verPlantillas" style="cursor: pointer; margin-right: 5px" href="#modalPlantillas" data-position="top" data-tooltip="Plantillas">description</i>
            <textarea style="resize: none;border: none; outline: none; height: 55px;" type="text" placeholder="Message" class="message mb-0" id="messageToSend"></textarea>
            <a onclick="sendMessage('${cellPhoneNumber}','${chatID}');" id="btnSendMessage"><i class="material-icons" style="padding-top: 3px;cursor:pointer;color:#6C7082;">send</i></a>
          </form>`;

				const mainContainerChat = document.getElementById('mainContainerChat');
				const mainContainerTipificar = document.getElementById('mainContainerTipificar');
				mainContainerChat.innerHTML = ``;
				mainContainerTipificar.innerHTML = ``;

				mainContainerChat.appendChild(nombreCliente);
				mainContainerChat.appendChild(chatWindow);
				mainContainerChat.appendChild(chatFooter);
				M.Tooltip.init(document.querySelectorAll('.tooltipped'))

				// * actualiza campo MES_MESSAGE_SHOW a '1' a los mensajes anteriores
				const estoxd = await postData(`${URL_API_CONSULTAR}/updateReadMessages`, { chatID, nombreDeUsuario, authToken });
				let messageToSend = document.getElementById('messageToSend');

				// enviar mensaje con enter
				messageToSend.addEventListener('keyup', async (e) => {
					if (e.key === 'Enter') {
						texto = messageToSend.value;
						let numChatActual = localStorage.getItem('numChatActual');
						let idChatActual = localStorage.getItem('idChatActual');
						if (texto == null) {
							alert('No puede  enviar un mensaje vacio')
						} else {
							const UserId = localStorage.getItem('UserId');

							try {
								const resMessage = await postData(`${URB_API_ENVIAR_MSG}/sendMessage`, { To: numChatActual, body: texto, GestionID: idChatActual, usuario: nombreDeUsuario, nombreDeUsuario, authToken, UserId });
								showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));
								messageToSend.focus();
								messageToSend.value = '';

								if (resMessage.error) {
									M.toast({ html: 'Se genero un error, intente de nuevo' });
									console.log('Error /sendMessage', resMessage.msg);
								}

							} catch (error) {
								M.toast({ html: 'Se genero un error, intente de nuevo' });
								console.log('Error al enviar mensaje por Enter\n', error);
							}
						}

					}
				});


				// * CONTROL FORMULARIO DE TIPIFICACION SEGUN TIPO DE CHAT
				if (TIPO_CHAT === 'GRUPAL') {
					// ? ICONO DEL CHAT GRUPAL
					ICON_CHAT = 'group';

					// ? FORMULARIO TIPIFICACION CHAT GRUPAL
					FORMULARIO_TIPIFICACION_CHAT = `
          <div class="row" style='padding: 15px; height: 100%;'>
            ${res.tipificacion.length ? `` : ''}
            <form id='formTipificacion' class="col s12" style="scroll-behavior: auto;overflow-y: auto;height: 90%;position: absolute;">
              <div class="row ">
                <div style="text-align:center">
                    <h5 data-i18n="Tipificación">Tipificación</h5>
                    <span style="font-weight: bold;">
                      <i class="material-icons prefix small">alarm_on</i>
                    </span>
                    <span id="tmo">00:00:00</span>
                </div>

                <div class="input-field col s12" style="display:none">
                  <i class="material-icons prefix">phone</i>
                  <input  id="txt_fecha_hora_inicio_tipificacion" type="text" disabled>
                </div>
                <div class="input-field col s12" style="display:none">
                  <i class="material-icons prefix">phone</i>
                  <input  id="txt_fecha_hora_registro" type="text" disabled>
                </div>

                <div class="input-field col s12" style="display:none">
                  <i class="material-icons prefix">phone</i>
                  <input  id="celularClienteTip" type="text" class="validate" value="${cellPhoneNumber}" disabled>
                </div>

                <div class="input-field col s12" style="display:none">
                  <i class="material-icons prefix">person</i>
                  <input id="inpAgente" type="tel" class="validate obli" data-campo='Nombre Agente' value="${name_user_log}" disabled>
                </div>

                <div class="input-field col s12">
                  <i class="material-icons prefix">local_offer</i>
                  <label for="inpCaso" data-i18n="N° Caso">N° Caso</label>
                  <input id="inpCaso" type="tel" class="validate obli" data-campo='N° Caso	'  onkeyup="habilitar_ctrl_tmo(); valida_inpCaso();" onclick="habilitar_ctrl_tmo(); valida_inpCaso();" autocomplete="off">
                  <div class="invalid-feedback">
                  </div>
                </div>


                <div class="input-field col s12">
                    <i class="material-icons prefix">playlist_add_check</i>
                    <select class="select obli" id="selTipificacion" data-campo='Tipificación'>
                        <option value="" disabled selected>Elije una opción</option>
                        <option value="Se escala con Ing.">Se escala con Ing.</option>
                        <option value="Se escala con gas solutions">Se escala con gas solutions</option>
                        <option value="Se remite con devitech">Se remite con devitech</option>
                        <option value="Se valida cartera">Se valida cartera</option>
                        <option value="Se valida placa">Se valida placa</option>
                        <option value="Se autoriza VFS">Se autoriza VFS</option>
                        <option value="Cambio de parámetros">Cambio de parámetros</option>
                        <option value="Asignación de Chip">Asignación de Chip</option>
                        <option value="Asignación de Placa">Asignación de Placa</option>
                        <option value="Validación de contrato">Validación de contrato</option>
                        <option value="Validación de extra-cupo">Validación de extra-cupo</option>
                        <option value="Soporte de sistemas">Soporte de sistemas</option>
                        <option value="Autorización AE">Autorización AE</option>
                        <option value="Soporte Flotas">Soporte Flotas</option>
                        <option value="Cargue de puntos">Cargue de puntos</option>
                        <option value="Validación de JDZ">Validación de JDZ</option>
                        <option value="Validación de comercial">Validación de comercial</option>
                        <option value="Validación Staff Terpel COS">Validación Staff Terpel COS</option>
                        <option value="Liberaciones">Liberaciones</option>
                        <option value="Autorizacion de cartera">Autorizacion de cartera</option>
                        <option value="Autor Manual">Autor Manual</option>
                        <option value="Validación de empresa / flota">Validación de empresa / flota</option>
                        <option value="Validación de cartera">Validación de cartera</option>
                        <option value="Cierre por no gestión de celulares">Cierre por no gestión de celulares</option>
                    </select>
                    <label data-i18n="Motivo">Motivo</label>
                </div>

                <div class="input-field col s12">
                  <i class="material-icons prefix">access_time</i>
                  <input id="txt_hora_inicio_chat" type="tel" class="ctrl_visual_campo validate obli" data-campo='Hora Inicio Chat' maxlength="5" onkeyup="valida_txt_hora_inicio_chat();" onclick="valida_txt_hora_inicio_chat();" autocomplete="off">
                  <label for="txt_hora_inicio_chat" data-i18n="Hora Inicio Chat">Hora Inicio Chat</label>
                  <div class="invalid-feedback">
                  </div>
                </div>

                <div class="input-field col s12">
                  <i class="material-icons prefix">timer</i>
                  <input id="txt_hora_fin_chat" type="tel" class="ctrl_visual_campo validate obli" data-campo='Hora Fin Chat' maxlength="5" onkeyup="valida_txt_hora_fin_chat();" onclick="valida_txt_hora_fin_chat();" autocomplete="off">
                  <label for="txt_hora_fin_chat" data-i18n="Hora Fin Chat">Hora Fin Chat</label>
                  <div class="invalid-feedback">
                  </div>
                </div>

                <div class="col s12" style="text-align: center;">
                  <button type='button' id="btnSendTyp" class="waves-effect waves-light btn-small" onclick="sendTypification2('${chatID}', '${infoClientActual.id}', '${res.tipoGestion}'); limpiarFormulario();" ><i class="material-icons prefix">save</i> <span data-i18n="Guardar"> Guardar</span> </button>
                </div>
              </div>
            </form>
          </div>`;
				} else {
					// ? ICONO DEL CHAT INDIVIDUAL
					ICON_CHAT = 'person';

					// ? FORMULARIO TIPIFICACION CHAT INDIVIDUAL
					FORMULARIO_TIPIFICACION_CHAT = `
          <div class="row" style='padding: 15px; height: 100%;'>
            ${res.tipificacion.length ? `` : ''}
            <form id='formTipificacion' class="col s12" style="scroll-behavior: auto;overflow-y: auto;height: 90%;position: absolute;">
              <div class="row ">
                <div style="text-align:center">
                    <h6 data-i18n="Tipificación">Tipificación</h6>
                </div>
                <div class="input-field col s12" style="display:none">
                <i class="material-icons prefix">person</i>
                <input id="inpAgente" type="tel" class="validate obli" data-campo='Nombre Agente' value="${name_user_log}" disabled>
                </div>
                <div class="col s12" style="text-align: center; padding-top: 50px;">
                  <button type='button' id="btnSendTyp" class="waves-effect waves-light btn-small" onclick="sendTypification('${chatID}', '${infoClientActual.id}', '${res.tipoGestion}')" ><span data-i18n="Cerrar Chat">Cerrar Chat</span> </button>
                </div>
              </div>
            </form>
          </div>`;
				}

				// * MOSTRAR FORMULARIO DE TIPIFICACION
				mainContainerTipificar.innerHTML = FORMULARIO_TIPIFICACION_CHAT;

				document.getElementById('containerDropdownTip').innerHTML = `<ul id='dropdownTip' style="width: 250px;" class='dropdown-content'></ul>`;

				let dropdownTip = document.getElementById('dropdownTip'),
					htmlTip = '';
				res.tipificacion.forEach((tip) => {
					htmlTip += `<li><a href="#"><span>${tip.TYP_OBSERVACIONES}</span></a></li>`;
				});
				dropdownTip.innerHTML = htmlTip;

				var elemsDropdown = document.querySelectorAll('.dropdown-trigger');
				M.Dropdown.init(elemsDropdown);
				var elemsSelect = document.querySelectorAll('.select');
				M.FormSelect.init(elemsSelect);
				$('input.input_text, textarea#textarea2').characterCounter();
				const emailOptions = document.querySelectorAll('#selectEmailTip option'),
					emailSelect = document.getElementById('selectEmailTip');
				showSelectOnForm(emailOptions, emailSelect, infoClientActual.extEmail);
				// * Hacer Scroll AL Chat
				const seccionChat = document.getElementById('seccionChat');
				setTimeout(() => {
					seccionChat?.scrollTo({ top: seccionChat.scrollHeight, behavior: 'smooth' });
				}, 300);

				let currentLanguage = localStorage.getItem('localIdioma');
				i18next.changeLanguage(currentLanguage, function (err, t) {
					$('html').localize();
				});
			});
		} else {

			secondChatWindow.appendChild(thirdChatWindow);
			chatWindow.appendChild(secondChatWindow);
			// ? NAV CHAT SINGLE O INDIVIDUAL
			nombreCliente.innerHTML = `
        <div class="chat-header">
        <div class="row valign-wrapper" id="nombreCliente">
        <div class="col media-image online pr-0">
            <i class="material-icons circle z-depth-2 responsive-img"
                style="font-size:33px; color:#276E90; padding:6px;">${ICON_CHAT}</i>
  
        </div>
        <div class="col">
            <p class="m-0 blue-grey-text text-darken-4 font-weight-700"
                id="celularCliente">${cellPhoneNumber}</p>
                <p id="chatIDHeader" style='display:none;'>${chatID}</p>
        </div> 
    </div>
    <span class="option-icon">

              <i class="material-icons modal-trigger tooltipped"
              id="btn_modal_directorio_contactos_single" style="text-align: right;"
              href="#modal_directorio_contactos" data-poasition="top" data-tooltip="Directorio Contactos" onclick="ctrl_modal_directorio_contactos();">contacts</i>
              
              <span style="margin: 0 3px;"></span>
  
                 <!-- <i class="material-icons modal-trigger" id="searchInfoClient" style="text-align: right" href="#modalInfoCliente" onclick="shwoInfoUser(${cellPhoneNumber});">info_outline</i> -->
  
          
        <ul id='dropdown2' class='dropdown-content'
            style="width: 150px; text-align:center;  ">
            <li style="line-height:0.5rem;min-height:20px;">
                <a class="modal-trigger"
                    href="#modalTransferir"
                    style="font-size: 13px; padding:3px 3px; text-align:center;color:#707070" onclick="showModaltransferir();"><span data-i18n="Transferir">Transferir</span></a>
            </li>
        </ul>
    </span>
    </div>`;

			chatFooter.innerHTML = `
        <form onsubmit=""  class="chat-input" enctype="multipart/form-data" autocomplete="off">
          <i class="material-icons " style="cursor: pointer;"  >attach_file</i>
          <i class="material-icons "   style="cursor: pointer;" href="#modalPlantillas" >description</i>
          <input type="text" placeholder="Message" class="message mb-0" disabled>
          <i class="material-icons "   style="cursor: pointer;" href="#modalPlantillas" >description</i>
          <a><i class="material-icons" style="padding-right: 5px;cursor:pointer;color:#6C7082;">send</i></a>
        </form>`;

			const mainContainerChat = document.getElementById('mainContainerChat');
			const mainContainerTipificar = document.getElementById('mainContainerTipificar');
			mainContainerChat.innerHTML = ``;
			mainContainerTipificar.innerHTML = ``;

			mainContainerChat.appendChild(nombreCliente);
			mainContainerChat.appendChild(chatWindow);
			mainContainerChat.appendChild(chatFooter);

			M.Tooltip.init(document.querySelectorAll('.tooltipped'))
		}

		document.getElementById("loaderGeneral").style.display = "none";


		// * Actualizacion para indicar que los chats ya fueron leidos
		const infoSection = document.querySelectorAll('.info-section');
		let chatsContainer = document.getElementById('sectionChatMenu').children;
		// verificar si el chat tiene un contador para quitarle el contador (circulito azul :v)
		for (let j = 0; j < chatsContainer.length; j++) {
			chatsContainer[j].style.backgroundColor = '#ffff';
			// console.log('está en el for');
			if (chatsContainer[j].id == chatID) {
				chatsContainer[j].style.backgroundColor = '#b6ddff99';
				// verificar si el chat ya tiene un contador 
				if (infoSection[j].getElementsByClassName('badge badge pill').length > 0) {
					let span = document.getElementsByClassName('badge badge pill')
					// se remueve el span que estaba
					//console.log("salida ", infoSection)
					if (infoSection[j] != "") {

						infoSection[j]?.removeChild(span[0]);
					}
				}
			}
		}

		// *** Recursiva - Revisando entrada de mensajes
		// clearInterval(idInterval);
		if (idInterval) {
			clearTimeout(idInterval);
		}

		const checkNewMessage = async () => {
			clearTimeout(idInterval);
			try {
				await showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));
			} finally {
				idInterval = setTimeout(() => {
					checkNewMessage();
				}, 5000);
			}
		};
		checkNewMessage();
		/* document.getElementById("loaderGeneral").style.display = "none"; */
	});
}
// CODIGO ANTES...
// function shwoConversation(chatID, cellPhoneNumber, nombre_contacto_chat) {

//     if (!nombre_contacto_chat) {
//         nombre_contacto_chat = cellPhoneNumber.substring(2, 13);
//     }
//     document.getElementById("loaderGeneral").style.display = "flex";
//     localStorage.setItem('numChatActual', cellPhoneNumber);
//     localStorage.setItem('idChatActual', chatID);
//     const mainContainerChat = document.getElementById('mainContainerChat');
//     const mainContainerTipificar = document.getElementById('mainContainerTipificar');
//     mainContainerChat.innerHTML = ``;
//     mainContainerTipificar.innerHTML = ``;

//     let nombreCliente = document.createElement('div');
//     let chatWindow = document.createElement('div');
//     let secondChatWindow = document.createElement('div');
//     let thirdChatWindow = document.createElement('div');
//     let chatFooter = document.createElement('div');

//     //seccion del chat =>chatWindow
//     chatWindow.setAttribute('class', 'chat-area ps ps--active-y');
//     chatWindow.setAttribute('style', 'overflow-y:auto !important');
//     chatWindow.setAttribute('id', 'seccionChat');
//     secondChatWindow.setAttribute('class', 'chats');
//     thirdChatWindow.setAttribute('class', 'chats');
//     thirdChatWindow.setAttribute('id', 'chatContainer');
//     thirdChatWindow.setAttribute('style', 'overflow-y:auto');
//     chatFooter.setAttribute('class', 'chat-footer');
//     chatWindow.addEventListener('scroll', () => {
//         checkScrollPosition(chatID, cellPhoneNumber);
//     });
//     secondChatWindow.appendChild(thirdChatWindow);
//     chatWindow.appendChild(secondChatWindow);
//     postData(`${URL_API_CONSULTAR}/searchConversation`, { chatID, cellPhoneNumber, nombreDeUsuario, authToken }).then(async (res) => {
//         // console.log(res);
//         const seccionChat = document.getElementById('seccionChat');
//         let infoClientActual = {
//             id: '',
//             direccion: '',
//             nombre: '',
//             tipoDocumento: '',
//             numDocumento: '',
//             celular: '',
//             telefono2: '',
//             correo: '',
//         };

//         let arrImgTypes = ['jpeg', 'png', 'webp', 'jpg'],
//             arrVideoTypes = ['mp4'],
//             arrDocsTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xlx', 'xlxs', 'txt', 'csv'];

//         // * Guardar Numero de mensajes del chat
//         localStorage.setItem('countMessages', res.conversation.length);
//         if (res.conversation.length > 0) {
//             //buscar informacion del cliente
//             postData('mensajeria/searchInfoUser', { cellPhoneNumber: cellPhoneNumber }).then(async (resInfo) => {
//                 if (resInfo.length > 0) {
//                     infoClientActual = {
//                         id: resInfo[0].EnCryptId,
//                         direccion: resInfo[0].CLI_DIRECCION || '',
//                         nombre: resInfo[0].CLI_NAME || '',
//                         tipoDocumento: resInfo[0].CLI_IDENTIFICATION_TYPE || '',
//                         numDocumento: resInfo[0].CLI_IDENTIFICATION_NUMBER || '',
//                         celular: resInfo[0].CLI_CELLPHONE_NUMBER || '',
//                         telefono2: resInfo[0].CLI_TELEFONO2 || '',
//                         correo: resInfo[0].CLI_EMAIL || '',
//                     };
//                 }
//                 // ? NAV CHAT SINGLE O INDIVIDUAL
//                 nombreCliente.innerHTML = `
//         <div class="chat-header">
//           <div class="row valign-wrapper" id="nombreCliente">
//             <div class="col media-image online pr-0">
//               <i class="material-icons circle z-depth-2 responsive-img" style="font-size: 40px; color: #276e90">account_circle</i>
//             </div>
//             <div class="col">
//               <p class="m-0 blue-grey-text text-darken-4 font-weight-700" id="celularCliente">${nombre_contacto_chat}</p>
//               <p id="chatIDHeader" style="display: none">${chatID}</p>
//             </div>
//           </div>
//           <span class="option-icon">
//             <i class="material-icons modal-trigger tooltipped" id="btn_modal_directorio_contactos_single" style="text-align: right" href="#modal_directorio_contactos" data-poasition="top" data-tooltip="Directorio Contactos" onclick="ctrl_modal_directorio_contactos();">contacts</i>

//             <span style="margin: 0 3px"></span>

//             <!-- <i class="material-icons modal-trigger" id="searchInfoClient" style="text-align: right" href="#modalInfoCliente" onclick="shwoInfoUser(${cellPhoneNumber});">info_outline</i> -->

//             <ul id="dropdown2" class="dropdown-content" style="width: 150px; text-align: center">
//               <li style="line-height: 0.5rem; min-height: 20px">
//                 <a class="modal-trigger" href="#modalTransferir" style="font-size: 13px; padding: 3px 3px; text-align: center; color: #707070" onclick="showModaltransferir();"><span data-i18n="Transferir">Transferir</span></a>
//               </li>
//             </ul>
//           </span>
//         </div>`;
//                 let conversations = res.conversation;
//                 localStorage.setItem('idfirstmessage', conversations[0].PK_MES_NCODE);
//                 // chat content
//                 for (let i = 0; i < conversations.length; i++) {
//                     // * Validar tipo de mensaje
//                     const MES_MEDIA_TYPE = conversations[i].MES_MEDIA_TYPE;
//                     const MES_MEDIA_URL = conversations[i].MES_MEDIA_URL;
//                     const MES_MESSAGE_ID = conversations[i].MES_MESSAGE_ID;
//                     const MES_BODY = conversations[i].MES_BODY;
//                     const MES_CHANNEL = conversations[i].MES_CHANNEL;
//                     const MES_CREATION_DATE = conversations[i].MES_CREATION_DATE;
//                     const MES_AUTHOR = conversations[i].MES_AUTHOR

//                     let autor_mensaje_entrante = '';

//                     if (MES_AUTHOR && MES_AUTHOR !== '.') {
//                         autor_mensaje_entrante = MES_AUTHOR;
//                     } else {
//                         autor_mensaje_entrante = 'Usuario';
//                     }
//                     // if (MES_MEDIA_TYPE !== null && arrImgTypes.includes(MES_MEDIA_TYPE)) isFileImg = true;
//                     // if (MES_MEDIA_TYPE !== null && arrDocsTypes.includes(MES_MEDIA_TYPE)) isFileDoc = true;
//                     // if (MES_MEDIA_TYPE !== null && arrVideoTypes.includes(MES_MEDIA_TYPE)) isFileVideo = true;
//                     // if (MES_MEDIA_TYPE !== null && MES_MEDIA_TYPE.includes('ogg')) isFileAudio = true;

//                     let tipoMsg = 'text';

//                     if (MES_MEDIA_TYPE !== null && arrImgTypes.includes(MES_MEDIA_TYPE)) tipoMsg = 'img';
//                     if (MES_MEDIA_TYPE !== null && arrDocsTypes.includes(MES_MEDIA_TYPE)) tipoMsg = 'doc';
//                     if (MES_MEDIA_TYPE !== null && arrVideoTypes.includes(MES_MEDIA_TYPE)) tipoMsg = 'video';
//                     if (MES_MEDIA_TYPE !== null && ['ogg', 'mp3'].includes(MES_MEDIA_TYPE)) tipoMsg = 'audio';


//                     if (conversations[i].MES_CHANNEL == 'RECEIVED') {
//                         thirdChatWindow.innerHTML += `
//               <div class="chat">
//                 <div class="chat-body">
//                 <span style="font-weight: bold; color: blue;">${autor_mensaje_entrante} Dice:</span>
//                   <div class="chat-text${tipoMsg === 'audio' ? 'F' : ''}" ${MES_MEDIA_TYPE === null ? '' : tipoMsg === 'img' ? 'style="max-width: 350px;"' : ''}>
//                     ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL })}
//                   </div>
//                 </div>
//               </div>`;
//                     }

//                     if (conversations[i].MES_CHANNEL == 'SEND') {
//                         thirdChatWindow.innerHTML += `
//               <div class="chat chat-right">
//                 <div class="chat-body">
//                 <span style="font-weight: bold; color: green;">${autor_mensaje_entrante} Dice:</span>
//                   <div class="chat-text" ${MES_MEDIA_TYPE === null ? '' : tipoMsg === 'img' ? 'style="max-width: 350px"' : ''}>
//                     ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL })}
//                   </div>
//                 </div>
//               </div>`;
//                     }

//                     if (conversations[i].MES_CHANNEL == 'ADMIN') {
//                         thirdChatWindow.innerHTML += `
//               <div class="chat chatRecibidoAdminAgente">
//                 <div class="chat-body">
//                 <span style="font-weight: bold; color: green;">${autor_mensaje_entrante} Dice:</span>
//                   <div class="chat-text">
//                     ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL })}
//                   </div>
//                 </div>
//               </div>`;
//                     }
//                 }

//                 const tipoCanal = res.tipoCanal;
//                 //footer chat
//                 chatFooter.innerHTML = `
//           <form onsubmit="" action="javascript:void(0);" class="chat-input" enctype="multipart/form-data" autocomplete="off">
//             <i class="material-icons modal-trigger tooltipped" style="cursor: pointer;" id="iconSendFile" href="#modalSendFile" data-position="top" data-tooltip="Adjuntos">attach_file</i>
//             <i class="material-icons modal-trigger tooltipped" onclick="showPlantillas();" id="verPlantillas" style="cursor: pointer; margin-right: 5px" href="#modalPlantillas" data-position="top" data-tooltip="Plantillas">description</i>
//             <textarea style="resize: none;border: none; outline: none; height: 55px;" type="text" placeholder="Message" class="message mb-0" id="messageToSend"></textarea>
//             <a onclick="sendMessage('${cellPhoneNumber}','${chatID}');" id="btnSendMessage"><i class="material-icons" style="padding-top: 3px;cursor:pointer;color:#6C7082;">send</i></a>
//           </form>`;

//                 const mainContainerChat = document.getElementById('mainContainerChat');
//                 const mainContainerTipificar = document.getElementById('mainContainerTipificar');
//                 mainContainerChat.innerHTML = ``;
//                 mainContainerTipificar.innerHTML = ``;

//                 mainContainerChat.appendChild(nombreCliente);
//                 mainContainerChat.appendChild(chatWindow);
//                 mainContainerChat.appendChild(chatFooter);
//                 M.Tooltip.init(document.querySelectorAll('.tooltipped'))

//                 // * actualiza campo MES_MESSAGE_SHOW a '1' a los mensajes anteriores
//                 const estoxd = await postData(`${URL_API_CONSULTAR}/updateReadMessages`, { chatID, nombreDeUsuario, authToken });
//                 let messageToSend = document.getElementById('messageToSend');

//                 // enviar mensaje con enter
//                 messageToSend.addEventListener('keyup', async (e) => {
//                     if (e.key === 'Enter') {
//                         texto = messageToSend.value;
//                         let numChatActual = localStorage.getItem('numChatActual');
//                         let idChatActual = localStorage.getItem('idChatActual');
//                         if (texto == null) {
//                             alert('No puede  enviar un mensaje vacio')
//                         } else {
//                             const UserId = localStorage.getItem('UserId');

//                             try {
//                                 const resMessage = await postData(`${URB_API_ENVIAR_MSG}/sendMessage`, { To: numChatActual, body: texto, GestionID: idChatActual, usuario: nombreDeUsuario, nombreDeUsuario, authToken, UserId });
//                                 showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));
//                                 messageToSend.focus();
//                                 messageToSend.value = '';

//                                 if (resMessage.error) {
//                                     M.toast({ html: 'Se genero un error, intente de nuevo' });
//                                     console.log('Error /sendMessage', resMessage.msg);
//                                 }

//                             } catch (error) {
//                                 M.toast({ html: 'Se genero un error, intente de nuevo' });
//                                 console.log('Error al enviar mensaje por Enter\n', error);
//                             }
//                         }

//                     }
//                 });

//                 // ? FORMULARIO TIPIFICACION SINGLE CHAT
//                 const formularioTipificacion = `
//           <div class="row" style='padding: 15px; height: 100%;'>
//             ${res.tipificacion.length ? `` : ''}
//             <form id='formTipificacion' class="col s12" style="scroll-behavior: auto;overflow-y: auto;height: 90%;position: absolute;">
//               <div class="row ">
//                 <div style="text-align:center">
//                     <h6 data-i18n="Opciones">Opciones</h6>
//                 </div>
//                 <div class="input-field col s12" style="display:none">
//                 <i class="material-icons prefix">person</i>
//                 <input id="inpAgente" type="tel" class="validate obli" data-campo='Nombre Agente' value="${name_user_log}" disabled>
//                 </div>
//                 <div class="col s12" style="text-align: center; padding-top: 50px;">
//                   <button type='button' id="btnSendTyp" class="waves-effect waves-light btn-small" onclick="sendTypification('${chatID}', '${infoClientActual.id}', '${res.tipoGestion}')" ><span data-i18n="Cerrar Chat">Cerrar Chat</span> </button>
//                 </div>
//               </div>
//             </form>
//           </div>`;
//                 /* const formularioTipificacion = `
//                   <div class="row" style='padding: 15px; height: 100%;'>
//                     ${res.tipificacion.length ? `` : ''}
//                     <form id='formTipificacion' class="col s12" style="scroll-behavior: auto;overflow-y: auto;height: 90%;position: absolute;">
//                       <div class="row ">
//                         <div style="text-align:center">
//                             <h6 data-i18n="Cerrar Chat">Cerrar Chat</h6>
//                         </div>

//                         <div class="input-field col s12">
//                           <i class="material-icons prefix">phone</i>
//                           <input  id="celularClienteTip" type="text" class="validate" value="${cellPhoneNumber}" disabled>
//                         </div>

//                         <div class="input-field col s12">
//                           <i class="material-icons prefix">comment</i>
//                           <input id="inpAgente" type="tel" class="validate obli" data-campo='Nombre Agente	'>
//                           <label for="inpAgente" data-i18n="Nombre Agente">Nombre Agente</label>
//                         </div>

//                         <div class="input-field col s12">
//                           <i class="material-icons prefix">comment</i>
//                           <input id="inpCliente" type="tel" class="validate obli" data-campo='Nombre Cliente	'>
//                           <label for="inpCliente" data-i18n="Nombre Cliente">Nombre Cliente</label>
//                         </div>

//                         <div class="input-field col s12">
//                           <i class="material-icons prefix">comment</i>
//                           <input id="inpCaso" type="tel" class="validate obli" data-campo='N° Caso	'>
//                           <label for="inpCaso" data-i18n="N° Caso">N° Caso</label>
//                         </div>

//                         <div class="input-field col s12">
//                             <i class="material-icons prefix">comment</i>
//                             <select class="select obli" id="selTipificacion" data-campo='Tipificación'>
//                                 <option value="" disabled selected>Elije una opción</option>
//                                 <option value="Se escala con Ing.">Se escala con Ing.</option>
//                                 <option value="Se escala con gas solutions">Se escala con gas solutions</option>
//                                 <option value="Se remite con devitech">Se remite con devitech</option>
//                                 <option value="Se valida cartera">Se valida cartera</option>
//                                 <option value="Se valida placa">Se valida placa</option>
//                                 <option value="Se autoriza VFS">Se autoriza VFS</option>
//                                 <option value="Cambio de parámetros">Cambio de parámetros</option>
//                                 <option value="Asignación de Chip">Asignación de Chip</option>
//                                 <option value="Asignación de Placa">Asignación de Placa</option>
//                                 <option value="Validación de contrato">Validación de contrato</option>
//                                 <option value="Validación de extra-cupo">Validación de extra-cupo</option>
//                                 <option value="Soporte de sistemas">Soporte de sistemas</option>
//                                 <option value="Autorización AE">Autorización AE</option>
//                                 <option value="Soporte Flotas">Soporte Flotas</option>
//                                 <option value="Cargue de puntos">Cargue de puntos</option>
//                                 <option value="Validación de JDZ">Validación de JDZ</option>
//                                 <option value="Validación de comercial">Validación de comercial</option>
//                                 <option value="Validación Staff Terpel COS">Validación Staff Terpel COS</option>
//                                 <option value="Liberaciones">Liberaciones</option>
//                                 <option value="Autorizacion de cartera">Autorizacion de cartera</option>
//                                 <option value="Autor Manual">Autor Manual</option>
//                                 <option value="Validación de empresa / flota">Validación de empresa / flota</option>
//                                 <option value="Validación de cartera">Validación de cartera</option>
//                                 <option value="Cierre por no gestión de celulares">Cierre por no gestión de celulares</option>
//                             </select>
//                             <label data-i18n="Motivo">Motivo</label>
//                         </div>

//                         <div class="col s12" style="text-align: center;">
//                           <button type='button' id="btnSendTyp" class="waves-effect waves-light btn-small" onclick="sendTypification('${chatID}', '${infoClientActual.id}', '${res.tipoGestion}')" ><span data-i18n="Cerrar y Enviar">Cerrar y Enviar</span> </button>
//                         </div>
//                       </div>
//                     </form>
//                   </div>`; */

//                 mainContainerTipificar.innerHTML = formularioTipificacion;

//                 document.getElementById('containerDropdownTip').innerHTML = `<ul id='dropdownTip' style="width: 250px;" class='dropdown-content'></ul>`;

//                 let dropdownTip = document.getElementById('dropdownTip'),
//                     htmlTip = '';
//                 res.tipificacion.forEach((tip) => {
//                     htmlTip += `<li><a href="#"><span>${tip.TYP_OBSERVACIONES}</span></a></li>`;
//                 });
//                 dropdownTip.innerHTML = htmlTip;

//                 var elemsDropdown = document.querySelectorAll('.dropdown-trigger');
//                 M.Dropdown.init(elemsDropdown);
//                 var elemsSelect = document.querySelectorAll('.select');
//                 M.FormSelect.init(elemsSelect);
//                 $('input.input_text, textarea#textarea2').characterCounter();
//                 const emailOptions = document.querySelectorAll('#selectEmailTip option'),
//                     emailSelect = document.getElementById('selectEmailTip');
//                 showSelectOnForm(emailOptions, emailSelect, infoClientActual.extEmail);
//                 // * Hacer Scroll AL Chat
//                 const seccionChat = document.getElementById('seccionChat');
//                 setTimeout(() => {
//                     seccionChat?.scrollTo({ top: seccionChat.scrollHeight, behavior: 'smooth' });
//                 }, 300);

//                 let currentLanguage = localStorage.getItem('localIdioma');
//                 i18next.changeLanguage(currentLanguage, function (err, t) {
//                     $('html').localize();
//                 });
//             });
//         } else {

//             secondChatWindow.appendChild(thirdChatWindow);
//             chatWindow.appendChild(secondChatWindow);
//             // ? NAV CHAT SINGLE O INDIVIDUAL
//             nombreCliente.innerHTML = `
//         <div class="chat-header">
//         <div class="row valign-wrapper" id="nombreCliente">
//         <div class="col media-image online pr-0">
//             <i class="material-icons circle z-depth-2 responsive-img"
//                 style="font-size: 40px;color:#276E90;">account_circle</i>

//         </div>
//         <div class="col">
//             <p class="m-0 blue-grey-text text-darken-4 font-weight-700"
//                 id="celularCliente">${cellPhoneNumber}</p>
//                 <p id="chatIDHeader" style='display:none;'>${chatID}</p>
//         </div> 
//     </div>
//     <span class="option-icon">

//               <i class="material-icons modal-trigger tooltipped"
//               id="btn_modal_directorio_contactos_single" style="text-align: right;"
//               href="#modal_directorio_contactos" data-poasition="top" data-tooltip="Directorio Contactos" onclick="ctrl_modal_directorio_contactos();">contacts</i>

//               <span style="margin: 0 3px;"></span>

//                  <!-- <i class="material-icons modal-trigger" id="searchInfoClient" style="text-align: right" href="#modalInfoCliente" onclick="shwoInfoUser(${cellPhoneNumber});">info_outline</i> -->


//         <ul id='dropdown2' class='dropdown-content'
//             style="width: 150px; text-align:center;  ">
//             <li style="line-height:0.5rem;min-height:20px;">
//                 <a class="modal-trigger"
//                     href="#modalTransferir"
//                     style="font-size: 13px; padding:3px 3px; text-align:center;color:#707070" onclick="showModaltransferir();"><span data-i18n="Transferir">Transferir</span></a>
//             </li>
//         </ul>
//     </span>
//     </div>`;

//             chatFooter.innerHTML = `
//         <form onsubmit=""  class="chat-input" enctype="multipart/form-data" autocomplete="off">
//           <i class="material-icons " style="cursor: pointer;"  >attach_file</i>
//           <i class="material-icons "   style="cursor: pointer;" href="#modalPlantillas" >description</i>
//           <input type="text" placeholder="Message" class="message mb-0" disabled>
//           <i class="material-icons "   style="cursor: pointer;" href="#modalPlantillas" >description</i>
//           <a><i class="material-icons" style="padding-right: 5px;cursor:pointer;color:#6C7082;">send</i></a>
//         </form>`;

//             const mainContainerChat = document.getElementById('mainContainerChat');
//             const mainContainerTipificar = document.getElementById('mainContainerTipificar');
//             mainContainerChat.innerHTML = ``;
//             mainContainerTipificar.innerHTML = ``;

//             mainContainerChat.appendChild(nombreCliente);
//             mainContainerChat.appendChild(chatWindow);
//             mainContainerChat.appendChild(chatFooter);

//             M.Tooltip.init(document.querySelectorAll('.tooltipped'))
//         }

//         document.getElementById("loaderGeneral").style.display = "none";


//         // * Actualizacion para indicar que los chats ya fueron leidos
//         const infoSection = document.querySelectorAll('.info-section');
//         let chatsContainer = document.getElementById('sectionChatMenu').children;
//         // verificar si el chat tiene un contador para quitarle el contador (circulito azul :v)
//         for (let j = 0; j < chatsContainer.length; j++) {
//             chatsContainer[j].style.backgroundColor = '#ffff';
//             // console.log('está en el for');
//             if (chatsContainer[j].id == chatID) {
//                 chatsContainer[j].style.backgroundColor = '#b6ddff99';
//                 // verificar si el chat ya tiene un contador 
//                 if (infoSection[j].getElementsByClassName('badge badge pill').length > 0) {
//                     let span = document.getElementsByClassName('badge badge pill')
//                     // se remueve el span que estaba
//                     //console.log("salida ", infoSection)
//                     if (infoSection[j] != "") {

//                         infoSection[j]?.removeChild(span[0]);
//                     }
//                 }
//             }
//         }

//         // *** Recursiva - Revisando entrada de mensajes
//         // clearInterval(idInterval);
//         if (idInterval) {
//             clearTimeout(idInterval);
//         }

//         const checkNewMessage = async () => {
//             clearTimeout(idInterval);
//             try {
//                 await showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));
//             } finally {
//                 idInterval = setTimeout(() => {
//                     checkNewMessage();
//                 }, 5000);
//             }
//         };
//         checkNewMessage();
//         /* document.getElementById("loaderGeneral").style.display = "none"; */
//     });
// }

// function shwoConversation2(chatID, cellPhoneNumber, nombrechat) {
//     /* document.getElementById("loaderGeneral").style.display = "flex"; */
//     localStorage.setItem('numChatActual', cellPhoneNumber);
//     localStorage.setItem('idChatActual', chatID);
//     const mainContainerChat = document.getElementById('mainContainerChat');
//     const mainContainerTipificar = document.getElementById('mainContainerTipificar');
//     mainContainerChat.innerHTML = ``;
//     mainContainerTipificar.innerHTML = ``;

//     let nombreCliente = document.createElement('div');
//     let chatWindow = document.createElement('div');
//     let secondChatWindow = document.createElement('div');
//     let thirdChatWindow = document.createElement('div');
//     let chatFooter = document.createElement('div');

//     //seccion del chat =>chatWindow
//     chatWindow.setAttribute('class', 'chat-area ps ps--active-y');
//     chatWindow.setAttribute('style', 'overflow-y:auto !important');
//     chatWindow.setAttribute('id', 'seccionChat');
//     secondChatWindow.setAttribute('class', 'chats');
//     thirdChatWindow.setAttribute('class', 'chats');
//     thirdChatWindow.setAttribute('id', 'chatContainer');
//     thirdChatWindow.setAttribute('style', 'overflow-y:auto');
//     chatFooter.setAttribute('class', 'chat-footer');
//     chatWindow.addEventListener('scroll', () => {
//         checkScrollPosition(chatID, cellPhoneNumber);
//     });
//     secondChatWindow.appendChild(thirdChatWindow);
//     chatWindow.appendChild(secondChatWindow);
//     postData(`${URL_API_CONSULTAR}/searchConversation`, { chatID, cellPhoneNumber, nombreDeUsuario, authToken }).then(async (res) => {
//         // console.log(res);
//         /* const seccionChat = document.getElementById('seccionChat'); */
//         let infoClientActual = {
//             id: '',
//             direccion: '',
//             nombre: '',
//             tipoDocumento: '',
//             numDocumento: '',
//             celular: '',
//             telefono2: '',
//             correo: '',
//         };

//         let arrImgTypes = ['jpeg', 'png', 'webp', 'jpg'],
//             arrVideoTypes = ['mp4'],
//             arrDocsTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xlx', 'xlxs', 'txt', 'csv'];

//         // * Guardar Numero de mensajes del chat
//         localStorage.setItem('countMessages', res.conversation.length);
//         if (res.conversation.length > 0) {
//             //buscar informacion del cliente
//             postData('mensajeria/searchInfoUser', { cellPhoneNumber: cellPhoneNumber }).then(async (resInfo) => {
//                 if (resInfo.length > 0) {
//                     infoClientActual = {
//                         id: resInfo[0].EnCryptId,
//                         direccion: resInfo[0].CLI_DIRECCION || '',
//                         nombre: resInfo[0].CLI_NAME || '',
//                         tipoDocumento: resInfo[0].CLI_IDENTIFICATION_TYPE || '',
//                         numDocumento: resInfo[0].CLI_IDENTIFICATION_NUMBER || '',
//                         celular: resInfo[0].CLI_CELLPHONE_NUMBER || '',
//                         telefono2: resInfo[0].CLI_TELEFONO2 || '',
//                         correo: resInfo[0].CLI_EMAIL || '',
//                     };
//                 }
//                 // ? NAV CHAT GROUP
//                 nombreCliente.innerHTML = `
//         <div class="chat-header">
//               <div class="row valign-wrapper" id="nombreCliente">
//               <div class="col media-image online pr-0">
//                 <i class="material-icons circle z-depth-2 responsive-img"
//                   style="font-size: 40px;color:#276E90;">account_circle</i>
//               </div>

//               <div class="col">
//                   <p class="m-0 blue-grey-text text-darken-4 font-weight-700"
//                       id="celularCliente">${nombrechat}</p>
//                       <p id="chatIDHeader" style='display:none;'>${chatID}</p>
//               </div> 
//           </div>
//           <span class="option-icon">

//               <i class="material-icons modal-trigger tooltipped"
//               id="btn_modal_directorio_contactos_group" style="text-align: right;"
//               href="#modal_directorio_contactos" data-poasition="top" data-tooltip="Directorio Contactos" onclick="ctrl_modal_directorio_contactos();">contacts</i>

//               <span style="margin: 0 3px;"></span>

//               <!--<i class="material-icons modal-trigger"
//                   id="searchInfoClient" style="text-align: right;"
//                   href="#modalInfoCliente" onclick="showInfoGestion('${chatID}');" >info_outline</i>-->



//               <ul id='dropdown2' class='dropdown-content'
//                   style="width: 150px; text-align:center;  ">
//                   <li style="line-height:0.5rem;min-height:20px;">
//                       <a class="modal-trigger"
//                           href="#modalTransferir"
//                           style="font-size: 13px; padding:3px 3px; text-align:center;color:#707070" onclick="showModaltransferir();"><span data-i18n="Transferir">Transferir</span></a>
//                   </li>
//               </ul>
//           </span>
//           </div>
//                     `;
//                 let conversations = res.conversation;
//                 localStorage.setItem('idfirstmessage', conversations[0].PK_MES_NCODE);
//                 // chat content
//                 for (let i = 0; i < conversations.length; i++) {
//                     // * Validar tipo de mensaje
//                     const MES_MEDIA_TYPE = conversations[i].MES_MEDIA_TYPE;
//                     const MES_MEDIA_URL = conversations[i].MES_MEDIA_URL;
//                     const MES_MESSAGE_ID = conversations[i].MES_MESSAGE_ID;
//                     const MES_BODY = conversations[i].MES_BODY;
//                     const MES_CHANNEL = conversations[i].MES_CHANNEL;
//                     const MES_CREATION_DATE = conversations[i].MES_CREATION_DATE;
//                     const MES_AUTHOR = conversations[i].MES_AUTHOR;
//                     let autor_mensaje_entrante = '';

//                     if (MES_AUTHOR && MES_AUTHOR !== '.') {
//                         autor_mensaje_entrante = MES_AUTHOR;
//                     } else {
//                         autor_mensaje_entrante = 'Usuario';
//                     }
//                     // if (MES_MEDIA_TYPE !== null && arrImgTypes.includes(MES_MEDIA_TYPE)) isFileImg = true;
//                     // if (MES_MEDIA_TYPE !== null && arrDocsTypes.includes(MES_MEDIA_TYPE)) isFileDoc = true;
//                     // if (MES_MEDIA_TYPE !== null && arrVideoTypes.includes(MES_MEDIA_TYPE)) isFileVideo = true;
//                     // if (MES_MEDIA_TYPE !== null && MES_MEDIA_TYPE.includes('ogg')) isFileAudio = true;

//                     let tipoMsg = 'text';

//                     if (MES_MEDIA_TYPE !== null && arrImgTypes.includes(MES_MEDIA_TYPE)) tipoMsg = 'img';
//                     if (MES_MEDIA_TYPE !== null && arrDocsTypes.includes(MES_MEDIA_TYPE)) tipoMsg = 'doc';
//                     if (MES_MEDIA_TYPE !== null && arrVideoTypes.includes(MES_MEDIA_TYPE)) tipoMsg = 'video';
//                     if (MES_MEDIA_TYPE !== null && ['ogg', 'mp3'].includes(MES_MEDIA_TYPE)) tipoMsg = 'audio';


//                     if (conversations[i].MES_CHANNEL == 'RECEIVED') {
//                         thirdChatWindow.innerHTML += `
//               <div class="chat">
//               <div class="chat-body">
//               <span style="font-weight: bold; color: blue;">${autor_mensaje_entrante} Dice:</span>
//                 <div class="chat-text${tipoMsg === 'audio' ? 'F' : ''}" ${MES_MEDIA_TYPE === null ? '' : tipoMsg === 'img' ? 'style="max-width: 250px;"' : ''}>
//                 ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL })}
//                 </div>
//               </div>
//             </div>`;
//                     }

//                     if (conversations[i].MES_CHANNEL == 'SEND') {
//                         thirdChatWindow.innerHTML += `
//               <div class="chat chat-right">
//                 <div class="chat-body">
//                 <span style="font-weight: bold; color: green;">${autor_mensaje_entrante} Dice:</span>
//                   <div class="chat-text" ${MES_MEDIA_TYPE === null ? '' : tipoMsg === 'img' ? 'style="max-width: 250px"' : ''}>
//                     ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL })}
//                   </div>
//                 </div>
//               </div>`;
//                     }

//                     if (conversations[i].MES_CHANNEL == 'ADMIN') {
//                         thirdChatWindow.innerHTML += `
//               <div class="chat chatRecibidoAdminAgente">
//                 <div class="chat-body">
//                 <span style="font-weight: bold; color: green;">${autor_mensaje_entrante} Dice:</span>
//                   <div class="chat-text">
//                     ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL })}
//                   </div>
//                 </div>
//               </div>`;
//                     }
//                 }

//                 const tipoCanal = res.tipoCanal;
//                 //footer chat
//                 chatFooter.innerHTML = `
//           <form onsubmit="" action="javascript:void(0);" class="chat-input" enctype="multipart/form-data" autocomplete="off">
//             <i class="material-icons modal-trigger tooltipped" style="cursor: pointer;" id="iconSendFile" href="#modalSendFile" data-position="top" data-tooltip="Adjuntos">attach_file</i>
//             <i class="material-icons modal-trigger tooltipped" onclick="showPlantillas();" id="verPlantillas" style="cursor: pointer; margin-right: 5px" href="#modalPlantillas" data-position="top" data-tooltip="Plantillas">description</i>
//             <textarea style="resize: none;border: none; outline: none; height: 55px;" type="text" placeholder="Message" class="message mb-0" id="messageToSend"></textarea>
//             <a onclick="sendMessage('${cellPhoneNumber}','${chatID}');" id="btnSendMessage"><i class="material-icons" style="padding-top: 3px;cursor:pointer;color:#6C7082;">send</i></a>
//           </form>`;

//                 const mainContainerChat = document.getElementById('mainContainerChat');
//                 const mainContainerTipificar = document.getElementById('mainContainerTipificar');
//                 mainContainerChat.innerHTML = ``;
//                 /* mainContainerTipificar.innerHTML = ``; */

//                 mainContainerChat.appendChild(nombreCliente);
//                 mainContainerChat.appendChild(chatWindow);
//                 mainContainerChat.appendChild(chatFooter);
//                 M.Tooltip.init(document.querySelectorAll('.tooltipped'))

//                 // * actualiza campo MES_MESSAGE_SHOW a '1' a los mensajes anteriores
//                 const estoxd = await postData(`${URL_API_CONSULTAR}/updateReadMessages`, { chatID, nombreDeUsuario, authToken });
//                 let messageToSend = document.getElementById('messageToSend');

//                 // enviar mensaje con enter
//                 messageToSend.addEventListener('keyup', async (e) => {
//                     if (e.key === 'Enter') {
//                         texto = messageToSend.value;
//                         let numChatActual = localStorage.getItem('numChatActual');
//                         let idChatActual = localStorage.getItem('idChatActual');
//                         if (texto == null) {
//                             alert('No puede  enviar un mensaje vacio')
//                         } else {
//                             const UserId = localStorage.getItem('UserId');

//                             try {
//                                 const resMessage = await postData(`${URB_API_ENVIAR_MSG}/sendMessage`, { To: numChatActual, body: texto, GestionID: idChatActual, usuario: nombreDeUsuario, nombreDeUsuario, authToken, UserId });
//                                 showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));
//                                 messageToSend.focus();
//                                 messageToSend.value = '';

//                                 if (resMessage.error) {
//                                     M.toast({ html: 'Se genero un error, intente de nuevo' });
//                                     console.log('Error /sendMessage', resMessage.msg);
//                                 }

//                             } catch (error) {
//                                 M.toast({ html: 'Se genero un error, intente de nuevo' });
//                                 console.log('Error al enviar mensaje por Enter\n', error);
//                             }
//                         }

//                     }
//                 });

//                 // ?  FORMULARIO TIPIFIACION GROUP
//                 const formularioTipificacion = `
//           <div class="row" style='padding: 15px; height: 100%;'>
//             ${res.tipificacion.length ? `` : ''}
//             <form id='formTipificacion' class="col s12" style="scroll-behavior: auto;overflow-y: auto;height: 90%;position: absolute;">
//               <div class="row ">
//                 <div style="text-align:center">
//                     <h5 data-i18n="Tipificacion">Tipificacion</h5>
//                     <span style="font-weight: bold;">
//                       <i class="material-icons prefix small">alarm_on</i>
//                     </span>
//                     <span id="tmo">00:00:00</span>
//                 </div>

//                 <div class="input-field col s12" style="display:none">
//                   <i class="material-icons prefix">phone</i>
//                   <input  id="txt_fecha_hora_inicio_tipificacion" type="text" disabled>
//                 </div>
//                 <div class="input-field col s12" style="display:none">
//                   <i class="material-icons prefix">phone</i>
//                   <input  id="txt_fecha_hora_registro" type="text" disabled>
//                 </div>

//                 <div class="input-field col s12" style="display:none">
//                   <i class="material-icons prefix">phone</i>
//                   <input  id="celularClienteTip" type="text" class="validate" value="${cellPhoneNumber}" disabled>
//                 </div>

//                 <div class="input-field col s12" style="display:none">
//                   <i class="material-icons prefix">person</i>
//                   <input id="inpAgente" type="tel" class="validate obli" data-campo='Nombre Agente' value="${name_user_log}" disabled>
//                 </div>

//                 <div class="input-field col s12">
//                   <i class="material-icons prefix">local_offer</i>
//                   <label for="inpCaso" data-i18n="N° Caso">N° Caso</label>
//                   <input id="inpCaso" type="tel" class="validate obli" data-campo='N° Caso	'  onkeyup="habilitar_ctrl_tmo(); valida_inpCaso();" onclick="habilitar_ctrl_tmo(); valida_inpCaso();" autocomplete="off">
//                   <div class="invalid-feedback">
//                   </div>
//                 </div>


//                 <div class="input-field col s12">
//                     <i class="material-icons prefix">playlist_add_check</i>
//                     <select class="select obli" id="selTipificacion" data-campo='Tipificación'>
//                         <option value="" disabled selected>Elije una opción</option>
//                         <option value="Se escala con Ing.">Se escala con Ing.</option>
//                         <option value="Se escala con gas solutions">Se escala con gas solutions</option>
//                         <option value="Se remite con devitech">Se remite con devitech</option>
//                         <option value="Se valida cartera">Se valida cartera</option>
//                         <option value="Se valida placa">Se valida placa</option>
//                         <option value="Se autoriza VFS">Se autoriza VFS</option>
//                         <option value="Cambio de parámetros">Cambio de parámetros</option>
//                         <option value="Asignación de Chip">Asignación de Chip</option>
//                         <option value="Asignación de Placa">Asignación de Placa</option>
//                         <option value="Validación de contrato">Validación de contrato</option>
//                         <option value="Validación de extra-cupo">Validación de extra-cupo</option>
//                         <option value="Soporte de sistemas">Soporte de sistemas</option>
//                         <option value="Autorización AE">Autorización AE</option>
//                         <option value="Soporte Flotas">Soporte Flotas</option>
//                         <option value="Cargue de puntos">Cargue de puntos</option>
//                         <option value="Validación de JDZ">Validación de JDZ</option>
//                         <option value="Validación de comercial">Validación de comercial</option>
//                         <option value="Validación Staff Terpel COS">Validación Staff Terpel COS</option>
//                         <option value="Liberaciones">Liberaciones</option>
//                         <option value="Autorizacion de cartera">Autorizacion de cartera</option>
//                         <option value="Autor Manual">Autor Manual</option>
//                         <option value="Validación de empresa / flota">Validación de empresa / flota</option>
//                         <option value="Validación de cartera">Validación de cartera</option>
//                         <option value="Cierre por no gestión de celulares">Cierre por no gestión de celulares</option>
//                     </select>
//                     <label data-i18n="Motivo">Motivo</label>
//                 </div>

//                 <div class="input-field col s12">
//                   <i class="material-icons prefix">access_time</i>
//                   <input id="txt_hora_inicio_chat" type="tel" class="ctrl_visual_campo validate obli" data-campo='Hora Inicio Chat' maxlength="5" onkeyup="valida_txt_hora_inicio_chat();" onclick="valida_txt_hora_inicio_chat();" autocomplete="off">
//                   <label for="txt_hora_inicio_chat" data-i18n="Hora Inicio Chat">Hora Inicio Chat</label>
//                   <div class="invalid-feedback">
//                   </div>
//                 </div>

//                 <div class="input-field col s12">
//                   <i class="material-icons prefix">timer</i>
//                   <input id="txt_hora_fin_chat" type="tel" class="ctrl_visual_campo validate obli" data-campo='Hora Fin Chat' maxlength="5" onkeyup="valida_txt_hora_fin_chat();" onclick="valida_txt_hora_fin_chat();" autocomplete="off">
//                   <label for="txt_hora_fin_chat" data-i18n="Hora Fin Chat">Hora Fin Chat</label>
//                   <div class="invalid-feedback">
//                   </div>
//                 </div>

//                 <div class="col s12" style="text-align: center;">
//                   <button type='button' id="btnSendTyp" class="waves-effect waves-light btn-small" onclick="sendTypification2('${chatID}', '${infoClientActual.id}', '${res.tipoGestion}'); limpiarFormulario();" ><i class="material-icons prefix">save</i> <span data-i18n="Cerrar y Enviar"> Cerrar y Enviar</span> </button>
//                 </div>
//               </div>
//             </form>
//           </div>`;

//                 mainContainerTipificar.innerHTML = formularioTipificacion;


//                 // ? ENFOCO EL CAMPO PRINCIPAL
//                 document.getElementById('inpCaso').focus();
//                 // ? LLAMO CONTROL VISUAL DEL CAMPO
//                 valida_inpCaso();

//                 document.getElementById('containerDropdownTip').innerHTML = `<ul id='dropdownTip' style="width: 250px;" class='dropdown-content'></ul>`;

//                 let dropdownTip = document.getElementById('dropdownTip'),
//                     htmlTip = '';
//                 res.tipificacion.forEach((tip) => {
//                     htmlTip += `<li><a href="#"><span>${tip.TYP_OBSERVACIONES}</span></a></li>`;
//                 });
//                 dropdownTip.innerHTML = htmlTip;

//                 var elemsDropdown = document.querySelectorAll('.dropdown-trigger');
//                 M.Dropdown.init(elemsDropdown);
//                 var elemsSelect = document.querySelectorAll('.select');
//                 M.FormSelect.init(elemsSelect);
//                 $('input.input_text, textarea#textarea2').characterCounter();
//                 const emailOptions = document.querySelectorAll('#selectEmailTip option'),
//                     emailSelect = document.getElementById('selectEmailTip');
//                 showSelectOnForm(emailOptions, emailSelect, infoClientActual.extEmail);
//                 // * Hacer Scroll AL Chat
//                 const seccionChat = document.getElementById('seccionChat');
//                 setTimeout(() => {
//                     seccionChat?.scrollTo({ top: seccionChat.scrollHeight, behavior: 'smooth' });
//                 }, 300);

//                 let currentLanguage = localStorage.getItem('localIdioma');
//                 i18next.changeLanguage(currentLanguage, function (err, t) {
//                     $('html').localize();
//                 });
//             });
//         } else {

//             secondChatWindow.appendChild(thirdChatWindow);
//             chatWindow.appendChild(secondChatWindow);
//             // ! ?????????????????????????????????????????????????????
//             // ? NAV CHAT NO IDENTIFICADO
//             nombreCliente.innerHTML = `
//         <div class="chat-header">
//         <div class="row valign-wrapper" id="nombreCliente">
//         <div class="col media-image online pr-0">
//             <i class="material-icons circle z-depth-2 responsive-img"
//                 style="font-size: 40px;color:#276E90;">account_circle</i>

//         </div>
//         <div class="col">
//             <p class="m-0 blue-grey-text text-darken-4 font-weight-700"
//                 id="celularCliente">${cellPhoneNumber}</p>
//                 <p id="chatIDHeader" style='display:none;'>${chatID}</p>
//         </div> 
//     </div>
//     <span class="option-icon">

//               <i class="material-icons modal-trigger tooltipped"
//               id="btn_modal_directorio_contactos_noidentificado" style="text-align: right;"
//               href="#modal_directorio_contactos" data-poasition="top" data-tooltip="Directorio Contactos" onclick="ctrl_modal_directorio_contactos();">contacts</i>

//               <span style="margin: 0 3px;"></span>

//         <!-- <i class="material-icons modal-trigger" id="searchInfoClient" style="text-align: right" href="#modalInfoCliente" onclick="shwoInfoUser(${cellPhoneNumber});">info_outline</i> -->


//         <ul id='dropdown2' class='dropdown-content'
//             style="width: 150px; text-align:center;  ">
//             <li style="line-height:0.5rem;min-height:20px;">
//                 <a class="modal-trigger"
//                     href="#modalTransferir"
//                     style="font-size: 13px; padding:3px 3px; text-align:center;color:#707070" onclick="showModaltransferir();"><span data-i18n="Transferir">Transferir</span></a>
//             </li>
//         </ul>
//     </span>
//     </div>`;

//             chatFooter.innerHTML = `
//         <form onsubmit=""  class="chat-input" enctype="multipart/form-data" autocomplete="off">
//           <i class="material-icons " style="cursor: pointer;"  >attach_file</i>
//           <i class="material-icons "   style="cursor: pointer;" href="#modalPlantillas" >description</i>
//           <input type="text" placeholder="Message" class="message mb-0" disabled>
//           <i class="material-icons "   style="cursor: pointer;" href="#modalPlantillas" >description</i>
//           <a><i class="material-icons" style="padding-right: 5px;cursor:pointer;color:#6C7082;">send</i></a>
//         </form>`;

//             const mainContainerChat = document.getElementById('mainContainerChat');
//             const mainContainerTipificar = document.getElementById('mainContainerTipificar');
//             mainContainerChat.innerHTML = ``;
//             mainContainerTipificar.innerHTML = ``;

//             mainContainerChat.appendChild(nombreCliente);
//             mainContainerChat.appendChild(chatWindow);
//             mainContainerChat.appendChild(chatFooter);
//         }

//         // * Actualizacion para indicar que los chats ya fueron leidos
//         const infoSection = document.querySelectorAll('.info-section');
//         let chatsContainer = document.getElementById('sectionChatMenu').children;
//         // verificar si el chat tiene un contador para quitarle el contador (circulito azul :v)
//         for (let j = 0; j < chatsContainer.length; j++) {
//             chatsContainer[j].style.backgroundColor = '#ffff';
//             // console.log('está en el for');
//             if (chatsContainer[j].id == chatID) {
//                 chatsContainer[j].style.backgroundColor = '#b6ddff99';
//                 // verificar si el chat ya tiene un contador 
//                 if (infoSection[j].getElementsByClassName('badge badge pill').length > 0) {
//                     let span = document.getElementsByClassName('badge badge pill')
//                     // se remueve el span que estaba
//                     infoSection[j].removeChild(span[0]);
//                 }
//             }
//         }

//         // *** Recursiva - Revisando entrada de mensajes
//         // clearInterval(idInterval);
//         if (idInterval) {
//             clearTimeout(idInterval);
//         }

//         const checkNewMessage = async () => {
//             clearTimeout(idInterval);
//             try {
//                 await showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));
//             } finally {
//                 idInterval = setTimeout(() => {
//                     checkNewMessage();
//                 }, 5000);
//             }
//         };
//         checkNewMessage();
//         document.getElementById("loaderGeneral").style.display = "none";
//     });
// }

// * Actualizar Chat
const showNewMessage = (chatID, cellPhoneNumber) => {
	// console.log('busca mensaje nuevo');
	let arrImgTypes = ['jpeg', 'png', 'webp', 'jpg'],
		arrVideoTypes = ['mp4'],
		arrDocsTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xlx', 'xlsx', 'txt', 'csv'];
	let chatContainer = document.getElementById('chatContainer');
	postData(`${URL_API_CONSULTAR}/searchNewMessagesInChat`, { chatID, cellPhoneNumber, nombreDeUsuario, authToken }).then(async (res) => {
		// console.log('2',res.conversation,'  storage ',localStorage.getItem('countMessages'));
		// console.log('1',res.incomingMessages);
		/* console.log(res.conversation);
		console.log(res.incomingMessages); */
		if (res.conversation == localStorage.getItem('countMessages')) {
			// console.log('respuesta:',res.conversation,'countMessages:',localStorage.getItem('countMessages'));
			return;
		}
		if (res.incomingMessages && chatContainer !== null) {

			// * Agregar mensaje nuevo a la vista del chat
			let newMessage = res.incomingMessages;

			// * Validar tipo de mensaje
			// let MES_MEDIA_TYPE = newMessage.MES_MEDIA_TYPE,
			//   MES_MEDIA_URL = newMessage.MES_MEDIA_URL,
			//   MES_MESSAGE_ID = newMessage.MES_MESSAGE_ID,
			//   MES_BODY = newMessage.MES_BODY,
			//   isFileImg = false,
			//   isFileDoc = false,
			//   isFileVideo = false,
			//   isFileAudio = false;
			const MES_MEDIA_TYPE = newMessage.MES_MEDIA_TYPE;
			const MES_MEDIA_URL = newMessage.MES_MEDIA_URL;
			const MES_MESSAGE_ID = newMessage.MES_MESSAGE_ID;
			const MES_BODY = newMessage.MES_BODY;
			const MES_CHANNEL = newMessage.MES_CHANNEL;
			const MES_CREATION_DATE = newMessage.MES_CREATION_DATE;
			const MES_AUTHOR = newMessage.MES_AUTHOR;
			const MES_SMS_STATUS = newMessage.MES_SMS_STATUS;
			const PK_MES_NCODE = newMessage.PK_MES_NCODE


			let autor_mensaje_entrante = '';

			if (MES_AUTHOR) {
				autor_mensaje_entrante = MES_AUTHOR;
			} else {
				autor_mensaje_entrante = 'Usuario';
			}



			// console.log('MES_MEDIA_URL',MES_MEDIA_URL);
			// if (MES_MEDIA_TYPE !== null && arrImgTypes.includes(MES_MEDIA_TYPE)) isFileImg = true;
			// if (MES_MEDIA_TYPE !== null && arrDocsTypes.includes(MES_MEDIA_TYPE)) isFileDoc = true;
			// if (MES_MEDIA_TYPE !== null && arrVideoTypes.includes(MES_MEDIA_TYPE)) isFileVideo = true;
			// if (MES_MEDIA_TYPE !== null && MES_MEDIA_TYPE.includes('ogg')) isFileAudio = true;

			let tipoMsg = 'text';

			if (MES_MEDIA_TYPE !== null && arrImgTypes.includes(MES_MEDIA_TYPE)) tipoMsg = 'img';
			if (MES_MEDIA_TYPE !== null && arrDocsTypes.includes(MES_MEDIA_TYPE)) tipoMsg = 'doc';
			if (MES_MEDIA_TYPE !== null && arrVideoTypes.includes(MES_MEDIA_TYPE)) tipoMsg = 'video';
			if (MES_MEDIA_TYPE !== null && ['ogg', 'mp3'].includes(MES_MEDIA_TYPE)) tipoMsg = 'audio';



			// * el mensaje es externo y recibido al chat del agente - Burbuja blanca 
			if (newMessage.MES_CHANNEL == 'RECEIVED') {
				// chatContainer.innerHTML += `
				//   <div class="chat">
				//     <div class="chat-body">
				//       <div class="chat-text" ${MES_MEDIA_TYPE === null ? '' : isFileImg ? 'style="max-width: 250px; display: flex; flex-direction: column"' : ''}>
				//         ${MES_MEDIA_TYPE !== null && isFileImg
				//     ? `<img class="imgChatReceive" src="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}" /> </br> ${MES_BODY === '' ? '' : `<p>${MES_BODY}</p>`}`
				//     : MES_MEDIA_TYPE !== null && isFileDoc
				//       ? `<p><a target="_blank" href="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}"=><b>File <i class="bx bx-file"></i></b></a></p>`
				//       : MES_MEDIA_TYPE !== null && isFileAudio
				//         ? `<audio src="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}" type="audio/mp3" controls></audio>`
				//         : MES_MEDIA_TYPE !== null && isFileVideo
				//           ? `<video src="${MES_MESSAGE_ID}.${MES_MEDIA_TYPE}" type="audio/mp3" controls></video>`
				//           : `<p>${MES_BODY}</p>`
				//   }
				//       </div>
				//     </div>
				//   </div>
				//   `;

				if (!MES_AUTHOR) {
					chatContainer.innerHTML += `
              <div class="chat">
                  <div class="chat-body">
                    <div class="chat-text${tipoMsg === 'audio' ? 'F' : ''}" ${MES_MEDIA_TYPE === null ? '' : tipoMsg === 'img' ? 'style="max-width: 250px;"' : ''}>
                    ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL })}
                    </div>
                  </div>
                </div>`;
				} else {
					chatContainer.innerHTML += `
              <div class="chat">
                  <div class="chat-body">
                  <span style="font-weight: bold; color: blue;">${autor_mensaje_entrante} Dice:</span>
                    <div class="chat-text${tipoMsg === 'audio' ? 'F' : ''}" ${MES_MEDIA_TYPE === null ? '' : tipoMsg === 'img' ? 'style="max-width: 250px;"' : ''}>
                    ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL })}
                    </div>
                  </div>
                </div>`;
				}
			}

			// * el mensaje es enviado por un agente - Burbuja azul
			if (newMessage.MES_CHANNEL == 'SEND') {
				// chatContainer.innerHTML += `
				//   <div class="chat chat-right">
				//     <div class="chat-body">
				//       <div class="chat-text" ${MES_MEDIA_TYPE === null ? '' : isFileImg ? 'style="max-width: 250px"' : ''}>
				//         ${MES_MEDIA_TYPE !== null && isFileImg ? `<img class="imgChatSend" src="${MES_MEDIA_URL}" />` : MES_MEDIA_TYPE !== null && isFileDoc ? `<p><a style="color:white" target="_blank" href="${MES_MEDIA_URL}"=><b>File <i class="bx bx-file"></i></b></a></p>` : `<p>${MES_BODY}</p>`}
				//       </div>
				//     </div>
				//   </div>
				//   `;
				chatContainer.innerHTML += `
            <div class="chat chat-right">
              <div class="chat-body">
              <span style="font-weight: bold; color: green;">${autor_mensaje_entrante} Dice:</span>
                <div class="chat-text" ${MES_MEDIA_TYPE === null ? '' : tipoMsg === 'img' ? 'style="max-width: 250px"' : ''}>
                  ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL })}
                </div>
              </div>
            </div>`;
			}

			// * burbuja del Administrador que interviene el chat (solo visible por el agente)
			if (newMessage.MES_CHANNEL == 'ADMIN') {
				// chatContainer.innerHTML += `
				// <div class="chat chatRecibidoAdminAgente">
				//   <div class="chat-body">
				//     <div class="chat-text">
				//       <p>${MES_BODY}</p>
				//     </div>
				//   </div>
				// </div>`;
				chatContainer.innerHTML += `
              <div class="chat chatRecibidoAdminAgente">
                <div class="chat-body">
                  <div class="chat-text">
                    ${drawChatContent({ tipoMsg, MES_CHANNEL, MES_MESSAGE_ID, MES_MEDIA_TYPE, MES_CREATION_DATE, MES_BODY, MES_MEDIA_URL })}
                  </div>
                </div>
              </div>`;
			}

			// * Actualizacion para indicar que los chats ya fueron leidos
			let IdMessage = newMessage.PK_MES_NCODE
			let status = newMessage.MES_SMS_STATUS

			postData(`${URL_API_CONSULTAR}/updateReadIncomingMessage`, { IdMessage, status, nombreDeUsuario, authToken }).then(async (resUpdateReadMessages) => {
				// * Actualizar cantidad de mensajes en el chat
				if (resUpdateReadMessages.message == 'Actualizado') localStorage.setItem('countMessages', parseInt(localStorage.getItem('countMessages')) + 1);
			});

			// * HACER SCROLL AL CHAT ↓
			setTimeout(() => {
				const windowChatActual = document.querySelector('#seccionChat');
				if (windowChatActual) windowChatActual.scrollTo({ top: windowChatActual.scrollHeight });
			}, 500);

		}


		// * Hacer Scroll AL Chat
		/* setTimeout(() => {
		  const windowChatActual = document.querySelector('#seccionChat');
		  if (windowChatActual) windowChatActual.scrollTo({ top: windowChatActual.scrollHeight });
		}, 2000); */

	});
};





// // ! ================================================================================================================================================
// // !                                                MOSTRAR NUEVOS MENSAJES PARA LOS CHATS ASIGNADOS AL USUARIO
// // ! ================================================================================================================================================
// /**
//  * @author Brayan Yanez
//  * @created 24 de abril de 2024
//  * @lastModified 24 de abril de 2024
//  * @version 1.0.0
//  */
// // TODO: FUNCION PARA MOSTRAR LOS MENSAJES NUEVOS SEGUN EL CHAT ASIGNADO AL USUARIO
// // * OBTENER LOS CHATS NOTIFICADOS
// const chats_notificados = {};
// async function showAlertNewMessages(AttendingChats) {
// 	// * OBTENGO LOS CHATS ASIGNADOS Y LOS DIV CONTENEDORES DE CADA CHAT ASIGNADO
// 	const chats_asignados = AttendingChats;

// 	// * SI HAY CHATS ASIGNADOS
// 	if (chats_asignados.length > 0) {
// 		// * RECORRO LOS CHATS ASIGNADOS
// 		for (let i = 0; i < chats_asignados.length; i++) {
// 			// ? OBTENGO EL CONTADOR DE CADA CHAT ASIGNADO
// 			let contador_chat_asignado = document.getElementById(`contador_${chats_asignados[i]}`);
// 			// ? CONSULTO LOS MENSAJES NUEVOS DE CADA CHAT ASIGNADO
// 			let chatID = chats_asignados[i];
// 			const buscar_nuevos_chats = await postData(URL_API_CONSULTAR + '/searchNewChats', { chatID, nombreDeUsuario, authToken });
// 			// ? ESPERO LA RESPUESTA DE LA CONSULTA
// 			if (buscar_nuevos_chats.numUnreadMessages > 0) {
// 				// ? MUESTRO LA CANTIDAD DE MENSAJES SIN LEER AL CONTADOR DEL CHAT ASIGNADO
// 				if (contador_chat_asignado !== null) {
// 					// ? MUESTRO LA CANTIDAD DE MENSAJES NUEVOS
// 					contador_chat_asignado.innerHTML = `
//                         <span class="badge badge pill light-blue darken-4">${buscar_nuevos_chats.numUnreadMessages}</span>
//                     `;
// 					// ? VERIFICAMOS SI YA FUE NOTIFICADO ESTE CHAT Y SI ES MAYOR LA CANTIDAD DE MENSAJES ACTUAL A LA ANTERIOR
// 					if (!chats_notificados[chatID] || buscar_nuevos_chats.numUnreadMessages > chats_notificados[chatID]) {
// 						await reproducir_sonido_notificacion();
// 					}

// 					// ? REGISTRAR QUE SE HA NOTIFICADO ESTE CHAT
// 					chats_notificados[chatID] = buscar_nuevos_chats.numUnreadMessages;
// 				}
// 			} else {
// 				// ? REMUEVO EL CONTADOR DEL CHAT ASIGNADO SI NO HAY MENSAJES NUEVOS
// 				if (contador_chat_asignado !== null) {
// 					contador_chat_asignado.innerHTML = '';
// 				}
// 				// ? REINICIAMOS LA NOTIFICACION DEL CHAT
// 				chats_notificados[chatID] = 0;
// 			}
// 		}
// 	}
// }




// CODIGO ANTES
// // ! ver nuevos mensajes de todos los chats actuales del asesor 

// const showAlertNewMessages = (AttendingChats) => {

//     return new Promise((resolve, reject) => {


//         let chatsContainer = document.getElementById('sectionChatMenu').children;


//         if (AttendingChats.length > 0) {

//             // ! recorrer array de los chats que tiene actualmente el agente en localstorage

//             for (let i = 0; i < AttendingChats.length; i++) {

//                 const infoSection = document.querySelectorAll('.info-section');

//                 let chatID = AttendingChats[i];

//                 postData(URL_API_CONSULTAR + '/searchNewChats', { chatID, nombreDeUsuario, authToken }).then(async (res) => {

//                     // !Validar si hay mensajes

//                     if (res.numUnreadMessages > 0) {

//                         let numUnreadMessages = res.numUnreadMessages;

//                         let chatID = localStorage.getItem('idChatActual');

//                         // !recorrer los chats que están en la vista para colocar el contador

//                         for (let j = 0; j < chatsContainer.length; j++) {


//                             if ((chatsContainer[j].id == AttendingChats[i])) {

//                                 chatID = localStorage.getItem('idChatActual');

//                                 // !verificar si el chat ya tiene un contador 

//                                 if (infoSection[j].getElementsByClassName('badge badge pill').length > 0) {

//                                     let span = infoSection[j].getElementsByClassName('badge badge pill');

//                                     // ! se remueve el span que estaba

//                                     infoSection[j].removeChild(span[0]);

//                                     if (chatsContainer[j].id != chatID) {

//                                         chatsContainer[j].style.backgroundColor = '#4299FF';

//                                         infoSection[j].innerHTML += `

//                                 <span class="badge badge pill light-blue darken-4">${numUnreadMessages}</span>

//                               `


//                                     }



//                                 } else {

//                                     if (chatsContainer[j].id != chatID) {

//                                         chatsContainer[j].style.backgroundColor = '#4299FF';


//                                         infoSection[j].innerHTML += `

//                                 <span class="badge badge pill light-blue darken-4">${numUnreadMessages}</span>

//                               `

//                                         playNotificationSound();


//                                     }

//                                 }


//                             }


//                         }


//                     } else {

//                         // console.log(`no hay mensajes nuevos para el chat ${chatID}`);

//                     }


//                 })


//             }

//             resolve(); // Resuelve la promesa cuando el bucle for termina

//         } else {

//             resolve(); // Resuelve la promesa si AttendingChats no tiene elementos

//         }

//     });

// };


// * colocar valor dentro de un select
function showSelectOnForm(options, select, dato) {
	options.forEach((elemOption) => {
		if (elemOption.value == dato) {
			elemOption.setAttribute('selected', 'true');
		}
	});
	var elemsSelect = document.querySelectorAll('.select');
	M.FormSelect.init(elemsSelect);
}

// * verificacion de datos de tipificacion y envío para ser guardados
// TODO: GUARDAR TIPIFICACION SINGLE CHAT
async function sendTypification(chatID, idCliente, tipoGestion) {
	console.log('sendTypification chatID ===> ', chatID);

	const btnSendTyp = document.querySelector('#btnSendTyp');

	if (validarInputs(document.querySelector('#formTipificacion'))) {

		btnSendTyp.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Enviando ...`
		btnSendTyp.disabled = true;
		const data = {
			chatID: chatID,
			tipoGestion,
			nombreAgente: document.querySelector('#inpAgente').value,
			/*     nombreCliente: document.querySelector('#inpCliente').value,
				 nCaso: document.querySelector('#inpCaso').value,
				 observacion: document.querySelector('#selTipificacion').value, */
			numChat: localStorage.getItem('numChatActual'),
		};

		// * guardar tipificación
		const resSendTyp = await postData('mensajeria/sendTypification', { data });
		if (resSendTyp.msg === 'ok') {

			document.querySelector('#mainContainerTipificar').innerHTML = `Tipificación agregada`;
			// * cerrar Chat
			cerrarChat();
		} else {
			M.toast({ html: document.querySelector('[data-i18n="Se generó un error, intente de nuevo"]').textContent });
			btnSendTyp.innerHTML = `<span data-i18n="Cerrar y Enviar">Cerrar y Enviar</span>`;
			btnSendTyp.disabled = false;
		}
	}

	let currentLanguage = localStorage.getItem('localIdioma');
	i18next.changeLanguage(currentLanguage, function (err, t) {
		$('html').localize();
	});

}


// TODO: GUARDAR DOCUMENTACION GROUP CHAT
async function sendTypification2(chatID, idCliente, tipoGestion) {

	const btnSendTyp = document.querySelector('#btnSendTyp');

	if (validarInputs(document.querySelector('#formTipificacion'))) {

		btnSendTyp.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Enviando ...`
		btnSendTyp.disabled = true;

		// Obtengo el valor del campo de fecha y hora de inicio tipificacion original
		var fechaHoraInicioOriginal = document.querySelector('#txt_fecha_hora_inicio_tipificacion').value;

		// Parsea la fecha y hora original utilizando Moment.js
		var fechaHoraInicioMoment = moment(fechaHoraInicioOriginal, "DD/MM/YYYY HH:mm:ss");

		// Formatea la fecha y hora
		var txt_fecha_hora_inicio_tipificacion = fechaHoraInicioMoment.format("YYYY-MM-DD HH:mm:ss");

		const data = {
			chatID: chatID,
			tipoGestion,
			numChat: localStorage.getItem('numChatActual'),
			txt_nombre_usuario: document.querySelector('#inpAgente').value,
			txt_numero_caso: document.querySelector('#inpCaso').value,
			txt_motivo: document.querySelector('#selTipificacion').value,
			txt_hora_inicio_chat: document.querySelector('#txt_hora_inicio_chat').value,
			txt_hora_fin_chat: document.querySelector('#txt_hora_fin_chat').value,
			tmo: document.getElementById('tmo').textContent,
			txt_fecha_hora_inicio_tipificacion: txt_fecha_hora_inicio_tipificacion,
		};

		// * guardar tipificación
		const resSendTyp = await postData('mensajeria/sendTypification2', { data });
		if (resSendTyp.msg === 'ok') {
			// ? NOTIFICAR USUARIO
			M.toast({ html: document.querySelector('[data-i18n="Tipificación realizada con éxito"]').textContent });
			/*  document.querySelector('#mainContainerTipificar').innerHTML = `Tipificación agregada`; */
			// * cerrar Chat
			/* cerrarChat(); */
			// ? HABILITAR NUEVAMENTE LA TIPIFICACION
			btnSendTyp.innerHTML = `<span data-i18n="Cerrar y Enviar">Cerrar y Enviar</span>`;
			btnSendTyp.disabled = false;

			// ? INICIALIZAR TMO
			// Envio TMO al campo
			document.getElementById("tmo").textContent = '00:00:00';
		} else {
			M.toast({ html: document.querySelector('[data-i18n="Se generó un error, intente de nuevo"]').textContent });
			btnSendTyp.innerHTML = `<span data-i18n="Cerrar y Enviar">Cerrar y Enviar</span>`;
			btnSendTyp.disabled = false;
		}
	}

	let currentLanguage = localStorage.getItem('localIdioma');
	i18next.changeLanguage(currentLanguage, function (err, t) {
		$('html').localize();
	});

}

function limpiarFormulario() {
	// Limpiar inputs
	document.querySelectorAll('#formTipificacion input[type="text"], #formTipificacion input[type="tel"]').forEach(input => {
		input.value = ''; // Esto limpia los campos de texto y teléfono
	});

	// Restablecer selects al primer ítem
	document.querySelectorAll('#formTipificacion select').forEach(select => {
		select.selectedIndex = 0; // Esto coloca los selects en su valor por defecto
	});
}

function updateInfoClient(cellPhoneNumber, idClient) {
	const ModalNameClient = document.getElementById('ModalNameClient');
	const ModalCelClient = document.getElementById('ModalCelClient');
	const ModalDocumentClient = document.getElementById('ModalDocumentClient');
	const ModalCorreoClient = document.getElementById('ModalCorreoClient');

	let validador = true;
	if (ModalNameClient.value == '' || ModalNameClient.value == null) {
		validador = false;
	}
	if (ModalCelClient.value == '' || ModalCelClient.value == null) {
		validador = false;
	}
	if (ModalCorreoClient.value == '' || ModalCorreoClient.value == null) {
		validador = false;
	}

	if (validador === true) {
		const data = {
			idClient: idClient,
			ModalNameClient: ModalNameClient.value,
			ModalCelClient: ModalCelClient.value,
			ModalDocumentClient: ModalDocumentClient.value,
			ModalCorreoClient: ModalCorreoClient.value,
		};

		postData('mensajeria/updateInfoClient', { data }).then(async (res) => {
			if (res == 'ok') {
				M.toast({ html: 'Información de cliente actualizada' });
			} else {
				M.toast({ html: 'Se generó un error, intente de nuevo' });
			}
		});
	}
}

function insertInfoClient(cellPhoneNumber) {
	const ModalNameClient = document.getElementById('ModalNameClient');
	const ModalCelClient = document.getElementById('ModalCelClient');
	const ModalDocumentClient = document.getElementById('ModalDocumentClient');
	const ModalCorreoClient = document.getElementById('ModalCorreoClient');

	let validador = true;
	if (ModalNameClient.value == '' || ModalNameClient.value == null) {
		validador = false;
	}
	if (ModalCelClient.value == '' || ModalCelClient.value == null) {
		validador = false;
	}
	if (ModalCorreoClient.value == '' || ModalCorreoClient.value == null) {
		validador = false;
	}

	if (validador === true) {
		const data = {
			ModalNameClient: ModalNameClient.value,
			ModalCelClient: ModalCelClient.value,
			ModalDocumentClient: ModalDocumentClient.value,
			ModalCorreoClient: ModalCorreoClient.value,
		};

		postData('mensajeria/insertInfoClient', { data }).then(async (res) => {
			if (res == 'ok') {
				M.toast({ html: 'Información de cliente agregada' });
			} else {
			}
		});
	}
}

function showModaltransferir() {
	let arrayAttendingChats = [];
	arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
	const chatID = localStorage.getItem('idChatActual');
	const btnEnviarTransfer = document.getElementById('btnEnviarTransfer');
	const modalTransferir = document.getElementById('modalTransferir');
	const MotivoTransferencia = document.getElementById('MotivoTransferencia');
	const selectModalAvalibleUsers = document.getElementById('selectModalAvalibleUsers');
	const ObservacionTransferencia = document.getElementById('ObservacionTransferencia');
	let options = document.createElement('div');
	MotivoTransferencia.value = '';
	selectModalAvalibleUsers.value = '';
	ObservacionTransferencia.value = '';
	let sectionChatMenu = document.getElementById('sectionChatMenu');
	const chatsNumber = sectionChatMenu.children; //cantidad de chats

	getData('mensajeria/availableUsers').then(async (res) => {
		options = `<option value="" disabled selected><span data-i18n="Seleccione el usuario">Seleccione el usuario</span></option>`;
		if (res.selectUsers.length > 0) {
			let array = res.selectUsers;
			array.forEach((element) => {
				options += `<option value="${element.PKUSU_NCODIGO}" >${element.USU_CUSUARIO}</option>`;
			});
			selectModalAvalibleUsers.innerHTML = options;

			var elemsSelect = document.querySelectorAll('.select');
			M.FormSelect.init(elemsSelect);
		}
		let currentLanguage = localStorage.getItem('localIdioma');
		i18next.changeLanguage(currentLanguage, function (err, t) {
			$('html').localize();
		});
	});

	btnEnviarTransfer.addEventListener('click', function () {
		let validador = true;

		if (MotivoTransferencia.value == null || MotivoTransferencia.value == '') {
			validador = false;
			M.toast({ html: document.querySelector('[data-i18n="Digite motivo de transferencia"]').textContent });
		}
		if (selectModalAvalibleUsers.value == null || selectModalAvalibleUsers.value == '') {
			validador = false;
			M.toast({ html: document.querySelector('[data-i18n="Seleccione usuario a transferir"]').textContent });
		}

		if (validador === true) {
			const data = {
				chatID: chatID,
				MotivoTransferencia: MotivoTransferencia.value,
				selectModalAvalibleUsers: selectModalAvalibleUsers.value,
				ObservacionTransferencia: ObservacionTransferencia.value,
			};

			postData('mensajeria/transferir', { data }).then(async (res) => {
				if (res == 'ok') {
					let sectionChatMenu = document.getElementById('sectionChatMenu');
					const mainContainerChat = document.getElementById('mainContainerChat');
					const mainContainerTipificar = document.getElementById('mainContainerTipificar');
					const chat = document.getElementById(chatID);
					//eliminar del array de localstorage el chat que se transfirió
					const filterChats = arrayAttendingChats.filter((item) => item !== chatID);
					localStorage.setItem('AttendingChats', JSON.stringify(filterChats));

					sectionChatMenu.removeChild(chat);

					mainContainerChat.innerHTML = ``;
					mainContainerTipificar.innerHTML = ``;
					M.toast({ html: document.querySelector('[data-i18n="Chat transferido con éxito"]').textContent });
					var modal = document.querySelectorAll('.modal');
					M.Modal.init(modal);
				}
			});
		}
	});
}

//realizar insert en tabla tbl_chats_management cuando es chatOutBound
function insertIdGestion(cellPhoneNumber) {
	let idUser = localStorage.getItem('UserId');
	let arrayAttendingChats = [];
	arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
	const ChatOutboundCelular = document.getElementById('ChatOutboundCelular');
	const PlantillaChatOutBound = document.getElementById('PlantillaChatOutBound');
	const indicativoChatOutBound = document.getElementById('indicativoChatOutBound');
	const UserId = localStorage.getItem('UserId');

	let validador = true;
	if (ChatOutboundCelular.value == '' || ChatOutboundCelular.value == null) {
		validador = false;
		M.toast({ html: document.querySelector('[data-i18n="Por favor digite el numero celular"]').textContent });
	}
	if (PlantillaChatOutBound.value == '' || PlantillaChatOutBound.value == null) {
		validador = false;
		M.toast({ html: document.querySelector('[data-i18n="Por favor seleccione una plantilla"]').textContent });
	}
	if (indicativoChatOutBound.value == '' || indicativoChatOutBound.value == null) {
		validador = false;
		M.toast({ html: document.querySelector('[data-i18n="Por favor seleccione el indicativo"]').textContent });
	}

	if (validador === true) {
		// let numeroCel = '+57' + ChatOutboundCelular.value;
		let numeroCel = indicativoChatOutBound.value.replace('+', '') + ChatOutboundCelular.value.replaceAll(' ', '');

		// * validar si el número al que desea enviar chatoutbound ya está siendo atendido
		postData('/mensajeria/isChatAttending', { numeroCel }).then(async (resisChatAttending) => {
			if (resisChatAttending.result.length < 1) {
				// el chat no está siendo atendido
				const data = {
					ChatOutboundCelular: numeroCel,
					PlantillaChatOutBound: PlantillaChatOutBound.value,
				};
				postData('mensajeria/insertIdGestion', { data }).then(async (res) => {
					if (res) {
						let IdGestion = res;

						try {
							const resMessage = await postData(`${URB_API_ENVIAR_MSG}/sendMessage`, { To: numeroCel, body: PlantillaChatOutBound.value, GestionID: IdGestion, usuario: nombreDeUsuario, nombreDeUsuario, authToken, UserId });
							showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));

							if (resMessage.error) {
								M.toast({ html: 'Se genero un error, intente de nuevo' });
								console.log('Error /sendMessage', resMessage.msg);
							}

						} catch (error) {
							M.toast({ html: 'Se genero un error, intente de nuevo' });
							console.log('Error al enviar mensaje en fn insertIdGestion\n', error);
						}
					}
				});
			} else {
				if (resisChatAttending.idUserAttending == idUser) {
					Swal.fire({
						title: document.querySelector('[data-i18n="Este Chat ya está siendo atendido por usted"]').textContent,
						text: document.querySelector('[data-i18n="¿Desea cerrar el chat actual y abrir uno nuevo?"]').textContent,
						icon: 'warning',
						showCancelButton: true,
						confirmButtonText: document.querySelector('[data-i18n="Sí, continuar"]').textContent,
						cancelButtonText: document.querySelector('[data-i18n="Cancelar"]').textContent,
					}).then((resultado) => {
						if (resultado.value) {
							// ! Hicieron click en "Sí"
							postData('mensajeria/cerrarChat', { chatIDHeader: resisChatAttending.idGestion }).then(async (res) => {
								if (res == 'ok') {
									// document.getElementById('messageToSend').value = 'Gracias por comunicarse con nosotros';
									//función de enviar mensaje
									// sendMessage(numChatActual, idChatActual);
									let idGestion = resisChatAttending.idGestion;
									let sectionChatMenu = document.getElementById('sectionChatMenu');
									const mainContainerChat = document.getElementById('mainContainerChat');
									const mainContainerTipificar = document.getElementById('mainContainerTipificar');
									const chat = document.getElementById(idGestion);
									let arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
									const filterChats = arrayAttendingChats.filter((item) => item !== idGestion);
									localStorage.setItem('AttendingChats', JSON.stringify(filterChats));
									sectionChatMenu.removeChild(chat);
									mainContainerChat.innerHTML = ``;
									mainContainerTipificar.innerHTML = ``;
									// M.toast({ html: 'Chat cerrado con éxito' });
									const data = {
										ChatOutboundCelular: numeroCel,
										PlantillaChatOutBound: PlantillaChatOutBound.value,
									};

									postData('mensajeria/insertIdGestion', { data }).then(async (res) => {
										if (res) {
											let IdGestion = res;

											try {
												const resMessage = await postData(`${URB_API_ENVIAR_MSG}/sendMessage`, { To: numeroCel, body: PlantillaChatOutBound.value, GestionID: IdGestion, usuario: nombreDeUsuario, nombreDeUsuario, authToken, UserId });
												showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));

												if (resMessage.error) {
													M.toast({ html: 'Se genero un error, intente de nuevo' });
													console.log('Error /sendMessage', resMessage.msg);
												}

											} catch (error) {
												M.toast({ html: 'Se genero un error, intente de nuevo' });
												console.log('Error al enviar mensaje por Enter\n', error);
											}
										}
									});
								}
								// document.getElementById('message_to_send').value = '';
							});
						} else {
							// ! Dijeron que no
						}
					});
				}
				if (resisChatAttending.result[0].GES_ESTADO_CASO == 'OPEN') {
					let IdGestion = resisChatAttending.result[0].PKGES_CODIGO;
					postData('mensajeria/updateAttending', { GestionID: IdGestion }).then(async (resUpdateAttending) => {
						if (resUpdateAttending.ASIGNED == true) {

							try {
								const resMessage = await postData(`${URB_API_ENVIAR_MSG}/sendMessage`, { To: numeroCel, body: PlantillaChatOutBound.value, GestionID: IdGestion, usuario: nombreDeUsuario, nombreDeUsuario, authToken, UserId });
								showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));

								if (resMessage.error) {
									M.toast({ html: 'Se genero un error, intente de nuevo' });
									console.log('Error /sendMessage', resMessage.msg);
								}

							} catch (error) {
								M.toast({ html: 'Se genero un error, intente de nuevo' });
								console.log('Error al enviar mensaje por Enter\n', error);
							}

						}
					});
				}
				if (resisChatAttending.idUserAttending != idUser && resisChatAttending.result[0].GES_ESTADO_CASO == 'ATTENDING') {
					Swal.fire(document.querySelector('[data-i18n="Cuidado!"]').textContent, document.querySelector('[data-i18n="Este número ya está siendo atendido por otro agente"]').textContent, 'warning');
				}
			}
		});
	}
}

//Mostrar plantillas cargadas en localStorage
function showPlantillas() {
	var plantillasLocal = JSON.parse(localStorage.getItem('plantillas'));
	const containerPlantillas = document.getElementById('containerPlantillas');
	containerPlantillas.innerHTML = ``;
	for (let i = 0; i < plantillasLocal.length; i++) {

		const textoFormateado = formatearTexto(plantillasLocal[i].PLA_CCONTENIDO);

		containerPlantillas.innerHTML += `
    <div class="collection card" style="border-radius: 5px;">
      <a  class="collection-item sectionPlantilla modal-close" style="color:#333333;cursor:pointer;">${textoFormateado}</a>
    </div>
    `;
	}

	const sectionPlantilla = document.querySelectorAll('.sectionPlantilla');

	for (let i = 0; i < sectionPlantilla.length; i++) {
		sectionPlantilla[i].style.color = 'black';
		sectionPlantilla[i].addEventListener('click', function () {
			const inputMessage = document.getElementById('messageToSend');
			inputMessage.value = sectionPlantilla[i].textContent;
			// postData('mensajeria/estadosUser', { estadoUser }).then(async (res) => {
			// });
		});
	}
}

function agrandarInputMessage() {
	const inpMessageToSend = document.querySelector('#messageToSend');

	Swal.fire({
		html: `<textarea id='taMessage' class='ta-message' rows='4' wrap='hard'></textarea>`,
		showCancelButton: true,
		cancelButtonText: 'Cerrar',
		showConfirmButton: false,
		customClass: 'swal-wide'
	}).then(() => {
		pasarTexto();
	});

	const taMessageToSend = document.querySelector('#taMessage');
	taMessageToSend.value = inpMessageToSend.value;

	if (inpMessageToSend.value.length > 400) {
		taMessageToSend.style.height = '300px';
	}

	taMessageToSend.addEventListener('keyup', e => {
		inpMessageToSend.value = taMessageToSend.value;
	});

	function pasarTexto() {
		inpMessageToSend.value = taMessageToSend.value;
	}
}

function formatearTexto(texto) {
	// Expresión regular para detectar enlaces
	const regexEnlace = /(http[s]?:\/\/[^\s]+)/g;
	const regexBold = /\*(.*?)\*/g;
	const regexItalic = /\_(.*?)\_/g;
	let resultado = '';

	// Reemplazar enlaces con etiquetas <a>
	resultado = texto.replace(regexEnlace, '<span class="fake-enlace">$&</span>');
	// Reemplazar '*' con etiquetas <b>
	resultado = resultado.replace(regexBold, '<b>$1</b>')
	// Reemplazar '_' con etiquetas <i>
	resultado = resultado.replace(regexItalic, '<i>$1</i>')
	// reemplaza saltos de linea con <br>
	resultado = resultado.replaceAll(/(\r\n|\r|\n)/g, '<br>');

	return resultado;
}

// ! ================================================================================================================================================
// !                                                           NOTIFICACIONES WHATSAPP
// ! ================================================================================================================================================
/**
 * @author Brayan Yanez
 * @created 24 de abril de 2024
 * @lastModified 24 de abril de 2024
 * @version 1.0.0
 */
// TODO: FUNCION PARA REPRODUCIR SONIDO DE NOTIFICACION MENSAJE NUEVO
async function reproducir_sonido_notificacion() {
	// ? OBTENGO EL ARCHIVO DE SONIDO
	const notificationSound = new Audio('../audio/waterdrop2.mp3');
	// ? PERMITO LA REPRODUCCIÓN AUTOMÁTICA
	notificationSound.autoplay = true;
	// ? ESPERO A QUE SE REPRODUZCA EL SONIDO
	await notificationSound.play();
}

// CODIGO ANTES
// const playNotificationSound = () => {
//   // Puedes ajustar la ruta del archivo de sonido según la ubicación en tu proyecto
//   const notificationSound = new Audio('../audio/waterdrop2.mp3');
//   notificationSound.play();
// };














// ! ================================================================================================================================================
// !                                                           MODULO TIPIFICACION
// ! ================================================================================================================================================
/**
 * @author Brayan Yanez
 * @created 10 de abril de 2024
 * @lastModified 10 de abril de 2024
 * @version 1.0.0
 */
// TODO: VALIDACION CAMPOS
// * VALIDACION CAMPO NUMERO CASO
async function valida_inpCaso() {
	const inpCaso = document.getElementById('inpCaso');
	let inpCaso_value = inpCaso.value;

	// * Validación si está vacío
	if (!inpCaso_value) {
		campo_invalido(inpCaso, 'Por favor complete este campo...', true);
	} else if (inpCaso_value.length <= 1) {
		campo_invalido(inpCaso, 'Este valor no es valido...', true);
	} else {
		campo_valido(inpCaso);
	}
}
// * VALIDACION CAMPO HORA INICIO CHAT
async function valida_txt_hora_inicio_chat() {
	const txt_hora_inicio_chat = document.getElementById('txt_hora_inicio_chat');
	let txt_hora_inicio_chat_value = txt_hora_inicio_chat.value.trim();

	// Remover caracteres no numéricos inmediatamente al escribir
	txt_hora_inicio_chat_value = txt_hora_inicio_chat_value.replace(/\D/g, '');

	// Agregar ':' después de los primeros dos números si aún no está presente
	if (txt_hora_inicio_chat_value.length >= 2 && txt_hora_inicio_chat_value.indexOf(':') === -1) {
		txt_hora_inicio_chat_value = txt_hora_inicio_chat_value.slice(0, 2) + ':' + txt_hora_inicio_chat_value.slice(2);
	}

	// Validar que solo contenga 5 caracteres en total con el formato hh:mm
	const horaRegex = /^\d{2}:\d{2}$/;

	// Actualizar el valor del campo con los caracteres limpios
	txt_hora_inicio_chat.value = txt_hora_inicio_chat_value;

	// Validación si está vacío o no cumple con el formato de hora
	if (!txt_hora_inicio_chat_value) {
		campo_invalido(txt_hora_inicio_chat, 'Por favor complete este campo...', true);
	} else if (!horaRegex.test(txt_hora_inicio_chat_value)) {
		campo_invalido(txt_hora_inicio_chat, 'Ingrese la hora en formato hh:mm', true);
	} else {
		campo_valido(txt_hora_inicio_chat);
	}
}
// * VALIDACION CAMPO HORA FIN CHAT
async function valida_txt_hora_fin_chat() {
	const txt_hora_inicio_chat = document.getElementById('txt_hora_inicio_chat');
	let txt_hora_inicio_chat_value = txt_hora_inicio_chat.value.trim();

	const txt_hora_fin_chat = document.getElementById('txt_hora_fin_chat');
	let txt_hora_fin_chat_value = txt_hora_fin_chat.value.trim();

	// Remover caracteres no numéricos inmediatamente al escribir
	txt_hora_fin_chat_value = txt_hora_fin_chat_value.replace(/\D/g, '');

	// Agregar ':' después de los primeros dos números si aún no está presente
	if (txt_hora_fin_chat_value.length >= 2 && txt_hora_fin_chat_value.indexOf(':') === -1) {
		txt_hora_fin_chat_value = txt_hora_fin_chat_value.slice(0, 2) + ':' + txt_hora_fin_chat_value.slice(2);
	}

	// Validar que solo contenga 5 caracteres en total con el formato hh:mm
	const horaRegex = /^\d{2}:\d{2}$/;

	// Actualizar el valor del campo con los caracteres limpios
	txt_hora_fin_chat.value = txt_hora_fin_chat_value;

	// Validación si está vacío o no cumple con el formato de hora
	if (!txt_hora_fin_chat_value) {
		campo_invalido(txt_hora_fin_chat, 'Por favor complete este campo...', true);
	} else if (!horaRegex.test(txt_hora_fin_chat_value)) {
		campo_invalido(txt_hora_fin_chat, 'Ingrese la hora en formato hh:mm', true);
	} else {
		// Obtener horas y minutos de la hora de inicio del chat
		const inicioParts = txt_hora_inicio_chat_value.split(':');
		const inicioHora = parseInt(inicioParts[0], 10);
		const inicioMinuto = parseInt(inicioParts[1], 10);

		// Obtener horas y minutos de la hora de fin del chat
		const finParts = txt_hora_fin_chat_value.split(':');
		const finHora = parseInt(finParts[0], 10);
		const finMinuto = parseInt(finParts[1], 10);

		// Validar que la hora de fin sea mayor o igual a la hora de inicio del chat
		if (finHora < inicioHora || (finHora === inicioHora && finMinuto < inicioMinuto)) {
			campo_invalido(txt_hora_fin_chat, 'La hora de fin debe ser mayor o igual a la hora de inicio del chat', true);
			txt_hora_fin_chat.value = '';
		} else {
			campo_valido(txt_hora_fin_chat);
		}
	}
}

















// ! ================================================================================================================================================
// !                                                      MODULO CONTROL TMO
// ! ================================================================================================================================================
/**
 * @author Brayan Yanez
 * @created 10 de abril de 2024
 * @lastModified 10 de abril de 2024
 * @version 1.0.0
 */
// TODO: OBTENER FECHA INGRESO
async function habilitar_ctrl_tmo() {
	// * Habilito TMO
	fecha_hora_ingreso();
}
async function fecha_hora_ingreso() {
	// Varibales
	let txt_fecha_hora_inicio_tipificacion = document.getElementById('txt_fecha_hora_inicio_tipificacion');

	// Condiciones
	if (txt_fecha_hora_inicio_tipificacion.value == '21/07/1988 21:00:00' || txt_fecha_hora_inicio_tipificacion.value == '') {
		// Obtén la fecha y hora actual
		let fecha = new Date();

		// Obtiene los componentes de la fecha y hora
		let dia = String(fecha.getDate()).padStart(2, '0');
		let mes = String(fecha.getMonth() + 1).padStart(2, '0');
		let año = fecha.getFullYear();
		let hora = String(fecha.getHours()).padStart(2, '0');
		let minutos = String(fecha.getMinutes()).padStart(2, '0');
		let segundos = String(fecha.getSeconds()).padStart(2, '0');

		// Formatea la fecha y hora en el formato deseado
		let fechaHoraFormateada = dia + '/' + mes + '/' + año + ' ' + hora + ':' + minutos + ':' + segundos;

		// Envio fecha al campo
		txt_fecha_hora_inicio_tipificacion.value = fechaHoraFormateada;
	}
}

// TODO:  OBTENER FECHA REGISTRO
function fecha_hora_registro() {
	// Obtén la fecha y hora actual
	let fecha = new Date();

	// Obtiene los componentes de la fecha y hora
	let dia = String(fecha.getDate()).padStart(2, '0');
	let mes = String(fecha.getMonth() + 1).padStart(2, '0');
	let año = fecha.getFullYear();
	let hora = String(fecha.getHours()).padStart(2, '0');
	let minutos = String(fecha.getMinutes()).padStart(2, '0');
	let segundos = String(fecha.getSeconds()).padStart(2, '0');

	// Formatea la fecha y hora en el formato deseado
	let fechaHoraFormateada = dia + '/' + mes + '/' + año + ' ' + hora + ':' + minutos + ':' + segundos;

	// Envio fecha al campo
	document.getElementById('txt_fecha_hora_registro').value = fechaHoraFormateada;
}

// TODO: CONTROL TMO
function control_tmo() {
	// Obtener valor del campo txt_fecha_hora_inicio_tipificacion
	let txt_fecha_hora_inicio_tipificacion = document.getElementById('txt_fecha_hora_inicio_tipificacion').value;
	let fecha_hora_ingreso = moment(txt_fecha_hora_inicio_tipificacion, "DD/MM/YYYY HH:mm:ss");

	// Obtener la hora actual
	let hora_actual = moment();

	// Calcular la diferencia de tiempo en milisegundos
	let diferencia_milisegundos = hora_actual.diff(fecha_hora_ingreso);

	// Calcular las horas, minutos y segundos de la diferencia de tiempo
	let horas = Math.floor(diferencia_milisegundos / 3600000);
	let minutos = Math.floor((diferencia_milisegundos % 3600000) / 60000);
	let segundos = Math.floor((diferencia_milisegundos % 60000) / 1000);

	// Formatear la diferencia de tiempo en horas, minutos y segundos
	let diferencia_formateada = ("0" + horas).slice(-2) + ":" + ("0" + minutos).slice(-2) + ":" + ("0" + segundos).slice(-2);

	// Envio TMO al campo
	document.getElementById("tmo").textContent = diferencia_formateada;
}

// * LLAMAR FUNCIONES fecha_hora_registro Y control_tmo CADA SEGUNDO. 
setInterval(() => {
	if (document.querySelector('#inpCaso') !== null) {
		// Variables
		let txt_fecha_hora_inicio_tipificacion = document.getElementById('txt_fecha_hora_inicio_tipificacion');
		// Condiciones
		if (txt_fecha_hora_inicio_tipificacion.value !== '21/07/1988 21:00:00' && txt_fecha_hora_inicio_tipificacion.value !== '') {
			fecha_hora_registro();
			control_tmo();
		}
	}
}, 1000);















// ! ================================================================================================================================================
// !                                                           MODULO DIRECTORIO DE CONTACTOS
// ! ================================================================================================================================================
/**
 * @author Brayan Yanez
 * @created 10 de abril de 2024
 * @lastModified 10 de abril de 2024
 * @version 1.0.0
 */
// TODO: CONTROL MODAL DIRECTORIO CONTACTO
async function ctrl_modal_directorio_contactos() {
	// * LISTAR CONTACTOS DEL DIRECTORIO
	listar_contactos_directorio();
}
// TODO: LISTAR CONTACTOS DEL DIRECTORIO
async function listar_contactos_directorio() {
	// * HAGO LA CONSULTA DE CONTACTO AL DIRECTORIO
	getData('/mensajeria/listar_directorio_contactos').then(async (consult_listar_directorio_contactos) => {
		const result_directorio_contactos = consult_listar_directorio_contactos.rta;
		if (result_directorio_contactos.length > 0) {
			// * DESTRUIMOS DATATABLE
			$("#tbl_directorio_contacto").DataTable().destroy();
			// * INICIALIZAMOS DATATABLES
			$(document).ready(function () {
				if (!$.fn.DataTable.isDataTable("#tbl_directorio_contacto")) {
					$("#tbl_directorio_contacto").DataTable({
						responsive: true,
						iDisplayLength: 3,
						aLengthMenu: [
							[3, 5, 10, 25, 50, -1],
							[3, 5, 10, 25, 50, "All"],
						],
						columnDefs: [
							{
								targets: [1, 5, 6], // Condiciono las columnas apiladas
								className: 'none'
							},
						],
						language: {
							lengthMenu: "Mostrar _MENU_ registros",
							zeroRecords: "No se encontraron resultados",
							info: "Mostrando del _START_ al _END_ de  _TOTAL_ registros",
							infoEmpty: "Mostrando del 0 al 0 de 0 registros",
							infoFiltered: "(Filtrado de _MAX_ registros)",
							sSearch: "Buscar",
							oPaginate: {
								sFirst: "Primero",
								sLast: "Ultimo",
								sNext: "Siguiente",
								sPrevious: "Anterior",
							},
							sProcessing: "Procesando",
						},
						drawCallback: function () {
							$(".dataTables_paginate > .pagination").addClass("pagination-rounded")
						},
						scrollX: false
					});
				}
			});

			// * OBTENEMOS LA TABLA Y LA INICIALIZAMOS VACIA
			const tabla = document.querySelector("#tbl_directorio_contacto tbody");
			let tbody_html = ``;

			// * LISTAMOS LOS REGISTROS
			result_directorio_contactos.forEach((row) => {
				tbody_html += `
            <tr>
                    <td><b>${row.REGISTRO}</b></td>

                    <td>
                        ${row.FECHA}
                    </td>
    
                    <td>
                        ${row.NUMERO}
                    </td>
    
                    <td>
                        ${row.CONTACTO}
                    </td>
    
                    <td>
                        ${row.ESTADO}
                    </td>
    
                    <td>
                        ${row.FECHA_ACTUALIZACION}
                    </td>
    
                    <td>
                        ${row.RESPONSABLE}
                    </td>

                    <td>
                    <a class="modal-trigger" href="#modal_actualizar_contacto" onclick="ctrl_modal_actualizar_contacto(${row.REGISTRO});">
                    <i class="material-icons"
              id="btn_modal_actualizar_contacto" style="text-align: right;">edit</i> Actualizar</a>
                    </td>

            </tr>
            `;
			});
			tabla.innerHTML = tbody_html;

			// * LLAMAR AL EVENTO 'draw.dt' MANUALMENTE AL CARGAR LA TABLA POR PRIMERA VEZ
			$("#tbl_directorio_contacto").trigger('draw.dt');
			return;
		} else {
			// ? NOTIFICO AL USUARIO
			M.toast({ html: 'Error en ruta: /mensajeria/listar_directorio_contactos, intente de nuevo' });
		}
	});
}



// TODO: CONTROL MODAL AGREGAR CONTACTO
async function ctrl_modal_agregar_contacto() {
	// * INICIALIZO CAMPOS
	document.getElementById('txt_numero_contacto').value = '';
	document.getElementById('txt_nombres_apellidos_contacto').value = '';

	// * INICIALIZO COMPONENTES
	setTimeout(function () {
		// ? INICIALIZO CONTROL VISUAL CAMPOS
		ctrl_init_campos();
	}, 100);
}
// TODO: VALIDACION CAMPOS
// * VALIDACION CAMPO NUMERO DE CONTACTO
async function valida_txt_numero_contacto() {
	const txt_numero_contacto = document.getElementById('txt_numero_contacto');
	let txt_numero_contacto_value = txt_numero_contacto.value.trim();

	// Remover caracteres no numéricos inmediatamente al escribir
	txt_numero_contacto_value = txt_numero_contacto_value.replace(/\D/g, '');

	// Validar que solo contenga 10 dígitos numéricos
	const numerosRegex = /^[0-9]{10}$/;

	// Actualizar el valor del campo con los caracteres limpios
	txt_numero_contacto.value = txt_numero_contacto_value;

	// Validación si está vacío o no cumple con el formato de números
	if (!txt_numero_contacto_value) {
		campo_invalido(txt_numero_contacto, 'Por favor complete este campo...', true);
	} else if (!numerosRegex.test(txt_numero_contacto_value)) {
		campo_invalido(txt_numero_contacto, 'Ingrese exactamente 10 números en este campo...', true);
	} else {
		campo_valido(txt_numero_contacto);
	}
}
// * VALIDACION CAMPO NOMBRES Y APELLIDOS
async function valida_txt_nombres_apellidos_contacto() {
	const txt_nombres_apellidos_contacto = document.getElementById('txt_nombres_apellidos_contacto');
	let txt_nombres_apellidos_contacto_value = txt_nombres_apellidos_contacto.value;

	// * Letra capital (colocar primera letra en mayúscula)
	if (txt_nombres_apellidos_contacto_value !== "") {
		txt_nombres_apellidos_contacto_value = txt_nombres_apellidos_contacto_value.charAt(0).toUpperCase() + txt_nombres_apellidos_contacto_value.slice(1);
		txt_nombres_apellidos_contacto.value = txt_nombres_apellidos_contacto_value;
	}

	// * Validación si está vacío
	if (!txt_nombres_apellidos_contacto_value) {
		campo_invalido(txt_nombres_apellidos_contacto, 'Por favor complete este campo...', true);
	} else if (txt_nombres_apellidos_contacto_value.length <= 3) {
		campo_invalido(txt_nombres_apellidos_contacto, 'Este valor no es valido...', true);
	} else {
		campo_valido(txt_nombres_apellidos_contacto);
	}
}
// TODO: AGREGAR CONTACTOS AL DIRECTORIO
async function guardar_contacto() {
	// TODO: BLINDAJE
	swal.fire({
		position: 'center',
		icon: 'question',
		title: 'Agregar Contacto?',
		html: `<i class="fas fa-hand-point-right"></i> Directorio Contacto.`,
		showCancelButton: true,
		allowOutsideClick: false,
		allowEscapeKey: false,
		confirmButtonColor: "#3085d6",
		cancelButtonColor: "#d33",
		confirmButtonText: "Si",
		cancelButtonText: "No"
	}).then(async (result) => {
		if (result.isConfirmed === true) {
			// TODO: OBTENGO VALORES DEL FORMULARIO
			// ? INFORMACION CORREO ASIGNADO
			const txt_numero_contacto = document.getElementById('txt_numero_contacto').value;
			const txt_nombres_apellidos_contacto = document.getElementById('txt_nombres_apellidos_contacto').value;


			// TODO: ENVIO DATA AL SERVIDOR
			postData('mensajeria/agregar_contacto', { txt_numero_contacto: txt_numero_contacto, txt_nombres_apellidos_contacto: txt_nombres_apellidos_contacto }).then(async (res) => {
				// TODO: OBTENGO RESPUESTA DEL SERVIDOR
				// * SI HAY CAMPOS INVALIDOS
				if (res.campos_invalidos) {
					// ? ACTIVO CONTROL VISUAL CAMPOS
					valida_txt_numero_contacto();
					valida_txt_nombres_apellidos_contacto();
					// ? NOTIFICO AL USUARIO
					M.toast({ html: `${res.campos_invalidos}` });
					return;
				}
				// * SI EL CONTACTO YA EXISTE
				if (res.existe_contacto) {
					// ? LIMPIO LOS CAMPOS
					document.getElementById('txt_numero_contacto').value = '';
					document.getElementById('txt_nombres_apellidos_contacto').value = '';
					// ? INICIALIZO CONTROL VISUAL CAMPOS
					ctrl_init_campos();
					// ? NOTIFICO AL USUARIO
					M.toast({ html: `${res.existe_contacto}` });

					// * CERRAR EL MODAL DE AGREGAR CONTACTO
					const instance = M.Modal.getInstance(document.getElementById('modal_agregar_contacto'));
					instance.close();
					return;
				}
				// * SI EL REGISTRO FUE EXITOSO
				if (res.registro_exitoso) {
					// ? LIMPIO LOS CAMPOS
					document.getElementById('txt_numero_contacto').value = '';
					document.getElementById('txt_nombres_apellidos_contacto').value = '';
					// ? INICIALIZO CONTROL VISUAL CAMPOS
					ctrl_init_campos();
					// ? NOTIFICO AL USUARIO
					M.toast({ html: `${res.registro_exitoso}` });

					// * LISTAR LOS CONTACTOS ACTUALES EN EL DIRECTORIO
					listar_contactos_directorio();

					// * CERRAR EL MODAL DE AGREGAR CONTACTO
					const instance = M.Modal.getInstance(document.getElementById('modal_agregar_contacto'));
					instance.close();
					return;
				}
				// * SI HUBO UN ERROR
				// ? NOTIFICO AL USUARIO
				M.toast({ html: 'Error en ruta: /mensajeria/agregar_contacto, intente de nuevo' });
			});
		}
	});
}




// TODO: CONTROL MODAL ACTUALIZAR CONTACTO
async function ctrl_modal_actualizar_contacto(id_contacto) {
	// * HAGO LA CONSULTA DEL REGISTRO A ACTUALIZAR
	const result_id_contacto = await getData(`mensajeria/id_contacto?id_contacto=${id_contacto}`);
	// * VALIDO RESPUESTA DEL SERVIDOR
	if (result_id_contacto.rta[0]) {
		// ? PASO LOS DATOS A LOS INPUTS
		document.getElementById('id_registro').value = result_id_contacto.rta[0].REGISTRO;
		document.getElementById('txt_update_numero_contacto').value = result_id_contacto.rta[0].NUMERO;
		document.getElementById('txt_update_nombres_apellidos_contacto').value = result_id_contacto.rta[0].CONTACTO;

		// ? PASO LOS DATOS AL SELECT
		var estadoSelect = document.getElementById('txt_update_estado');
		var estadoValue = result_id_contacto.rta[0].ESTADO;
		// Recorrer las opciones del select y marcar la que coincide con el valor recibido
		for (var i = 0; i < estadoSelect.options.length; i++) {
			if (estadoSelect.options[i].value === estadoValue) {
				estadoSelect.options[i].selected = true;
				break; // Termina el bucle después de encontrar la opción correspondiente
			}
		}

		// Inicializar los selects
		var elemsSelect = document.querySelectorAll('select');
		M.FormSelect.init(elemsSelect);

		// Inicializar los inputs
		var elemsInput = document.querySelectorAll('.ctrl_visual_campo');
		M.updateTextFields();

		// ? INICIALIZO CONTROL VISUAL CAMPOS
		valida_txt_update_numero_contacto();
		valida_txt_update_nombres_apellidos_contacto();
	} else {
		// ? NOTIFICO AL USUARIO
		M.toast({ html: 'Error en ruta: /mensajeria/id_contacto, intente de nuevo' });
	}
}
// TODO: VALIDACION CAMPOS
// * VALIDACION CAMPO NUMERO DE CONTACTO
async function valida_txt_update_numero_contacto() {
	const txt_update_numero_contacto = document.getElementById('txt_update_numero_contacto');
	let txt_update_numero_contacto_value = txt_update_numero_contacto.value.trim();

	// Remover caracteres no numéricos inmediatamente al escribir
	txt_update_numero_contacto_value = txt_update_numero_contacto_value.replace(/\D/g, '');

	// Validar que solo contenga 10 dígitos numéricos
	const numerosRegex = /^[0-9]{10}$/;

	// Actualizar el valor del campo con los caracteres limpios
	txt_update_numero_contacto.value = txt_update_numero_contacto_value;

	// Validación si está vacío o no cumple con el formato de números
	if (!txt_update_numero_contacto_value) {
		campo_invalido(txt_update_numero_contacto, 'Por favor complete este campo...', true);
	} else if (!numerosRegex.test(txt_update_numero_contacto_value)) {
		campo_invalido(txt_update_numero_contacto, 'Ingrese exactamente 10 números en este campo...', true);
	} else {
		campo_valido(txt_update_numero_contacto);
	}
}
// * VALIDACION CAMPO NOMBRES Y APELLIDOS
async function valida_txt_update_nombres_apellidos_contacto() {
	const txt_update_nombres_apellidos_contacto = document.getElementById('txt_update_nombres_apellidos_contacto');
	let txt_update_nombres_apellidos_contacto_value = txt_update_nombres_apellidos_contacto.value;

	// * Letra capital (colocar primera letra en mayúscula)
	if (txt_update_nombres_apellidos_contacto_value !== "") {
		txt_update_nombres_apellidos_contacto_value = txt_update_nombres_apellidos_contacto_value.charAt(0).toUpperCase() + txt_update_nombres_apellidos_contacto_value.slice(1);
		txt_update_nombres_apellidos_contacto.value = txt_update_nombres_apellidos_contacto_value;
	}

	// * Validación si está vacío
	if (!txt_update_nombres_apellidos_contacto_value) {
		campo_invalido(txt_update_nombres_apellidos_contacto, 'Por favor complete este campo...', true);
	} else if (txt_update_nombres_apellidos_contacto_value.length <= 3) {
		campo_invalido(txt_update_nombres_apellidos_contacto, 'Este valor no es valido...', true);
	} else {
		campo_valido(txt_update_nombres_apellidos_contacto);
	}
}
// TODO: ACTUALIZAR CONTACTOS AL DIRECTORIO
async function actualizar_contacto() {
	// TODO: BLINDAJE
	swal.fire({
		position: 'center',
		icon: 'question',
		title: 'Actualizar Contacto?',
		html: `<i class="fas fa-hand-point-right"></i> Directorio Contacto.`,
		showCancelButton: true,
		allowOutsideClick: false,
		allowEscapeKey: false,
		confirmButtonColor: "#3085d6",
		cancelButtonColor: "#d33",
		confirmButtonText: "Si",
		cancelButtonText: "No"
	}).then(async (result) => {
		if (result.isConfirmed === true) {
			// TODO: OBTENGO VALORES DEL FORMULARIO
			// ? INFORMACION CORREO ASIGNADO
			const id_registro = document.getElementById('id_registro').value;
			const txt_update_estado = document.getElementById('txt_update_estado').value;
			const txt_update_numero_contacto = document.getElementById('txt_update_numero_contacto').value;
			const txt_update_nombres_apellidos_contacto = document.getElementById('txt_update_nombres_apellidos_contacto').value;


			// TODO: ENVIO DATA AL SERVIDOR
			postData('mensajeria/actualizar_contacto', { id_registro: id_registro, txt_update_estado: txt_update_estado, txt_update_numero_contacto: txt_update_numero_contacto, txt_update_nombres_apellidos_contacto: txt_update_nombres_apellidos_contacto }).then(async (res) => {
				// TODO: OBTENGO RESPUESTA DEL SERVIDOR
				// * SI HAY CAMPOS INVALIDOS
				if (res.campos_invalidos) {
					// ? ACTIVO CONTROL VISUAL CAMPOS
					valida_txt_update_numero_contacto();
					valida_txt_update_nombres_apellidos_contacto();
					// ? NOTIFICO AL USUARIO
					M.toast({ html: `${res.campos_invalidos}` });
					return;
				}
				// * SI EL CONTACTO NO EXISTE
				if (res.no_existe_contacto) {
					// ? NOTIFICO AL USUARIO
					M.toast({ html: `${res.no_existe_contacto}` });

					// * CERRAR EL MODAL DE ACTUALIZAR CONTACTO
					const instance = M.Modal.getInstance(document.getElementById('modal_actualizar_contacto'));
					instance.close();
					return;
				}
				// * SI EL REGISTRO FUE EXITOSO
				if (res.registro_actualizado) {
					// ? NOTIFICO AL USUARIO
					M.toast({ html: `${res.registro_actualizado}` });

					// * LISTAR LOS CONTACTOS ACTUALES EN EL DIRECTORIO
					listar_contactos_directorio();

					// * CERRAR EL MODAL DE AGREGAR CONTACTO
					const instance = M.Modal.getInstance(document.getElementById('modal_actualizar_contacto'));
					instance.close();
					return;
				}
				// * SI HUBO UN ERROR
				// ? NOTIFICO AL USUARIO
				M.toast({ html: 'Error en ruta: /mensajeria/actualizar_contacto, intente de nuevo' });
			});
		}
	});
}




// ! ================================================================================================================================================
// !                                                   LISTAR CONTACTOS ACTIVOS PARA CHAT OUTBOUND
// ! ================================================================================================================================================
/**
 * @author Brayan Yanez
 * @created 10 de abril de 2024
 * @lastModified 10 de abril de 2024
 * @version 1.0.0
 */
// TODO: CONTROL MODAL CHAT OUNBOUND
async function ctrl_modalChatOut() {
	// * INICIALIZO CAMPOS
	$('#ChatOutboundCelular').val('');
	$('#PlantillaChatOutBound').val('');


	// * HAGO LA CONSULTA DE CONTACTO AL DIRECTORIO
	getData('/mensajeria/directorio_contactos').then(async (consult_directorio_contactos) => {
		// ? OBTENGO LOS CONTACTOS
		if (consult_directorio_contactos.rta) {
			// ? OBTENGO EL DATALIST Y LO LIMPIO
			const dataList = document.getElementById('contactos');
			dataList.innerHTML = ''

			// ? LLENO EL DATALIST
			consult_directorio_contactos.rta.forEach(contacto => {
				const option = document.createElement('option');
				option.value = contacto.NUMERO;
				option.textContent = contacto.CONTACTO;
				dataList.appendChild(option);
			});
		} else {
			// ? LIMPIO EL DATALIST
			const dataList = document.getElementById('contactos');
			dataList.innerHTML = '';

			// ? NOTIFICAR AL USUARIO
			M.toast({ html: 'Error en ruta: /mensajeria/directorio_contactos, intente de nuevo' });
		}
	});

	// * INICIALIZO COMPONENTES
	// ? INICIALIZO SELECT2
	$('#ChatOutboundCelular').trigger('change');

	// ? TOMO LA PRIMERA OPCION QUE TIENE POR DEFECTO EL SELECT
	$('#PlantillaChatOutBound').val($('#PlantillaChatOutBound option:first').val());
	// ? INICIALIZO COMPONENTE SELECT
	M.FormSelect.init($('#PlantillaChatOutBound'));
}
// TODO: VALIDACION CAMPOS
// * VALIDACION CAMPO NUMERO DE CONTACTO
async function valida_ChatOutboundCelular() {
	const ChatOutboundCelular = document.getElementById('ChatOutboundCelular');
	let ChatOutboundCelular_value = ChatOutboundCelular.value.trim();

	// Remover caracteres no numéricos inmediatamente al escribir
	ChatOutboundCelular_value = ChatOutboundCelular_value.replace(/\D/g, '');

	// Validar que solo contenga 10 dígitos numéricos
	const numerosRegex = /^[0-9]{10}$/;

	// Actualizar el valor del campo con los caracteres limpios
	ChatOutboundCelular.value = ChatOutboundCelular_value;

	// Validación si está vacío o no cumple con el formato de números
	if (!ChatOutboundCelular_value) {
		campo_invalido(ChatOutboundCelular, 'Por favor complete este campo...', true);
	} else if (!numerosRegex.test(ChatOutboundCelular_value)) {
		campo_invalido(ChatOutboundCelular, 'Ingrese exactamente 10 números en este campo...', true);
	} else {
		campo_valido(ChatOutboundCelular);
	}
}



// ! ================================================================================================================================================
// !                                                               FUNCIONES AUXILIARES
// ! ================================================================================================================================================
/**
 * @author Brayan Yanez
 * @created 10 de abril de 2024
 * @lastModified 10 de abril de 2024
 * @version 1.0.0
 */
// TODO: CONTROL VISUAL INICIAL
async function ctrl_init_campos() {
	let invalidFeedbackElements = document.querySelectorAll('.invalid-feedback');
	for (let i = 0; i < invalidFeedbackElements.length; i++) {
		invalidFeedbackElements[i].style.display = 'none';
	}

	let elementos = document.querySelectorAll('.ctrl_visual_campo');
	for (let i = 0; i < elementos.length; i++) {
		elementos[i].style.borderBottom = '1px solid';
		elementos[i].style.borderColor = "#9e9e9e";
	}
}
// TODO:  CONTROL VISUAL CAMPO INVALIDO
async function campo_invalido(campo, sms, mostrarIcono) {
	const invalidFeedbackElement = campo.parentElement.querySelector('.invalid-feedback');
	invalidFeedbackElement.innerHTML = mostrarIcono ? '► ' + sms : sms;
	invalidFeedbackElement.style.display = 'block';
	invalidFeedbackElement.style.color = 'red';
	campo.style.borderColor = "red";
}
// TODO:  CONTROL VISUAL CAMPO VALIDO
async function campo_valido(campo) {
	const invalidFeedbackElement = campo.parentElement.querySelector('.invalid-feedback');
	invalidFeedbackElement.textContent = '';
	invalidFeedbackElement.style.display = 'none';
	campo.style.borderColor = "#23b397";
}