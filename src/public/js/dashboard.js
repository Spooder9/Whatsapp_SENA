document.addEventListener("DOMContentLoaded", () => {
  inicio();


  // ! ============================================================================================================================================================
  // !                                                        MODULO CONTROL GRAFICO INDICADORES DASHBOARD
  // ! ============================================================================================================================================================
  // GRAFICA AGENTES
  var graficoAgentes = $("#pie-chart-agentes");
  var pieChartAgentes = new Chart(graficoAgentes, {
    type: "pie",
    options: {
      responsive: true,
      maintainAspectRatio: false,
      responsiveAnimationDuration: 500,
    },
    data: {
      labels: ["", ""],
      datasets: [
        {
          label: "Agentes",
          data: [0, 0],
          backgroundColor: ["#212121", "#6b6f82"],
        },
      ],
    },
  });
  // FIN GRAFICA AGENTES

  // GRAFICA CLIENTES
  var graficoClientes = $("#pie-chart-clientes");
  var pieChartClientes = new Chart(graficoClientes, {
    type: "pie",
    options: {
      responsive: true,
      maintainAspectRatio: false,
      responsiveAnimationDuration: 500,
    },
    data: {
      labels: ["", ""],
      datasets: [
        {
          label: "Clientes",
          data: [0, 0],
          backgroundColor: ["#212121", "#6b6f82"],
        },
      ],
    },
  });
  // FIN GRAFICA CLIENTES

  // ! ============================================================================================================================================================
  // !                                                     MODULO ACTUALIZACION DASHBOARD
  // ! ============================================================================================================================================================
  function actualizarDashboard() {
    return new Promise((resolve) => {
      getData("/dashboard/actualizarDashboard").then((res) => {

        // TODO: =============================================================================================
        // TODO:                           INDICADORES ASA GENERAL
        // TODO: =============================================================================================
        // Actualiza campos ASA GENERAL
        try {

          if (res.datasqlAsaColaGeneral.length > 0) {

            let fechaActual = new Date();
            let fechaRegistro = new Date();
            let time = "";

            let horaASA = 0;
            let minutoASA = 0;
            let segundoASA = 0;
            let totalSegundosASA = 0;

            let horaASA60 = 0;
            let minutoASA60 = 0;
            let segundoASA60 = 0;
            let totalSegundosASA60 = 0;
            let registrosASA60 = 0

            let horaASA30 = 0;
            let minutoASA30 = 0;
            let segundoASA30 = 0;
            let totalSegundosASA30 = 0;
            let registrosASA30 = 0

            res.datasqlAsaColaGeneral.forEach((registro) => {
              horaASA += parseInt(registro.ASA.split(":")[0]);
              minutoASA += parseInt(registro.ASA.split(":")[1]);
              segundoASA += parseInt(registro.ASA.split(":")[2]);

              time = registro.hora
              fechaRegistro.setHours(time.split(':')[0], time.split(':')[1], time.split(':')[2]);

              if ((fechaActual.getTime() - fechaRegistro.getTime()) / 60000 <= 60) {
                horaASA60 += parseInt(registro.ASA.split(":")[0]);
                minutoASA60 += parseInt(registro.ASA.split(":")[1]);
                segundoASA60 += parseInt(registro.ASA.split(":")[2]);
                registrosASA60 = registrosASA60 + 1;
              }

              if ((fechaActual.getTime() - fechaRegistro.getTime()) / 60000 <= 30) {
                horaASA30 += parseInt(registro.ASA.split(":")[0]);
                minutoASA30 += parseInt(registro.ASA.split(":")[1]);
                segundoASA30 += parseInt(registro.ASA.split(":")[2]);
                registrosASA30 = registrosASA30 + 1;
              }

            })


            totalSegundosASA = (horaASA * 60 * 60) + (minutoASA * 60) + (segundoASA)
            document.getElementById("promedioAsaCola").innerHTML = secondsToString(totalSegundosASA / res.datasqlAsaColaGeneral.length);
            if ((totalSegundosASA / res.datasqlAsaColaGeneral.length) / 60 >= 3) {

              let tarjetapromedioAsaCola = document.querySelector("#tarjetapromedioAsaCola");
              tarjetapromedioAsaCola.setAttribute("class", "card-content red darken-4 white-text");
              let promedioAsaCola = document.querySelector("#promedioAsaCola");
              promedioAsaCola.setAttribute("class", "card-stats-number white-text");

            } else if ((totalSegundosASA / res.datasqlAsaColaGeneral.length) / 60 >= 2) {

              let tarjetapromedioAsaCola = document.querySelector("#tarjetapromedioAsaCola");
              tarjetapromedioAsaCola.setAttribute("class", "card-content orange darken-4 white-text");
              let promedioAsaCola = document.querySelector("#promedioAsaCola");
              promedioAsaCola.setAttribute("class", "card-stats-number white-text");

            } else if ((totalSegundosASA / res.datasqlAsaColaGeneral.length) / 60 > 0) {

              let tarjetapromedioAsaCola = document.querySelector("#tarjetapromedioAsaCola");
              tarjetapromedioAsaCola.setAttribute("class", "card-content");
              let promedioAsaCola = document.querySelector("#promedioAsaCola");
              promedioAsaCola.setAttribute("class", "card-stats-number");

            }

            totalSegundosASA60 = (horaASA60 * 60 * 60) + (minutoASA60 * 60) + (segundoASA60)
            if (totalSegundosASA60 != 0) {
              document.getElementById("promedioAsaCola60").innerHTML = secondsToString(totalSegundosASA60 / registrosASA60)
              if ((totalSegundosASA60 / registrosASA60) / 60 >= 3) {

                let tarjetapromedioAsaCola60 = document.querySelector("#tarjetapromedioAsaCola60");
                tarjetapromedioAsaCola60.setAttribute("class", "card-content red darken-4 white-text");
                let promedioAsaCola60 = document.querySelector("#promedioAsaCola60");
                promedioAsaCola60.setAttribute("class", "card-stats-number white-text");

              } else if ((totalSegundosASA60 / registrosASA60) / 60 >= 2) {

                let tarjetapromedioAsaCola60 = document.querySelector("#tarjetapromedioAsaCola60");
                tarjetapromedioAsaCola60.setAttribute("class", "card-content orange darken-4 white-text");
                let promedioAsaCola60 = document.querySelector("#promedioAsaCola60");
                promedioAsaCola60.setAttribute("class", "card-stats-number white-text");

              } else if ((totalSegundosASA60 / registrosASA60) / 60 >= 0) {

                let tarjetapromedioAsaCola60 = document.querySelector("#tarjetapromedioAsaCola60");
                tarjetapromedioAsaCola60.setAttribute("class", "card-content");
                let promedioAsaCola60 = document.querySelector("#promedioAsaCola60");
                promedioAsaCola60.setAttribute("class", "card-stats-number");

              }

            }

            totalSegundosASA30 = (horaASA30 * 60 * 60) + (minutoASA30 * 60) + (segundoASA30)
            if (totalSegundosASA30 != 0) {
              document.getElementById("promedioAsaCola30").innerHTML = secondsToString(totalSegundosASA30 / registrosASA30)
              if ((totalSegundosASA30 / registrosASA30) / 60 >= 3) {

                let tarjetapromedioAsaCola30 = document.querySelector("#tarjetapromedioAsaCola30");
                tarjetapromedioAsaCola30.setAttribute("class", "card-content red darken-4 white-text");
                let promedioAsaCola30 = document.querySelector("#promedioAsaCola30");
                promedioAsaCola30.setAttribute("class", "card-stats-number white-text");

              } else if ((totalSegundosASA30 / registrosASA30) / 60 >= 2) {

                let tarjetapromedioAsaCola30 = document.querySelector("#tarjetapromedioAsaCola30");
                tarjetapromedioAsaCola30.setAttribute("class", "card-content orange darken-4 white-text");
                let promedioAsaCola30 = document.querySelector("#promedioAsaCola30");
                promedioAsaCola30.setAttribute("class", "card-stats-number white-text");

              } else if ((totalSegundosASA30 / registrosASA30) / 60 >= 0) {

                let tarjetapromedioAsaCola30 = document.querySelector("#tarjetapromedioAsaCola30");
                tarjetapromedioAsaCola30.setAttribute("class", "card-content");
                let promedioAsaCola30 = document.querySelector("#promedioAsaCola30");
                promedioAsaCola30.setAttribute("class", "card-stats-number");

              }



            }
          }
        } catch (error) {
          console.log("Hubo un error en las tarjetas ASA : ", error);
        }
        // FIN ASA GENERAL


        // TODO: =============================================================================================
        // TODO:                                TABLA CHATS EN ESPERA
        // TODO: =============================================================================================
        bodyChatsEspera = "";
        if (res.datasqlChatsEspera.length > 0) {
          res.datasqlChatsEspera.forEach((chat) => {

            tiempoAmarillo = false;
            tiempoRojo = false;

            try {
              if (parseInt(chat.espera.split(":")[0]) >= 1) {
                tiempoRojo = true;
              }
              else if (parseInt(chat.espera.split(":")[1]) >= 5) {
                tiempoRojo = true;
              }
              else if (parseInt(chat.espera.split(":")[1]) >= 3) {
                tiempoAmarillo = true;
              }
            } catch (error) {
              console.log("Algun chat en espera esta en Null, ya sea recibido o enviado : ", error);
            }

            bodyChatsEspera += "<tr>";
            bodyChatsEspera += `<td> ${chat.cliente} </td>`;
            bodyChatsEspera += "<td>" + chat.fecha + "</td>";
            bodyChatsEspera += `<td class='center'> <div ${tiempoRojo ? 'class="tiempoRojo"' : tiempoAmarillo ? 'class="tiempoAmarillo"' : 'class="tiempoVerde"'} > ${chat.espera} </div> </td>`;
            bodyChatsEspera += "</tr>";
          });


        } else {
          bodyChatsEspera += "<tr>";
          bodyChatsEspera += "<td> No data </td>";
          bodyChatsEspera += "<td> No data </td>";
          bodyChatsEspera += "<td> No data </td>";
          bodyChatsEspera += "</tr>";
        }
        document.getElementById("bodyChatsEspera").innerHTML = bodyChatsEspera;


        // TODO: =============================================================================================
        // TODO:                              TABLA CHATS INDIVIDUALES
        // TODO: =============================================================================================
        bodyChatsActivos = "";
        if (res.datasqlChatsActivos.length > 0) {

          res.datasqlChatsActivos.forEach((chat) => {
            tiempoAmarilloEnviado = false;
            tiempoRojoEnviado = false;
            tiempoAzulEnviado = false;

            tiempoAmarilloRecibido = false;
            tiempoRojoRecibido = false;
            tiempoAzulRecibido = false;

            tiempoAmarilloEsperaASA = false;
            tiempoRojoEsperaASA = false;

            tiempoAmarilloAgenteASA = false;
            tiempoRojoAgenteASA = false;

            //Valida tiempo de la cola ASA del tiempo en espera antes de la asignacion

            try {
              if (parseInt(chat.asaCola.split(":")[0]) >= 1) {
                tiempoRojoEsperaASA = true;
              }
              else if (parseInt(chat.asaCola.split(":")[1]) >= 5) {
                tiempoRojoEsperaASA = true;
              }
              else if (parseInt(chat.asaCola.split(":")[1]) >= 3) {
                tiempoAmarilloEsperaASA = true;
              }
            } catch (error) {
              console.log("Error en tabla Cola ASA espera : " + error);
            }

            //Valida tiempo del agente ASA del tiempo en espera antes del primer mensaje

            try {
              if (parseInt(chat.asaAgente.split(":")[0]) >= 1) {
                tiempoRojoAgenteASA = true;
              }
              else if (parseInt(chat.asaAgente.split(":")[1]) >= 5) {
                tiempoRojoAgenteASA = true;
              }
              else if (parseInt(chat.asaAgente.split(":")[1]) >= 3) {
                tiempoAmarilloAgenteASA = true;
              }
            } catch (error) {
              console.log("Error en tabla Cola ASA espera : " + error);
            }

            //Valida el tiempo del ultimo mensaje enviado
            try {
              if (!chat.tiempoUltimoEnviado) {
                tiempoAzulEnviado = true;
                chat.tiempoUltimoEnviado = "Sin mensaje"
              }
              else if (parseInt(chat.tiempoUltimoEnviado.split(":")[0]) >= 1) {
                tiempoRojoEnviado = true;
              }
              else if (parseInt(chat.tiempoUltimoEnviado.split(":")[1]) >= 5) {
                tiempoRojoEnviado = true;
              }
              else if (parseInt(chat.tiempoUltimoEnviado.split(":")[1]) >= 3) {
                tiempoAmarilloEnviado = true;
              }
            } catch (error) {
              console.log("Error en tabla recibidos : " + error);
            }

            //Valida el tiempo del ultimo mensaje recibido
            try {
              if (!chat.tiempoUltimoRecibido) {
                tiempoAzulRecibido = true;
                chat.tiempoUltimoRecibido = "Sin mensaje"
              }
              else if (parseInt(chat.tiempoUltimoRecibido.split(":")[0]) >= 1) {
                tiempoRojoRecibido = true;
              }
              else if (parseInt(chat.tiempoUltimoRecibido.split(":")[1]) >= 5) {
                tiempoRojoRecibido = true;
              }
              else if (parseInt(chat.tiempoUltimoRecibido.split(":")[1]) >= 3) {
                tiempoAmarilloRecibido = true;
              }
            } catch (error) {
              console.log("Error en tabla recibidos : " + error);
            }

            bodyChatsActivos += "<tr>";
            bodyChatsActivos += `<td> ${chat.cliente} </td>`;
            bodyChatsActivos += "<td>" + chat.agente + "</td>";
            bodyChatsActivos += "<td>" + chat.fecha + "</td>";
            bodyChatsActivos += `<td class='center'> <div ${tiempoRojoRecibido ? 'class="tiempoRojo"' : tiempoAmarilloRecibido ? 'class="tiempoAmarillo"' : tiempoAzulRecibido ? 'class="tiempoAzul"' : 'class="tiempoVerde"'} > ${chat.tiempoUltimoRecibido} </div></td>`;
            bodyChatsActivos += `<td class='center'> <div ${tiempoRojoEnviado ? 'class="tiempoRojo"' : tiempoAmarilloEnviado ? 'class="tiempoAmarillo"' : tiempoAzulEnviado ? 'class="tiempoAzul"' : 'class="tiempoVerde"'} > ${chat.tiempoUltimoEnviado} </div></td>`;
            bodyChatsActivos += `<td class='center'> <div ${tiempoRojoEsperaASA ? 'class="tiempoRojo"' : tiempoAmarilloEsperaASA ? 'class="tiempoAmarillo"' : 'class="tiempoVerde"'} > ${chat.asaCola} </div></td>`;
            bodyChatsActivos += `<td class='center'> <div ${tiempoRojoAgenteASA ? 'class="tiempoRojo"' : tiempoAmarilloAgenteASA ? 'class="tiempoAmarillo"' : 'class="tiempoVerde"'} > ${chat.asaAgente} </div></td>`;
            bodyChatsActivos += "<td class='center'>" + chat.tiempoTotal + "</td>";
            bodyChatsActivos += `<td class='center'>
           <a id='verChatOnline' class='modal-trigger' href="#modalVerChat" verChat='${chat.idchat}' cliente ='${chat.cliente}' agente='${chat.agente}'> <i class='material-icons'>remove_red_eye</i></a>   
           <a id='transferirChat' class='modal-trigger' href='#modalTransferir' verChat='${chat.idchat}'> <i class='material-icons'>transfer_within_a_station</i></a>   
           <a id='cerrarChat' href='javascript:void(0);' verChat='${chat.idchat}' numeroCliente="${chat.cliente}"> <i class='material-icons'>cancel</i></a>
           </td>`;
            bodyChatsActivos += "</tr>";
          });
        } else {
          bodyChatsActivos += "<tr>";
          bodyChatsActivos += "<td> No data </td>";
          bodyChatsActivos += "<td> No data </td>";
          bodyChatsActivos += "<td> No data </td>";
          bodyChatsActivos += "<td> No data </td>";
          bodyChatsActivos += "<td> No data </td>";
          bodyChatsActivos += "<td> No data </td>";
          bodyChatsActivos += "<td> No data </td>";
          bodyChatsActivos += "<td> No data </td>";
          bodyChatsActivos += "<td> No data </td>";
          bodyChatsActivos += "</tr>";
        }
        document.getElementById("bodyChatsActivos").innerHTML = bodyChatsActivos;


        // TODO: =============================================================================================
        // TODO:                                  TABLA CHATS GRUPOS
        // TODO: =============================================================================================
        //INICIO Chats Grupos
        bodyGruposActivos = "";

        if (res.datasqlChatsGrupos.length > 0) {

          res.datasqlChatsGrupos.forEach((chat) => {
            tiempoAmarilloEnviado = false;
            tiempoRojoEnviado = false;
            tiempoAzulEnviado = false;

            tiempoAmarilloRecibido = false;
            tiempoRojoRecibido = false;
            tiempoAzulRecibido = false;

            tiempoAmarilloEsperaASA = false;
            tiempoRojoEsperaASA = false;

            tiempoAmarilloAgenteASA = false;
            tiempoRojoAgenteASA = false;

            //Valida tiempo de la cola ASA del tiempo en espera antes de la asignacion

            try {
              if (parseInt(chat.vtc_asa_cola.split(":")[0]) >= 1) {
                tiempoRojoEsperaASA = true;
              }
              else if (parseInt(chat.vtc_asa_cola.split(":")[1]) >= 5) {
                tiempoRojoEsperaASA = true;
              }
              else if (parseInt(chat.vtc_asa_cola.split(":")[1]) >= 3) {
                tiempoAmarilloEsperaASA = true;
              }
            } catch (error) {
              console.log("Error en tabla Cola ASA espera : " + error);
            }

            //Valida tiempo del agente ASA del tiempo en espera antes del primer mensaje

            try {
              if (parseInt(chat.vtc_asa_agente.split(":")[0]) >= 1) {
                tiempoRojoAgenteASA = true;
              }
              else if (parseInt(chat.vtc_asa_agente.split(":")[1]) >= 5) {
                tiempoRojoAgenteASA = true;
              }
              else if (parseInt(chat.vtc_asa_agente.split(":")[1]) >= 3) {
                tiempoAmarilloAgenteASA = true;
              }
            } catch (error) {
              console.log("Error en tabla Cola ASA espera : " + error);
            }

            //Valida el tiempo del ultimo mensaje enviado
            try {
              if (!chat.vtc_tiempo_ult_enviado) {
                tiempoAzulEnviado = true;
                chat.vtc_tiempo_ult_enviado = "Sin mensaje"
              }
              else if (parseInt(chat.vtc_tiempo_ult_enviado.split(":")[0]) >= 1) {
                tiempoRojoEnviado = true;
              }
              else if (parseInt(chat.vtc_tiempo_ult_enviado.split(":")[1]) >= 5) {
                tiempoRojoEnviado = true;
              }
              else if (parseInt(chat.vtc_tiempo_ult_enviado.split(":")[1]) >= 3) {
                tiempoAmarilloEnviado = true;
              }
            } catch (error) {
              console.log("Error en tabla recibidos : " + error);
            }

            //Valida el tiempo del ultimo mensaje recibido
            try {
              if (!chat.vtc_tiempo_ult_recibido) {
                tiempoAzulRecibido = true;
                chat.vtc_tiempo_ult_recibido = "Sin mensaje"
              }
              else if (parseInt(chat.vtc_tiempo_ult_recibido.split(":")[0]) >= 1) {
                tiempoRojoRecibido = true;
              }
              else if (parseInt(chat.vtc_tiempo_ult_recibido.split(":")[1]) >= 5) {
                tiempoRojoRecibido = true;
              }
              else if (parseInt(chat.vtc_tiempo_ult_recibido.split(":")[1]) >= 3) {
                tiempoAmarilloRecibido = true;
              }
            } catch (error) {
              console.log("Error en tabla recibidos : " + error);
            }

            bodyGruposActivos += "<tr>";
            bodyGruposActivos += "<td>" + chat.vct_grupo + "</td>";
            bodyGruposActivos += "<td>" + chat.vct_usuario + "</td>";
            bodyGruposActivos += "<td>" + chat.vtc_fecha_inicial_mensaje + "</td>";
            bodyGruposActivos += `<td class='center'> <div ${tiempoRojoRecibido ? 'class="tiempoRojo"' : tiempoAmarilloRecibido ? 'class="tiempoAmarillo"' : tiempoAzulRecibido ? 'class="tiempoAzul"' : 'class="tiempoVerde"'} > ${chat.vtc_tiempo_ult_recibido} </div></td>`;
            bodyGruposActivos += `<td class='center'> <div ${tiempoRojoEnviado ? 'class="tiempoRojo"' : tiempoAmarilloEnviado ? 'class="tiempoAmarillo"' : tiempoAzulEnviado ? 'class="tiempoAzul"' : 'class="tiempoVerde"'} > ${chat.vtc_tiempo_ult_enviado} </div></td>`;
            bodyGruposActivos += `<td class='center'> <div ${tiempoRojoEsperaASA ? 'class="tiempoRojo"' : tiempoAmarilloEsperaASA ? 'class="tiempoAmarillo"' : 'class="tiempoVerde"'} > ${chat.vtc_asa_cola} </div></td>`;
            bodyGruposActivos += `<td class='center'> <div ${tiempoRojoAgenteASA ? 'class="tiempoRojo"' : tiempoAmarilloAgenteASA ? 'class="tiempoAmarillo"' : 'class="tiempoVerde"'} > ${chat.vtc_asa_agente} </div></td>`;
            bodyGruposActivos += "<td class='center'>" + chat.vtc_tmo + "</td>";
            bodyGruposActivos += `<td class='center'>
           <a id='verChatOnline' class='modal-trigger' href="#modalVerChat" verChat='${chat.vct_id}' cliente ='${chat.vct_grup}' agente='${chat.vtc_agente}'> <i class='material-icons'>remove_red_eye</i></a>
           </td>`;
            bodyGruposActivos += "</tr>";
          });
        } else {
          bodyGruposActivos += "<tr>";
          bodyGruposActivos += "<td> No data </td>";
          bodyGruposActivos += "<td> No data </td>";
          bodyGruposActivos += "<td> No data </td>";
          bodyGruposActivos += "<td> No data </td>";
          bodyGruposActivos += "<td> No data </td>";
          bodyGruposActivos += "<td> No data </td>";
          bodyGruposActivos += "<td> No data </td>";
          bodyGruposActivos += "<td> No data </td>";
          bodyGruposActivos += "<td> No data </td>";
          bodyGruposActivos += "</tr>";
        }
        document.getElementById("bodyGruposActivos").innerHTML = bodyGruposActivos;
        // FIN CHATs Grupos




        // TODO: =============================================================================================
        // TODO:                                  TABLA AGENTES CONECTADOS
        // TODO: =============================================================================================
        bodyAgentesConectados = "";
        if (res.datasqlAgentesConectados.length > 0) {
          res.datasqlAgentesConectados.forEach((agente) => {

            bodyAgentesConectados += "<tr>";
            bodyAgentesConectados += "<td>" + agente.agente + "</td>";
            bodyAgentesConectados += "<td>" + agente.nombre + "</td>";
            bodyAgentesConectados += "<td>" + agente.estado + "</td>";
            bodyAgentesConectados += "<td>" + agente.tiempo + "</td>";
            bodyAgentesConectados += "<td>" + agente.chats + "</td>";
            bodyAgentesConectados += `<td class="center"><a class="btn-floating tooltipped red darken-3" data-position="top" data-tooltip="Desconectar" onclick=" mostrarModalCierreSesion(${agente.primaryKey}, '${agente.agente}', ${agente.chats})"><i class="small material-icons">clear</i></a></td>`;
            bodyAgentesConectados += "</tr>";
          });

          M.Tooltip.init(document.querySelectorAll('.tooltipped'));
        } else {
          bodyAgentesConectados += "<tr>";
          bodyAgentesConectados += "<td> No data </td>";
          bodyAgentesConectados += "<td> No data </td>";
          bodyAgentesConectados += "<td> No data </td>";
          bodyAgentesConectados += "<td> No data </td>";
          bodyAgentesConectados += "<td> No data </td>";
          bodyAgentesConectados += "<td> No data </td>";
          bodyAgentesConectados += "</tr>";
        }
        document.getElementById("bodyAgentesConectados").innerHTML = bodyAgentesConectados;

        document.getElementById("clientesActivos").innerHTML = res.datasqlChatsEstado[0].chatsActivos;
        document.getElementById("clientesEspera").innerHTML = res.datasqlChatsEstado[0].chatsEspera;
        document.getElementById("clientesEspera").innerHTML = res.datasqlChatsEspera.length;
        document.getElementById("clientesTotal").innerHTML = res.datasqlChatsEstado[0].chatsActivos + res.datasqlChatsEstado[0].chatsEspera;

        document.getElementById("agentesActivos").innerHTML = res.datasqlAgentesEstado[0].agentesActivos;
        document.getElementById("agentesPausa").innerHTML = res.datasqlAgentesEstado[0].agentesPausa;
        document.getElementById("agentesTotal").innerHTML = res.datasqlAgentesEstado[0].agentesActivos + res.datasqlAgentesEstado[0].agentesPausa;

        pieChartAgentes.data.labels[0] = document.getElementById("labelAgentesActivos").innerHTML;
        pieChartAgentes.data.labels[1] = document.getElementById("labelAgentesPausa").innerHTML;
        pieChartAgentes.data.datasets[0].data[0] = res.datasqlAgentesEstado[0].agentesActivos;
        pieChartAgentes.data.datasets[0].data[1] = res.datasqlAgentesEstado[0].agentesPausa;
        pieChartAgentes.update();

        pieChartClientes.data.labels[0] = document.getElementById("labelClientesActivos").innerHTML;
        pieChartClientes.data.labels[1] = document.getElementById("labelClientesEspera").innerHTML;
        pieChartClientes.data.datasets[0].data[0] = res.datasqlChatsEstado[0].chatsActivos;
        pieChartClientes.data.datasets[0].data[1] = res.datasqlChatsEstado[0].chatsEspera;
        pieChartClientes.data.datasets[0].data[1] = res.datasqlChatsEspera.length;
        pieChartClientes.update();

        //VER CHAT ONLINE
        document.querySelectorAll("a#verChatOnline").forEach((botonVerChat) => {
          botonVerChat.addEventListener("click", async function (e) {

            //Fix Modal duplicate events ver chat online
            document.getElementById("divFooterModalVerChat").innerHTML = `<input type="text" placeholder="" id="inputEnviarMensajeAgente" class="col s7  ml-2 message mb-0">
            <a class="col s2 ml-2 btn waves-effect waves-light send center" id="enviarMensajeAsesor"><span data-i18n="Enviar">Enviar</span></a>
            <a class="col s2 ml-2 modal-action modal-close waves-effect waves-light btn border-round red center"
                id="cerrarModalVerChat"><span data-i18n="Cerrar">Cerrar</span></a>`
            //Fin fix modal duplicate eventsver chat online

            //traducir placeholder para enviar mensaje al asesor
            document.querySelector("#modalVerChat > div.modal-footer > input").placeholder = document.querySelector('[data-i18n="Escribe un mensaje para el agente"]').textContent;
            // fin traduccion

            let codigoChat = this.getAttribute("verChat");
            let cliente = this.getAttribute("cliente");
            let agente = this.getAttribute("agente");

            let chat = "";
            document.getElementById("contenedorChat").innerHTML = chat;
            let interaccion = await postData("/reportes/getInteraccion", { data: codigoChat });
            let cantidadChats = interaccion.length;

            let arrImgTypes = ['jpeg', 'png', 'webp', 'jpg'],
              arrVideoTypes = ['mp4'],
              arrDocsTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xlx', 'xlxs', 'txt', 'csv'];

            interaccion.forEach((element) => {
              let isFileImg = false,
                isFileDoc = false,
                isFileVideo = false,
                isFileAudio = false;

              if (Boolean(element.MES_MEDIA_TYPE) && element.MES_MEDIA_TYPE != "Null" && element.MES_MEDIA_TYPE != "None") {

                if (arrImgTypes.includes(element.MES_MEDIA_TYPE)) isFileImg = true;
                if (arrDocsTypes.includes(element.MES_MEDIA_TYPE)) isFileDoc = true;
                if (arrVideoTypes.includes(element.MES_MEDIA_TYPE)) isFileVideo = true;
                if (element.MES_MEDIA_TYPE.includes('ogg')) isFileAudio = true;

                if (element.MES_CHANNEL == "RECEIVED") {
                  if (isFileImg) element.MES_BODY = `<img class="imgChatReceive" src="${element.MES_MESSAGE_ID}.${element.MES_MEDIA_TYPE}"> ${element.MES_BODY}`;
                  if (isFileDoc) element.MES_BODY = `<a target="_blank" href="${element.MES_MESSAGE_ID}.${element.MES_MEDIA_TYPE}"> <b>File <i class="bx bx-file"></i></b></a> ${element.MES_BODY}`;
                  if (isFileVideo) element.MES_BODY = `<video class="imgChatReceive" src="${element.MES_MESSAGE_ID}.${element.MES_MEDIA_TYPE}" type="audio/mp3" controls></video> ${element.MES_BODY}`;
                  if (isFileAudio) element.MES_BODY = `<audio src="${element.MES_MESSAGE_ID}.${element.MES_MEDIA_TYPE}" type="audio/mp3" controls></audio> ${element.MES_BODY}`;
                }
                else if (element.MES_CHANNEL == "SEND") {
                  if (isFileImg) element.MES_BODY = `<img class="imgChatReceive" src="${element.MES_MEDIA_URL}"> ${element.MES_BODY}`;
                  if (isFileDoc) element.MES_BODY = `<a target="_blank" href="${element.MES_MEDIA_URL}"> <b>File <i class="bx bx-file"></i></b></a> ${element.MES_BODY}`;
                  if (isFileVideo) element.MES_BODY = `<video class="imgChatReceive" src="${element.MES_MEDIA_URL}" type="audio/mp3" controls></video> ${element.MES_BODY}`;
                  if (isFileAudio) element.MES_BODY = `<audio src="${element.MES_MEDIA_URL}" type="audio/mp3" controls></audio> ${element.MES_BODY}`;
                }
              }

              if (element.MES_CHANNEL == "RECEIVED") {
                chat += ` 
                <div>
                  <div class="col s9 mt-1 mb-1 chatRecibido">
                    <p class="left">${element.MES_AUTHOR} - ${element.MES_CREATION_DATE} :</p>
                    <br>
                    <p class="left">${element.MES_BODY}</p>
                  </div>
                </div>
                `;
              } else if (element.MES_CHANNEL == "SEND") {
                chat += ` 
                <div>
                  <div class="col s9 offset-s3 mt-1 mb-1 chatEnviado">
                    <p class="left">${element.MES_AUTHOR} - ${element.MES_CREATION_DATE} :</p>
                    <br>
                    <p class="left">${element.MES_BODY}</p>
                  </div>
                </div>
                `;
              } else if (element.MES_CHANNEL == "ADMIN") {
                chat += ` 
                <div>
                  <div class="col s9 mt-1 mb-1 chatRecibidoAdmin">
                    <p class="left">${element.MES_USER}  - ${element.MES_CREATION_DATE} :</p>
                    <br>
                    <p class="left">${element.MES_BODY}</p>
                  </div>
                </div>
                `;
              }
            });
            document.getElementById("contenedorChat").innerHTML = chat;

            let intervaloconsultarmensajes = setInterval(async function () {
              let interaccion = await postData("/reportes/getInteraccion", { data: codigoChat });

              if (interaccion.length == cantidadChats) {
                return;
              }

              cantidadChats += 1;
              let nuevoMensaje = interaccion.at(-1);

              isFileImg = false;
              isFileDoc = false;
              isFileVideo = false;
              isFileAudio = false;

              if (Boolean(nuevoMensaje.MES_MEDIA_TYPE) && nuevoMensaje.MES_MEDIA_TYPE != "Null" && nuevoMensaje.MES_MEDIA_TYPE != "None") {

                if (arrImgTypes.includes(nuevoMensaje.MES_MEDIA_TYPE)) isFileImg = true;
                if (arrDocsTypes.includes(nuevoMensaje.MES_MEDIA_TYPE)) isFileDoc = true;
                if (arrVideoTypes.includes(nuevoMensaje.MES_MEDIA_TYPE)) isFileVideo = true;
                if (nuevoMensaje.MES_MEDIA_TYPE.includes('ogg')) isFileAudio = true;

                if (nuevoMensaje.MES_CHANNEL == "RECEIVED") {
                  if (isFileImg) nuevoMensaje.MES_BODY = `<img class="imgChatReceive" src="${nuevoMensaje.MES_MESSAGE_ID}.${nuevoMensaje.MES_MEDIA_TYPE}"> ${nuevoMensaje.MES_BODY}`;
                  if (isFileDoc) nuevoMensaje.MES_BODY = `<a target="_blank" href="${nuevoMensaje.MES_MESSAGE_ID}.${nuevoMensaje.MES_MEDIA_TYPE}"> <b>File <i class="bx bx-file"></i></b></a> ${nuevoMensaje.MES_BODY}`;
                  if (isFileVideo) nuevoMensaje.MES_BODY = `<video class="imgChatReceive" src="${nuevoMensaje.MES_MESSAGE_ID}.${nuevoMensaje.MES_MEDIA_TYPE}" type="audio/mp3" controls></video> ${nuevoMensaje.MES_BODY}`;
                  if (isFileAudio) nuevoMensaje.MES_BODY = `<audio src="${nuevoMensaje.MES_MESSAGE_ID}.${nuevoMensaje.MES_MEDIA_TYPE}" type="audio/mp3" controls></audio> ${nuevoMensaje.MES_BODY}`;
                }
                else if (nuevoMensaje.MES_CHANNEL == "SEND") {
                  if (isFileImg) nuevoMensaje.MES_BODY = `<img class="imgChatReceive" src="${nuevoMensaje.MES_MEDIA_URL}"> ${nuevoMensaje.MES_BODY}`;
                  if (isFileDoc) nuevoMensaje.MES_BODY = `<a target="_blank" href="${nuevoMensaje.MES_MEDIA_URL}"> <b>File <i class="bx bx-file"></i></b></a> ${nuevoMensaje.MES_BODY}`;
                  if (isFileVideo) nuevoMensaje.MES_BODY = `<video class="imgChatReceive" src="${nuevoMensaje.MES_MEDIA_URL}" type="audio/mp3" controls></video> ${nuevoMensaje.MES_BODY}`;
                  if (isFileAudio) nuevoMensaje.MES_BODY = `<audio src="${nuevoMensaje.MES_MEDIA_URL}" type="audio/mp3" controls></audio> ${nuevoMensaje.MES_BODY}`;
                }
              }

              if (nuevoMensaje.MES_CHANNEL == "RECEIVED") {
                chat += ` 
                <div>
                  <div class="col s9 mt-1 mb-1 chatRecibido">
                    <p class="left">${cliente} - ${nuevoMensaje.MES_CREATION_DATE} :</p>
                    <br>
                    <p class="left">${nuevoMensaje.MES_BODY}</p>
                  </div>
                </div>
                `;
              } else if (nuevoMensaje.MES_CHANNEL == "SEND") {
                chat += ` 
                <div>
                  <div class="col s9 offset-s3 mt-1 mb-1 chatEnviado">
                    <p class="left">${nuevoMensaje.MES_USER} - ${nuevoMensaje.MES_CREATION_DATE} :</p>
                    <br>
                    <p class="left">${nuevoMensaje.MES_BODY}</p>
                  </div>
                </div>
                `;
              } else if (nuevoMensaje.MES_CHANNEL == "ADMIN") {
                chat += ` 
                <div>
                  <div class="col s9 mt-1 mb-1 chatRecibidoAdmin">
                    <p class="left">${nuevoMensaje.MES_USER} - ${nuevoMensaje.MES_CREATION_DATE} :</p>
                    <br>
                    <p class="left">${nuevoMensaje.MES_BODY}</p>
                  </div>
                </div>
                `;
              }
              document.getElementById("contenedorChat").innerHTML = chat;
            }, 2500);

            document.getElementById("cerrarModalVerChat").addEventListener("click", function () {
              clearInterval(intervaloconsultarmensajes);
            });


            //Enviar mensaje al asesor desde la admin ver chat
            document.getElementById("enviarMensajeAsesor").addEventListener("click", function () {
              if (document.getElementById("inputEnviarMensajeAgente").value != "") {
                let data = {
                  codigoChat: codigoChat,
                  mensaje: document.getElementById("inputEnviarMensajeAgente").value
                }
                postData("/dashboard/enviarMensajeAsesor", { data });
                document.getElementById("inputEnviarMensajeAgente").value = "";
              }
            });

            //Enviar mensaje al asesor desde la admin ver chat ENTER
            document.getElementById("inputEnviarMensajeAgente").addEventListener("keyup", (e) => {
              if (e.key === 'Enter') {
                //console.log(codigoChat);
                if (document.getElementById("inputEnviarMensajeAgente").value != "") {
                  let data = {
                    codigoChat: codigoChat,
                    mensaje: document.getElementById("inputEnviarMensajeAgente").value
                  }
                  postData("/dashboard/enviarMensajeAsesor", { data });
                  document.getElementById("inputEnviarMensajeAgente").value = "";
                }
              }
            });

            let currentLanguage = localStorage.getItem("localIdioma");
            i18next.changeLanguage(currentLanguage, function (err, t) {
              $("html").localize();
            });

          });
        });
        //VER CHAT ONLINE

        //TRANSFERIR CHAT
        document.querySelectorAll("a#transferirChat").forEach((botonTransferirChat) => {
          botonTransferirChat.addEventListener("click", function (e) {

            //Fix Modal duplicate events 
            document.getElementById("divBtnEnviarTransfer").innerHTML = `<div class="col s12"><a class="waves-effect waves-light btn-small right" id="btnEnviarTransfer"><span data-i18n="Enviar">Enviar</span></a></div>`;
            //Fin fix modal duplicate eventsver 

            let codigoChat = this.getAttribute("verChat");
            const MotivoTransferencia = document.getElementById("MotivoTransferencia");
            const selectModalAvalibleUsers = document.getElementById("selectModalAvalibleUsers");
            const ObservacionTransferencia = document.getElementById("ObservacionTransferencia");
            getData("mensajeria/availableUsers").then(async (res) => {
              options = `<option value="" disabled selected><span data-i18n="Seleccione el usuario">Seleccione el usuario</span></option>`;
              if (res.selectUsers.length > 0) {
                let array = res.selectUsers;
                array.forEach((element) => {
                  options += `<option value="${element.PKUSU_NCODIGO}" >${element.USU_CUSUARIO}</option>`;
                });
                selectModalAvalibleUsers.innerHTML = options;
                var elemsSelect = document.querySelectorAll(".select");
                M.FormSelect.init(elemsSelect);
              }

              let currentLanguage = localStorage.getItem("localIdioma");
              i18next.changeLanguage(currentLanguage, function (err, t) {
                $("html").localize();
              });
            });

            document.getElementById("btnEnviarTransfer").addEventListener("click", function () {
              let validador = true;
              if (MotivoTransferencia.value == null || MotivoTransferencia.value == "") {
                validador = false;
                M.toast({ html: "Digite motivo de transferencia" });
              }
              if (selectModalAvalibleUsers.value == null || selectModalAvalibleUsers.value == "") {
                validador = false;
                M.toast({ html: "Seleccione usuario a transferir" });
              }

              if (validador === true) {
                const data = {
                  chatID: codigoChat,
                  MotivoTransferencia: MotivoTransferencia.value,
                  selectModalAvalibleUsers: selectModalAvalibleUsers.value,
                  ObservacionTransferencia: ObservacionTransferencia.value,
                };

                postData("mensajeria/transferir", { data }).then(async (res) => {
                  if (res == "ok") {
                    Swal.fire({
                      position: "center",
                      icon: "success",
                      title: document.querySelector('[data-i18n="Chat transferido con exito"]').textContent,
                      showConfirmButton: true,
                      confirmButtonText: document.querySelector('[data-i18n="Aceptar"]').textContent,
                      allowOutsideClick: false,
                      allowEscapeKey: false,
                    }).then((result) => {
                      if (result.isConfirmed) {
                        location.reload();
                      }
                    });
                  }
                });
              }
            });
          });
        });
        //TRANSFERIR CHAT

        //CERRAR CHAT
        document.querySelectorAll("a#cerrarChat").forEach((botonCerrarChat) => {
          botonCerrarChat.addEventListener("click", function (e) {
            let codigoChat = this.getAttribute("verChat");
            let numeroCliente = this.getAttribute("numeroCliente");
            Swal.fire({
              position: "center",
              icon: "warning",
              title: document.querySelector('[data-i18n="¿Seguro que quiere cerrar el chat?"]').textContent,
              showConfirmButton: true,
              showCancelButton: true,
              confirmButtonText: document.querySelector('[data-i18n="Aceptar"]').textContent,
              confirmButtonColor: "rgb(202, 5, 29)",
              cancelButtonText: document.querySelector('[data-i18n="Cancelar"]').textContent,
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then((result) => {
              if (result.isConfirmed) {
                postData("mensajeria/cerrarChatAdmin", { chatIDHeader: codigoChat, numeroCliente: numeroCliente }).then(async (res) => {
                  if (res == "ok") {
                    Swal.fire({
                      position: "center",
                      icon: "success",
                      title: document.querySelector('[data-i18n="Chat cerrado con exito"]').textContent,
                      showConfirmButton: true,
                      confirmButtonText: document.querySelector('[data-i18n="Aceptar"]').textContent,
                      allowOutsideClick: false,
                      allowEscapeKey: false,
                    }).then((result) => {
                      if (result.isConfirmed) {
                        location.reload();
                      }
                    });
                  }
                });
              }
            });
          });
        });
        //CERRAR CHAT

        resolve();
      });
    });
  }

  setInterval(() => {
    actualizarDashboard();
  }, 10000);

  async function inicio() {
    document.getElementById("loaderGeneral").style.display = "flex";
    await actualizarDashboard();
    document.getElementById("loaderGeneral").style.display = "none";
  }
});

function mostrarModalCierreSesion(agentePrimaryKey, agenteNombre, agenteChats) {
  if (agenteChats == 0) {
    Swal.fire({
      position: "center",
      icon: "warning",
      title: "¿Seguro que quiere cerrar la sesion?",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      confirmButtonColor: "rgb(202, 5, 29)",
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        postData("dashboard/cerrarSesionAgente", { agentePrimaryKey, agenteNombre }).then(async (res) => {
          console.log(res);
          if (res.result == "OK") {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Chat cerrado con exito",
              showConfirmButton: true,
              confirmButtonText: "Aceptar",
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then((result) => {
              if (result.isConfirmed) {
                location.reload();
              }
            });
          }
        });
      }
    });
  } else {
    Swal.fire({
      position: "center",
      icon: "error",
      title: "No puede cerrar la sesion, el usuario tiene chats asignados",
      showConfirmButton: true,
      confirmButtonText: "Aceptar",
      allowOutsideClick: false,
      allowEscapeKey: false,
    })
  }
}
