const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../global.config.json')));
console.log("puerto config", config.apis.botWhatsappWebJS.PORT)
const { DB_NAME } = config.database;
const { apis } = config;
const connMySQL = require('../public/database');
const Class2 = require('../public/Class2');
const qrcode = require('qrcode-terminal');
const { format, parse, isValid, addDays } = require('date-fns');
const { es, tr } = require('date-fns/locale')
const mime = require('mime-types');
const express = require("express");


const DICC = {
	STATUS_APP_INICIANDO: 'INICIANDO',
	STATUS_APP_FINALIZADO: 'FINALIZADO',
	STATUS_APP_ERROR: 'ERROR',
	QR_SIN_INFO: 'SIN_INFO',
	QR_SOLICITANDO: 'SOLICITANDO',
	QR_EMPAREJADO: 'EMPAREJADO',
	CLIENT_OK: 'OK',
	CLIENT_NOT_READY: 'NOT_READY',
	CLIENT_FAIL: 'FAIL',
	SESION_OK: 'OK',
	SESION_NOT_READY: 'NOT_READY',
	SESION_FAIL: 'FAIL'
}

const DICC_SOLICITUD = {
	EN_ESPERA: 'EN ESPERA',
	FINALIZADO: 'FINALIZADO'
}

const clientWP = new Client({
	authStrategy: new LocalAuth({ clientId: apis.botWhatsappWebJS.PORT, dataPath: apis.botWhatsappWebJS.PATH_AUTH }),
	puppeteer: {
		headless: true,
		// executablePath: os.platform() === 'linux' ? '/usr/bin/google-chrome' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
	},
	webVersionCache: {
		path: apis.botWhatsappWebJS.PATH_CACHE
	},
	authTimeoutMs: 3600000,
	clientId: apis.botWhatsappWebJS.PORT
});

const randomId = () => {
	const random = Math.random().toString(32).substring(2);
	const fecha = Date.now();
	return `${random}-${fecha}`;
}

/**
 * Retorna string sin especios y solo caracteres alfanúmericos
 * @param {String} str 
 * @returns {String}
 */
const cleanDocumento = (str) => {
	return str.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Se obtiene fecha y hora actual
 * @returns {String} ej: 28 sept 2023, 2:44:28 p. m.
 */
const getDateTimeActual = () => {
	const opciones = {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: true
	}

	const dateTimeActual = new Date()

	return dateTimeActual.toLocaleString('es-ES', opciones)
}

/**
 * Actualiza datos relacionados con estado del robot de whatsapp
 * @param {Object} camposDB Objetos con campos a actualizar de DB
 */
const updateInfoBotWP = async (camposDB) => {
	try {
		const sqlSelect = `SELECT PKLIPR_NCODE FROM ${DB_NAME}.tbl_line_profiling WHERE LIPR_STATUS = ? ORDER BY PKLIPR_NCODE DESC LIMIT 1;`;
		const [resSelect] = await connMySQL.promise().query(sqlSelect, ["true"]);
		const PKLIPR_NCODE = resSelect[0].PKLIPR_NCODE;
	
		const sqlUpdate = `UPDATE ${DB_NAME}.tbl_line_profiling SET ? WHERE LIPR_STATUS = ? AND PKLIPR_NCODE = ?`;
		await connMySQL.promise().query(sqlUpdate, [camposDB, "true", PKLIPR_NCODE]);

	} catch {
		const sqlInsert = `INSERT INTO ${DB_NAME}.tbl_line_profiling SET ?`;
		await connMySQL.promise().query(sqlInsert, [camposDB]);
	}
}

/**
 * Crea cualquier menú de 'tbl_bot_tree' pasando solo el nombre de este (campo BTREE_TIPO_MSG)
 * @param {String} nombreMenu ej: MSG_MENU_1
 * @returns {String}
 */
const buildMenu = async (nombreMenu) => {
	const sqlSelect = `SELECT PKBTREE_NCODIGO,BTREE_OPTION_NUM,BTREE_TEXTO FROM ${DB_NAME}.tbl_bot_tree WHERE BTREE_TIPO_MSG = ?`;
	const [resSelect] = await connMySQL.promise().query(sqlSelect, [nombreMenu]);

	if (resSelect.length) {
		const arrMenu = resSelect.map(opMenu => {
			return isNaN(opMenu.BTREE_OPTION_NUM) ? `${opMenu.BTREE_TEXTO}\n` : `${opMenu.BTREE_OPTION_NUM}. ${opMenu.BTREE_TEXTO}\n`;
		})

		return arrMenu.join('');
	}
}


const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());


/**
 * EndPoint para enviar mensaje a usuario externo
 * Además guarda cada mensaje del bot en Base de datos
 * @param {String} whatsappNum Formato 573106542257@c.us
 * @param {String} textBody El texto del mensaje (si viene un file, esto por defecto viene con string vacio)
 */
