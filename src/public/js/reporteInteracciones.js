// ! ================================================================================================================================================
// !                                                           CONSULTAR REPORTE DE TIPIFICACIONES
// ! ================================================================================================================================================
document.addEventListener("DOMContentLoaded", async () => {
  let archivoChat = "";
  let archivoNombre = "";

  $("#page-length-option").DataTable({
    responsive: true,
    lengthMenu: [
      [10, 25, 50, -1],
      [10, 25, 50, "All"],
    ],
    language: {
      lengthMenu: "Mostrar _MENU_ registros",
      zeroRecords: "No se encontraron resultados",
      info: "Mostrando del _START_ al _END_ de  _TOTAL_ registros",
      infoEmpty: "Mostrando del 0 al 0 de 0 registros",
      infoFiltered: "(Filtrado de _MAX_ registros)",
      sSearch: "Buscar",
      oPaginate: {
        sFirst: "Primero",
        sLast: "Ultimo",
        sNext: "Siguiente",
        sPrevious: "Anterior",
      },
      sProcessing: "Procesando",
    },
    drawCallback: function () {
      $(".dataTables_paginate > .pagination").addClass("pagination-rounded")
    },
    scrollX: false
  });

  // Función para construir o reconstruir la tabla
  async function construirTabla(reporteInteracciones) {
    $("#page-length-option").DataTable().clear().destroy();
    if (reporteInteracciones.length > 0) {
      var table = $("#page-length-option").DataTable({
        data: reporteInteracciones,
        columns: [
          { data: "PKTYP_CODIGO" },
          { data: "TYP_CFECHA_REGISTRO" },
          { data: "TYP_ORIGEN" },
          { data: "TYP_NUMEROCASO" },
          { data: "TYP_CNUMERO" },
          { data: "TYP_HORA_INCIO_CHAT" },
          { data: "TYP_HORA_FIN_CHAT" },
          { data: "TYP_OBSERVACION" },
          { data: "TYP_TMO" },
          { data: "TYP_NOMBRE_AGENTE" }
        ],
        responsive: true,
        iDisplayLength: 20,
        lengthMenu: [
          [20, 40, 60, 80, 100, -1],
          [20, 40, 60, 80, 100, "All"],
        ],
        dom: "lfrtipB",
        buttons: [{ extend: "excel", title: "Reporte_Tipificaciones_WhatsApp_Terpel_IVR", className: "waves-effect waves-light btn border-round color-oscuro z-depth-4 mr-1 mb-1 ml-3 mt-1 " }],
        destroy: true,
        language: {
          lengthMenu: "Mostrar _MENU_ registros",
          zeroRecords: "No se encontraron resultados",
          info: "Mostrando del _START_ al _END_ de  _TOTAL_ registros",
          infoEmpty: "Mostrando del 0 al 0 de 0 registros",
          infoFiltered: "(Filtrado de _MAX_ registros)",
          sSearch: "Buscar",
          oPaginate: {
            sFirst: "Primero",
            sLast: "Ultimo",
            sNext: "Siguiente",
            sPrevious: "Anterior",
          },
          sProcessing: "Procesando",
        },
        drawCallback: function () {
          $(".dataTables_paginate > .pagination").addClass("pagination-rounded")
        },
        scrollX: false,
        destroy: true
      });
    } else {
      $("#page-length-option").DataTable({
        responsive: true,
        lengthMenu: [
          [10, 25, 50, -1],
          [10, 25, 50, "All"],
        ],
        language: {
          lengthMenu: "Mostrar _MENU_ registros",
          zeroRecords: "No se encontraron resultados",
          info: "Mostrando del _START_ al _END_ de  _TOTAL_ registros",
          infoEmpty: "Mostrando del 0 al 0 de 0 registros",
          infoFiltered: "(Filtrado de _MAX_ registros)",
          sSearch: "Buscar",
          oPaginate: {
            sFirst: "Primero",
            sLast: "Ultimo",
            sNext: "Siguiente",
            sPrevious: "Anterior",
          },
          sProcessing: "Procesando",
        },
        drawCallback: function () {
          $(".dataTables_paginate > .pagination").addClass("pagination-rounded")
        },
        scrollX: false,
        destroy: true
      });
    }
  }





  // ! ================================================================================================================================================
  // !                                                           CONSULTAR LOS DATOS DE HOY
  // ! ================================================================================================================================================
  // ? OBTENGO LA FECHA DE HOY EN FORMATO AAAA-MM-DD
  let fechaHoy = new Date();
  let dd = String(fechaHoy.getDate()).padStart(2, "0");
  let mm = String(fechaHoy.getMonth() + 1).padStart(2, "0"); //January is 0!
  let yyyy = fechaHoy.getFullYear();
  const data = {
    fechaInicial: `${yyyy}-${mm}-${dd}`,
    fechaFinal: `${yyyy}-${mm}-${dd}`,
  };

  let reporteInteracciones = await postData("/reportes/getReporteInteracciones", { data });
  construirTabla(reporteInteracciones);












  // ! ================================================================================================================================================
  // !                                                           CONSULTAR LOS DATOS SEGUN FILTRO APLICADO
  // ! ================================================================================================================================================
  document.getElementById("Buscar").addEventListener("click", async function (e) {
    let fechaInicial = document.getElementById("fechaInicial");
    let fechaFinal = document.getElementById("fechaFinal");

    valida_fechaInicial();
    valida_fechaFinal();

    const data = {
      fechaInicial: fechaInicial.value,
      fechaFinal: fechaFinal.value,
    };

    let reporteInteracciones = await postData("/reportes/getReporteInteracciones", { data });
    construirTabla(reporteInteracciones);
  });
});











