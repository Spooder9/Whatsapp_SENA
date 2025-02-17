const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../global.config.json')));
const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const MySqlStore = require('express-mysql-session')(session);
const passport = require('passport');
// const { database, port: WEB_PORT } = require('./keys');
const { isLoggedIn, error404 } = require('./lib/auth');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const http = require('http');
const setupSocket = require('./socketManager');



// * Init
const app = express();
require('./lib/passport');
const server = http.createServer(app);


// * Public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../node_modules/socket.io/client-dist/')));
app.use(express.static(path.join(__dirname, '../apis/bot-whatsapp-webjs/media')));
app.use(express.static(path.join(__dirname, '../node_modules/sweetalert2/dist')));
// app.use('/reportes', express.static(path.join(__dirname, '../../WebHookWhasappConnetly/media')));

// * Settings
app.set('PORT', process.env.PORT || config.apis.web.PORT);
app.set('views', path.join(__dirname, 'views'));
app.engine(
  '.hbs',
  exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars'),
  })
);
app.set('view engine', '.hbs');

app.use(cors({ origin: true }));

// * Middleware
const database = {
  host: config.database.HOST,
  user: config.database.USER,
  password: config.database.PASSWORD,
  database: config.database.DB_NAME
}

const sessionMiddleware = session({
  secret: 'secreto',
  resave: false,
  saveUninitialized: true,
  store: new MySqlStore(database),
  cookie: { maxAge: 1000 * 60 * 60 * 10, httpOnly: true }
});

// Función para obtener la fecha y hora actual en un formato específico
function obtenerFechaHoraActual() {
  const now = new Date();
  const opcionesFechaHora = {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  return now.toLocaleString(undefined, opcionesFechaHora);
}

// Formato personalizado para el logger de morgan
const formatoPersonalizado = ':method :url :status :response-time ms';

app.use(sessionMiddleware)
app.use(flash());
app.use(morgan(formatoPersonalizado, {
  stream: {
    write: function (mensaje) {
      const fechaHora = obtenerFechaHoraActual();
      console.log(`\x1b[36m${fechaHora}\x1b[0m`, mensaje);
    }
  }
}));
app.use(fileUpload());
app.use(express.urlencoded({ extended: false })); // Aceptar datos sencillos
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// * Global Variables
app.use((req, res, next) => {
  app.locals.messageSuccess = req.flash('messageSuccess');
  app.locals.messageInfo = req.flash('messageInfo');
  app.locals.messageWarning = req.flash('messageWarning');
  app.locals.messageError = req.flash('messageError');
  app.locals.user = req.user;
  next();
});

// * Routes
// app.use('/api/recursos', require('./routes/recursos.routes'));
app.use(require('./routes/authentication.routes'));
app.use(require('./routes/index.routes'));
app.use(isLoggedIn); // No entrar a las rutas sin logearse, redirecciona al Login
app.use('/dashboard', require('./routes/dashboard.routes'));
app.use('/mensajeria', require('./routes/mensajeria.routes'));
app.use('/plantillas', require('./routes/plantillas.routes'));
app.use('/reportes', require('./routes/reportes.routes'));
app.use('/usuarios', require('./routes/usuarios.routes'));
app.use('/textoBot', require('./routes/arbolBot.routes'));


// * Starting Server
// app.listen(app.get('PORT'), () => {
//   console.log(`Server WEB principal on port ${app.get('PORT')} - http://localhost:${app.get('PORT')}`);
// });

const startServer = () => {
  server.listen(app.get('PORT'), () => {
    console.log(`Server WEB principal on port ${app.get('PORT')} - http://localhost:${app.get('PORT')}`);
  });
  setupSocket(server, sessionMiddleware)
}

startServer();


// * 404
app.use(error404);