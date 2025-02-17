document.addEventListener("DOMContentLoaded", function () {
   
    setTimeout(function(){
      
       setInterval(async function(){
        let verificarLogin = await postData("/usuarios/verificarLogin");
        if (!verificarLogin){
            location.reload();
        }
       }, 60000);

      }, 60000);
  
  });