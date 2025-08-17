document.addEventListener("DOMContentLoaded", function () {
  $(".modal").modal({ dismissible: false });

  //$("select").formSelect();

  $(".select2").select2({
    dropdownAutoWidth: true,
    width: "100%",
  });

  mensajeSweetalert2();
});

// * getData -> Peticiones Fetch GET - Recibe como parametro una ruta Ej: "/prueba"
// * --- Ejemplo - Misma idea con el resto de funciones Fetch
// *  getData("/rutaNode")
// *    then((res) => console.log(res))
const getData = async (route) => {
  try {
    let res = await fetch(route);
    let json = await res.json();
    if (!res.ok) throw { status: res.status, statusText: res.statusText };
    return json;
  } catch (err) {
    console.error(err);
    Toast.fire({
      icon: "error",
      title: `Error en getData(): ${(err.status, err.statusText)}`,
    });
  }
};

// * postData -> Peticiones Fetch POST - Recibe como parametro una ruta y un JSON Ej: "/prueba", {x:1,y:2}
const postData = async (route, data = {}) => {
  try {
    let res = await fetch(route, {
      mode: "cors",
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*'
      },
    });
    let json = await res.json();

    if (!res.ok) throw { status: res.status, statusText: res.statusText };
    return json;
  } catch (err) {
    console.log(err);
  }
};