// Endpoint para enviar mensajes
app.post("/send-message", async (req, res) => {
	console.log(req.body);
	
	const { whatsappNum, textBody } = req.body;
  
	if (!whatsappNum || !textBody) {
	  return res.status(400).json({ error: "Número y mensaje son requeridos" });
	}
  
	try {
	  const message = await clientWP.sendMessage(whatsappNum, textBody);
	  res.json({ success: true, messageId: message.id._serialized });
	} catch (error) {
	  console.error("Error al enviar mensaje:", error);
	  res.status(500).json({ success: false, error: error.message });
	}
  });


// Iniciar servidor
app.listen(PORT, () => {
	console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});




/**
 * Función que usa el Bot para enviar mensaje a usuario externo
 * Además guarda cada mensaje del bot en Base de datos
 * @param {String} whatsappNum Formato 573106542257
 * @param {String} textBody El texto del mensaje (si viene un file, esto por defecto viene con string vacio)
 * @param {String} lastrowid PKGES_CODIGO de la intereacción
 */
const sendMessage = async ({ whatsappNum, textBody, lastrowid, interaccion = true }) => {
	/* try { */	
	
	if (whatsappNum.length <= 17) {
		const Message = await clientWP.sendMessage(whatsappNum, textBody);
		console.log('WA Message ====> ', Message);
		const botWhatsappNum = Message.to.replace('@c.us', '');
		const userWhatsappNum = Message.from.replace('@c.us', '');
		const idMensaje = Message._data.id.id;


		const dataInsert = {
			FK_GES_CODIGO: lastrowid,
			MES_ACCOUNT_SID: Message.from,
			MES_BODY: textBody, // se recorta por si es demasiado largo
			MES_FROM: botWhatsappNum,
			MES_TO: userWhatsappNum,
			MES_AUTHOR: "BOT",
			MES_CHANNEL: 'SEND',
			MES_MESSAGE_ID: idMensaje,
			MES_USER: 'BOT'
		}
		const sqlInsert = `INSERT INTO ${DB_NAME}.tbl_messages SET ?`;
		await connMySQL.promise().query(sqlInsert, [dataInsert]);

		// ? para algo del dashboard
		const sqlUpdateUltimoEnviado = `UPDATE ${DB_NAME}.tbl_chats_management SET GES_ULTIMO_ENVIADO = NOW() WHERE PKGES_CODIGO = ?`;
		await connMySQL.promise().query(sqlUpdateUltimoEnviado, [lastrowid]);

		// ? esto es para detectar en la función "vigilaChats" si una consersación no tiene interación, dejé "interacción" por defecto 
		// ? en false para no tener que modificar las llamadas a esta función que ya existian
		if (interaccion) {
			const sqlUpdateUltimaInteraccion = `UPDATE ${DB_NAME}.tbl_chats_management SET GES_ULT_INTERACCION = ? WHERE PKGES_CODIGO = ?`;
			await connMySQL.promise().query(sqlUpdateUltimaInteraccion, ['BOT', lastrowid]);
		}
	} 
}

/**
 * Función que usa el agente/asesor para enviar mensajes a usuario externo
 * @param {} param0 
 * @returns {Promise}
 */
