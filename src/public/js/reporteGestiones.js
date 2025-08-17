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
    };

    let response = await postData("/reportes/reporte-gestiones", data);

    $("#page-length-option").DataTable().destroy();

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      $("#page-length-option").DataTable({
        data: response.data,
        columns: [
          { data: "PKGES_CODIGO", title: "Código" },
          { data: "GES_TIPO_CHAT", title: "Tipo chat" },
          { data: "FKGES_NUSU_CODIGO", title: "Usuario" },
          { data: "GES_ESTADO_CASO", title: "Estado caso" },
          { data: "GES_CULT_MSGBOT", title: "Mensaje bot" },
          { data: "GES_NUMERO_COMUNICA", title: "Número comunica" },
          { data: "GES_ULT_INTERACCION", title: "Última interacción" },
          { data: "GES_TIPO_CANAL", title: "Tipo canal" },
          { data: "GES_CHORA_INICIO_GESTION", title: "Hora inicio gestión" },
          { data: "GES_CFECHA_REGISTRO", title: "Fecha registro" },
          { data: "GES_CFECHA_MODIFICACION", title: "Fecha modificación" },
          { data: "GES_NOMBRE_COMUNICA", title: "Nombre comunica" },
          { data: "GES_CTIPO", title: "Tipo" },
          { data: "GES_ULTIMO_ENVIADO", title: "Último enviado" },
          { data: "GES_ULTIMO_RECIBIDO", title: "Último recibido" },
          { data: "GES_CFECHA_ASIGNACION", title: "Fecha asignación" },
          { data: "GES_CFECHA_PASOASESOR", title: "Fecha paso a asesor" },
          { data: "GES_CESTADO", title: "Estado" }
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
