const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../global.config.json')));
const { MAIN_PATH } = config;
const { DB_NAME } = config.database;
const connMySQL = require("../../public/database");

module.exports = {

  getRutaArchivo: ({ ruta, nombreArchivo }) => {
    let relativa = null;
    let absolutaServidor = null;

    if (ruta === 'excel') {
      relativa = path.resolve(`./src/public/doc/excel`);
      absolutaServidor = `${MAIN_PATH}/WEB/src/public/doc/excel`;
    }

    if (ruta === 'transacciones') {
      relativa = path.resolve(`./src/public/transacciones`);
      absolutaServidor = `${MAIN_PATH}/WEB/src/public/transacciones`;
    }

    if (ruta === 'files_connectly') {
      relativa = path.resolve('../WebHookWhasappConnetly/receivedFiles')
      absolutaServidor = `${MAIN_PATH}/WebHookWhasappConnetly/receivedFiles`;
    }

    if (fs.existsSync(relativa)) return path.join(relativa, nombreArchivo);
    if (fs.existsSync(absolutaServidor)) return path.join(absolutaServidor, nombreArchivo);
  },
  randomID: () => {
    return `${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`
  },
  DICC_ESTADOS_ENVIO_CONVERSACION: {
    POR_ENVIAR: 'POR ENVIAR',
    ENVIADO: 'ENVIADO',
    ERROR: 'ERROR',
    FINALIZADO: 'FINALIZADO',
    EN_PROCESO: 'EN PROCESO'
  },
  getRealPhone: async ({ codigo }) => {
    const regexCel = /^\+\d{12}$/;
    const esCodigo = !regexCel.test(codigo);

    const sqlChatManagment = `SELECT * FROM ${DB_NAME}.tbl_chats_management WHERE GES_NUMERO_COMUNICA = ?`;
    const [infoChatManagment] = await connMySQL.promise().query(sqlChatManagment, [codigo]);

    if (esCodigo && infoChatManagment.length > 0) {

      const telForm = infoChatManagment[0].GES_FORM_TELEFONO;
      const userLabel = telForm ? `+57${telForm} (web)` : 'User (web)';

      return { userLabel, original: codigo, isWeb: true }
    }
    

    return { userLabel: codigo, original: codigo, isWeb: false }
  },

  getNameGroup: async ({ codigo }) => {
    const regexCel = /^\+\d{12}$/;
    const esCodigo = !regexCel.test(codigo);

    const sqlChatManagment = `SELECT * FROM ${DB_NAME}.tbl_chats_management WHERE GES_NUMERO_COMUNICA = ?`;
    const [infoChatManagment] = await connMySQL.promise().query(sqlChatManagment, [codigo]);

    if (esCodigo && infoChatManagment.length > 0) {

      const telForm = infoChatManagment[0].GES_FORM_TELEFONO;
      const userLabel = telForm ? `+57${telForm} (web)` : 'User (web)';

      return { userLabel, original: codigo, isWeb: true }
    }
    

    return { userLabel: codigo, original: codigo, isWeb: false }
  }
}