const sendMessageAgent = async ({ To, isFile, fileName, extFile, body, GestionID, UserId, usuario }) => {
	console.log("Parametros que recibo ====> ", To, isFile, fileName, extFile, body, GestionID, UserId);
	console.log("desde sendmessageagent ====", isFile, fileName, extFile)
	return new Promise(async (resolve, reject) => {

		try {
			const PKGES_CODIGO = Class2.DeCrypt(GestionID);
			console.log("PKGES_CODIGO ====> ", PKGES_CODIGO);
			console.log("Valida si es menor a 14 ====> ", To.length);
			if (To.length < 14) {
				const whatsappNumFormateado = `${To}@c.us`; // 573106542257@c.us
				let Message = null;

				// * viene adjunto
				if (isFile) {
					console.log("entro si es media")
					const pathFolder = `${apis.botWhatsappWebJS.PATH}/media`;
					const media = MessageMedia.fromFilePath(`${pathFolder}/${fileName}`);
					Message = await clientWP.sendMessage(whatsappNumFormateado, media);
				}

				// * sin adjunto
				if (!isFile) Message = await clientWP.sendMessage(whatsappNumFormateado, body.trim());

				const botWhatsappNum = Message.to.replace('@c.us', '');
				const idMensaje = Message._data.id.id;

				const dataInsert = {
					FK_GES_CODIGO: PKGES_CODIGO,
					MES_ACCOUNT_SID: Message.from,
					MES_BODY: isFile ? null : body.trim(),
					MES_FROM: botWhatsappNum,
					MES_TO: To,
					MES_AUTHOR: usuario,
					MES_CHANNEL: 'SEND',
					MES_MESSAGE_ID: idMensaje,
					MES_MEDIA_URL: isFile ? fileName : null,
					MES_MEDIA_TYPE: isFile ? extFile : null,
					MES_USER: Class2.DeCrypt(UserId),
					MES_SMS_STATUS: 'received'
				}

				const sqlInsert = `INSERT INTO ${DB_NAME}.tbl_messages SET ?`;
				await connMySQL.promise().query(sqlInsert, [dataInsert]);

				// ? para metricas y dashboard

				const sqlUpdate1 = `UPDATE ${DB_NAME}.tbl_chats_management SET GES_ULT_INTERACCION = ?, GES_ULTIMO_ENVIADO = NOW() WHERE PKGES_CODIGO = ?`;
				await connMySQL.promise().query(sqlUpdate1, ['AGENTE', PKGES_CODIGO]);

				const sqlUpdate2 = `UPDATE ${DB_NAME}.tbl_chats_management SET GES_PRIMERO_AGENTE = NOW() WHERE PKGES_CODIGO = ? AND GES_PRIMERO_AGENTE IS NULL`;
				await connMySQL.promise().query(sqlUpdate2, [PKGES_CODIGO]);

				return resolve({ error: false, msg: 'enviado' });

			}

			const whatsappNumFormateado = To.replace('+', ''); // 573106542257@c.us
			let Message = null;

			// * viene adjunto
			if (isFile) {
				const pathFolder = `${apis.botWhatsappWebJS.PATH}/media`;
				const media = MessageMedia.fromFilePath(`${pathFolder}/${fileName}`);
				Message = await clientWP.sendMessage(whatsappNumFormateado, media);
			}

			// * sin adjunto
			if (!isFile) {
				console.log('Enviando mensaje sin adjunto. Número de WhatsApp formateado:', whatsappNumFormateado);
				console.log('Contenido del mensaje:', body.trim());
				Message = await clientWP.sendMessage(whatsappNumFormateado, body.trim());
				console.log('Que paso!!!', Message);
			}

			const botWhatsappNum = Message.to.replace('@c.us', '');
			const idMensaje = Message._data.id.id;
			const dataInsert = {
				FK_GES_CODIGO: PKGES_CODIGO,
				MES_ACCOUNT_SID: Message.from,
				MES_BODY: isFile ? null : body.trim(),
				MES_FROM: botWhatsappNum,
				MES_TO: To,
				MES_AUTHOR: usuario,
				MES_CHANNEL: 'SEND',
				MES_MESSAGE_ID: idMensaje,
				MES_MEDIA_URL: isFile ? fileName : null,
				MES_MEDIA_TYPE: isFile ? extFile : null,
				MES_USER: Class2.DeCrypt(UserId),
				MES_SMS_STATUS: 'received'
			}
			console.log("dataInsert ====> ", dataInsert);

			const sqlInsert = `INSERT INTO ${DB_NAME}.tbl_messages SET ?`;
			let resultado = await connMySQL.promise().query(sqlInsert, [dataInsert]);
			console.log("resultado ====> ", resultado);

			// ? para metricas y dashboard

			const sqlUpdate1 = `UPDATE ${DB_NAME}.tbl_chats_management SET GES_ULT_INTERACCION = ?, GES_ULTIMO_ENVIADO = NOW() WHERE PKGES_CODIGO = ?`;
			await connMySQL.promise().query(sqlUpdate1, ['AGENTE', PKGES_CODIGO]);

			const sqlUpdate2 = `UPDATE ${DB_NAME}.tbl_chats_management SET GES_PRIMERO_AGENTE = NOW() WHERE PKGES_CODIGO = ? AND GES_PRIMERO_AGENTE IS NULL`;
			await connMySQL.promise().query(sqlUpdate2, [PKGES_CODIGO]);

			return resolve({ error: false, msg: 'enviado' });


		} catch (error) {
			console.log('Error fn sendMessageAgent ❌\n', error);
			return reject({ error: true, msg: error });
		}
	});
}


// ! ======================================================================================================================================================================
// !                                                              CONTROL INICIAL DE MENSAJES ENTRANTES → FUNCION manageTree
// ! ======================================================================================================================================================================
/**
 * @author Brayan Yanez
 * @created 14 de Mayo de 2024
 * @lastModified 14 de Mayo de 2024
 * @version 1.0.0
 */
