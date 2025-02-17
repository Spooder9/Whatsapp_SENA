const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../global.config.json')));
const { DB_NAME } = config.database;
const router = require('express').Router();
const connMySQL = require('../../public/database');
const { isAgente } = require('../lib/auth');
const Class2 = require('../../public/Class2');
const { isSupervisorOrAdministrator } = require("../lib/auth");
const fetch = require('node-fetch');
const axios = require('axios');
const https = require('https');

router.get('/', isAgente, (req, res) => {
  try {
    let PKPER_NCODIGO = req.user.PKusu;
    const sqlEstado = `SELECT USU_CAUXILIAR, USU_TIPO_LOGUEO FROM ${DB_NAME}.tbl_usuarios WHERE PKUSU_NCODIGO=?`;
    connMySQL.promise()
      .query(sqlEstado, [PKPER_NCODIGO])
      .then(([resultEstadoUser, fields]) => {
        let estadoUser = resultEstadoUser[0].USU_CAUXILIAR;
        const tipoLogueo = resultEstadoUser[0].USU_TIPO_LOGUEO;
        // console.log('resultEstadoUser',resultEstadoUser);
        //seleccionar plantillas para enviar a un usuario con el que ya se tiene chat
        const sqlPlantillas = `SELECT * FROM ${DB_NAME}.tbl_plantillas`;
        connMySQL.promise()
          .query(sqlPlantillas)
          .then(([resultPlantillas, fields]) => {
            const sqlTemplates = `SELECT * FROM ${DB_NAME}.tbl_template WHERE TEM_ESTADO='Activo'`;
            connMySQL.promise()
              .query(sqlTemplates)
              .then(([resultTemplates, fields]) => {
                res.render('app/appChat', { title: '', estadoUser, tipoLogueo, resultTemplates, resultPlantillas });
              });
          });
      });
  } catch (e) {
    console.log('ERROR! ERROR! ERROR! ERROR! se genero un error en la ruta GET mensajeria', e);
  }
});