// * deleteData -> Peticiones Fetch DELETE - Recibe como parametro una ruta Ej: "/delete/:id"
const deleteData = async (route) => {
  try {
    let res = await fetch(route, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let json = await res.json();
    if (!res.ok) throw { status: res.status, statusText: res.statusText };
    return json;
  } catch (err) {
    console.log(err);
  }
};

// * Toast -> Pequeñas alertas, si modificas esto se modifican TODAS
const alertaSwal = Swal.mixin({
  toast: true,
  position: "top-end", // * Posicion
  showConfirmButton: false,
  timer: 4000, // * Time
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

// * inputMayus -> Pasar a MAYUSCULAS el texto de los inputs
// * --- los cuales son seleccionados antes con 'let inputTal = document.getElementById("inputTal")'
// * --- se pasan los campos por Array de forma dinamica Ej: inputsMayus([inputTal, etc...])
// TODO --- Para un ejemplo ver input en el Login
const inputsMayus = (arrInputs = []) => {
  arrInputs.forEach((element) => {
    element.addEventListener("keyup", (e) => {
      element.value = element.value.toUpperCase();
    });
  });
};

// * limpiarCampos -> Limpia inputs Materialize - Misma idea de la function inputsMayus()
const limpiarCampos = (arrInputs = []) => {
  arrInputs.forEach((element) => {
    element.value = "";
    element.nextElementSibling.classList.remove("active");
  });
};

// * mensajeSuccess -> Muestra una alerta tomando el nombre de '<div id="messageSuccess" data-message="{{success}}"></div>'
// * --- ver en views/partials/messages.hbs
const mensajeSweetalert2 = () => {
  let message = "";
  const messageSuccess = document.getElementById("messageSuccess"),
    messageInfo = document.getElementById("messageInfo"),
    messageWarning = document.getElementById("messageWarning"),
    messageError = document.getElementById("messageError");
  if (messageSuccess) {
    message = messageSuccess.dataset.message;
    alertaSwal.fire({ icon: "success", title: message });
  } else if (messageInfo) {
    message = messageInfo.dataset.message;
    alertaSwal.fire({ icon: "info", title: message });
  } else if (messageWarning) {
    message = messageWarning.dataset.message;
    alertaSwal.fire({ icon: "warning", title: message });
  } else if (messageError) {
    message = messageError.dataset.message;
    alertaSwal.fire({ icon: "error", title: message });
  }
};

// * Funciones Cargar y Ocultar loader
const containerLoader = document.getElementById('loaderGeneral');
const textLoader = document.getElementById('textLoader');
const cargarLoader = (message = 'Cargando...') => {
  containerLoader.style.display = "flex";
  textLoader.textContent = message;
}

const ocultarLoader = () => {
  containerLoader.style.display = "none";
  textLoader.textContent = '';
}

const fillSelect = ({ request, select, valueAfterLoad }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const arrData = await getData(request);
      select.innerHTML = `<option value='' disabled selected>Elija una opción</option>`;
      if (arrData.length) {
        const listadoOpt = arrData.map(data => `<option value='${data.OP_ID}'>${data.OP_OPCION}</option>`).join('');
        select.innerHTML += listadoOpt;
      }
      select.value = valueAfterLoad ? valueAfterLoad : '';
      select.disabled = false;
      M.FormSelect.init(select);
      resolve(true);

    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

// validar inputs vacios
const validarInputs = (form) => {
  // * los hago con for, ya que con forEach el return no sirve bien y sigue derecho la ejecución

  const arrElementosObli = [...form.querySelectorAll('.obli')];
  for (const elemDOM of arrElementosObli) {
    if (!elemDOM.value.trim()) {
      elemDOM.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center', });
      M.toast({ html: `Falta ${elemDOM.getAttribute('data-campo')}` });
      return false;
    }
  }

  const arrElementosTel = [...form.querySelectorAll('.v-tel')];
  for (const elemDOM of arrElementosTel) {
    if (isNaN(elemDOM.value.trim())) {
      elemDOM.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center', });
      M.toast({ html: `El campo ${elemDOM.getAttribute('data-campo')} debe ser númerico` });
      return false;
    }

    if (elemDOM.value.trim().length !== Number(elemDOM.getAttribute('data-length'))) {
      elemDOM.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center', });
      M.toast({ html: `El campo ${elemDOM.getAttribute('data-campo')} debe tener ${elemDOM.getAttribute('data-length')} números` });
      return false;
    }
  }

  const arrElementosEmail = [...form.querySelectorAll('.v-email')];
  const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  for (const elemDOM of arrElementosEmail) {
    if (!regexEmail.test(elemDOM.value.trim())) {
      elemDOM.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center', });
      M.toast({ html: `El campo ${elemDOM.getAttribute('data-campo')} no es valido` });
      return false;
    }
  }

  return true;
}

// * validador de inputs
const removerNoNumeros = (string) => {
  const strSinEspacios = string.replaceAll(' ', '');
  const strToArray = strSinEspacios.split('');
  const newArray = strToArray.filter(char => !isNaN(char) ? char : '');
  const strDefinitivo = newArray.join('');
  return strDefinitivo;
}

const initRestriccionInputs = () => {
  // solo números
  document.querySelectorAll('.solo-num').forEach(input => {
    // solo deja escribir numeros
    input.addEventListener('keyup', e => {
      setTimeout(() => {
        input.value = removerNoNumeros(e.target.value);
      }, 100);
    });

    // solo deja pegar numeros
    input.addEventListener('paste', e => {
      setTimeout(() => {
        input.value = removerNoNumeros(e.target.value);
      }, 100)
    });

  });
}

initRestriccionInputs();

// función para quitar o poner clases a un listado de objetos del DOM
const toggleClass = ({ accion, clase, arrElementos }) => {
  arrElementos.forEach(obj => {
    if (accion === 'add') {
      obj.classList.add(clase);
    }

    if (accion === 'remove') {
      obj.classList.remove(clase);
    }
  });
}

const formatearHora = ({ hora }) => {
  const horaNueva = new Date(hora);

  return horaNueva.toLocaleTimeString('es-CO')
}

const activarCopiadoClickInputs = () => {
  document.querySelectorAll('.able-to-copy').forEach(input => {
    input.addEventListener('click', async e => {
      const texto = e.target.value;

      try {
        if (texto) {
          await navigator.clipboard.writeText(texto);
          M.toast({ html: `Texto copiado!` });
        }

      } catch (error) {
        console.log('Error al copiar el texto');
      }
    });
  });
}

$(window).on("load", async function () {
  // Traduccion
  // Inicializar i18n y cargar JSON
  i18next.use(window.i18nextXHRBackend).init(
    {
      debug: false,
      fallbackLng: "es",
      lng: "es",
      supportedLngs: ["es", "pt", "en"],
      backend: {
        loadPath: "/data/locales/{{lng}}.json",
      },
      returnObjects: true,
    },
    function (err, t) {
      // resources have been loaded
      jqueryI18next.init(i18next, $);
    }
  );

  // TRADUCIR PAGINA Y MANTENER TRADUCCION
  if (localStorage.getItem("localIdioma") === null) {
    localStorage.setItem("localIdioma", $("#idioma").text());
  }

  // Carrgar idioma al cargar la pagina
  $(".dropdown-language .dropdown-item").each(function () {
    var $this = $(this);
    $this.siblings(".selected").removeClass("selected");
    if (localStorage.getItem("localIdioma") == $this.find("a").data("language")) {
      $this.addClass("selected");
      var selectedFlag = $this.find(".flag-icon").attr("class");
      $(".translation-button .flag-icon").removeClass().addClass(selectedFlag);
    }
  });
  setTimeout(() => {
    i18next.changeLanguage(localStorage.getItem("localIdioma"), function (err, t) {
      $("html").localize();
    });

  }, 100);

  //Cambiar lenguaje segun bandera seleccionada
  $(".dropdown-language .dropdown-item").on("click", function () {
    var $this = $(this);
    $this.siblings(".selected").removeClass("selected");
    $this.addClass("selected");
    var selectedFlag = $this.find(".flag-icon").attr("class");

    $(".translation-button .flag-icon").removeClass().addClass(selectedFlag);
    var currentLanguage = $this.find("a").data("language");

    postData("/cambiarIdioma", { currentLanguage });
    localStorage.setItem("localIdioma", currentLanguage);

    i18next.changeLanguage(currentLanguage, function (err, t) {
      $("html").localize();
    });
  });



  // * VIGILANTE DE ACTIVIDAD
  /* if (location.pathname !== '/login') {
    // este es para el backend, por si la persona cierra la página sin cerrar sesión, si ya se deja de enviar esta petición entonces significa que ya cerró la pagina
    setInterval(async () => { await postData('usuarios/actualizar-actividad') }, 240000); // cada 4 min

    // este es para el front, talvez desde el back se le cierra la sesión entonces en el front no se le quedé el caché de front y piense el usuario que sigue conectado
    const TIEMPO_INACTIVIDAD = 20 * 60 * 1000; // 20 minutos en milisegundos
    let tiempoInactivo;

    const cerrarSesion = () => {

      let timerInterval
      Swal.fire({
        title: 'Se ha detectado inactividad',
        html: 'La sesión se cerrará en <b></b>.',
        timer: 8000,
        timerProgressBar: true,
        showCancelButton: true,
        cancelButtonText: `<b>CANCELAR</b> <i class='bx bx-stop-circle'></i>`,
        cancelButtonColor: '#be3636',
        didOpen: () => {
          Swal.showLoading()
          const b = Swal.getHtmlContainer().querySelector('b')
          timerInterval = setInterval(() => {
            b.textContent = Swal.getTimerLeft()
          }, 100)
        },
        willClose: () => {
          clearInterval(timerInterval)
        }
      }).then((result) => {
        // cierra sesión
        if (result.dismiss === Swal.DismissReason.timer) window.location.href = '/logout'
      })
    }

    const reiniciarTemporizador = () => {
      clearTimeout(tiempoInactivo)
      tiempoInactivo = setTimeout(cerrarSesion, TIEMPO_INACTIVIDAD)
    }

    const eventosActividad = () => {
      document.addEventListener('mousemove', reiniciarTemporizador);
      document.addEventListener('keydown', reiniciarTemporizador);
    }

    eventosActividad();
    reiniciarTemporizador();
  } */
});

function secondsToString(seconds) {
  var hour = Math.floor(seconds / 3600);
  hour = (hour < 10) ? '0' + hour : hour;
  var minute = Math.floor((seconds / 60) % 60);
  minute = (minute < 10) ? '0' + minute : minute;
  var second = Math.floor(seconds % 60);
  second = (second < 10) ? '0' + second : second;
  return hour + ':' + minute + ':' + second;
}
