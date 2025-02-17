document.addEventListener('DOMContentLoaded', async (e) => {
    const divQR = document.getElementById('divQR');
    const imgQRConectado = document.getElementById('imgQRConectado');
    const estadoQR = document.getElementById("estadoQR");
   
    const mostrarQR = async (QRActual) => {
      // * Traer QR
      let QR = await getData('/QR');

      // console.log("llegas QR0",QR,typeof(QR))
      // * Validar si el QR cambio
      if (QR.qr !== QRActual) {
        estadoQR.textContent =  QR.state

        divQR.classList.remove('displayNone');
        imgQRConectado.classList.add('displayNone');
        new QRious({ element: divQR, value: QR.qr, size: 300, backgroundAlpha: 0 });
      }
      // * Si esta Sincronizado quitamos el QR
      if (QR.qr === 'conectado') {
        divQR.classList.add('displayNone');
        imgQRConectado.classList.remove('displayNone');
      }
      setTimeout(() => {
        mostrarQR(QR.qr);
      }, 2000);
      // undraw_accept_terms_re_lj38
    };
  
    mostrarQR('');
  });
  