// ! ================================================================================================================================================
// !                                                  MODULO DIRECTORIO DE CONTACTOS
// ! ================================================================================================================================================
// TODO: AGREGAR CONTACTOS AL DIRECTORIO
router.post('/agregar_contacto', async (req, res) => {
  try {
    // * OBTENGO LA DATA
    const { txt_numero_contacto, txt_nombres_apellidos_contacto } = req.body;

    // * BLINDAJE
    if (!txt_numero_contacto || txt_numero_contacto.length < 10 || !txt_nombres_apellidos_contacto || txt_nombres_apellidos_contacto.length < 3) {
      return res.json({ campos_invalidos: 'Tienes campos invalidos en el formulario' });
    }

    const sql_consult = `SELECT * FROM ${DB_NAME}.tbl_directorio_contacto WHERE drcont_num_contacto = ?`;
    const result_contacto = await connMySQL.promise().query(sql_consult, [txt_numero_contacto]);
    console.log('result_contacto ===> ', result_contacto[0]);

    // * VALIDO SI EXISTE EL CONTACTO
    if (result_contacto[0].length > 0) {
      return res.json({ existe_contacto: 'Este número de contacto ya se encuentra registrado en el sistema...' });
    } else {
      // * SENTENCIA SQL
      const sqlInsertClient = `INSERT INTO ${DB_NAME}.tbl_directorio_contacto SET ?`;
      const nuevo_contacto = {
        drcont_num_contacto: txt_numero_contacto,
        drcont_nombres_apellidos_contacto: txt_nombres_apellidos_contacto,
        drcont_tipo_estado: 'Activo',
        drcont_fk_usuarios: req.user.PKusu

      };

      await connMySQL
        .promise()
        .query(sqlInsertClient, [nuevo_contacto])
        .then(async ([insertClient, fields]) => {
          console.log('inserta cliente', insertClient);
          return res.json({ registro_exitoso: 'Se ha registrado con exito el contacto en el sistema...' });
        });
    }
  } catch (error) {
    console.log('❌ Error en la ruta POST /agregar_contacto', error);
    res.json({ error: error });
  }
});
// TODO: LISTAR CONTACTOS DEL DIRECTORIO
router.get('/listar_contacto', async (req, res) => {
  try {
    // * OBTENGO LA DATA
    const numero_contacto_chat = req.query.numero_contacto_chat;
    // * SENTENCIA SQL
    const consult_numero_contacto_chat = `SELECT drcont_nombres_apellidos_contacto AS CONTACTO FROM ${DB_NAME}.tbl_directorio_contacto WHERE drcont_num_contacto='${numero_contacto_chat}' AND drcont_tipo_estado = 'Activo'`;
    const result_numero_contacto_chat = await connMySQL.promise().query(consult_numero_contacto_chat);
    res.json({ rta: result_numero_contacto_chat[0] });
  } catch (error) {
    res.json({ error: error });
  }
});
// TODO: LISTAR CONTACTO EN EL DIRECTORIO
router.get('/listar_directorio_contactos', async (req, res) => {
  try {
    // * SENTENCIA SQL
    const consult_consult_listar_directorio_contactos = `SELECT 
    dc.drcont_id AS REGISTRO,
    dc.drcont_fecha AS FECHA,
    dc.drcont_num_contacto AS NUMERO, 
    dc.drcont_nombres_apellidos_contacto AS CONTACTO, 
    dc.drcont_tipo_estado AS ESTADO, 
    dc.drcont_actualizacion AS FECHA_ACTUALIZACION, 
    u.USU_CNOMBRE AS RESPONSABLE
FROM 
    ${DB_NAME}.tbl_directorio_contacto dc
JOIN 
    ${DB_NAME}.tbl_usuarios u ON dc.drcont_fk_usuarios = u.PKUSU_NCODIGO`;
    const result_consult_listar_directorio_contactos = await connMySQL.promise().query(consult_consult_listar_directorio_contactos);
    res.json({ rta: result_consult_listar_directorio_contactos[0] });
  } catch (error) {
    res.json({ error: error });
  }
});
// TODO: CONTROL MODAL ACTUALIZAR CONTACTO
router.get('/id_contacto', async (req, res) => {
  try {
    // * OBTENGO LA DATA
    const id_contacto = req.query.id_contacto;
    // * SENTENCIA SQL
    const consult_id_contacto = `SELECT drcont_id AS REGISTRO, drcont_num_contacto AS NUMERO, drcont_nombres_apellidos_contacto AS CONTACTO, drcont_tipo_estado AS ESTADO FROM ${DB_NAME}.tbl_directorio_contacto WHERE drcont_id='${id_contacto}'`;
    const result_id_contacto = await connMySQL.promise().query(consult_id_contacto);
    res.json({ rta: result_id_contacto[0] });
  } catch (error) {
    res.json({ error: error });
  }
});
// TODO: ACTUALIZAR CONTACTOS AL DIRECTORIO
router.post('/actualizar_contacto', async (req, res) => {
  try {
    // * OBTENGO LA DATA
    const { id_registro, txt_update_estado, txt_update_numero_contacto, txt_update_nombres_apellidos_contacto } = req.body;

    // * BLINDAJE
    if (!id_registro || !txt_update_estado || txt_update_estado.length < 5 || !txt_update_numero_contacto || txt_update_numero_contacto.length < 10 || !txt_update_nombres_apellidos_contacto || txt_update_nombres_apellidos_contacto.length < 3) {
      return res.json({ campos_invalidos: 'Tienes campos invalidos en el formulario' });
    }

    // * VALIDO SI EXISTE EL CONTACTO
    const sql_consult = `SELECT * FROM ${DB_NAME}.tbl_directorio_contacto WHERE drcont_id = ?`;
    const result_contacto = await connMySQL.promise().query(sql_consult, [id_registro]);

    if (result_contacto[0].length > 0) {
      const sqlUpdateContact = `UPDATE ${DB_NAME}.tbl_directorio_contacto SET 
                              drcont_num_contacto = ?, 
                              drcont_nombres_apellidos_contacto = ?, 
                              drcont_tipo_estado = ?, 
                              drcont_fk_usuarios = ? 
                              WHERE drcont_id = ?`;
      const actualizar_contacto = [
        txt_update_numero_contacto,
        txt_update_nombres_apellidos_contacto,
        txt_update_estado,
        req.user.PKusu,
        id_registro
      ];

      // * ACTUALIZO EL CONTACTO
      await connMySQL.promise().query(sqlUpdateContact, actualizar_contacto)
        .then(async (updateResult) => {
          console.log('Resultado de actualización:', updateResult);
          return res.json({ registro_actualizado: 'Se ha actualizado con éxito el contacto en el sistema.' });
        })
        .catch(error => {
          console.error('Error al actualizar el contacto:', error);
          return res.json({ error: 'Hubo un problema al actualizar el contacto.' });
        });
    } else {
      // * SI NO EXISTE EL CONTACTO
      return res.json({ no_existe_contacto: 'Este número de contacto no se encuentra registrado en el sistema.' });
    }
  } catch (error) {
    console.log('❌ Error en la ruta POST /agregar_contacto', error);
    res.json({ error: error });
  }
});
// TODO: CONSULTAR DIRECTORIO DE CONTACTOS
router.get('/directorio_contactos', async (req, res) => {
  try {
    // * SENTENCIA SQL
    const consult_directorio_contactos = `SELECT drcont_num_contacto AS NUMERO, drcont_nombres_apellidos_contacto AS CONTACTO FROM ${DB_NAME}.tbl_directorio_contacto WHERE drcont_tipo_estado='Activo'`;
    const result_directorio_contactos = await connMySQL.promise().query(consult_directorio_contactos);
    res.json({ rta: result_directorio_contactos[0] });
  } catch (error) {
    res.json({ error: error });
  }
});









