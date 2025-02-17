document.addEventListener("DOMContentLoaded", () => {
  let archivoChat = "";
  let archivoNombre = "";

  $("#page-length-option").DataTable({
    responsive: true,
    lengthMenu: [
      [10, 25, 50, -1],
      [10, 25, 50, "All"],
    ],
  });

  document.getElementById("Buscar").addEventListener("click", async function (e) {
    const fechaInicial = document.getElementById("fechaInicial");
    const fechaFinal = document.getElementById("fechaFinal");
    const inpNoDocumento = document.getElementById("inpNoDocumento");

    const data = {
      fechaInicial: fechaInicial.value,
      fechaFinal: fechaFinal.value,
      noDocumento: inpNoDocumento.value,
    };

    let response = await postData("/reportes/reporte-gestiones", data);

    $("#page-length-option").DataTable().destroy();

    if (response.data.length > 0) {
      var table = $("#page-length-option").DataTable({
        data: response.data,
        columns: [
          { data: "GES_ESTADO_SOLICITUD" },
          { data: "GES_NOMBRE_COMUNICA" },
          { data: "GES_TIPO_DOC_PACIENTE" },
          { data: "GES_DOCUMENTO_PACIENTE" },
          { data: "GES_NOMBRE_PACIENTE" },
          { data: "GES_PARENTESCO" },
          { data: "GES_NUMEROS_TELEFONO" },
          { data: "GES_CORREO" },
          { data: "GES_PACIENTE_HOSPITALIZADO" },
          { data: "GES_SEDE" },
          { data: "GES_SOLICITUD" },
          { data: "GES_CONSULTA_MEDICINA_ESP" },
          { data: "GES_CONSULTA_ES" },
          { data: "GES_CUAL_PROGRAMA" },
          { data: "GES_EPS_REMITE" },
          { data: "GES_STRFECHA_EXPEDICION" },
          { data: "GES_STR_FECHA_VENCIMIENTO" },
          { data: "GES_STR_RANGO_FECHAS_CITA" },
          { data: "GES_MEDICO_PREFERENCIA" },
          { data: "GES_CONSULTA_EXTERNA" },
        ],
        responsive: true,
        iDisplayLength: 20,
        lengthMenu: [
          [20, 40, 60, 80, 100, -1],
          [20, 40, 60, 80, 100, "All"],
        ],
        dom: "lfrtipB",
        buttons: [{ extend: "excel", className: "waves-effect waves-light btn border-round color-oscuro z-depth-4 mr-1 mb-1 ml-3 mt-1 " }],
      });
      return;
    }

    M.toast({ html: response.msg });
    $("#page-length-option").DataTable({
      responsive: true,
      lengthMenu: [
        [10, 25, 50, -1],
        [10, 25, 50, "All"],
      ],
    });
  });

  document.getElementById("descargarChat").addEventListener("click", function () {
    var text = archivoChat;
    var filename = archivoNombre;
    download(filename, text);
  });

  function download(filename, text) {
    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
});
