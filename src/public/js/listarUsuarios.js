document.addEventListener('DOMContentLoaded', () => {

  const configDatatable = {
    // options
    responsive: 'true',
    dom: 'lfrtipB',
    iDisplayLength: 10,
    lengthMenu: [
      [10, 25, 50, -1],
      [10, 25, 50, "All"],
    ],
    searching: true,
    filter: true,
    buttons: [],
    language: {
      lengthMenu: 'Mostrar _MENU_ registros',
      zeroRecords: 'No hay resultados',
      info: 'Registros en total - _TOTAL_',
      infoEmpty: '0 registros',
      infoFiltered: '(filtrado de un total de MAX registros)',
      sSearch: 'Busqueda:',
      oPaginate: {
        sFirst: 'Primero',
        sLast: 'Último',
        sNext: 'Siguiente',
        sPrevious: 'Anterior',
      },
      sProcessing: 'Procesando...',
    }
  }

  $("#tablaListaUsers").DataTable(configDatatable);
  document.querySelector('.dataTables_filter').style.display = 'block'; // input de busqueda, que se muestre

  const eliminar = () => {
    document.querySelectorAll("a#borrar").forEach((botonBorrar) => {
      botonBorrar.addEventListener("click", function (e) {
        let ideliminar = this.getAttribute("eliminarUsuario");
        console.log(ideliminar);
        Swal.fire({
          title: "¿Are you sure you want to disable the user?",
          showCancelButton: true,
          confirmButtonColor: 'rgb(202, 5, 29)',
          confirmButtonText: "DISABLE",
        }).then((result) => {
          if (result.isConfirmed) {
            console.log("eliminado " + ideliminar);
            getData(`/usuarios/disableUser/${ideliminar}`).then(res => {
              location.reload();
            })

          }
        });
      });
    });
  };

  eliminar();

});