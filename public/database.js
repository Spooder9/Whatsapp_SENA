const fs = require('fs');
const path = require('path');
const mysql = require("mysql2");
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../global.config.json')));
const { HOST, USER, DB_NAME, PASSWORD } = config.database;

let conn = mysql.createConnection({
  host: HOST,
  user: USER,
  database: DB_NAME,
  password: PASSWORD,
  dateStrings: true,
  charset: 'utf8mb4'
});

try {
  conn.promise().query("SELECT 1").then(() => console.log(`✅ Conectado a DB ${DB_NAME}`)).catch(() => console.log('❌ No se pudo realizar la conexión a la DB'));
  // console.log("Connected DB ");
  const sql = "SELECT 1";
  setInterval(() => {
    conn
      .promise()
      .query(sql)
      .then(([result, fields]) => {
        console.log("Todo Correcto");
      })
      .catch((err) => console.log("ERROR::", err));
  }, 3600000);
} catch (error) {
  if (error) {
    let posicion = error.message.indexOf("Can't add new command when connection is in closed state");
    if (posicion !== -1) {
      console.log("Disconnected DB :(");
      conn = mysql.createConnection({
        host: HOST,
        user: USER,
        database: DB_NAME,
        password: PASSWORD,
        dateStrings: true,
        charset: 'utf8mb4'
      });
      console.log("Reconected DB ");
    }
  }
}

module.exports = conn;