router.get('/traerPlantillas', isAgente, (req, res) => {
  try {
    const sqlPlantillas = `SELECT * FROM ${DB_NAME}.tbl_plantillas`;
    connMySQL.promise()
      .query(sqlPlantillas)
      .then(([resultPlantillas, fields]) => {
        res.json(resultPlantillas);
      });
  } catch (e) {
    console.log('ERROR! ERROR! ERROR! ERROR! se genero un error en la ruta GET traerPlantillas', e);
  }
});

router.get('/getId', (req, res) => {
  try {
    console.log('Usuario conectado', req.user);
    // console.log('CODEEEEEEEEEEEEEEEEE', req.user.PKusu);
    let UserId = Class2.EnCrypt(`${req.user.PKusu}`);
    res.json({ idPer: UserId });
  } catch (e) {
    console.log('ERROR! ERROR! ERROR! se genero un error en la ruta GET getId', e);
  }
});

router.get('/cantidadChats', (req, res) => {
  try {
    // console.log('CODEEEEEEEEEEEEEEEEE', req.user.ChatsNumber);
    // let ChatsNumber = Class2.EnCrypt(`${req.user.ChatsNumber}`);
    let ChatsNumber = req.user.ChatsNumber;
    res.json({ ChatsNumber: ChatsNumber });
  } catch (e) {
    console.log('ERROR! ERROR! ERROR! se genero un error en la ruta GET getId', e);
  }
});

router.post('/searchInfoUser', async (req, res) => {
  try {
    const { cellPhoneNumber } = req.body;

    const selectsqlClient = `SELECT * FROM ${DB_NAME}.tbl_client WHERE CLI_CELLPHONE_NUMBER like '%${cellPhoneNumber}%'`;
    const [infoCliente] = await connMySQL.promise().query(selectsqlClient);

    if (infoCliente.length > 0) {
      infoCliente[0].EnCryptId = Class2.EnCrypt(`${infoCliente[0].PK_CLI_NCODE}`);
    }

    return res.json(infoCliente);

  } catch (e) {
    console.log('Existe un ERROR en la ruta POST searchInfoUser', e);
  }
});

