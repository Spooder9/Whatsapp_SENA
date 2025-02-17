document.addEventListener('DOMContentLoaded', () => {
    console.log('entra a contar caracteres');
    
    const btnActualizar = document.getElementById('btnActualizar');
    btnActualizar.addEventListener('click', function () {
        console.log('actualizar');
        
        const textoBot = document.getElementById('texto_bot').value;
        const idText = document.getElementById('idText').textContent;
        

        let validador = true;
        if (textoBot.length>950) {
            validador=false
            // M.toast({ html: 'No se puede sobrepasar los caracteres permitidos'});
            M.toast({ html: document.querySelector('[data-i18n="No se puede sobrepasar los caracteres permitidos"]').textContent});
            
        }
        if(textoBot.trim() === ""){
          validador=false
          // M.toast({ html: 'Por favor diligencie el campo'});
          M.toast({ html: document.querySelector('[data-i18n="Por favor diligencie el campo"]').textContent});
        }
        

        console.log('validador',textoBot.length);
        console.log('id',idText);
        if (validador == true) {
            console.log('entra para ir a POST');
            postData("/textoBot/actualizarTextoGuionBOT", { idText, textoBot }).then((res) => {
                console.log(res);
                if (res == "ok") {
                    Swal.fire({
                      position: "center",
                      icon: "success",
                      title: document.querySelector('[data-i18n="Actualización realizada con éxito"]').textContent,
                      // title: 'Actualización realizada con éxito',
                      showConfirmButton: true,
                      confirmButtonText: document.querySelector('[data-i18n="Aceptar"]').textContent,
                      allowOutsideClick: false,
                      allowEscapeKey: false,
                    }).then((result) => {
                      if (result.isConfirmed) {
                        window.location="/textoBot/arbolBot"; 
                      }
                    });
                  }
               
            })
        }
    });
  
});

function contarcaracteres(){
		
    //Numero de caracteres permitidos
 var total=995;

 setTimeout(function(){
 var valor=document.getElementById('texto_bot');
 var respuesta=document.getElementById('res');
 var cantidad=valor.value.length;
 document.getElementById('res').innerHTML = cantidad +' '+ document.querySelector('[data-i18n="caractere/s, te quedan"]').textContent +' ' +(total - cantidad) ;
 if(cantidad>total){
     respuesta.style.color = "red";
 }
 else {
     respuesta.style.color = "black";
 }
 },10);

}