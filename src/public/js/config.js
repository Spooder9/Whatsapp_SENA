document.addEventListener("DOMContentLoaded", function () {
  // * Materialize
  window.elemsModal = document.querySelectorAll(".modal");
  M.Modal.init(elemsModal);
  var elemsSelect = document.querySelectorAll('.select');
  M.FormSelect.init(elemsSelect);
  var elemsDropdown = document.querySelectorAll('.dropdown-trigger');
  M.Dropdown.init(elemsDropdown);
  // * Maximo Caracteres Inputs Materialize
  // $('[data-length]').characterCounter();
  // * Tabs Cards Materialize
  // $(document).ready(function () {
  //   $("ul.tabs").tabs();
  // });
  // * Collapsible //
  let elemsCollapsible = document.querySelectorAll('.collapsible');
  M.Collapsible.init(elemsCollapsible);
  // * MaterialBox //
  let elemsMaterialBox = document.querySelectorAll('.materialboxed');
  M.Materialbox.init(elemsMaterialBox);
  // * Picker //
  let elemsPicker = document.querySelectorAll('.datepicker');
  M.Datepicker.init(elemsPicker, {
    autoClose: true,
    format: 'yyyy/mm/dd',
    container: 'body',
    i18n: {
      months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    },
  });

  /*  $('.datepicker').datepicker({
     autoClose: true,
     format: 'yyyy/mm/dd',
     container: 'body',
     i18n: {
       months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
       monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
       weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
       weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
     },
   }); */




  // * Datatables //
  let configDatatable = {
    // options
    responsive: 'true',
    dom: 'lfrtipB',
    iDisplayLength: 20,
    aLengthMenu: [
      [20, 40, 60, 80, 100, -1],
      [20, 40, 60, 80, 100, 'All'],
    ],
    buttons: [
      {
        extend: 'excelHtml5',
        text: 'EXCEL',
        titleAttr: 'Exportar a Excel',
        className: 'green darken-4',
      },
    ],
    language: {
      lengthMenu: 'Mostrar _MENU_ registros',
      zeroRecords: 'No se encontraron resultados',
      info: 'Registros en total - _TOTAL_',
      infoEmpty: '0 registros',
      infoFiltered: '(filtrado de un total de _MAX_ registros)',
      sSearch: 'Buscar:',
      oPaginate: {
        sFirst: 'Primero',
        sLast: 'Último',
        sNext: 'Siguiente',
        sPrevious: 'Anterior',
      },
      sProcessing: 'Procesando...',
    },
  };

  let tableDatatable = new DataTable('#tabla', configDatatable);



});