router.get('/info-gestion', async (req, res) => {
  try {
    const idGestion = Class2.DeCrypt(req.query.idGestion);

    const sqlSelect = `SELECT * FROM ${DB_NAME}.tbl_chats_management WHERE PKGES_CODIGO = ?`;
    const [resSelect] = await connMySQL.promise().query(sqlSelect, [idGestion]);

    res.json(resSelect)

  } catch (error) {
    console.log('❌ Error ruta GET /info-gestion', error);
  }
});

// TODO: GUARDAR TIPIFICACION SINGLE CHAT
router.post('/sendTypification', async (req, res) => {
  try {

    const { chatID, numChat, nombreAgente } = req.body.data;

    let id = Class2.DeCrypt(chatID);
    const newTypification = {
      FKTYP_NGES_CODIGO: id,
      TYP_CNUMERO: numChat,
      TYP_NUMEROCASO: '-',
      TYP_NOMBRE_AGENTE: nombreAgente,
      TYP_CESTADO: 'Activo',
      TYP_OBSERVACION: 'AGENTE CIERRA CHAT INDIVIDUAL',
      FKTYP_NUSU_CODIGO: req.user.PKusu,
    };

    const sqlInsertTyp = `INSERT INTO ${DB_NAME}.tbl_typifications SET ?`;
    await connMySQL.promise().query(sqlInsertTyp, [newTypification]);

    const dataUpdate = {
      GES_ESTADO_CASO: 'CLOSE',
      GES_CULT_MSGBOT: 'MSG_FIN',
      GES_CDETALLE_ADICIONAL: 'CERRADO - TIPIFICACION',
    }
    const sqlUpdate = `UPDATE ${DB_NAME}.tbl_chats_management SET ? WHERE PKGES_CODIGO = ?`;
    console.log("query encuenta >>>", sqlUpdate)
    await connMySQL.promise().query(sqlUpdate, [dataUpdate, id]);

    res.json({ msg: 'ok' });

  } catch (e) {
    console.log('Existe un ERROR en la ruta POST sendTypification', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});
// TODO: GUARDAR DOCUMENTACION GROUP CHAT
router.post('/sendTypification2', async (req, res) => {
  try {
    // * OBTENGO LA DATA
    const { chatID, numChat, txt_nombre_usuario, txt_numero_caso, txt_motivo, txt_hora_inicio_chat, txt_hora_fin_chat, tmo, txt_fecha_hora_inicio_tipificacion } = req.body.data;
    let id = Class2.DeCrypt(chatID);


    // * OBTIENE FECHA Y HORA ACTUAL
    const data = new Date();
    data.setUTCHours(data.getUTCHours() - 5); // Ajusta la hora para la zona horaria de Colombia
    // Formatea la fecha y hora en el formato deseado
    const fecha_actual = data.toISOString().slice(0, 10).replace('T', ' ');
    const fecha_y_hora_actual = data.toISOString().slice(0, 19).replace('T', ' ');


    // * DATA SQL
    const newTypification = {
      FKTYP_NGES_CODIGO: id,
      TYP_ORIGEN: 'GRUPAL',
      TYP_CNUMERO: numChat,
      TYP_NUMEROCASO: txt_numero_caso,
      TYP_NOMBRE_AGENTE: txt_nombre_usuario,
      TYP_FECHA_HORA_INICIO_MENSAJE: fecha_actual + " " + txt_hora_inicio_chat + ":00",
      TYP_HORA_INCIO_CHAT: txt_hora_inicio_chat,
      TYP_FECHA_HORA_FIN_MENSAJE: fecha_actual + " " + txt_hora_fin_chat + ":00",
      TYP_HORA_FIN_CHAT: txt_hora_fin_chat,
      TYP_FECHA_HORA_INICIO_TIPIFICACION: txt_fecha_hora_inicio_tipificacion,
      TYP_TMO: tmo,
      TYP_OBSERVACION: txt_motivo,
      TYP_CESTADO: 'Activo',
      FKTYP_NUSU_CODIGO: req.user.PKusu,
    };



    const sqlInsertTyp = `INSERT INTO ${DB_NAME}.tbl_typifications SET ?`;
    await connMySQL.promise().query(sqlInsertTyp, [newTypification]);

    const dataUpdate = {
      GES_ESTADO_CASO: 'ATTENDING',
      GES_CULT_MSGBOT: 'MSG_FIN',
      GES_CDETALLE_ADICIONAL: 'CERRADO - TIPIFICACION',
    }
    const sqlUpdate = `UPDATE ${DB_NAME}.tbl_chats_management SET ? WHERE PKGES_CODIGO = ?`;
    console.log("query encuenta >>>", sqlUpdate)
    await connMySQL.promise().query(sqlUpdate, [dataUpdate, id]);

    res.json({ msg: 'ok' });

  } catch (e) {
    console.log('Existe un ERROR en la ruta POST sendTypification', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});

router.post('/updateInfoClient', async (req, res) => {
  try {
    const { idClient, nombre, tipoDocumento, numDocumento, celular, telefono2, email, direccion } = req.body.infoCliente;

    let id = Class2.DeCrypt(idClient);
    const client = {
      CLI_NAME: nombre,
      CLI_IDENTIFICATION_TYPE: tipoDocumento,
      CLI_IDENTIFICATION_NUMBER: numDocumento,
      CLI_CELLPHONE_NUMBER: celular,
      CLI_TELEFONO2: telefono2,
      CLI_EMAIL: email,
      CLI_DIRECCION: direccion,
      CLI_STATUS: 'Activo',
    };
    const selectsqlClient = `UPDATE ${DB_NAME}.tbl_client SET ? WHERE PK_CLI_NCODE = ?`;
    await connMySQL
      .promise()
      .query(selectsqlClient, [client, id])
      .then(async ([UpdateClient, fields]) => {
        console.log('UpdateClient', UpdateClient);
        res.json('ok');
      });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST updateInfoClient', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});

router.post('/insertInfoClient', async (req, res) => {
  try {
    const { nombre, tipoDocumento, numDocumento, celular, telefono2, email, direccion } = req.body.infoCliente;
    const client = {
      CLI_NAME: nombre,
      CLI_IDENTIFICATION_TYPE: tipoDocumento,
      CLI_IDENTIFICATION_NUMBER: numDocumento,
      CLI_CELLPHONE_NUMBER: celular,
      CLI_TELEFONO2: telefono2,
      CLI_EMAIL: email,
      CLI_DIRECCION: direccion,
      CLI_STATUS: 'Activo',
    };
    const selectsqlClient = `SELECT * FROM ${DB_NAME}.tbl_client WHERE CLI_CELLPHONE_NUMBER like '%${celular}%'`;
    await connMySQL
      .promise()
      .query(selectsqlClient)
      .then(async ([selectClient, fields]) => {
        if (selectClient.length == 0) {
          const sqlInsertClient = `INSERT INTO ${DB_NAME}.tbl_client SET ?`;
          await connMySQL
            .promise()
            .query(sqlInsertClient, [client])
            .then(async ([insertClient, fields]) => {
              console.log('inserta cliente', insertClient);
              res.json('ok');
            });
        }
      });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST insertInfoClient', e);
    // M.toast({ html: 'Se generó un error, intente de nuevo' });
  }
});

router.get('/availableUsers', async (req, res) => {
  try {
    console.log('entra a avalible users');
    const selectsqlUsers = `SELECT * FROM ${DB_NAME}.tbl_usuarios WHERE USU_CROL='AGENTE' AND USU_CAUXILIAR= 'ONLINE'`;
    await connMySQL
      .promise()
      .query(selectsqlUsers)
      .then(async ([selectUsers, fields]) => {
        console.log('selectUsers', selectUsers);
        res.json({ selectUsers });
      });
  } catch (e) {
    console.log('ERROR! ERROR! ERROR! se genero un error en la ruta GET availableUsers', e);
  }
});

router.post('/isChatAttending', async (req, res) => {
  try {
    console.log('entra a isChatAttending');
    const { numeroCel } = req.body;

    const sql = `SELECT * FROM ${DB_NAME}.tbl_chats_management where GES_NUMERO_COMUNICA like '%${numeroCel}%' and (GES_ESTADO_CASO='ATTENDING' OR GES_ESTADO_CASO='TRANSFERRED') OR ( GES_ESTADO_CASO='OPEN' AND GES_CULT_MSGBOT='MSG_FIN')`;
    let [result] = await connMySQL.promise().query(sql);
    // ! el numero NO esta siendo atendido
    if (result.length == 0) return res.json({ result });
    // !el numero esta siendo atendido
    if (result.length > 0) return res.json({ result, message: `Chat en attending por ${result[0].FKGES_NUSU_CODIGO}`, idUserAttending: Class2.EnCrypt(`${result[0].FKGES_NUSU_CODIGO}`), idGestion: Class2.EnCrypt(`${result[0].PKGES_CODIGO}`) });

    res.json(`La peticion ${req.originalUrl} no hizo una nada :v`);
  } catch (e) {
    console.log(`ERROR! ERROR! ERROR! se genero un error en la ruta GET ${req.originalUrl}`, e);
  }
});

router.post('/transferir', async (req, res) => {
  console.log('entra a la ruta POST transferir');
  try {
    const { chatID, MotivoTransferencia, selectModalAvalibleUsers, ObservacionTransferencia } = req.body.data;
    console.log('chatID', chatID);

    let id = chatID

    if (isNaN(chatID)) {
      id = Class2.DeCrypt(chatID);
    } else {
      id = chatID;
    }

    const newTransfer = {
      FKTRA_NUSU_CODIGO: req.user.PKusu,
      FKTRA_NUSU_TRANSFERIDO: selectModalAvalibleUsers,
      FKTRA_NGES_CODIGO: id,
      TRA_MOTIVO: MotivoTransferencia,
      TRA_OBSERVACION: ObservacionTransferencia,
      TYP_CESTADO: 'Activo',
    };
    const update = {
      FKGES_NUSU_CODIGO: selectModalAvalibleUsers,
      GES_ESTADO_CASO: 'TRANSFERRED',
    };
    const updatesql = `UPDATE ${DB_NAME}.tbl_chats_management SET ? WHERE PKGES_CODIGO = ?`;
    await connMySQL
      .promise()
      .query(updatesql, [update, id])
      .then(async ([UpdateClient, fields]) => {
        console.log('UpdateClient', UpdateClient);
        if (UpdateClient.affectedRows == 1) {
          const selectsqlTransfer = `INSERT INTO ${DB_NAME}.tbl_transfers SET ?`;
          await connMySQL
            .promise()
            .query(selectsqlTransfer, [newTransfer])
            .then(async ([insertTransfer, fields]) => {
              res.json('ok');
            });
        }
      });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST transferir', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});

//modificar estado del usuario
router.post('/estadosUser', async (req, res) => {
  try {
    const { estadoUser } = req.body;
    let idUser = req.user.PKusu;
    const estadoUpdate = {
      USU_CAUXILIAR: estadoUser,
    };
    const selectsqlClient = `UPDATE ${DB_NAME}.tbl_usuarios SET ? WHERE PKUSU_NCODIGO = ?`;
    await connMySQL
      .promise()
      .query(selectsqlClient, [estadoUpdate, idUser])
      .then(async ([UpdateUser, fields]) => {
        // console.log('UpdateClient', UpdateUser);
        res.json('ok');
      });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST estados', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});

router.post('/cerrarChat', async (req, res) => {
  try {
    const { chatIDHeader } = req.body;

    let ChatID = chatIDHeader

    if (isNaN(chatIDHeader)) {
      ChatID = Class2.DeCrypt(chatIDHeader);
    } else {
      ChatID = chatIDHeader;
    }

    const estadoUpdate = {
      GES_ESTADO_CASO: 'CLOSE',
      GES_CULT_MSGBOT: 'MSG_FIN',
    };
    const selectsqlClient = `UPDATE ${DB_NAME}.tbl_chats_management SET ?, GES_CHORA_FIN_GESTION = NOW() WHERE PKGES_CODIGO = ?`;
    await connMySQL
      .promise()
      .query(selectsqlClient, [estadoUpdate, ChatID])
      .then(async ([UpdateUser, fields]) => {
        console.log('UpdateClient', UpdateUser.serverStatus);

        res.json('ok');
      });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST cerrarChat', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});

// INICIO Cierra el caso desde el dashboard -- Creado por Gerson Xavier
router.post('/cerrarChatAdmin', isSupervisorOrAdministrator, async (req, res) => {
  try {
    const { chatIDHeader, numeroCliente } = req.body;

    let ChatID = chatIDHeader

    if (isNaN(chatIDHeader)) {
      ChatID = Class2.DeCrypt(chatIDHeader);
    } else {
      ChatID = chatIDHeader;
    }


    const estadoUpdate = {
      GES_ESTADO_CASO: 'CLOSE',
      GES_CULT_MSGBOT: 'MSG_FIN'
    };

    const tipificaAdmin = {
      FKTYP_NGES_CODIGO: chatIDHeader,
      FKTYP_NUSU_CODIGO: req.user.PKusu,
      TYP_CNUMERO: numeroCliente,
      TYP_OBSERVACION: "Cerrado desde ADMIN",
      TYP_CESTADO: "Activo"
    };

    const sqlTipificaAdmin = `INSERT INTO ${DB_NAME}.tbl_typifications SET ?`;
    await connMySQL.promise().query(sqlTipificaAdmin, [tipificaAdmin]);

    const selectsqlClient = `UPDATE ${DB_NAME}.tbl_chats_management SET ?, GES_CHORA_FIN_GESTION = NOW() WHERE PKGES_CODIGO = ?`;
    await connMySQL
      .promise()
      .query(selectsqlClient, [estadoUpdate, ChatID])
      .then(async ([UpdateUser, fields]) => {
        console.log('UpdateClient', UpdateUser.serverStatus);

        res.json('ok');
      });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST cerrarChatAdmin', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});
// FIN Cierra el caso desde el dashboard

router.post('/insertIdGestion', async (req, res) => {
  try {
    const { ChatOutboundCelular, PlantillaChatOutBound } = req.body.data;
    console.log('>>>>numero', ChatOutboundCelular);
    const client = {
      FKGES_NUSU_CODIGO: req.user.PKusu,
      GES_ESTADO_CASO: 'ATTENDING',
      GES_NUMERO_COMUNICA: ChatOutboundCelular,
      GES_CTIPO: 'OUTBOUND',
      GES_CULT_MSGBOT: 'MSG_FIN',
      GES_CESTADO: 'Activo',
    };
    const sqlInsertClient = `INSERT INTO ${DB_NAME}.tbl_chats_management SET ?, GES_CFECHA_ASIGNACION = NOW() ,GES_CHORA_INICIO_GESTION = NOW()`;
    await connMySQL
      .promise()
      .query(sqlInsertClient, [client])
      .then(async ([insertClient, fields]) => {
        // console.log('insertClient',insertClient.insertId);
        let idGestion = Class2.EnCrypt(`${insertClient.insertId}`);
        console.log('idGestion', idGestion);
        res.json(idGestion);
      });
  } catch (e) {
    console.log('Existe un ERROR en la ruta POST insertIdGestion', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});

router.post('/updateAttending', async (req, res) => {
  console.log('entra a la ruta POST updateAttending');
  try {
    const { GestionID } = req.body;
    console.log('GestionID', GestionID);

    const sqlUpdate = `UPDATE ${DB_NAME}.tbl_chats_management SET GES_ESTADO_CASO = 'ATTENDING', FKGES_NUSU_CODIGO='${req.user.PKusu}'  WHERE PKGES_CODIGO = ${GestionID}`
    let [resultUpdate] = await connMySQL.promise().query(sqlUpdate)
    if (resultUpdate.changedRows) return res.json({ ASIGNED: true })

  } catch (e) {
    console.log('Existe un ERROR en la ruta POST updateAttending', e);
    req.flash('messageError', `Ocurrio un error, por favor vuelva a intentarlo`);
  }
});

module.exports = router;