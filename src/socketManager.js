// const connMySQL = require('./database');
// const { database, port: WEB_PORT } = require('./keys');
// const socketIO = require('socket.io');
// const DB_NAME = database.database;

const setupSocket = (server, sessionInstance) => {
  // const io = socketIO(server);

  // const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
  // io.use(wrap(sessionInstance));

  // io.on('connection', (socket) => {

  // socket.on('disconnect', async () => {
  // const user = socket.request.session.passport.user;
  // console.log('Usuario se desconecta', user.Nombre);

  // const updateEstado = `UPDATE ${DB_NAME}.tbl_usuarios SET USU_CAUXILIAR = ? WHERE PKUSU_NCODIGO  = ?`;
  // await connMySQL.promise().query(updateEstado, ['DISCONNECTED', user.PKusu]);
  // });
  // });
}

module.exports = setupSocket;