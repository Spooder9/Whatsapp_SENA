document.addEventListener('DOMContentLoaded', async () => {
  const CONFIG_DATATABLE = {
    // options
    "scrollX": true,
    responsive: 'true',
    dom: '<"centerTopDataTable"lf>rt<"centerTopDataTable"ip>B',
    iDisplayLength: 10,
    aLengthMenu: [
      [5, 10, 25, 50, -1],
      [5, 10, 25, 50, 'All'],
    ],
    buttons: [],
    language: {
      lengthMenu: 'Mostrar _MENU_ registros',
      zeroRecords: 'No se encontraron resultados',
      info: 'Registros en total - _TOTAL_',
      infoEmpty: '0 registros',
      infoFiltered: '(filtrado de un total de MAX registros)',
      sSearch: 'Busqueda rapida:',
      oPaginate: {
        sFirst: 'Primero',
        sLast: 'Último',
        sNext: 'Siguiente',
        sPrevious: 'Anterior',
      },
      sProcessing: 'Procesando...',
    }
  }
  const imgPrevia = document.querySelector('#imgPrevia');
  const selPlantilla = document.querySelector('#selPlantilla');
  const contPlantilla = document.querySelector('#contPlantilla');
  const btnCargue = document.querySelector('#btnCargue');

  M.FormSelect.init(selPlantilla);
  M.Materialbox.init(imgPrevia);
  $('#page-length-option').DataTable(CONFIG_DATATABLE);

  // * plantillas de connectly

  const OBJ_PLANTILLA = await getData('/mensajeria/connectyl/plantillas');
  await fillSelectPlantillas({ arrDOMSelects: [selPlantilla] });

  selPlantilla.addEventListener('change', (e) => {
    const idPlantilla = e.target.value;
    const plantilla = OBJ_PLANTILLA.find(plantilla => plantilla.id === idPlantilla);
    const codeLenguaje = plantilla.templates[0].language.code;
    document.querySelector('#inpCodeLanguage').value = codeLenguaje;

    const contenidoPlantilla = plantilla.templates[0].templateComponents;
    contPlantilla.innerHTML = '';
    contPlantilla.appendChild(generatePlantillaHTML({ contenidoPlantilla }));
    contPlantilla.style.display = 'block';
  });

  btnCargue.addEventListener('click', async (e) => {
    const rutaArchivo = document.querySelector('#inpRutaArchivo').value; // ruta del archivo ya cambiado el nombre en backend y puesto en local
    const nombreExcel = document.querySelector('#inpNombreExcel').value; // nombre original del usuario
    const codLanguage = document.querySelector('#inpCodeLanguage').value; // al crear la plantilla, le pueden poner es/en
    const codPlantilla = selPlantilla.value;

    if (codPlantilla === '') {
      return alertaSwal.fire({
        icon: 'error',
        title: 'Primero seleccione una plantilla',
      });
    }

    const respuesta = await postData('/mensajeria/masivo/generar-envio', { rutaArchivo, nombreExcel, codPlantilla, codLanguage });
    alertaSwal.fire({
      icon: 'success',
      title: 'Envio generado correctamente',
    });

  });

});

function fillSelectPlantillas({ arrDOMSelects }) {
  return new Promise(async (resolve, reject) => {
    try {

      const arrPlantillas = await getData('/mensajeria/connectyl/plantillas');
      if (arrPlantillas.length) {
        const listadoOptPlantillas = arrPlantillas.map(plantilla => `<option value='${plantilla.id}'>${plantilla.name}</option>`).join('');
        // console.log(listadoOptPlantillas);
        arrDOMSelects.forEach(select => {
          select.innerHTML += listadoOptPlantillas;
          M.FormSelect.init(select);
        });
      }
      resolve(true);

    } catch (error) {
      console.log(error);
      reject(error)
    }
  })
}

function generatePlantillaHTML({ contenidoPlantilla }) {

  const plantilla = document.createElement('div');

  const divChat = document.createElement('div');
  divChat.classList.add('chat-plantilla');

  const divBotones = document.createElement('div');
  divBotones.classList.add('botones-plantilla');

  contenidoPlantilla.forEach(obj => {

    // * aqui viene documentos, imagenes, video, texto (titulo)
    if (Object.keys(obj).includes('header')) {

      if (obj.header.hasOwnProperty('text')) {
        const p = document.createElement('p');
        p.innerHTML = obj.header.text.text;
        divChat.appendChild(p);
      }

      if (obj.header.hasOwnProperty('media')) {

        if (obj.header.media.type === 'TYPE_VIDEO') {

          const video = document.createElement('video');
          video.style.width = '100%';
          video.style.height = 'auto';
          video.style.borderRadius = '6px';
          video.controls = true;

          const source = document.createElement('source');
          source.src = obj.header.media.example[0];
          source.type = 'video/mp4';
          video.appendChild(source);
          video.innerHTML += `<p>Tu  navegador no soporta este tipo de archivo</p>`;
          divChat.appendChild(video);
        }

        if (obj.header.media.type === 'TYPE_IMAGE') {
          const img = document.createElement('img');
          img.src = obj.header.media.example[0];
          img.style.width = '100%';
          img.style.height = 'auto';
          img.style.borderRadius = '6px';
          divChat.appendChild(img);
        }

        if (obj.header.media.type === 'TYPE_DOCUMENT') {
          const a = document.createElement('a');
          a.href = obj.header.media.example[0];
          a.download = true;
          a.innerHTML = `<p><i class='bx bxs-download'></i> Descargar archivo</p>`;
          divChat.appendChild(a);
        }
      }
    }

    // * aqui solo viene texto (este es el más importante, es el texto main)
    if (Object.keys(obj).includes('body')) {
      const p = document.createElement('p');
      p.innerHTML = replaceWithTags(obj.body.text.text);
      divChat.appendChild(p);
    }

    // * botones wp
    if (Object.keys(obj).includes('button')) {
      const buttonDiv = document.createElement('div');
      buttonDiv.classList.add('button-wp');
      buttonDiv.innerHTML = obj.button.quickReply.text;
      divBotones.appendChild(buttonDiv);
    }

    // * footer
    if (Object.keys(obj).includes('footer')) {
      const p = document.createElement('p');
      p.classList.add('footer-plantilla');
      p.innerHTML = obj.footer.text.text;
      divChat.appendChild(p);
    }
  });

  plantilla.appendChild(divChat);
  plantilla.appendChild(divBotones);

  return plantilla;
}

function replaceWithTags(str) {
  str = str.replace(/\*(.*?)\*/g, '<b>$1</b>'); // Reemplazar texto entre dos asteriscos con etiquetas <b>
  str = str.replace(/~(.*?)~/g, '<del>$1</del>'); // Reemplazar texto entre dos tildes con etiquetas <del>
  str = str.replace(/_(.*?)_/g, '<i>$1</i>'); // Reemplazar texto entre dos guiones bajos con etiquetas <i>
  str = str.replace(/\n/g, '<br>'); // Reemplazar saltos de línea con etiquetas <br>
  return str;
}