/* ============================================
   ESCUDO DIGITAL - Analizador de enlaces
   Solo revisa CÓMO ESTÁ ESCRITO el enlace.
   No lo visita ni consulta ningún servicio externo.
   ============================================ */

(function () {
  "use strict";


  /* ---------- PARTE 1: LISTAS DE DATOS ---------- */

  const ACORTADORES = [
    "bit.ly", "tinyurl.com", "cutt.ly", "t.co", "goo.gl", "is.gd", "rb.gy",
    "shorturl.at", "ow.ly", "wa.link", "t.ly", "rebrand.ly", "tiny.cc", "buff.ly"
  ];

  const TERMINACIONES = [
    "xyz", "top", "click", "icu", "buzz", "cfd", "sbs", "link", "rest",
    "monster", "quest", "cyou", "online", "site", "support"
  ];

  const PALABRAS = [
    "login", "signin", "verificar", "verifica", "verify", "segur", "secure",
    "actualiz", "update", "cuenta", "account", "confirm", "soporte", "support",
    "promo", "premio", "ganaste", "bloqueo", "bloqueada", "reclamar", "claim",
    "ayuda", "clave", "password", "billetera", "wallet", "cobro", "reembolso",
    "devolucion"
  ];

  // Lista CORTA de marcas (escrita de memoria: verificala y ampliala).
  const MARCAS = [
    { nombre: "Mercado Libre / Mercado Pago", claves: ["mercadolibre", "mercadopago"],
      oficiales: ["mercadolibre.com.ar", "mercadolibre.com", "mercadopago.com.ar", "mercadopago.com"] },
    { nombre: "ANSES", claves: ["anses"], oficiales: ["anses.gob.ar"] },
    { nombre: "AFIP / ARCA", claves: ["afip", "arca"], oficiales: ["afip.gob.ar", "arca.gob.ar"] },
    { nombre: "Correo Argentino", claves: ["correoargentino"], oficiales: ["correoargentino.com.ar"] },
    { nombre: "Andreani", claves: ["andreani"], oficiales: ["andreani.com"] },
    { nombre: "PAMI", claves: ["pami"], oficiales: ["pami.org.ar"] },
    { nombre: "Santander", claves: ["santander"], oficiales: ["santander.com.ar", "santander.com"] },
    { nombre: "BBVA", claves: ["bbva"], oficiales: ["bbva.com.ar", "bbva.com"] },
    { nombre: "Netflix", claves: ["netflix"], oficiales: ["netflix.com"] },
    { nombre: "PayPal", claves: ["paypal"], oficiales: ["paypal.com"] },
    { nombre: "WhatsApp", claves: ["whatsapp"], oficiales: ["whatsapp.com", "whatsapp.net", "wa.me"] },
    { nombre: "Instagram", claves: ["instagram"], oficiales: ["instagram.com"] },
    { nombre: "Facebook", claves: ["facebook"], oficiales: ["facebook.com", "fb.com"] }
  ];

  function coincideClave(host, clave) {
    if (clave.length >= 6) { return host.indexOf(clave) !== -1; }
    return host.split(/[.\-]/).indexOf(clave) !== -1;
  }

  function esOficial(host, oficiales) {
    return oficiales.some(function (dominio) {
      return host === dominio || host.endsWith("." + dominio);
    });
  }

  // Obtiene el nombre real del sitio (lo que está antes de .com, .com.ar, etc.)
  function etiquetaPrincipal(host) {
    const partes = host.split(".");
    if (partes.length < 2) { return host; }
    const ultima = partes[partes.length - 1];
    const penultima = partes[partes.length - 2];
    const segundos = ["com", "net", "org", "gob", "gov", "edu", "mil", "int", "co"];
    if (partes.length >= 3 && ultima.length === 2 && segundos.indexOf(penultima) !== -1) {
      return partes[partes.length - 3];
    }
    return penultima;
  }

  // Cambia números y combinaciones que se parecen a letras (paypa1 -> paypal)
  function sinDisfraz(texto, paraUno) {
    return texto
      .replace(/rn/g, "m")
      .replace(/vv/g, "w")
      .replace(/0/g, "o")
      .replace(/1/g, paraUno)
      .replace(/3/g, "e")
      .replace(/4/g, "a")
      .replace(/5/g, "s");
  }

  // Cuenta cuántas letras hay que cambiar, agregar o quitar para pasar de una palabra a otra
  function distancia(a, b) {
    if (Math.abs(a.length - b.length) > 2) { return 99; }
    let anterior = [];
    for (let j = 0; j <= b.length; j++) { anterior.push(j); }
    for (let i = 1; i <= a.length; i++) {
      const actual = [i];
      for (let j = 1; j <= b.length; j++) {
        const costo = a[i - 1] === b[j - 1] ? 0 : 1;
        actual.push(Math.min(anterior[j] + 1, actual[j - 1] + 1, anterior[j - 1] + costo));
      }
      anterior = actual;
    }
    return anterior[b.length];
  }


  /* ---------- PARTE 2: LAS REGLAS ---------- */

  const REGLAS_ENLACES = [
    {
      titulo: "El nombre se parece mucho al de una marca conocida",
      explicacion: "Los sitios falsos suelen cambiar una letra o reemplazarla por un número parecido (como 1 en lugar de l) para que no lo notes.",
      peso: 4,
      detecta: function (c) {
        const etiqueta = etiquetaPrincipal(c.host);
        const variantes = [etiqueta, sinDisfraz(etiqueta, "l"), sinDisfraz(etiqueta, "i")];
        for (let i = 0; i < MARCAS.length; i++) {
          const marca = MARCAS[i];
          if (esOficial(c.host, marca.oficiales)) { continue; }
          for (let k = 0; k < marca.claves.length; k++) {
            const clave = marca.claves[k];
            if (clave.length < 5) { continue; }
            if (c.host.indexOf(clave) !== -1) { continue; }
            const maxima = clave.length >= 8 ? 2 : 1;
            for (let v = 0; v < variantes.length; v++) {
              if (variantes[v] === clave || distancia(variantes[v], clave) <= maxima) {
                return "Se parece a: " + marca.nombre + ". El nombre real de este sitio es «" + etiqueta + "».";
              }
            }
          }
        }
        return false;
      }
    },
    {
      titulo: "Usa un acortador de enlaces",
      explicacion: "Los acortadores esconden hacia qué página te llevan. Es una forma habitual de ocultar sitios falsos.",
      peso: 3,
      detecta: function (c) { return ACORTADORES.indexOf(c.hostBase) !== -1; }
    },
    {
      titulo: "La dirección es un número, no un nombre",
      explicacion: "Los sitios reales casi siempre usan un nombre (como mibanco.com.ar). Una dirección numérica es muy poco común en sitios legítimos.",
      peso: 4,
      detecta: function (c) { return /^\d{1,3}(\.\d{1,3}){3}$/.test(c.host); }
    },
    {
      titulo: "Tiene un @ que puede esconder el destino real",
      explicacion: "En un enlace, lo que está antes de una @ se ignora, y se usa para que parezca que vas a un sitio conocido cuando en realidad vas a otro.",
      peso: 4,
      detecta: function (c) { return c.url.username !== "" || c.url.password !== ""; }
    },
    {
      titulo: "Parece imitar a una marca u organismo conocido",
      explicacion: "El enlace nombra a una marca, pero su dirección no es una de las oficiales que tenemos cargadas. Es la forma más común de sitios falsos.",
      peso: 4,
      detecta: function (c) {
        for (let i = 0; i < MARCAS.length; i++) {
          const marca = MARCAS[i];
          const nombrada = marca.claves.some(function (k) { return coincideClave(c.host, k); });
          if (nombrada && !esOficial(c.host, marca.oficiales)) {
            return "Parece imitar a: " + marca.nombre + ".";
          }
        }
        return false;
      }
    },
    {
      titulo: "Usa caracteres especiales en el nombre",
      explicacion: "Algunos estafadores reemplazan letras por otras parecidas de otros alfabetos para imitar un sitio conocido.",
      peso: 3,
      detecta: function (c) { return c.host.indexOf("xn--") !== -1; }
    },
    {
      titulo: "Usa un tipo de enlace poco común",
      explicacion: "Los enlaces normales de páginas web empiezan con http o https.",
      peso: 3,
      detecta: function (c) { return c.url.protocol !== "http:" && c.url.protocol !== "https:"; }
    },
    {
      titulo: "No usa conexión segura (http)",
      explicacion: "Hoy casi todos los sitios serios usan https. Ojo: que tenga https tampoco garantiza que el sitio sea real.",
      peso: 2,
      detecta: function (c) { return c.url.protocol === "http:"; }
    },
    {
      titulo: "Termina en una extensión poco habitual",
      explicacion: "Esta terminación se ve seguido en sitios falsos, aunque algunos sitios legítimos también la usan.",
      peso: 2,
      detecta: function (c) { return TERMINACIONES.indexOf(c.terminacion) !== -1; }
    },
    {
      titulo: "Tiene muchos guiones en el nombre",
      explicacion: "Los nombres muy largos y con guiones suelen usarse para parecer oficiales (por ejemplo: banco-ayuda-seguro-clientes).",
      peso: 2,
      detecta: function (c) { return (c.host.match(/-/g) || []).length >= 3; }
    },
    {
      titulo: "Tiene muchos subdominios",
      explicacion: "Poner muchos nombres separados por puntos sirve para esconder el dominio verdadero, que es el último antes de la terminación.",
      peso: 2,
      detecta: function (c) { return c.host.split(".").length >= 5; }
    },
    {
      titulo: "Usa un puerto poco común",
      explicacion: "Los sitios normales no suelen mostrar números de puerto en el enlace.",
      peso: 2,
      detecta: function (c) { return c.url.port !== ""; }
    },
    {
      titulo: "El nombre incluye palabras típicas de engaño",
      explicacion: "Palabras como «verificar», «seguro», «cuenta» o «ayuda» se usan seguido para dar confianza. Por sí solas no prueban nada.",
      peso: 1,
      detecta: function (c) {
        return PALABRAS.some(function (p) { return c.hostSinTildes.indexOf(p) !== -1; });
      }
    }
  ];


  /* ---------- PARTE 3: TEXTOS DEL RESULTADO ---------- */

  const NIVELES_ENLACE = {
    ninguna: {
      titulo: "No encontramos señales de alerta en la forma de este enlace",
      resumen: "Esto NO significa que sea seguro. No visitamos la página ni la comparamos con listas de sitios peligrosos: solo revisamos cómo está escrito. Un sitio falso puede tener un enlace de aspecto normal."
    },
    pocas: {
      icono: "⚠️",
      titulo: "Encontramos alguna señal de alerta",
      resumen: "Hay pocos indicios, pero conviene ser cuidadoso. Verificá quién te mandó el enlace antes de abrirlo."
    },
    varias: {
      titulo: "Encontramos señales de alerta importantes",
      resumen: "Este enlace tiene características que aparecen seguido en estafas. No lo abras hasta verificarlo por un canal oficial."
    },
    muchas: {
      titulo: "Encontramos muchas señales de alerta",
      resumen: "Este enlace se parece mucho a los de sitios falsos. Te recomendamos no abrirlo y no dar ningún dato."
    }
  };

  const CONSEJOS_ENLACE = [
    "No abras el enlace para «probarlo»: entrar ya puede mostrarte una página falsa que te pida datos.",
    "Si dice ser de un banco, empresa u organismo, escribí vos la dirección oficial en el navegador o usá su aplicación oficial.",
    "Si ya hiciste clic y pusiste claves o datos de tarjeta, cambiá tus claves desde el sitio oficial y llamá a tu banco cuanto antes.",
    "Consultá con una persona de confianza antes de actuar."
  ];

  const AVISO_ENLACE = "Importante: este análisis solo mira cómo está escrito el enlace. No lo visita, no sabe qué contiene la página ni si figura en listas de sitios peligrosos. No puede garantizar que un enlace sea seguro.";

  const ENLACE_EJEMPLO = "http://mercadolibre-ayuda.xyz/login";


  /* ---------- PARTE 4: EL ANÁLISIS ---------- */

  function analizarEnlace(entrada) {
    const texto = entrada.trim();
    if (texto.length > 2000 || /\s/.test(texto)) { return { error: true }; }

    const tieneProtocolo = /^[a-z][a-z0-9+.\-]*:\/\//i.test(texto);
    let url;
    try {
      url = new URL(tieneProtocolo ? texto : "https://" + texto);
    } catch (e) {
      return { error: true };
    }

    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (host.indexOf(".") === -1) { return { error: true }; }

    const contexto = {
      url: url,
      host: host,
      hostBase: host.replace(/^www\./, ""),
      hostSinTildes: host.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      terminacion: host.split(".").pop()
    };

    const encontradas = [];
    let puntaje = 0;
    REGLAS_ENLACES.forEach(function (regla) {
      const resultado = regla.detecta(contexto);
      if (resultado) {
        let explicacion = regla.explicacion;
        if (typeof resultado === "string") { explicacion = explicacion + " " + resultado; }
        encontradas.push({ titulo: regla.titulo, explicacion: explicacion });
        puntaje += regla.peso;
      }
    });

    let nivel;
    if (puntaje === 0) { nivel = "ninguna"; }
    else if (puntaje <= 2) { nivel = "pocas"; }
    else if (puntaje <= 5) { nivel = "varias"; }
    else { nivel = "muchas"; }

    return { error: false, host: host, encontradas: encontradas, nivel: nivel };
  }


  /* ---------- PARTE 5: MOSTRAR EL RESULTADO ---------- */

  function crear(etiqueta, texto, clase) {
    const elemento = document.createElement(etiqueta);
    if (texto) { elemento.textContent = texto; }
    if (clase) { elemento.className = clase; }
    return elemento;
  }

  const caja = document.getElementById("resultado-enlace");
  const campo = document.getElementById("texto-enlace");

  function mostrarAviso(titulo, texto) {
    caja.replaceChildren();
    caja.className = "resultado resultado-ninguna";
    caja.appendChild(crear("h3", titulo));
    caja.appendChild(crear("p", texto));
    caja.hidden = false;
    caja.focus({ preventScroll: true });
  }

  function mostrarResultado(r) {
    const info = NIVELES_ENLACE[r.nivel];
    caja.replaceChildren();
    caja.className = "resultado resultado-" + r.nivel;

    const titulo = crear("h3", "");
    if (info.icono) {
      const icono = crear("span", info.icono, "resultado-icono");
      icono.setAttribute("aria-hidden", "true");
      titulo.appendChild(icono);
    }
    titulo.appendChild(document.createTextNode(info.titulo));
    caja.appendChild(titulo);
    caja.appendChild(crear("p", info.resumen));

    // Hacia dónde lleva realmente (solo texto, NO es un enlace)
    const destino = crear("div", "", "destino-enlace");
    destino.appendChild(crear("strong", "Este enlace lleva al sitio:"));
    destino.appendChild(crear("span", r.host, "dominio"));
    destino.appendChild(crear("p", "Lo que importa es la parte final del nombre, la última antes de la terminación (.com, .com.ar, etc.).", "destino-nota"));
    caja.appendChild(destino);

    if (r.encontradas.length > 0) {
      caja.appendChild(crear("h4", "Señales que encontramos"));
      const lista = crear("ul", "", "lista-senales");
      r.encontradas.forEach(function (senal) {
        const item = document.createElement("li");
        item.appendChild(crear("strong", senal.titulo));
        item.appendChild(document.createTextNode(senal.explicacion));
        lista.appendChild(item);
      });
      caja.appendChild(lista);
    }

    caja.appendChild(crear("h4", "Qué te recomendamos hacer"));
    const consejos = crear("ul", "", "lista-consejos");
    CONSEJOS_ENLACE.forEach(function (c) { consejos.appendChild(crear("li", c)); });
    caja.appendChild(consejos);

    caja.appendChild(crear("p", AVISO_ENLACE, "resultado-aviso"));

    caja.hidden = false;
    caja.scrollIntoView({ behavior: "smooth", block: "start" });
    caja.focus({ preventScroll: true });
  }

  function revisar() {
    const texto = campo.value.trim();
    if (texto === "") {
      mostrarAviso("Primero pegá un enlace", "Copiá el enlace que te mandaron (sin tocarlo), pegalo en el cuadro y volvé a apretar «Revisar enlace».");
      return;
    }
    const r = analizarEnlace(texto);
    if (r.error) {
      mostrarAviso("No pudimos reconocer un enlace", "Pegá solo el enlace, sin otras palabras. Si tenés el mensaje completo, usá la herramienta «Revisar un mensaje».");
      return;
    }
    mostrarResultado(r);
  }


  /* ---------- PARTE 6: CONECTAR LOS BOTONES ---------- */

  document.getElementById("boton-revisar-enlace").addEventListener("click", revisar);

  campo.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") { revisar(); }
  });

  document.getElementById("boton-ejemplo-enlace").addEventListener("click", function () {
    campo.value = ENLACE_EJEMPLO;
    campo.focus();
  });

  document.getElementById("boton-borrar-enlace").addEventListener("click", function () {
    campo.value = "";
    caja.replaceChildren();
    caja.hidden = true;
    campo.focus();
  });

})();