// ! ================================================================================================================================================ 
// !                                        VALIDACION CAMPOS Y CONTROL VISUAL FORMULARIO
// ! ================================================================================================================================================
// TODO: VALIDACION CAMPOS
// * VALIDACION CAMPO FECHA INICIAL
async function valida_fechaInicial() {
  const fechaInicial = document.getElementById('fechaInicial');
  const fechaInicial_value = fechaInicial.value.trim();
  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!fechaInicial_value) {
    campo_invalido(fechaInicial, 'Por favor complete este campo...', true);
  } else if (!fechaRegex.test(fechaInicial_value)) {
    campo_invalido(fechaInicial, 'Por favor ingrese la fecha en el formato AAAA-MM-DD.', true);
  } else {
    campo_valido(fechaInicial);
  }
}
// * VALIDACION CAMPO FECHA FINAL
async function valida_fechaFinal() {
  const fechaFinal = document.getElementById('fechaFinal');
  const fechaFinal_value = fechaFinal.value.trim();

  const fechaInicial = document.getElementById('fechaInicial');
  const fechaInicial_value = document.getElementById('fechaInicial').value.trim();

  if (!fechaFinal_value) {
    campo_invalido(fechaFinal, 'Por favor complete este campo...', true);
  } else if (!fechaFinal_value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    campo_invalido(fechaFinal, 'Por favor ingrese la fecha en el formato AAAA-MM-DD.', true);
  } else if (!fechaInicial_value) {
    campo_invalido(fechaFinal, 'Por favor primero seleccione una fecha inicial...', true);
  } else {
    const fechaInicial_date = new Date(fechaInicial_value);
    const fechaFinal_date = new Date(fechaFinal_value);

    if (fechaFinal_date < fechaInicial_date) {
      campo_invalido(fechaFinal, 'La fecha final no puede ser mayor a la fecha final.', true);
      fechaInicial.value = '';
    } else {
      // Calculamos la diferencia de días
      const diferenciaEnMilisegundos = fechaFinal_date - fechaInicial_date;
      const diferenciaEnDias = Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60 * 24));

      if (diferenciaEnDias > 31) {
        campo_invalido(fechaFinal, 'Por favor seleccione una fecha final no mayor a 31 días...', true);
        fechaFinal.value = '';
      } else {
        campo_valido(fechaFinal);
      }
    }
  }
}






// ! ================================================================================================================================================
// !                                                               FUNCIONES AUXILIARES
// ! ================================================================================================================================================
// TODO: CONTROL VISUAL INICIAL
async function ctrl_init_campos() {
  let invalidFeedbackElements = document.querySelectorAll('.invalid-feedback');
  for (let i = 0; i < invalidFeedbackElements.length; i++) {
    invalidFeedbackElements[i].style.display = 'none';
  }

  let elementos = document.querySelectorAll('.ctrl_visual_campo');
  for (let i = 0; i < elementos.length; i++) {
    elementos[i].style.borderBottom = '1px solid';
    elementos[i].style.borderColor = "#9e9e9e";
  }
}
// TODO:  CONTROL VISUAL CAMPO INVALIDO
async function campo_invalido(campo, sms, mostrarIcono) {
  const invalidFeedbackElement = campo.parentElement.querySelector('.invalid-feedback');
  invalidFeedbackElement.textContent = mostrarIcono ? '► ' + sms : sms;
  invalidFeedbackElement.style.display = 'block';
  invalidFeedbackElement.style.color = 'red';
  campo.style.borderColor = "red";
}
// TODO:  CONTROL VISUAL CAMPO VALIDO
async function campo_valido(campo) {
  const invalidFeedbackElement = campo.parentElement.querySelector('.invalid-feedback');
  invalidFeedbackElement.textContent = '';
  invalidFeedbackElement.style.display = 'none';
  campo.style.borderColor = "#23b397";
}