async function manageTree(msgIn) {
	return new Promise(async (resolve, reject) => {
		try {
			// * VARIABLES
			const WHATSAPP_FROM = msgIn.from;
			const SMS_INICIAL_ESPERA = `🔍👩‍💻 Me encuentro localizando al primer agente disponible, no me tardo.`;
			let lastrowid = 0;
			let hablandoConArbol = true;
			let CONTACTO_INTERNO = '';
			let TIPO_CHAT = '';
			let CODIGO_ASIGNACION = null;
			let ESTADO_CASO = 'OPEN';
			let CULT_MSGBOT = '';
			let ULT_INTERACCION = 'USUARIO_WHATSAPP';
			let TIPO_GESTION = 'INBOUND';
			let TIPO_CANAL = 'WHATSAPP';
			let ESTADO_REGISTRO = 'Activo';
			let WHATSAPP_FROM_CLEAN = msgIn.from.replace(/@g\.us|@c\.us/g, '');

			// * IDENTIFICAMOS EL CONTACTO DEL CHAT
			if (WHATSAPP_FROM_CLEAN.length > 12) {
				// * BUSCAMOS SI EL CHAT ES DE UN GRUPO Y MANEJAMOS EL ESCENARIO					
				const sql_buscar_grupo = `SELECT grp_nombre AS NOMBRE_GRUPO FROM ${DB_NAME}.tbl_grupo WHERE grp_numero = ?`;
				const result_buscar_grupo = await connMySQL.promise().query(sql_buscar_grupo, [msgIn.from]);
				if (result_buscar_grupo[0].length > 0) {
					// ? SI TENEMOS RESULTADOS, ES UN GRUPO Y AGREGAMOS EL NOMBRE DEL GRUPO
					CONTACTO_INTERNO = result_buscar_grupo[0][0].NOMBRE_GRUPO;
				} else {
					// ? SI NO MANTENEMOS EL FROM DEL CHAT
					CONTACTO_INTERNO = msgIn.from;
				}

				// ? DEFINICION DE VARIABLES
				TIPO_CHAT = 'GRUPAL';
				CODIGO_ASIGNACION = '*';
				ESTADO_CASO = 'ATTENDING';
				CULT_MSGBOT = 'MSG_FIN';
			} else {
				// * SI NO ES UN GRUPO, BUSCAMOS SI EL CONTACTO EXISTE EN EL DIRECTORIO DE CONTACTOS Y MANEJAMOS EL ESCENARIO					
				// ? PREPARAMOS LA VARIABLE PARA BUSCAR EL CONTACTO EN EL DIRECTORIO DE CONTACTOS
				const WHATSAPP_FROM_CLEAN_FORMATEADO = WHATSAPP_FROM_CLEAN.substring(2, 13);
				const sql_buscar_contacto = `SELECT drcont_nombres_apellidos_contacto AS NOMBRE_CONTACTO FROM ${DB_NAME}.tbl_directorio_contacto WHERE drcont_num_contacto = ?`;
				const result_buscar_contacto = await connMySQL.promise().query(sql_buscar_contacto, [WHATSAPP_FROM_CLEAN_FORMATEADO]);
				if (result_buscar_contacto[0].length > 0) {
					// ? SI TENEMOS RESULTADOS, ES UN CONTACTO Y AGREGAMOS EL NOMBRE DEL CONTACTO
					CONTACTO_INTERNO = result_buscar_contacto[0][0].NOMBRE_CONTACTO;
				} else {
					// ? SI NO MANTENEMOS EL FROM DEL CHAT FORMATEADO A 10 DIGITOS
					CONTACTO_INTERNO = WHATSAPP_FROM_CLEAN_FORMATEADO;
				}

				// ? DEFINICION DE VARIABLES
				TIPO_CHAT = 'INDIVIDUAL';
				CULT_MSGBOT = 'USUARIO_HABLA_1RA_VEZ';
			}

			// * BUSCAMOS EL ULTIMO REGISTRO PARA EL USUARIO EN LA TABLA CHATS MANAGEMENT
			const sql_consulta_chat = `SELECT PKGES_CODIGO AS ID_REGISTRO, GES_ESTADO_CASO AS ESTADO_CASO, GES_CULT_MSGBOT AS ESTADO_ARBOL FROM ${DB_NAME}.tbl_chats_management WHERE GES_NUMERO_COMUNICA = ? AND GES_CESTADO = ? ORDER BY PKGES_CODIGO DESC LIMIT 1`
			const result_consulta_chat = await connMySQL.promise().query(sql_consulta_chat, [WHATSAPP_FROM, 'Activo']);

			// * CONTROL DE FLUJO PARA MENSAJES RECIBIDOS SEGUN EL WHATSAPP_FROM
			if (result_consulta_chat[0].length > 0 && result_consulta_chat[0][0].ESTADO_CASO !== 'CLOSE') {
				// ? SI HAY REGISTROS PARA EL WHATSAPP_FROM, SE ACTUALIZA EL REGISTRO
				// * VARAIBLES
				lastrowid = result_consulta_chat[0][0].ID_REGISTRO;

				// * ACTUALIZAMOS EL REGISTRO EN LA TABLA CHATS MANAGEMENT
				const data_actualizar_chat = {
					GES_NOMBRE_COMUNICA: CONTACTO_INTERNO,
					GES_ULTIMO_RECIBIDO: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
				}
				const condicionales_actualizar_chat = {
					PKGES_CODIGO: lastrowid
				}
				const sql_actualizar_chat = `UPDATE ${DB_NAME}.tbl_chats_management SET ? WHERE  ?`;
				await connMySQL.promise().query(sql_actualizar_chat, [data_actualizar_chat, condicionales_actualizar_chat]);

				// // * SI EL ESTADO DEL CASO ES 'OPEN' Y EL ESTADO DEL ARBOL ES MSG_FIN, SE ENVIA MENSAJE DE ESPERA DEBIDO A QUE QUEDA EL USUARIO EN ESPERA DE UN ASESOR
				// if (result_consulta_chat[0][0].ESTADO_CASO === 'OPEN' && result_consulta_chat[0][0].ESTADO_ARBOL === 'MSG_FIN') {
				//   sendMessage({ whatsappNum: telComunica, textBody: msgEspera, lastrowid });
				// }
			} else {
				// ? SI NO HAY REGISTROS PARA EL WHATSAPP_FROM, SE CREA UN NUEVO REGISTRO

				// * INSERTAMOS EL REGISTRO EN LA TABLA CHATS MANAGEMENT
				const data_insert_chat = {
					GES_TIPO_CHAT: TIPO_CHAT,
					FKGES_NUSU_CODIGO: CODIGO_ASIGNACION,
					GES_ESTADO_CASO: ESTADO_CASO,
					GES_CULT_MSGBOT: CULT_MSGBOT,
					GES_NUMERO_COMUNICA: WHATSAPP_FROM,
					GES_ULT_INTERACCION: ULT_INTERACCION,
					GES_TIPO_CANAL: TIPO_CANAL,
					GES_CHORA_INICIO_GESTION: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
					GES_NOMBRE_COMUNICA: CONTACTO_INTERNO,
					GES_CTIPO: TIPO_GESTION,
					GES_CESTADO: ESTADO_REGISTRO
				}
				const sql_insert_chat = `INSERT INTO ${DB_NAME}.tbl_chats_management SET ?`;
				const [result_insert_chat] = await connMySQL.promise().query(sql_insert_chat, [data_insert_chat]);
				lastrowid = result_insert_chat.insertId;
			}

			// * RESPUESTA FINAL DEL PROCESO
			resolve({ lastrowid, hablandoConArbol });

		} catch (error) {
			console.log('❌ Error en PEDRO LOPEZ → funcion manageTree ===> ', error);
			reject({ error: true, msg: error })
		}
	});
}


