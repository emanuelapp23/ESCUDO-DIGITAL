/* ============================================
   ESCUDO DIGITAL - Copiar / compartir resumen
   Agrega un botón a cada resultado para copiar un resumen
   y mostrárselo a alguien de confianza.
   No incluye el mensaje original, solo el análisis.
   Todo ocurre en el dispositivo.
   ============================================ */

(function () {
  "use strict";

  const CAJAS = ["resultado-mensaje", "resultado-enlace"];

  function crear(etiqueta, texto, clase) {
    const elemento = document.createElement(etiqueta);
    if (texto) { elemento.textContent = texto; }
    if (clase) { elemento.className = clase; }
    return elemento;
  }

  // Arma el texto del resumen leyendo lo que ya está en pantalla
  function armarResumen(caja) {
    const tipo = (caja.id === "resultado-enlace") ? "un enlace" : "un mensaje";
    const titulo = caja.querySelector("h3");
    const lineas = [];

    lineas.push("Resumen de Escudo Digital");
    lineas.push("Revisé " + tipo + " con esta herramienta.");
    lineas.push("");
    if (titulo) {
      lineas.push("Resultado: " + titulo.textContent.replace(/⚠️/g, "").trim());
    }

    const dominio = caja.querySelector(".dominio");
    if (dominio) {
      lineas.push("El enlace lleva al sitio: " + dominio.textContent);
    }

    const senales = caja.querySelectorAll(".lista-senales li strong");
    if (senales.length > 0) {
      lineas.push("");
      lineas.push("Señales de alerta que encontró:");
      senales.forEach(function (s) { lineas.push("- " + s.textContent); });
    }

    lineas.push("");
    lineas.push("Ojo: este análisis solo busca señales conocidas. No garantiza que algo sea seguro ni que sea una estafa. Quiero que me ayudes a verificarlo por un canal oficial antes de hacer nada.");

    return lineas.join("\n");
  }

  // Copia al portapapeles. Devuelve true si pudo.
  async function copiar(texto) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(texto);
        return true;
      }
    } catch (e) { /* probamos el otro método */ }

    try {
      const auxiliar = document.createElement("textarea");
      auxiliar.value = texto;
      auxiliar.setAttribute("readonly", "");
      auxiliar.style.position = "fixed";
      auxiliar.style.opacity = "0";
      document.body.appendChild(auxiliar);
      auxiliar.select();
      const funciono = document.execCommand("copy");
      document.body.removeChild(auxiliar);
      return funciono;
    } catch (e) {
      return false;
    }
  }

  // Agrega los botones al final del resultado (antes del aviso final)
  function agregarBotones(caja) {
    if (caja.querySelector(".acciones-resumen")) { return; }   // ya están
    const aviso = caja.querySelector(".resultado-aviso");
    if (!aviso) { return; }  // no es un resultado completo (ej. cuadro vacío)

    const bloque = crear("div", "", "acciones-resumen");
    bloque.appendChild(crear("h4", "Mostráselo a alguien de confianza"));

    const fila = crear("div", "", "acciones");
    const botonCopiar = crear("button", "Copiar resumen", "boton boton-secundario");
    botonCopiar.type = "button";
    fila.appendChild(botonCopiar);

    let botonCompartir = null;
    if (navigator.share) {
      botonCompartir = crear("button", "Compartir", "boton boton-secundario");
      botonCompartir.type = "button";
      fila.appendChild(botonCompartir);
    }
    bloque.appendChild(fila);

    const estado = crear("p", "", "estado-copia");
    estado.setAttribute("role", "status");
    estado.setAttribute("aria-live", "polite");
    bloque.appendChild(estado);

    botonCopiar.addEventListener("click", async function () {
      const texto = armarResumen(caja);
      const funciono = await copiar(texto);
      if (funciono) {
        estado.textContent = "Resumen copiado. Ya podés pegarlo en un mensaje.";
        const manual = bloque.querySelector(".copia-manual");
        if (manual) { manual.remove(); }
      } else {
        estado.textContent = "No pudimos copiarlo automáticamente. Copiá el texto de abajo a mano.";
        if (!bloque.querySelector(".copia-manual")) {
          const cuadro = crear("textarea", "", "copia-manual");
          cuadro.readOnly = true;
          cuadro.rows = 8;
          cuadro.value = texto;
          cuadro.setAttribute("aria-label", "Resumen para copiar");
          bloque.appendChild(cuadro);
          cuadro.focus();
          cuadro.select();
        }
      }
    });

    if (botonCompartir) {
      botonCompartir.addEventListener("click", async function () {
        try {
          await navigator.share({ title: "Resumen de Escudo Digital", text: armarResumen(caja) });
        } catch (e) {
          // La persona canceló o el dispositivo no lo permitió: no hacemos nada.
        }
      });
    }

    caja.insertBefore(bloque, aviso);
  }

  // Cada vez que el resultado cambia, nos fijamos si hay que agregar los botones
  CAJAS.forEach(function (id) {
    const caja = document.getElementById(id);
    if (!caja) { return; }
    new MutationObserver(function () { agregarBotones(caja); })
      .observe(caja, { childList: true });
  });

})();