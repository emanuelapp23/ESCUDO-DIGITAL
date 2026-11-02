/* ============================================
   ESCUDO DIGITAL - Analizador de capturas
   Lee el texto de una imagen EN EL DISPOSITIVO (Tesseract.js)
   y lo pasa por el analizador de mensajes.
   La imagen no se envía a ningún servidor.
   ============================================ */

(function () {
  "use strict";

  const MAX_MB = 10;

  const entrada = document.getElementById("archivo-captura");
  const vista = document.getElementById("vista-captura");
  const botonLeer = document.getElementById("boton-leer-captura");
  const botonBorrar = document.getElementById("boton-borrar-captura");
  const estado = document.getElementById("estado-captura");
  const bloqueTexto = document.getElementById("bloque-texto-captura");
  const textoLeido = document.getElementById("texto-captura");
  const botonRevisar = document.getElementById("boton-revisar-captura");

  let urlVista = null;

  function decir(texto) {
    estado.textContent = texto;
    estado.hidden = (texto === "");
  }

  function limpiarVista() {
    if (urlVista) { URL.revokeObjectURL(urlVista); urlVista = null; }
    vista.removeAttribute("src");
    vista.hidden = true;
  }

  // Al elegir un archivo: validar y mostrar vista previa
  entrada.addEventListener("change", function () {
    limpiarVista();
    bloqueTexto.hidden = true;
    textoLeido.value = "";
    decir("");
    botonLeer.disabled = true;

    const archivo = entrada.files[0];
    if (!archivo) { return; }

    if (archivo.type.indexOf("image/") !== 0) {
      decir("Ese archivo no es una imagen. Elegí una captura en formato PNG o JPG.");
      return;
    }
    if (archivo.size > MAX_MB * 1024 * 1024) {
      decir("La imagen pesa demasiado (máximo " + MAX_MB + " MB). Probá con una captura más chica.");
      return;
    }

    urlVista = URL.createObjectURL(archivo);
    vista.src = urlVista;
    vista.hidden = false;
    botonLeer.disabled = false;
  });

  // Leer el texto de la imagen
  botonLeer.addEventListener("click", async function () {
    const archivo = entrada.files[0];
    if (!archivo) { return; }

    if (typeof Tesseract === "undefined") {
      decir("No se pudo cargar la herramienta de lectura. Revisá tu conexión a internet y recargá la página.");
      return;
    }

    botonLeer.disabled = true;
    bloqueTexto.hidden = true;
    decir("Preparando la lectura… La primera vez puede tardar un poco porque se descargan los datos del idioma.");

    let worker = null;
    try {
      worker = await Tesseract.createWorker("spa", 1, {
        logger: function (m) {
          if (m.status === "recognizing text") {
            decir("Leyendo la imagen… " + Math.round(m.progress * 100) + " %");
          }
        }
      });
      const resultado = await worker.recognize(archivo);
      const texto = (resultado.data.text || "").trim();

      if (texto === "") {
        decir("No pudimos leer texto en esta imagen. Probá con una captura más nítida, o copiá el texto a mano en «Revisar un mensaje».");
      } else {
        textoLeido.value = texto;
        bloqueTexto.hidden = false;
        decir("Listo. Leé el texto de abajo: si se leyó algo mal, corregilo antes de revisarlo.");
        textoLeido.focus();
      }
    } catch (error) {
      decir("Algo salió mal al leer la imagen. Revisá tu conexión y probá de nuevo.");
    } finally {
      if (worker) { try { await worker.terminate(); } catch (e) { /* nada */ } }
      botonLeer.disabled = false;
    }
  });

  // Pasar el texto al analizador de mensajes (el resultado aparece en esa sección)
  botonRevisar.addEventListener("click", function () {
    const texto = textoLeido.value.trim();
    if (texto === "") {
      decir("No hay texto para revisar.");
      return;
    }
    document.getElementById("texto-mensaje").value = texto;
    document.getElementById("boton-revisar").click();
  });

  // Borrar todo
  botonBorrar.addEventListener("click", function () {
    entrada.value = "";
    limpiarVista();
    textoLeido.value = "";
    bloqueTexto.hidden = true;
    botonLeer.disabled = true;
    decir("");
  });

})();