// ! ======================================================================================================================================================================
// !                                                              RECEPCION DE MENSAJES ENTRANTES → FUNCION arbol
// ! ======================================================================================================================================================================
/**
 * @author Brayan Yanez
 * @created 14 de Mayo de 2024
 * @lastModified 14 de Mayo de 2024
 * @version 1.0.0
 * 
 */
async function arbol(WHATSAPP_FROM, WHATSAPP_BODY, ID_TBL_CHATS_MANAGEMENT) {
	try {
		// * VARIABLES DE CONTROL
		let SMS_TRANSFERENCIA = 'Te vamos a transferir con un asesor...';
		let ESTADO_ACTUAL_ARBOL = '';
		let FIN_ARBOL = 'MSG_FIN';

		// * OBTENER EL FLUJO DEL ARBOL PARA EL CHAT RECIBIDO
		const sqlSelect = `SELECT GES_CULT_MSGBOT AS ESTADO_ARBOL, GES_ESTADO_CASO FROM ${DB_NAME}.tbl_chats_management WHERE PKGES_CODIGO = ? AND GES_NUMERO_COMUNICA = ? AND GES_CESTADO = ? ORDER BY PKGES_CODIGO DESC LIMIT 1`;
		const [resSelect] = await connMySQL.promise().query(sqlSelect, [ID_TBL_CHATS_MANAGEMENT, WHATSAPP_FROM, 'Activo']);

		// * SI EXISTE UN REGISTRO PARA EL CHAT
		if (resSelect.length) {
			ESTADO_ACTUAL_ARBOL = resSelect[0].ESTADO_ARBOL;

			// * SI EL ESTADO ACTUAL ES 'USUARIO_HABLA_1RA_VEZ'
			if (ESTADO_ACTUAL_ARBOL === 'USUARIO_HABLA_1RA_VEZ') {
				// * NOTIFICAMOS AL USUARIO QUE SERA TRANSFERIDO CON UN ASESOR
				await sendMessage({ whatsappNum: WHATSAPP_FROM, textBody: SMS_TRANSFERENCIA, ID_TBL_CHATS_MANAGEMENT });
				// * ACTUALIZAMOS EL ESTADO DEL CHAT EN LA BASE DE DATOS
				const sqlUpdate = `UPDATE ${DB_NAME}.tbl_chats_management SET GES_CULT_MSGBOT = ? WHERE PKGES_CODIGO = ?`;
				await connMySQL.promise().query(sqlUpdate, [FIN_ARBOL, ID_TBL_CHATS_MANAGEMENT]);
				return;

			} else if (ESTADO_ACTUAL_ARBOL === "MSG_FIN" && resSelect[0].GES_ESTADO_CASO === "OPEN") {
				// * NOTIFICAMOS AL USUARIO QUE SE ENCUENTRA A LA ESPERA DE ATENCION
				await sendMessage({ whatsappNum: WHATSAPP_FROM, textBody: "Sigues a la espera de atención.", ID_TBL_CHATS_MANAGEMENT });
				// * ACTUALIZAMOS EL ESTADO DEL CHAT EN LA BASE DE DATOS
				const sqlUpdate = `UPDATE ${DB_NAME}.tbl_chats_management SET GES_CULT_MSGBOT = ?, GES_ESTADO_CASO = ? WHERE PKGES_CODIGO = ?`;
				await connMySQL.promise().query(sqlUpdate, [FIN_ARBOL, "OPEN", ID_TBL_CHATS_MANAGEMENT]);
				return;
			}
		}
	} catch (error) {
		console.log('❌ Error en PEDRO LOPEZ → funcion arbol ===> ', error);
	}
}

