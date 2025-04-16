# WhatsApp_SENA

[![npm](https://img.shields.io/npm/v/whatsapp-web.js.svg)](https://www.npmjs.com/package/whatsapp-web.js)
[![GitHub stars](https://img.shields.io/github/stars/pedroslopez/whatsapp-web.js.svg?style=social&label=Star)](https://github.com/pedroslopez/whatsapp-web.js)
[![License](https://img.shields.io/github/license/pedroslopez/whatsapp-web.js.svg)](https://github.com/pedroslopez/whatsapp-web.js/blob/main/LICENSE)

Este repositorio forma parte de un proyecto de formación en el que se construye una aplicación de atención por WhatsApp, pensada para cubrir las necesidades de una empresa o atención a cliente. Para ello, se ha utilizado como núcleo la librería [whatsapp-web.js (WWebJS)](https://github.com/pedroslopez/whatsapp-web.js), que emplea Puppeteer para interactuar con la versión web de WhatsApp.

## Tabla de Contenidos

- [Acerca de este proyecto](#acerca-de-este-proyecto)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Migraciones y Seeds](#migraciones-y-seeds)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Uso](#uso)
  - [Ejecutar el bot](#ejecutar-el-bot)
  - [Ejecutar la web de administración](#ejecutar-la-web-de-administración)
- [Ejemplo básico de uso de la librería](#ejemplo-básico-de-uso-de-la-librería)
- [Características soportadas (WWebJS)](#características-soportadas-wwebjs)
- [Contribuciones](#contribuciones)
- [Disclaimer](#disclaimer)
- [Licencia](#licencia)

---

## Acerca de este proyecto

Este repositorio busca proveer una aplicación de mensajería y atención a clientes a través de WhatsApp, con:
- **Bot automatizado**: para atender consultas frecuentes o flujos predefinidos de conversación.
- **Panel web de administración**: para gestionar la base de datos, visualizar mensajes, contactos, entre otros.
- **Base de datos**: la cual se estructura y llena utilizando migraciones y seeds (scripts SQL).

La aplicación hace uso de [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) para conectarse a WhatsApp Web de manera no oficial, utilizando Puppeteer para controlar la sesión y enviar/recibir mensajes.

> **Nota importante**: WhatsApp no permite oficialmente bots o clientes no oficiales. Usa este tipo de proyectos bajo tu propia responsabilidad.

---

## Requisitos

- **Node.js** versión 18 o superior.
- **npm** o **yarn** para la instalación de dependencias.
- **Base de datos** configurada para ejecutar las migraciones y seeds (por defecto está pensado para MySQL o MariaDB, pero se puede adaptar).

Si aún no tienes la versión LTS de Node.js, puedes actualizar siguiendo, por ejemplo, uno de estos métodos (en sistemas *nix):

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

En Windows:
- Descarga la última versión LTS desde la [página oficial de Node.js](https://nodejs.org/).
- O bien instala/actualiza vía [Chocolatey](https://chocolatey.org/) o [Winget](https://learn.microsoft.com/en-us/windows/package-manager/winget/) con:
  ```bash
  choco install nodejs-lts
  ```
  o 
  ```bash
  winget install OpenJS.NodeJS.LTS
  ```

---

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/Spooder9/Whatsapp_SENA.git
   ```
2. Entra en la carpeta del proyecto:
   ```bash
   cd Whatsapp_SENA
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
   o 
   ```bash
   yarn
   ```

---

## Migraciones y Seeds

Para crear la base de datos y las tablas necesarias, así como para poblar la información inicial, se deben ejecutar los scripts SQL que se encuentran en la carpeta [`migrations`](./migrations) y [`seeds`](./migrations).

Por ejemplo, si utilizas MySQL desde la línea de comandos:
```bash
mysql -u tu_usuario -p tu_base_de_datos < migrations/01_create_tables.sql
mysql -u tu_usuario -p tu_base_de_datos < migrations/02_create_relations.sql

# Y luego los seeds
mysql -u tu_usuario -p tu_base_de_datos < seeds/01_insert_data.sql
```

Asegúrate de cambiar `tu_usuario` y `tu_base_de_datos` según tu configuración local.

---

## Estructura del proyecto

```
Whatsapp_SENA/
├─ migrations/            # Scripts SQL para crear y actualizar la BD
├─ public/                # Archivos estáticos
├─ seeds/                 # Scripts SQL para poblar datos iniciales
├─ src/                   # Código fuente de la aplicación web de administración
│  └─ index.js            # Punto de entrada para iniciar la app web
├─ whatsapp_bot/          # Código relacionado al bot de WhatsApp
│  └─ index.js            # Punto de entrada para iniciar el bot
├─ package.json
└─ README.md
```

---

## Uso

### Ejecutar el bot

1. Asegúrate de haber clonado e instalado las dependencias.
2. Verifica que tu base de datos esté creada y poblada mediante las migraciones y seeds.
3. Desde la carpeta raíz del proyecto, ejecuta:
   ```bash
   node whatsapp_bot/index.js
   ```
4. En la primera ejecución, la aplicación te mostrará un código QR en la consola. Escanéalo con la cámara de WhatsApp en tu teléfono para iniciar la sesión.
5. ¡Listo! Tu bot de WhatsApp estará en línea y listo para enviar y recibir mensajes.

### Ejecutar la web de administración

1. Desde la carpeta raíz, asegúrate de que tu base de datos esté lista.
2. Ejecuta:
   ```bash
   node src/index.js
   ```
3. Abre tu navegador e ingresa la URL que se muestre en consola (generalmente `http://localhost:3000` o el puerto que hayas configurado).
4. Desde ahí podrás gestionar los datos, usuarios y todo lo que el proyecto incluya para administración.

---

## Ejemplo básico de uso de la librería

La librería [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) permite inicializar un cliente de WhatsApp de la siguiente forma:

```javascript
const { Client } = require('whatsapp-web.js');

const client = new Client();

client.on('qr', (qr) => {
    // Genera y escanea este código con tu teléfono
    console.log('QR RECIBIDO', qr);
});

client.on('ready', () => {
    console.log('¡Cliente listo!');
});

client.on('message', msg => {
    if (msg.body === '!ping') {
        msg.reply('pong');
    }
});

client.initialize();
```

Este ejemplo muestra cómo recibir y responder mensajes de texto. Para más casos de uso, revisa la documentación oficial de la librería o el archivo `example.js` del repositorio original de WWebJS.

---

## Características soportadas (WWebJS)

| Característica                                    | Estado                    |
| ------------------------------------------------- | ------------------------- |
| Multi Device                                      | ✅                         |
| Enviar y recibir mensajes                         | ✅                         |
| Enviar medios (imágenes, audio, documentos)       | ✅                         |
| Enviar medios (video)                             | ✅ (requiere Google Chrome)|
| Enviar stickers                                   | ✅                         |
| Recibir medios (imágenes, audio, video)           | ✅                         |
| Enviar tarjetas de contacto                       | ✅                         |
| Enviar ubicación                                  | ✅                         |
| Enviar botones (DEPRECATED)                       | ❌                         |
| Enviar listas (DEPRECATED)                        | ❌                         |
| Recibir ubicación                                 | ✅                         |
| Responder mensajes                                | ✅                         |
| Unirse a grupos por enlace                        | ✅                         |
| Obtener enlace de invitación de grupo             | ✅                         |
| Modificar info de grupo (asunto, descripción)     | ✅                         |
| Modificar ajustes del grupo                       | ✅                         |
| Agregar participantes al grupo                    | ✅                         |
| Expulsar participantes del grupo                  | ✅                         |
| Promover/degradar administradores                 | ✅                         |
| Mencionar usuarios o grupos                       | ✅                         |
| Silenciar/activar notificaciones en chats         | ✅                         |
| Bloquear/desbloquear contactos                    | ✅                         |
| Obtener información de contacto                   | ✅                         |
| Obtener fotos de perfil                           | ✅                         |
| Configurar mensaje de estado del usuario          | ✅                         |
| Reaccionar a mensajes                             | ✅                         |
| Crear encuestas (polls)                           | ✅                         |
| Votar en encuestas                                | 🔜 (futuro)                |
| Comunidades, Canales, etc.                        | 🔜 (futuro)                |

---

## Contribuciones

¡Las contribuciones son bienvenidas! Para cambios importantes, es recomendable abrir primero un issue para discutir qué te gustaría cambiar o añadir. Por favor, revisa las [pautas de contribución](https://github.com/pedroslopez/whatsapp-web.js/blob/main/CONTRIBUTING.md) antes de crear una propuesta.

---

## Disclaimer

Este proyecto no está afiliado, asociado, autorizado, respaldado ni relacionado de manera oficial con WhatsApp o sus subsidiarias y afiliados. El sitio web oficial de WhatsApp es [whatsapp.com](https://www.whatsapp.com/).  
**No se garantiza que tu número de WhatsApp no pueda ser bloqueado** por usar este método, ya que WhatsApp no permite bots o clientes no oficiales en su plataforma. Úsalo bajo tu propio riesgo.

---

## Licencia

Este proyecto se distribuye bajo la [Licencia Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).  
Consulta el archivo [LICENSE](https://github.com/pedroslopez/whatsapp-web.js/blob/main/LICENSE) en el repositorio original de WWebJS para más detalles.

---

¡Gracias por usar **WhatsApp_SENA**! Esperamos que este proyecto te sirva como base para crear tu propia solución de atención a clientes vía WhatsApp. Si tienes preguntas, sugerencias o encuentras algún problema, no dudes en abrir un issue o enviar un pull request. ¡Buena suerte y feliz programación!