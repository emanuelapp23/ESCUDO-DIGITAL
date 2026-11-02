/* ============================================
   ESCUDO DIGITAL - Simulacro de práctica
   Mensajes INVENTADOS para aprender a reconocer señales.
   No se guarda nada: el puntaje vive solo mientras la página está abierta.
   ============================================ */

(function () {
  "use strict";

  /* ---------- LOS MENSAJES DE PRÁCTICA ----------
     Para agregar uno nuevo, copiá un bloque entero (con su coma) y cambiá los datos.
     - esEstafa: true si es una estafa, false si es un mensaje normal.
     - senales:  lista de señales de alerta (en los reales, dejala vacía: []). */

  const MENSAJES = [
    {
      texto: "Mamá, soy yo. Se me rompió el celular y este es mi número nuevo. Necesito que me hagas una transferencia urgente, después te explico. No le digas nada a papá.",
      esEstafa: true,
      explicacion: "Es el engaño clásico del «número nuevo». Aprovecha el cariño y el apuro para que no verifiques.",
      senales: [
        "Dice que cambió de número",
        "Pide una transferencia urgente",
        "Pide guardar el secreto",
        "Qué hacer: llamá a tu familiar a su número de siempre, antes de transferir"
      ]
    },
    {
      texto: "Recordatorio: mañana a las 10:30 tenés turno con el Dr. Gómez en el consultorio de siempre. Si no podés asistir, avisanos con tiempo para darle el lugar a otra persona.",
      esEstafa: false,
      explicacion: "Es un mensaje normal: no pide datos, no tiene enlaces ni apuro, y habla de algo que ya conocías. Aun así, si algo te hace dudar, llamá al consultorio por el teléfono que ya tenés.",
      senales: []
    },
    {
      texto: "¡FELICITACIONES! Fuiste seleccionado para ganar un celular de última generación. Para recibirlo, confirmá tus datos y pagá $2.500 de envío en: bit.ly/premio-hoy. Tenés 24 horas.",
      esEstafa: true,
      explicacion: "Un premio de un sorteo en el que no participaste, y encima te piden pagar para recibirlo.",
      senales: [
        "Premio que no pediste",
        "Te piden dinero para «cobrar»",
        "Enlace acortado que esconde el destino real",
        "Urgencia: «tenés 24 horas»"
      ]
    },
    {
      texto: "Tu código de verificación es 482913. No lo compartas con nadie. Si no lo pediste, ignorá este mensaje.",
      esEstafa: false,
      explicacion: "Si justo estabas entrando a tu cuenta, es el código que esperabas: es normal. Nunca lo compartas con nadie. Si te llega SIN que hayas pedido nada, alguien puede estar intentando entrar a tu cuenta: cambiá tu contraseña desde la aplicación oficial.",
      senales: []
    },
    {
      texto: "Tu paquete no pudo ser entregado. Para reprogramar la entrega abonar $450 de reenvío en: www.entrega-paquetes-ar.top. De no abonarse en 48 horas será devuelto.",
      esEstafa: true,
      explicacion: "Muchas personas esperan paquetes, por eso este engaño funciona. El pago de «reenvío» es solo una excusa para robar los datos de tu tarjeta.",
      senales: [
        "Pide dinero por un envío que quizás ni esperabas",
        "Enlace con terminación rara (.top) y nombre genérico",
        "Plazo corto de 48 horas",
        "Qué hacer: consultá el envío en la página o app oficial de la empresa, escribiendo vos la dirección"
      ]
    },
    {
      texto: "Ma, llego un poco tarde a cenar, hay mucho tránsito. Guardame un plato. Un beso.",
      esEstafa: false,
      explicacion: "Es un mensaje cotidiano. No pide dinero, ni datos, ni hacer nada urgente. No todo mensaje es una amenaza, y desconfiar de todo también cansa.",
      senales: []
    },
    {
      texto: "Invertí $50.000 hoy y retirá $100.000 en una semana. Ganancia 100% garantizada. Hay pocos cupos, escribinos ya y no se lo cuentes a nadie para no saturar el grupo.",
      esEstafa: true,
      explicacion: "Ninguna inversión seria puede garantizar que duplicás tu dinero en una semana.",
      senales: [
        "Ganancia «garantizada» y exagerada",
        "Presión: «pocos cupos»",
        "Pide guardar el secreto"
      ]
    },
    {
      texto: "Soporte técnico: detectamos virus en tu computadora. Llamá ya al número que aparece en la pantalla e instalá el programa de asistencia que te vamos a indicar para limpiarla.",
      esEstafa: true,
      explicacion: "Una empresa de tecnología no te contacta por su cuenta para avisarte de un virus. Es un pretexto para que instales un programa y controlen tu equipo.",
      senales: [
        "Te contactan sin que lo hayas pedido",
        "Miedo a un virus",
        "Piden instalar un programa de «asistencia»"
      ]
    }
  ];


  /* ---------- LÓGICA ---------- */

  const caja = document.getElementById("simulacro");
  const botonEmpezar = document.getElementById("boton-empezar-simulacro");

  let orden = [];
  let indice = 0;
  let aciertos = 0;

  function crear(etiqueta, texto, clase) {
    const elemento = document.createElement(etiqueta);
    if (texto) { elemento.textContent = texto; }
    if (clase) { elemento.className = clase; }
    return elemento;
  }

  // Mezcla el orden de los mensajes (cada práctica queda distinta)
  function mezclar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const aux = copia[i]; copia[i] = copia[j]; copia[j] = aux;
    }
    return copia;
  }

  function empezar() {
    orden = mezclar(MENSAJES);
    indice = 0;
    aciertos = 0;
    mostrarPregunta();
  }

  function mostrarPregunta() {
    const mensaje = orden[indice];
    caja.replaceChildren();

    caja.appendChild(crear("p", "Mensaje " + (indice + 1) + " de " + orden.length, "simulacro-progreso"));
    caja.appendChild(crear("blockquote", mensaje.texto, "mensaje-practica"));
    caja.appendChild(crear("p", "¿Qué te parece este mensaje?", "simulacro-pregunta"));

    const acciones = crear("div", "", "acciones");
    const botonEstafa = crear("button", "Es una estafa", "boton");
    botonEstafa.type = "button";
    const botonReal = crear("button", "Parece real", "boton boton-secundario");
    botonReal.type = "button";
    acciones.appendChild(botonEstafa);
    acciones.appendChild(botonReal);
    caja.appendChild(acciones);

    const respuesta = crear("div", "", "resultado simulacro-respuesta");
    respuesta.tabIndex = -1;
    respuesta.hidden = true;
    caja.appendChild(respuesta);

    function responder(dijoEstafa) {
      botonEstafa.disabled = true;
      botonReal.disabled = true;
      const acerto = (dijoEstafa === mensaje.esEstafa);
      if (acerto) { aciertos++; }
      mostrarRespuesta(respuesta, mensaje, acerto);
    }

    botonEstafa.addEventListener("click", function () { responder(true); });
    botonReal.addEventListener("click", function () { responder(false); });
  }

  function mostrarRespuesta(respuesta, mensaje, acerto) {
    respuesta.className = "resultado simulacro-respuesta " +
      (acerto ? "resultado-ninguna" : "resultado-pocas");

    respuesta.appendChild(crear("h3", (acerto ? "✔ ¡Bien! " : "✖ Esta vez no. ") +
      (mensaje.esEstafa ? "Era una estafa." : "Era un mensaje normal.")));
    respuesta.appendChild(crear("p", mensaje.explicacion));

    if (mensaje.senales.length > 0) {
      respuesta.appendChild(crear("h4", "Señales de alerta"));
      const lista = crear("ul", "", "lista-consejos");
      mensaje.senales.forEach(function (s) { lista.appendChild(crear("li", s)); });
      respuesta.appendChild(lista);
    }

    const ultimo = (indice === orden.length - 1);
    const siguiente = crear("button", ultimo ? "Ver mi resultado" : "Siguiente mensaje", "boton");
    siguiente.type = "button";
    siguiente.addEventListener("click", function () {
      if (ultimo) { mostrarFinal(); } else { indice++; mostrarPregunta(); }
    });
    respuesta.appendChild(siguiente);

    respuesta.hidden = false;
    respuesta.scrollIntoView({ behavior: "smooth", block: "nearest" });
    respuesta.focus({ preventScroll: true });
  }

  function mostrarFinal() {
    caja.replaceChildren();
    const final = crear("div", "", "resultado resultado-ninguna");
    final.tabIndex = -1;
    final.appendChild(crear("h3", "Acertaste " + aciertos + " de " + orden.length));
    final.appendChild(crear("p",
      "Si fallaste alguno, es normal: estos mensajes están pensados para parecerse a los reales. " +
      "Lo importante es la costumbre de frenar y verificar. En la vida real no siempre vas a poder " +
      "distinguir una estafa a simple vista, y por eso la regla es: ante la duda, no hagas clic, " +
      "no des datos y confirmá por un canal oficial."));
    const otra = crear("button", "Practicar de nuevo", "boton");
    otra.type = "button";
    otra.addEventListener("click", empezar);
    final.appendChild(otra);
    caja.appendChild(final);
    final.focus();
  }

  botonEmpezar.addEventListener("click", empezar);

})();