document.addEventListener("DOMContentLoaded", () => {
    
 
    $("#page-length-option").DataTable({
        responsive: true,
        lengthMenu: [
          [10, 25, 50, -1],
          [10, 25, 50, "All"],
        ],
      });

  document.getElementById("Buscar").addEventListener("click", async function (e) {
    let fechaInicial = document.getElementById("fechaInicial");
    let fechaFinal = document.getElementById("fechaFinal");
    let listaAgentes = document.getElementById("listaAgentes");

    const data = {
      fechaInicial: fechaInicial.value,
      fechaFinal: fechaFinal.value,
      listaAgentes: listaAgentes.value,
    };

    let reporteAgentes = await postData("/reportes/getReporteAgentes", { data });
    $("#page-length-option").DataTable().destroy();
    if (reporteAgentes.length > 0) {

    //   let array_reporteAgentes = reporteAgentes.map((elem) => {
    //     return Object.values(elem);
    //   });
      
      $("#page-length-option").DataTable({
        data: reporteAgentes,
        columns: [
        {data: 'REGU_CUSUARIO'},
        {data: 'REGU_CDOCUMENTO'},
        {data: 'REGU_CAUXILIAR'},
        {data: 'REGU_FECHA_INICIO'},
        {data: 'REGU_FECHA_FIN'},
        {data: 'REGU_TIEMPO'}
        ],
        responsive: true,
        iDisplayLength: 20,
        lengthMenu: [
          [20, 40, 60, 80, 100, -1],
          [20, 40, 60, 80, 100, "All"],
        ],
        dom: 'lfrtipB',
        buttons : [{extend: 'excel', className: 'waves-effect waves-light btn border-round color-oscuro z-depth-4 mr-1 mb-1 ml-3 mt-1 '}],
      });
    } else {
      $("#page-length-option").DataTable({
        responsive: true,
        lengthMenu: [
          [10, 25, 50, -1],
          [10, 25, 50, "All"],
        ],
      });
    }
  });


});