// ! ======================================================================================================================================================================
// !                                                              RECEPCION DE MENSAJES ENTRANTES → FUNCION handleMessageIn
// ! ======================================================================================================================================================================
/**
 * @author Brayan Yanez
 * @created 14 de Mayo de 2024
 * @lastModified 14 de Mayo de 2024
 * @version 1.0.0
*/
async function handleMessageIn(msgIn) {
	return new Promise(async (resolve, reject) => {
		console.log(msgIn);
		// * BLINDAJE PARA EVITAR QUE SE PROCESAN MENSAJES DE BROADCAST (MASIVOS POR LISTAS DE DIFUSION DE WHATSAPP)
		if (!msgIn.from.includes('status@broadcast')) {
			try {
				// * ESPERAMOS EL ID DE LA GESTION Y SI EL USUARIO ESTA HABLANDO CON EL ARBOL
				const { lastrowid, hablandoConArbol } = await manageTree(msgIn);
				// * VARIABLES DE CONTROL
				let ID_TBL_CHATS_MANAGEMENT = lastrowid;
				let WHATSAPP_FROM = '';
				let WHATSAPP_BODY = msgIn.body.trim() !== "" ? msgIn.body.trim() : null;
				let WHATSAPP_FROM_FORMATEADO = '';
				let WHATSAPP_TO = msgIn.to.replace(/@g\.us|@c\.us/g, '');
				let CONTACTO_INTERNO = '';
				let WHATSAPP_ACK = 'RECEIVED';
				let WHATSAPP_EXT_HASMEDIA = null;
				let WHATSAPP_HASMEDIA = null;
				let WHATSAPP_NOTIFYNAME = msgIn._data.notifyName;
				let WHATSAPP_ID = msgIn.id.id;
				let ESTADO_INTERNO = 'received';

				// * SI EXISTE EL ID DE LA GESTION EN LA TABLA tbl_chats_management
				if (ID_TBL_CHATS_MANAGEMENT > 0) {
					// * IDENTIFICAMOS EL CONTACTO DEL CHAT
					let WHATSAPP_FROM_CLEAN = msgIn.from.replace(/@g\.us|@c\.us/g, '');
					if (WHATSAPP_FROM_CLEAN.length > 12) {
						// * BUSCAMOS SI EL CHAT ES DE UN GRUPO Y MANEJAMOS EL ESCENARIO
						const sql_buscar_grupo = `SELECT grp_nombre AS NOMBRE_GRUPO FROM ${DB_NAME}.tbl_grupo WHERE grp_numero = ?`;
						const result_buscar_grupo = await connMySQL.promise().query(sql_buscar_grupo, [msgIn.from]);

						if (result_buscar_grupo[0].length > 0) {
							// ? SI TENEMOS RESULTADOS, ES UN GRUPO Y AGREGAMOS EL NOMBRE DEL GRUPO
							CONTACTO_INTERNO = result_buscar_grupo[0][0].NOMBRE_GRUPO;
						} else {
							// ? SI NO MANTENEMOS EL FROM DEL CHAT
							CONTACTO_INTERNO = msgIn.from;
						}

						// ? MANTENEMOS EL NUMERO DEL FROM
						WHATSAPP_FROM = msgIn.from;
						// ? MANTENEMOS EL NUMERO DEL FROM PARA MANEJO DEL MES_FROM
						WHATSAPP_FROM_FORMATEADO = msgIn.from;
					} else {
						// * SI NO ES UN GRUPO, BUSCAMOS SI EL CONTACTO EXISTE EN EL DIRECTORIO DE CONTACTOS Y MANEJAMOS EL ESCENARIO
						// ? PREPARAMOS LA VARIABLE PARA BUSCAR EL CONTACTO EN EL DIRECTORIO DE CONTACTOS
						const WHATSAPP_FROM_formateado = msgIn.from.replace(/@g\.us|@c\.us/g, '').substring(2, 13);
						const sql_buscar_contacto = `SELECT drcont_nombres_apellidos_contacto AS NOMBRE_CONTACTO FROM ${DB_NAME}.tbl_directorio_contacto WHERE drcont_num_contacto = ?`;
						const result_buscar_contacto = await connMySQL.promise().query(sql_buscar_contacto, [WHATSAPP_FROM_formateado]);

						if (result_buscar_contacto[0].length > 0) {
							// ? SI TENEMOS RESULTADOS, ES UN CONTACTO Y AGREGAMOS EL NOMBRE DEL CONTACTO
							CONTACTO_INTERNO = result_buscar_contacto[0][0].NOMBRE_CONTACTO;
						} else {
							// ? SI NO MANTENEMOS EL FROM DEL CHAT FORMATEADO A 10 DIGITOS
							CONTACTO_INTERNO = WHATSAPP_FROM_formateado;
						}

						// ? MANTENEMOS EL NUMERO DEL FROM
						WHATSAPP_FROM = msgIn.from;
						// ? MANTENEMOS EL NUMERO DEL FROM PARA MANEJO DEL MES_FROM
						WHATSAPP_FROM_FORMATEADO = msgIn.from.replace(/@g\.us|@c\.us/g, '');
					}

					// * CONTROL DE USUARIO MENSAJE RECIBIDO
					if (!WHATSAPP_NOTIFYNAME) {
						WHATSAPP_NOTIFYNAME = 'Usuario';
					}


					// * SI TENEMOS msgIn.hasMedia, SE DEBE GUARDAR EL ARCHIVO EN UNA CARPETA Y GUARDAR LA URL EN LA BASE DE DATOS
					if (msgIn.hasMedia) {
						// ? VARIABLES
						const media = await msgIn.downloadMedia();
						const base64File = media.data;
						WHATSAPP_EXT_HASMEDIA = mime.extension(media.mimetype);
						if (WHATSAPP_EXT_HASMEDIA === 'oga') {
							WHATSAPP_EXT_HASMEDIA = 'ogg';
						}

						WHATSAPP_HASMEDIA = `${randomId()}.${WHATSAPP_EXT_HASMEDIA}`;

						fs.writeFile(`${config.apis.botWhatsappWebJS.PATH}/media/${WHATSAPP_HASMEDIA}`, base64File, { encoding: 'base64' }, async (error) => {
							if (error) {
								console.log(`❌ Error en PEDRO LOPEZ → Al guardar archivo enviado por ${WHATSAPP_FROM} ${getDateTimeActual()} ===> `, error);
								return;
							}
						});
					}

					// * GUARDAMOS EL MENSAJE RECIBIDO EN LA BASE DE DATOS tbl_messages
					// ? PREPARAMOS LA DATA
					const data_agregar_mensaje = {
						FK_GES_CODIGO: ID_TBL_CHATS_MANAGEMENT,
						MES_ACCOUNT_SID: WHATSAPP_FROM,
						MES_BODY: WHATSAPP_BODY,
						MES_FROM: WHATSAPP_FROM_FORMATEADO,
						MES_TO: WHATSAPP_TO,
						MES_AUTHOR: WHATSAPP_NOTIFYNAME,
						MES_CHANNEL: WHATSAPP_ACK,
						MES_MEDIA_TYPE: WHATSAPP_EXT_HASMEDIA,
						MES_MEDIA_URL: WHATSAPP_HASMEDIA,
						MES_MESSAGE_ID: WHATSAPP_ID,
						MES_SMS_STATUS: ESTADO_INTERNO
					};

					// ? PREPARAMOS LA CONSULTA SQL
					const sql_agregar_mensaje = `INSERT INTO ${DB_NAME}.tbl_messages SET ?`;
					// ? EJECUTAMOS LA CONSULTA
					const result_agregar_mensaje = await connMySQL.promise().query(sql_agregar_mensaje, [data_agregar_mensaje]);

					// * SI EL USUARIO ESTA HABLANDO CON EL ARBOL HABILITAMOS EL FLUJO DE ESTE
					if (hablandoConArbol) {
						// * EJECUTAMOS EL ARBOL
						arbol(WHATSAPP_FROM, WHATSAPP_BODY, ID_TBL_CHATS_MANAGEMENT);
					}

					// * RESPUESTA FINAL SI TODO SALE BIEN
					return resolve(true);
				}
			} catch (error) {
				// * RESPUESTA FINAL SI HAY ERROR
				reject({ error: true, msg: error });
				console.log('❌ Error en PEDRO LOPEZ → funcion handleMessageIn ===> ', error);
			}
		}
	});
}


