document.addEventListener("DOMContentLoaded", () => {
    inicio();

    let contenedorGraficosBot = document.getElementById("contenedorGraficosBot");

    function actualizarDashboard() {
      return new Promise((resolve) => {
        getData("/dashboard/actualizarDashboardBot").then((res) => 
        {   

            //obtener posicion del scroll antes de crear el grafico
            var pos = $(document).scrollTop();
          //Actualiza tarjetas
          try{
            //Actualizar interacciones Activas
            document.getElementById("interaccionesActivas").innerHTML = res.datasqlInteraccionesAbiertasBot.length;
           //Actualizar interacciones Activas

            if(res.datasqlInteraccionesBot.length >0){

                //Actualizar interacciones finalizadas
                document.getElementById("interaccionesFinalizadas").innerHTML = res.datasqlInteraccionesBot.length;
                //FIN Actualizar interacciones finalizadas

                //Actualizar interacciones con paso a asesor
                let opcionPasoAsesor = 0
                for (const registro of res.datasqlInteraccionesBot) {
                    for (const opcionAsesor of res.datasqlOpcionesAgentes) {
                        if(registro.OpcionArbol.includes(opcionAsesor.BTREE_TIPO_MSG)){
                            opcionPasoAsesor = opcionPasoAsesor + 1;
                            break;
                        }
                    }
                }
                document.getElementById("interaccionesAgente").innerHTML = opcionPasoAsesor;
                //FIN Actualizar interacciones con paso a asesor

                //Actualiza tiempo promedio
                let hora = 0;
                let minuto = 0;
                let segundos = 0;
                let totalSegundos = 0;

                res.datasqlInteraccionesBot.forEach((registro) => {
                    hora += parseInt(registro.Duracion.split(":")[0]);
                    minuto += parseInt(registro.Duracion.split(":")[1]);
                    segundos += parseInt(registro.Duracion.split(":")[2]);
                })


                totalSegundos = (hora*60*60) + (minuto * 60) + (segundos);
                document.getElementById("tarajetaTiempoPromedio").innerHTML = secondsToString(totalSegundos/res.datasqlInteraccionesBot.length);

              // FIN Actualiza tiempo promedio
            }
          }catch (error) {
            console.log("Hubo un error en las tarjetas : ", error);
          }
          // FIN Actualiza tarjetas
          contenedorGraficosBot.innerHTML="";
          const contenedorGraficos = []
          const graficosOpcionesPrincipales = []
          let posicionGrafico = 0;

          for (const opcionPrimaria of res.datasqlOpcionPrimaria) {
            contenedorGraficos[posicionGrafico] = document.createElement("div");
            contenedorGraficos[posicionGrafico].innerHTML = `
            <div id="chartjs-bar-chart" class="card">
                <div class="card-content">
                    <div class="row">
                        <div class="col s12">
                            <div class="row">
                                <div class="col s12">
                                <div class="sample-chart-wrapper"><canvas id="bar-chart${posicionGrafico}" height="400"></canvas></div>
                                </div>
                            
                            </div>
                        </div>
                    </div>
                </div>
            </div>`

            contenedorGraficosBot.appendChild(contenedorGraficos[posicionGrafico]);

            graficosOpcionesPrincipales[posicionGrafico] = new Chart($("#bar-chart"+posicionGrafico), {
                type: "horizontalBar",
                options: 
                {
                    responsive: true,
                    maintainAspectRatio: false,
                    responsiveAnimationDuration: 500,
                    scales: 
                    {
                        xAxes: 
                        [{
                            ticks: 
                            {
                                beginAtZero: true
                            }
                        }]
                    },
                },
                data:
                {
                    labels: [],
                    datasets:
                    [{
                        label: "",
                        data: [],
                        backgroundColor: "#00bcd4",
                        hoverBackgroundColor: "#00acc1",
                        borderColor: "transparent"
                    }]
                }
            });

            for (const arbol of res.datasqlArbol) {
                if (arbol.BTREE_TIPO_MSG == 'MSG_MENU_0' && arbol.BTREE_OPTION_NUM == opcionPrimaria.opcionPrimaria) {
                    graficosOpcionesPrincipales[posicionGrafico].data.datasets[0].label = "Opcion principal del ARBOL : "+arbol.BTREE_TEXTO
                 break;
                }
             }

            let posicionChart = 0
            for (const opcionSecundaria of res.datasqlOpcionSecundaria) {
                if(opcionSecundaria.opcionSecundaria.substring(16,17) == opcionPrimaria.opcionPrimaria){

                    for (const arbol of res.datasqlArbol) {
                        if (arbol.BTREE_TIPO_MSG.substring(10,11) == opcionPrimaria.opcionPrimaria && arbol.BTREE_OPTION_NUM == opcionSecundaria.opcionSecundaria.substring(17,18)) {
                            graficosOpcionesPrincipales[posicionGrafico].data.labels[posicionChart] = arbol.BTREE_TEXTO;
                        }else if (arbol.BTREE_TIPO_MSG == 'MSG_MENU_0' && arbol.BTREE_OPTION_NUM == opcionPrimaria.opcionPrimaria) {
                            graficosOpcionesPrincipales[posicionGrafico].data.labels[posicionChart] = arbol.BTREE_TEXTO; 
                        }
                     }

                    graficosOpcionesPrincipales[posicionGrafico].data.datasets[0].data[posicionChart] = opcionSecundaria.cantidad;
                    graficosOpcionesPrincipales[posicionGrafico].update();

                    posicionChart = posicionChart + 1
                }
            }
            //volver a la posicion del scroll despues de crear el grafico
            $(document).scrollTop(pos);
            posicionGrafico = posicionGrafico + 1
          }

          resolve();
        });
      });
    }


    setInterval(() => {
      actualizarDashboard();
    }, 30000);

    async function inicio() {
      document.getElementById("loaderGeneral").style.display = "flex";
      await actualizarDashboard();
      document.getElementById("loaderGeneral").style.display = "none";
    }
  });
