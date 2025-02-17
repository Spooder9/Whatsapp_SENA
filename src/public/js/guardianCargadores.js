// Este archivo contiene las funciones comunes que utilizan las paginas de los cargadores, para saber si un cargue está en progreso o no

function recuGetDataCargue(JSONTransaccion) {
  fetch(`/transacciones/${JSONTransaccion}`)
    .then(response => {
      if (response.status === 404) location.reload();
      return response.json()
    })
    .then(jsondata => {
      const
        tituloPestana = document.querySelector('title'),
        tipoCargue = jsondata.tipoCargue,
        progresoLoader = document.querySelector('#progresoLoader'),
        linkNavegaOtras = document.querySelector('#navegarOtras'),
        // botones de 'visa del input excel' -> Si no existe arroja null
        btnCargue = document.querySelector('#btnCargue'),
        // botones de 'donde se envia a procesar el excel con python' -> Si no existe arroja null
        btnCargarExcel = document.querySelector('#btnCargarExcel');

      progresoLoader.classList.remove('displayNone'); // muestra
      linkNavegaOtras.classList.remove('displayNone'); // muestra

      if (jsondata.ejecutando) {

        if (btnCargarExcel) {
          btnCargarExcel.classList.add('disabled');
          btnCargarExcel.innerHTML = `Subiendo <i class='bx bx-loader bx-spin' ></i>`;
        }

        if (btnCargue) {
          btnCargue.classList.add('disabled');
          btnCargue.innerHTML = `Subiendo <i class='bx bx-loader bx-spin' ></i>`;
        }

        cargarLoader("Cargue en curso...");
        progresoLoader.innerHTML = `${jsondata.porcentaje}%`;
        tituloPestana.innerHTML = 'Subiendo...';
        setTimeout(() => { recuGetDataCargue(JSONTransaccion) }, Math.floor((Math.random() * (3000 - 700 + 1)) + 700)); // Se ejecuta en intervalos entre .7sg y 3sg
      }

      if (jsondata.finalizado) {
        //console.log('Cargue finalizado', 'porcentaje', `${jsondata.porcentaje}%`, 'Insertados', jsondata.insertados, 'No insertados', jsondata.noInsertados)
        progresoLoader.innerHTML = '100%';
        setTimeout(() => {

          if (btnCargarExcel) {
            btnCargarExcel.classList.remove('disabled');
            btnCargarExcel.innerHTML = `Vista previa Excel <i class='bx bxs-show' style='font-size: 1rem;'></i>`;
          }

          if (btnCargue) {
            btnCargue.innerHTML = 'Finalizado';
          }

          progresoLoader.innerHTML = "";
          tituloPestana.innerHTML = 'Cargue finalizado';

          postData('/rrhh/eliminarTransaccionCargue', { JSONTransaccion, tipoCargue }).then((res) => { });

          ocultarLoader();
          fireToastCargueDone({ tipoCargue, jsondata });

        }, 2000);
      }

      if (jsondata.hasOwnProperty('cancelado')) {
        document.querySelector('#textLoader').innerHTML = 'Cancelando proceso...'
        progresoLoader.classList.add('displayNone');
        setTimeout(() => {
          tituloPestana.innerHTML = 'Cancelado';

          if (btnCargarExcel) {
            btnCargarExcel.classList.remove('disabled');
            btnCargarExcel.innerHTML = `Vista previa Excel <i class='bx bxs-show' style='font-size: 1rem;'></i>`;
          }

          if (btnCargue) {
            btnCargue.innerHTML = 'Cancelado';
          }

          postData('/rrhh/eliminarTransaccionCargue', { JSONTransaccion, tipoCargue }).then((res) => { });
          ocultarLoader();

          Toast.fire({
            icon: 'warning',
            title: 'Proceso cancelado por el usuario'
          });
        }, 2000);
      }

      if (jsondata.hasOwnProperty('error')) {
        console.log(jsondata.error);
      }
    })
    .catch(err => {
      recuGetDataCargue(JSONTransaccion);
    });
}

function fireToastCargueDone({ tipoCargue, jsondata }) {
  // ejecuta el toast cuando el cargue termina
  let titleToast = '', textoToast = '';

  if (tipoCargue === 'cargueMasivoCuposVacaciones') {
    titleToast = `<span style="color: #ee5f00">Cargue cupos vacaciones finalizado</span>`;
    textoToast += `<p style="margin-bottom: .5rem"><b>${jsondata.actualizados}</b> registros actualizados</p>`;
  }

  textoToast += `<p style="margin-bottom: .5rem"><b>${jsondata.insertados}</b> registros nuevos</p>`;

  Toast.fire({
    icon: 'success',
    title: titleToast,
    html: textoToast,
  });

}