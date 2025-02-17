var minDate, maxDate;
 
// Custom filtering function which will search data in column four between two values
$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {
        var min = minDate.val();
        var max = maxDate.val();
        var date = new Date( data[3] );
 
        if (
            ( min === null && max === null ) ||
            ( min === null && date <= max ) ||
            ( min <= date   && max === null ) ||
            ( min <= date   && date <= max )
        ) {
 

            return true;
        }
      
        return false;
    }
    
);


 
$(document).ready(function() {
 
   
    // Create date inputs
    minDate = new DateTime($('#minimo'), {
        format: 'MMMM Do YYYY'
        
    });
    maxDate = new DateTime($('#maximo'), {
        format: 'MMMM Do YYYY'
    });
 
    // DataTables initialisation
    var table = $('#filtertabla').DataTable({
        // options
    responsive: 'true',
    dom: 'lfrtipB',
    iDisplayLength: 20,
    aLengthMenu: [
        [20, 40, 60, 80, 100, -1],
        [20, 40, 60, 80, 100, 'All'],
    ],
    buttons: ["copy", "excel", "csv", "pdfHtml5"],
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
    
    });
   

    // Refilter the table
    $('#minimo, #maximo').on('change', function () {
        console.log(minDate.val());
        table.draw();
    });
});