/**
 * Si hay mensajes unread, los procesa como si fuera mensaje in
 * @returns void
 */
const handleMsgNoLeidos = async () => {
	const arrMessagesParaProcesar = []; // array de objetos Message

	// 1. obtiene chats del telefono
	const arrChats = await clientWP.getChats();

	// 2. recorre cada chat en busca de mensajes no leidos
	for (let objChat of arrChats) {
		if (objChat.unreadCount > 0) { // chat con mensaje sin leer
			// 2.1 devuelve un array de objetos Message, con todos los mensajes sin leer de ese chat
			const arrMessagesSinLeer = await objChat.fetchMessages({ limit: objChat.unreadCount });
			// 2.2 se saca el ultimo (más reciente) mensaje de esa conversación
			const ultimoMsgSinLeer = arrMessagesSinLeer.pop();
			// 2.3. se agrega el Message al array para más adelante ser procesado y no se pierda
			if (ultimoMsgSinLeer.fromMe === false) arrMessagesParaProcesar.push(ultimoMsgSinLeer);
			// 2.4. se deja el chat como visto
			await objChat.sendSeen();
		}
	}

	const cantMsgNoLeidos = arrMessagesParaProcesar.length;

	if (cantMsgNoLeidos > 0) {
		// Promise all espera a que se resuelvan todas las promesas xD
		Promise.all(arrMessagesParaProcesar.map(objMessage => handleMessageIn(objMessage)))
			.then(values => {
				// todo, será que dejar un registro de los mensajes recuperados?
			});
		return;
	}
}

