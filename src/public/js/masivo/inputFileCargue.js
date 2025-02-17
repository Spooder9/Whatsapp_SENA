document.addEventListener('DOMContentLoaded', () => {
  const
    btnCargarExcel = document.querySelector('#btnCargarExcel'),
    fileExcel = document.querySelector('#fileExcel'),
    tipoCargue = 'cargue_masivo_telefonos';

  fileExcel.value = null;

  fetch(`/mensajeria/masivo/estado-cargue?tipoCargue=${tipoCargue}`)
    .then(response => response.json())
    .then(res => {
      console.log(res);

      try {
        const { estado, archivoTransaccion } = res;

        if (estado === 'subiendo') {
          cargarLoader('Cargue en progreso...'); // esta funcion está en custom-script.js
          // todo: recuGetDataCargue(archivoTransaccion); // esta función está en guardianCargadores.js
        } else {
          ocultarLoader();
        }

      } catch (error) {
        console.error(error);
      }
    });

  btnCargarExcel.addEventListener('click', e => {
    let msgToast = null;

    const mimeExcel = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (!fileExcel.value) {
      msgToast = 'Seleccione un Excel'
    } else if (fileExcel.files[0].type !== mimeExcel) {
      msgToast = 'El archivo debe ser un Excel'
    }

    if (msgToast) {
      alertaSwal.fire({
        icon: 'error',
        title: msgToast,
      });
      msgToast = null;
      e.preventDefault();
    } else {
      cargarLoader("Cargando... Espere Por Favor")
    }
  });

});
