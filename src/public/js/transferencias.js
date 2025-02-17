document.addEventListener('DOMContentLoaded', () => {
	// ! ======================================================================================================================================================================
	// !                                                                  VARIABLES GLOBALES
	// ! ======================================================================================================================================================================
	/**
	 * @author Brayan Yanez
	 * @created 14 de Mayo de 2024
	 * @lastModified 14 de Mayo de 2024
	 * @version 1.0.0
	*/
	const ID_USER_LOG = localStorage.getItem('UserId');
	const LOGIN_USER_LOG = document.querySelector('#inpTipoLogueo').value;
	const AUX_USER_LOG = document.getElementById('nameUserEstado').textContent;
	const nombreDeUsuario = document.getElementById('userUsuario').innerText;
	const authToken = document.getElementById('authToken').innerText;
	let AUTORIZAR_SONIDO_CHAT = false;
	const CONTENT_CHATS = document.getElementById('sectionChatMenu');
	let CAPACIDAD_CHATS_USER = '';
	let OCUPACION_CHATS_USER = '';
	let CHATS_ASIGNADOS = [];






	// ? SIMULAMOS CLICK SOBRE EL CONTENEDOR DE CHATS
	// ESTO SE HACE PARA SALTAR EL PREVENT DEFAULT QUE TIENE EL NAVEGADOR PARA REPRODUCIR SONIDOS SIN INTERACCION PREVIA DEL USUARIO
	// DOMException: play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD
	document.getElementById('contenedor_chats').click();












	// ! ======================================================================================================================================================================
	// !                                                              ASIGNAR AUTOMATICAMENTE CHATS AL USUARIO → FUNCION asignador_automatico_chats
	// ! ======================================================================================================================================================================
	/**
	 * @author Brayan Yanez
	 * @created 14 de Mayo de 2024
	 * @lastModified 14 de Mayo de 2024
	 * @version 1.0.0
	 */
	async function asignador_automatico_chats() {
		// * SOLICITAR ASIGNAR CHATS AL USUARIO
		const CHATS_ASIGNADOS = await postData(`${URL_API_ASIGNACION}/asignacionSelect`, { ID_USER_LOG, AUX_USER_LOG, nombreDeUsuario, authToken });

		// * ACTUALIZAR LAS VARIABLES GLOBALES
		CAPACIDAD_CHATS_USER = CHATS_ASIGNADOS.result_cap_chats_user;
		OCUPACION_CHATS_USER = CHATS_ASIGNADOS.result_ocp_chats_user;

		// * VALIDAR RESPUESTA LUEGO DE UNA PAUSA DE 6 SEGUNDOS
		setTimeout(() => {
			if (CHATS_ASIGNADOS.success) {
				return M.toast({ html: `${CHATS_ASIGNADOS.success}` });
			}
			if (CHATS_ASIGNADOS.error) {
				return M.toast({ html: `${CHATS_ASIGNADOS.error}` });
			}
		}, 6000);

	}

	// * LLAMAR LA FUNCION PARA ASIGNAR CHATS AL USUARIO LA PRIMERA VEZ
	asignador_automatico_chats();












	// ! ======================================================================================================================================================================
	// !                                                               LISTAR LOS CHATS ASIGNADOS AL USUARIO → FUNCION listar_chats_asignados
	// ! ======================================================================================================================================================================
	/**
	 * @author Brayan Yanez
	 * @created 14 de Mayo de 2024
	 * @lastModified 14 de Mayo de 2024
	 * @version 1.0.0
	 */
	async function listar_chats_asignados() {
		// * VARIABLES
		let ICON_CHAT = '';
		let INFO_CHAT = '';

		CHATS_ASIGNADOS = await postData(`${URL_API_ASIGNACION}/chatsAsignados`, { ID_USER_LOG, nombreDeUsuario, authToken });

		// * VALIDA SI EL USUARIO AUTORIZA EL SONIDO DE NOTIFICACION PARA MENSAJES NUEVOS
		if (AUTORIZAR_SONIDO_CHAT === false) {
			// * SOLICITAR AUTORIZACION DE SONIDO AL USUARIO POR MEDIO DE SW ALERT
			Swal.fire({
				title: '\uD83D\uDD0A Notificación de mensajes nuevos',
				text: 'Por favor autoriza la notificación de mensajes nuevos de tus chats asignados.',
				icon: 'warning',
				confirmButtonText: 'Aceptar y Continuar...',
				allowEscapeKey: false,
				allowOutsideClick: false
			}).then((result) => {
				if (result.isConfirmed) {
					AUTORIZAR_SONIDO_CHAT = true;
					// * LLAMAR LA FUNCION PARA LISTAR CHATS ASIGNADOS AL USUARIO UNA VEZ AUTORIZADO EL SONIDO
					listar_chats_asignados();
				}
			});
		} else {
			// * VALIDO SI EL USUARIO TIENE CHATS ASIGNADOS
			if (CHATS_ASIGNADOS.length) {
				// * RECORRER LOS CHATS ASIGNADOS
				CHATS_ASIGNADOS.forEach((chat) => {
					// ? VALIDAR SI EL CHAT NO EXISTE
					if (!document.getElementById(chat.ID_CHAT)) {
						// ? SI EXISTE EL DIV DE "NO TIENES CHATS ASIGNADOS..." LO ELIMINO
						if (document.getElementById('ID_CHAT')) {
							document.getElementById('ID_CHAT').remove();
						}

						// * CREO UN ELMENTO DIV PARA EL CHAT Y LO PERSONALIZO
						// ? CREO UN DIV PARA EL CHAT
						let LISTAR_INFO_CHAT = document.createElement('div');
						// ? AGREGO UN ID AL DIV DEL CHAT
						LISTAR_INFO_CHAT.setAttribute('id', `list_info_chat_${chat.ID_CHAT}`);

						// ? SI EL ESTADO DEL CHAT ES TRANSFERRD SE LE COLOCA UN ASTERISCO A LA DERECHA DEL NOMBRE DEL CONTACTO
						if (chat.ESTADO_CASO === 'TRANSFERRED') {
							INFO_CHAT = 'Transferido';
						} else {
							INFO_CHAT = 'Asignado';
						}

						// ? VALIDAMOS SI EL CHAT ES GRUPAL O INDIVIDUAL
						if (chat.TIPO_CHAT === 'GRUPAL') {
							INFO_CHAT = 'Grupo ' + INFO_CHAT;
							ICON_CHAT = 'group';
						} else {
							INFO_CHAT = 'Chat ' + INFO_CHAT;
							ICON_CHAT = 'person';
						}

						// ? AGREGAR EL HTML DEL CHAT A LISTAR_INFO_CHAT
						LISTAR_INFO_CHAT.innerHTML = `
                    <div class="chat-user animate fadeUp delay-2 list_info_chat" id="${chat.ID_CHAT}" onclick="activar_conversacion_chat('${chat.ID_CHAT}', '${chat.TIPO_CHAT}','${chat.WHATSAPP_FROM}', '${chat.CONTACTO_INTERNO}')">
                        <div class="user-section">
                            <div class="row valign-wrapper">
                                <div class="col s2 media-image online pr-0">
                                    <i class="material-icons circle z-depth-2 responsive-img tooltipped" data-position="right" data-tooltip="Chat ${chat.WHATSAPP_FROM}" style="font-size: 25px;color:#276E90; padding: 6px;">${ICON_CHAT}</i>
                                </div>
                                <div class="col s10">
                                    <p class="m-0 blue-grey-text text-darken-4 font-weight-700" style="padding: 3px;">${chat.CONTACTO_INTERNO} </p>
                                    <p class="m-0 info-text">${INFO_CHAT}</p>
                                </div>
                            </div>
                        </div>
                        <div class="info-section">
                            <div class="star-timing">
                                <div class="time"><span></span></div>
                                <div class="star" id="contador_${chat.ID_CHAT}"></div>
                            </div>
                        </div>
                    </div>
                `;

						// * AGREGAR EL CHAT AL CONTENEDOR DE CHATS
						if (CONTENT_CHATS.firstChild) {
							// Si ya hay elementos dentro de CONTENT_CHATS, insertamos el nuevo chat antes del primer hijo
							CONTENT_CHATS.insertBefore(LISTAR_INFO_CHAT, CONTENT_CHATS.firstChild);
						} else {
							// Si no hay elementos dentro de CONTENT_CHATS, simplemente lo añadimos
							CONTENT_CHATS.appendChild(LISTAR_INFO_CHAT);
						}
						M.Tooltip.init(document.querySelectorAll('.tooltipped'));
					}
				});
			} else {
				// * RENDERIZAR EL MENSAJE DE "No tienes chats asignados..." SI NO HAY CHATS ASIGNADOS
				CONTENT_CHATS.innerHTML = ``;
				let LISTAR_INFO_CHAT = `
            <div class="chat-user animate fadeUp delay-2" id="ID_CHAT">
                <div class="col s12 valign-wrapper">
                    <div class="col s2 media-image online pr-0">
                        <i class="material-icons">offline_pin</i>
                    </div>
                    <div class="col s10">
                        <p>No tienes chats asignados...</p>
                    </div>
                </div>
            </div>
        `;
				CONTENT_CHATS.innerHTML = LISTAR_INFO_CHAT;
			}

			// * LLAMAR LAS SIGUIENTE FUNCIONES CADA CADA 5 SEGUNDOS
			setTimeout(() => {
				console.log('CAPACIDAD_CHATS_USER >= OCUPACION_CHATS_USER ===> ', CAPACIDAD_CHATS_USER, OCUPACION_CHATS_USER);
				// * LLAMAR LA FUNCION PARA ASIGNAR CHATS AL USUARIO MIENTRAS EL LA CAPACIDAD DE CHATS SEA MAYOR A LA OCUPACION DE CHATS
				if (CAPACIDAD_CHATS_USER >= OCUPACION_CHATS_USER) {
					asignador_automatico_chats();
				}

				// * LLAMAR LA FUNCION PARA LISTAR LOS CHATS ASIGNADOS AL USUARIO
				listar_chats_asignados();

				// * LLAMAR LA FUNCION PARA NOTIFICAR MENSAJES NUEVOS
				notificar_mensaje_nuevo_chat(CHATS_ASIGNADOS);
				document.getElementById('contenedor_chats').click();
			}, 5000);
		}
	}


	// * LLAMAR LA FUNCION PARA LISTAR CHATS ASIGNADOS AL USUARIO LA PRIMERA VEZ
	listar_chats_asignados();














	// ! ================================================================================================================================================
	// !                            NOTIFICAR MENSAJES NUEVOS PARA LOS CHATS ASIGNADOS AL USUARIO → FUNCION notificar_mensaje_nuevo_chat
	// ! ================================================================================================================================================
	/**
	 * @author Brayan Yanez
	 * @created 24 de abril de 2024
	 * @lastModified 24 de abril de 2024
	 * @version 1.0.0
	 */
	// TODO: FUNCION PARA MOSTRAR LOS MENSAJES NUEVOS SEGUN EL CHAT ASIGNADO AL USUARIO
	// * OBTENER LOS CHATS NOTIFICADOS
	const chats_notificados = {};
	async function notificar_mensaje_nuevo_chat(CHATS_ASIGNADOS) {
		// * SI HAY CHATS ASIGNADOS
		if (CHATS_ASIGNADOS.length > 0) {
			// * RECORRO LOS CHATS ASIGNADOS
			for (let i = 0; i < CHATS_ASIGNADOS.length; i++) {
				// ? OBTENGO EL CONTADOR DE CADA CHAT ASIGNADO
				let contador_chat_asignado = document.getElementById(`contador_${CHATS_ASIGNADOS[i].ID_CHAT}`);
				// ? CONSULTO LOS MENSAJES NUEVOS DE CADA CHAT ASIGNADO
				let chatID = CHATS_ASIGNADOS[i].ID_CHAT;
				const buscar_nuevos_chats = await postData(URL_API_CONSULTAR + '/searchNewChats', { chatID, nombreDeUsuario, authToken });
				// ? ESPERO LA RESPUESTA DE LA CONSULTA
				if (buscar_nuevos_chats.numUnreadMessages > 0) {
					// ? MUESTRO LA CANTIDAD DE MENSAJES SIN LEER AL CONTADOR DEL CHAT ASIGNADO
					if (contador_chat_asignado !== null) {
						// ? MUESTRO LA CANTIDAD DE MENSAJES NUEVOS
						contador_chat_asignado.innerHTML = `
                        <span class="badge badge pill light-blue darken-4" style="width: 33px;">${buscar_nuevos_chats.numUnreadMessages}</span>
                    `;
						// ? VERIFICAMOS SI YA FUE NOTIFICADO ESTE CHAT Y SI ES MAYOR LA CANTIDAD DE MENSAJES ACTUAL A LA ANTERIOR
						if (!chats_notificados[chatID] || buscar_nuevos_chats.numUnreadMessages > chats_notificados[chatID]) {
							await reproducir_sonido_notificacion();
						}

						// ? REGISTRAR QUE SE HA NOTIFICADO ESTE CHAT
						chats_notificados[chatID] = buscar_nuevos_chats.numUnreadMessages;
					}
				} else {
					// ? REMUEVO EL CONTADOR DEL CHAT ASIGNADO SI NO HAY MENSAJES NUEVOS
					if (contador_chat_asignado !== null) {
						contador_chat_asignado.innerHTML = '';
					}
					// ? REINICIAMOS LA NOTIFICACION DEL CHAT
					chats_notificados[chatID] = 0;
				}
			}
		}
	}




	// ! ================================================================================================================================================
	// !                                   REPRODUCIR SONIDO DE NOTIFICACION PARA MENSAJE NUEVO → FUNCION reproducir_sonido_notificacion
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























	var idPer = '';
	const btnSendFile = document.getElementById('btnSendFile');
	//adjuntos
	let arrayPrueba = [];
	localStorage.setItem('AttendingChats', JSON.stringify(arrayPrueba));

	function getId() {
		getData('/mensajeria/getId').then((res) => {
			let idPer = res.idPer;
			localStorage.setItem('UserId', idPer);

			//SIEMPRE QUE ENTRE EL USUARIO VA A ESTAR ACTVIO PERO PRIMERO DEBE VALIDAR SI TIENE UN ESTADO ANTERIOR
			//SI ES NULO SIGNIFICA QUE NO SE LE HA ASIGNADO NADA Y LO PONE COMO EN ESTADO ACTIVO
			//SI SIGNIFICA QUE SI REFRESCA LA PÁGINA NO VA A PERDER EL ESTADO EN EL QUE ESTA, DE OTRA FORMA LO ASIGNA EN ACTIVO
		});
	}
	getId();

	function cantidadChats() {
		getData('/mensajeria/cantidadChats').then((res) => {
			let chatsAllowed = 50;
			localStorage.setItem('chatsAllowed', chatsAllowed);
		});
	}
	cantidadChats();

	// ! Enviar Adjunto
	btnSendFile.addEventListener('click', () => {
		const inputAddFile = document.getElementById('inputAddFile');
		let Media = inputAddFile.files[0];
		let fileSize = inputAddFile.files[0].size;
		let formData = new FormData();
		if (fileSize > 25000000) {
			alert('el archivo supera las 25 megas, IMPOSIBLE ENVIAR');
			return;
		}

		// * Send File
		formData.append('Media', Media);
		formData.append('To', localStorage.getItem('numChatActual'));
		formData.append('GestionID', localStorage.getItem('idChatActual'));
		formData.append('body', '');
		formData.append('usuario', nombreDeUsuario);
		formData.append('nombreDeUsuario', nombreDeUsuario);
		formData.append('authToken', authToken);
		formData.append('UserId', localStorage.getItem('UserId'));


		fetch(`${URB_API_ENVIAR_MSG}/sendMessage`, {
			method: 'POST',
			body: formData,
		})
			.then((res) => res.json())
			.then((res) => {
				showNewMessage(localStorage.getItem('idChatActual'), localStorage.getItem('numChatActual'));
			});
	});








































	// CODIGO ANTES...
	// const countNumberChats = () => {
	//   let arrayAttendingChats = [];
	//   arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
	//   // let existchata = arrayAttendingChats.includes('5A6D786D414E3D3D');

	//   let chatsAllowed = localStorage.getItem('chatsAllowed'); //se trae la cantidad de chats permitidos

	//   let UserId = localStorage.getItem('UserId');
	//   //capturamos el div que contiene el array de los chats para saber que cantidad de chats tiene el agente actualmente
	//   let sectionChatMenu = document.getElementById('sectionChatMenu');
	//   const chatsNumber = sectionChatMenu.children.length; //cantidad de chats
	//   const nameUserEstado = document.getElementById('nameUserEstado');
	//   const tipoLogueo = document.querySelector('#inpTipoLogueo').value; // cuando el tipo de logueo es JWT no se le asignan chats ya que en ese caso es solo outbound

	//   //verificar estado de usuario
	//   if (nameUserEstado.textContent === 'ONLINE') {
	//     //verificar si la cantidad de chats es menor al tope permitido
	//     if (chatsNumber < chatsAllowed) {
	//       //traer chats ATTENDING o en estado TRANSFERRED
	//       postData(`${URL_API_ASIGNACION}/chatsAsignados`, { UserId, arrayAttendingChats, nombreDeUsuario, authToken }).then(async (res) => {
	//         console.log('res chatsAsignados ===> ', res);
	//         if (res?.result.length > 0) {
	//           if (res.TRANSFERRED) Swal.fire('Message!', document.querySelector('[data-i18n="Se le ha transferido el chat"]').textContent + ' ' + res.result[0].GES_NUMERO_COMUNICA, 'success');
	//           let mensaje = res.result[0];
	//           let existchat = arrayAttendingChats.includes(mensaje.EnCryptId);

	//           if (existchat == false) {
	//             let htmlChat = document.createElement('div');
	//             htmlChat.setAttribute('id', mensaje.EnCryptId);

	//             // ? Por si la persona de alguna forma se salta el formulario
	//             const nombre_contacto_chat = mensaje.GES_NOMBRE_COMUNICA;
	//             const TIPO_CHAT = mensaje.GES_TIPO_CHAT;
	//             console.log('TIPO_CHAT ===> ', TIPO_CHAT);

	//             htmlChat.innerHTML = `
	//               <div class="chat-user animate fadeUp delay-2" onclick="shwoConversation('${mensaje.EnCryptId}','${mensaje.GES_NUMERO_COMUNICA}', '${mensaje.GES_NOMBRE_COMUNICA}')">
	//                 <div class="user-section">
	//                   <div class="row valign-wrapper">
	//                     <div class="col s2 media-image online pr-0">
	//                       <i class="material-icons circle z-depth-2 responsive-img tooltipped" data-position="right" data-tooltip="Chat ${mensaje.GES_NUMERO_COMUNICA}" style="font-size: 35px;color:#276E90;">people</i>
	//                     </div>
	//                     <div class="col s10">
	//                       <p class="m-0 blue-grey-text text-darken-4 font-weight-700">${nombre_contacto_chat} </p>
	//                       <p class="m-0 info-text"></p>
	//                     </div>
	//                   </div>
	//                 </div>
	//                 <div class="info-section">
	//                   <div class="star-timing">
	//                     <div class="time"><span></span></div>
	//                     <div class="star" id="contador_${mensaje.EnCryptId}"></div>
	//                   </div>

	//                 </div>
	//               </div>
	//               `;

	//             sectionChatMenu.appendChild(htmlChat);

	//             arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
	//             arrayAttendingChats.push(mensaje.EnCryptId.toString());
	//             localStorage.setItem('AttendingChats', JSON.stringify(arrayAttendingChats));

	//             M.Tooltip.init(document.querySelectorAll('.tooltipped'));
	//           }
	//         } else {

	//           // * asignación de chats automáticos al agente. 
	//           postData(`${URL_API_ASIGNACION}/asignacionSelect`, { UserId, nombreDeUsuario, authToken }).then(async (res) => {
	//             console.log('res asignacionSelect ===> ', res);
	//             if (res.result.length > 0) {
	//               let mensaje = res.result[0];
	//               let existchat = arrayAttendingChats.includes(mensaje.EnCryptId);
	//               if (existchat == false) {
	//                 let htmlChat = document.createElement('div');
	//                 htmlChat.setAttribute('id', mensaje.EnCryptId);

	//                 const nombre_contacto_chat = mensaje.GES_NOMBRE_COMUNICA;
	//                 const TIPO_CHAT = mensaje.GES_TIPO_CHAT;
	//                 console.log('TIPO_CHAT ===> ', TIPO_CHAT);

	//                 htmlChat.innerHTML += `
	//                     <div class="chat-user animate fadeUp delay-2"  onclick="shwoConversation('${mensaje.EnCryptId}','${mensaje.GES_NUMERO_COMUNICA}', '${mensaje.GES_NOMBRE_COMUNICA}')">
	//                       <div class="user-section">
	//                         <div class="row valign-wrapper">
	//                           <div class="col s2 media-image online pr-0">
	//                             <i class="material-icons circle z-depth-2 responsive-img tooltipped" data-position="top" data-tooltip="${mensaje.GES_NUMERO_COMUNICA}" style="font-size: 35px;color:#276E90;">account_circle</i>
	//                           </div>
	//                           <div class="col s10">
	//                             <p class="m-0 blue-grey-text text-darken-4 font-weight-700">${nombre_contacto_chat} </p>
	//                             <p class="m-0 info-text"></p>
	//                           </div>
	//                         </div>
	//                       </div>
	//                       <div class="info-section">
	//                         <div class="star-timing">
	//                           <div class="time"><span></span></div>
	//                           <div class="star" id="contador_${mensaje.EnCryptId}"></div>
	//                         </div>
	//                       </div>
	//                     </div>
	//                     `;

	//                 sectionChatMenu.appendChild(htmlChat);
	//                 arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
	//                 arrayAttendingChats.push(mensaje.EnCryptId.toString());
	//                 localStorage.setItem('AttendingChats', JSON.stringify(arrayAttendingChats));
	//                 M.Tooltip.init(document.querySelectorAll('.tooltipped'));

	//               }
	//             } else {
	//               if (arrayAttendingChats.length > 0) {
	//                 postData(`${URL_API_ASIGNACION}/verificarChats`, { UserId, arrayAttendingChats, nombreDeUsuario, authToken }).then(async (res) => {
	//                   if (res.length > 0) {
	//                     let sectionChatMenu = document.getElementById('sectionChatMenu');
	//                     const mainContainerChat = document.getElementById('mainContainerChat');
	//                     const mainContainerTipificar = document.getElementById('mainContainerTipificar');

	//                     res.forEach((elem) => {
	//                       try {
	//                         let chat = document.getElementById(elem);
	//                         sectionChatMenu.removeChild(chat);

	//                         let arrayAttendingChats = JSON.parse(localStorage.getItem('AttendingChats'));
	//                         let filterChats = arrayAttendingChats.filter((item) => item !== elem);
	//                         localStorage.setItem('AttendingChats', JSON.stringify(filterChats));
	//                       } catch (error) {
	//                         console.log("El chat " + elem + " no se puede eliminar por que no existe, error : " + error);
	//                       }


	//                     });
	//                     mainContainerChat.innerHTML = ``;
	//                     mainContainerTipificar.innerHTML = ``;

	//                     M.toast({ html: document.querySelector('[data-i18n="Chats actualizados por supervisor"]').textContent });
	//                   }
	//                 });
	//               }
	//             }
	//           });
	//         }
	//       });
	//     }
	//   }

	//   // ! Repeat
	//   setTimeout(() => {
	//     countNumberChats();
	//   }, 2000);
	// };

	// countNumberChats();
});