/**
 * Vigila la cantidad de chats en el celular del bot cada 30 segundos si tiene
 * mas de cantMaxChats, borra el chat más viejo
 * @param {Number} cantMaxChats Cantidad maxima de chats en el telefono bot
 * @returns void
 */
const recursivaBorrarChats = async (cantMaxChats) => {
	try {
		const arrChats = await clientWP.getChats();

		if (arrChats.length > cantMaxChats) {
			const PrivateChat = arrChats.pop();
			await PrivateChat.delete(); // ? solo se le borra al bot, no al usuario
			setTimeout(() => { recursivaBorrarChats(cantMaxChats) }, 30000);
			return;
		}

		setTimeout(() => { recursivaBorrarChats(cantMaxChats) }, 30000);

	} catch (error) {
		console.log('❌ Error fn recursivaBorrarChats', error);
	}
}


const horaInicioApp = format(new Date(), 'yyyy-MM-dd KK:mm:ss');
console.log('🤖 Iniciando cliente whatsapp-web.js...');
// actualizarEstadoPacientesPendientes();
updateInfoBotWP({
	LIPR_INICIO_APP_DATETIME: horaInicioApp,
	LIPR_STATUS_APP: DICC.STATUS_APP_INICIANDO,
	LIPR_CLIENTWP_STATUS: DICC.CLIENT_NOT_READY,
	LIPR_SESIONWP_STATUS: DICC.SESION_NOT_READY,
	LIPR_QR_STATUS: DICC.QR_SIN_INFO,
	LIPR_QR_STRING: null
});

// inicializa cliente WP
clientWP.initialize().then(async () => {
	const horaFinInicioApp = format(new Date(), 'yyyy-MM-dd KK:mm:ss');
	let wwwversion = await clientWP.getWWebVersion();
	console.log('🚀 Version WP Navegador', wwwversion);
	updateInfoBotWP({ LIPR_VERSION_WPWEB: wwwversion, LIPR_FIN_INICIO_APP_DATETIME: horaFinInicioApp, LIPR_STATUS_APP: DICC.STATUS_APP_FINALIZADO});
}).catch(error => {
	console.log('❌ Error fn clientWP.initialize', error);
	updateInfoBotWP({
		LIPR_STATUS_APP: DICC.STATUS_APP_ERROR
	});
});

// * --- EVENTOS

// * se genera código qr
clientWP.on('qr', (qr) => {
	console.log(`▩ ${getDateTimeActual()} Solicitando escaneo QR`);

	updateInfoBotWP({ LIPR_QR_STATUS: DICC.QR_SOLICITANDO, LIPR_QR_STRING: qr });

	// ? descomentar para mostrar QR en la terminal
	qrcode.generate(qr, { small: true });
});

// * cliente listo
clientWP.on('ready', () => {
	// ? cliente listo para enviar  y recibir mensajes
	console.log(`✅ Ready (cliente whatsapp-web.js listo)`);

	updateInfoBotWP({ LIPR_WHATSAPP_NUM: clientWP.info.wid.user, LIPR_CLIENTWP_STATUS: DICC.CLIENT_OK, LIPR_QR_STATUS: DICC.QR_EMPAREJADO, LIPR_QR_STRING: null });

	handleMsgNoLeidos();
	/* recursivaCerrarChatInactivo(); */
	recursivaBorrarChats(40);
});

// * sesión exitosa en wp web
clientWP.on('authenticated', () => {
	// ? Sesión guardada con exito (me imagino que la que se guarda en carpetas locales auth y caché)
	console.log(`✅ AUTHENTICATION SUCCESFUL (sesión exitosa)`);
	updateInfoBotWP({ LIPR_SESIONWP_STATUS: DICC.SESION_OK, LIPR_QR_STATUS: DICC.QR_EMPAREJADO, LIPR_QR_STRING: null });
});

// * sesión no exitosa en wp web
clientWP.on('auth_failure', (msg) => {
	// ? Fired if session restore was unsuccessfull
	console.error(`❌ ${getDateTimeActual()} AUTHENTICATION FAILURE (sesión no exitosa)`, msg);
	updateInfoBotWP({ LIPR_SESIONWP_STATUS: DICC.SESION_FAIL, LIPR_CLIENTWP_STATUS: DICC.CLIENT_FAIL });
});


// ! ======================================================================================================================================================================
// !                                                              RECEPCION DE MENSAJES ENTRANTES → LLAMA LA FUNCION handleMessageIn
// ! ======================================================================================================================================================================
/**
 * @author Brayan Yanez
 * @created 14 de Mayo de 2024
 * @lastModified 14 de Mayo de 2024
 * @version 1.0.0
 */
// TODO: CONTROL DE CHATS Y MENSAJES ENTRANTES ENTRE PEDRO LOPEZ Y EL BOT → → → ESTO SERIA COMO LA RUTA /inwhatsapp
// * OBTENER LOS CHATS Y MENSAJES POR MEDIO DE LA LIBRERIA DE WHATSAPP-WEB.JS
// * persona externa escribe a chat de bot
// ? este sería como la ruta /inwhatsapp
clientWP.on('message', async (msgIn) => {
	handleMessageIn(msgIn);
});

module.exports = { sendMessageAgent }