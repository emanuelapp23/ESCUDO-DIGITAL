/* ============================================
   ESCUDO DIGITAL - Analizador de mensajes
   Todo se ejecuta en el navegador de la persona.
   El texto no se envía ni se guarda en ningún lado.
   ============================================ */


/* ---------- PARTE 1: LAS REGLAS ----------
   Cada regla busca una señal de alerta en el texto.
   - titulo:      cómo se llama la señal
   - explicacion: por qué es una señal de alerta
   - peso:        qué tan importante es (1 = leve, 4 = muy importante)
   - patron:      las palabras que busca (escritas SIN tildes ni ñ,
                  porque el programa quita las tildes del mensaje antes de revisarlo)
   Para agregar una regla nueva, copiá un bloque entero y cambiá sus datos. */

const REGLAS_MENSAJES = [
   {
    titulo: "Habla de una compra o cargo que no reconocés",
    explicacion: "Es una estafa muy común: te asustan con una compra que no hiciste para que entres a un enlace y la \"canceles\". Para revisar un consumo, entrá a la app oficial de tu banco o llamá al número que figura en tu tarjeta, nunca desde un enlace de un mensaje.",
    peso: 3,
    patron: /(no reconoce|no reconoces|desconoce (esta|la) (compra|operacion|transaccion)|revertir (la |esta )?(operacion|compra|transaccion)|compra (por|de) (el )?monto|compra no autorizada|cargo no autorizado|consumo (no reconocido|sospechoso)|sitio (de comercio electronico )?extranjero|se debite|actividad (sospechosa|suspechosa))/
  }, {
    titulo: "Te apuran para que actúes sin pensar",
    explicacion: "Los estafadores crean urgencia para que no tengas tiempo de consultar con nadie.",
    peso: 2,
    patron: /(urgente|inmediatamente|de inmediato|ahora mismo|ultimo aviso|ultimas horas|en 24 horas|en 48 horas|hoy mismo|cuanto antes|lo antes posible)/
  },
  {
    titulo: "Amenaza con bloquear o cancelar algo",
    explicacion: "Es muy común que digan que tu cuenta, tarjeta o servicio será bloqueado para asustarte.",
    peso: 2,
    patron: /(cuenta (ha sido |fue |sera |va a ser |esta )?(bloquead|suspendid|cancelad|limitad|inhabilitad)|(bloqueo|suspension|cancelacion) de (tu|su) (cuenta|tarjeta|servicio)|dar de baja|actividad (inusual|sospechosa)|acceso no autorizado)/
  },
  {
    titulo: "Pide claves, códigos o datos de tarjeta",
    explicacion: "Ninguna empresa seria te pide contraseñas, códigos de verificación ni datos de tu tarjeta por mensaje.",
    peso: 4,
    patron: /(contrasena|clave|\bpin\b|codigo de (seguridad|verificacion|acceso|confirmacion)|codigo que (te|le) (llego|enviamos|mandamos)|\btoken\b|\bcvv\b|\bcvc\b|numero de (tu |su )?tarjeta|datos de (tu |su )?(tarjeta|cuenta)|clave fiscal|home banking)/
  },
  {
    titulo: "Menciona pagos, transferencias o criptomonedas",
    explicacion: "Los pedidos de dinero, adelantos o tarjetas de regalo son una señal típica de estafa.",
    peso: 2,
    patron: /(transferi|transferencia|deposit(a|e|o|ar)|\bgiro\b|gift ?card|tarjetas? de regalo|bitcoin|criptomoneda|usdt|adelanto|pago anticipado|abonar|abona)/
  },
  {
    titulo: "Dice que ganaste un premio o una herencia",
    explicacion: "Los premios que no pediste ni sorteos en los que no participaste suelen ser un engaño.",
    peso: 3,
    patron: /(ganaste|has ganado|felicitaciones|felicidades|premio|sorteo|sorteamos|fuiste seleccionad|has sido seleccionad|herencia|beneficiari)/
  },
  {
    titulo: "Parece un familiar con un problema o un número nuevo",
    explicacion: "Es una estafa frecuente: alguien se hace pasar por un familiar que cambió de número y necesita ayuda o dinero.",
    peso: 3,
    patron: /(cambie de (numero|celular)|mi nuevo (numero|celular)|nuevo numero|este es mi numero|perdi mi celular|tuve un accidente|estoy detenid|estoy en problemas|necesito ayuda urgente|(mama|papa|abuela|abuelo|tia|tio)[,!. ]+(soy yo|necesito|me paso))/
  },
  {
    titulo: "Te pide guardar el secreto",
    explicacion: "Los estafadores no quieren que consultes con otras personas, porque así podrías descubrir el engaño.",
    peso: 2,
    patron: /(no (se lo |le |lo )?(cuentes|digas|comentes|avises)( a nadie)?|en secreto|estrictamente confidencial)/
  },
  {
    titulo: "Pide instalar una aplicación o dar acceso remoto",
    explicacion: "Algunas estafas te piden instalar programas para controlar tu celular o computadora y vaciar tus cuentas.",
    peso: 3,
    patron: /(anydesk|teamviewer|rustdesk|quicksupport|instala (la |esta |una )?(app|aplicacion)|descarga (la |esta |una )?(app|aplicacion)|acceso remoto|control remoto)/
  },
  {
    titulo: "Promete ganancias fáciles o trabajo sin experiencia",
    explicacion: "Las inversiones con ganancias aseguradas y los trabajos fáciles muy bien pagados son un gancho común.",
    peso: 3,
    patron: /(ganancias? garantizad|ganancias? aseguradas?|gana dinero|inversion (segura|garantizada)|duplica(r|mos)? tu (dinero|inversion)|trabajo desde (casa|tu celular)|sin experiencia|ingresos extra|rendimiento garantizado)/
  },
  {
    titulo: "Incluye un enlace acortado",
    explicacion: "Los enlaces acortados esconden hacia qué página te llevan. Es una forma habitual de ocultar sitios falsos.",
    peso: 3,
    patron: /(bit\.ly|tinyurl|cutt\.ly|t\.co\/|goo\.gl|is\.gd|rb\.gy|shorturl|ow\.ly|wa\.link)/
  },
  {
    titulo: "Incluye un enlace o te pide hacer clic",
    explicacion: "Un enlace no es malo por sí solo, pero es la forma más común de llevarte a páginas falsas. No lo toques sin verificar quién te escribió.",
    peso: 1,
    patron: /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|info|xyz|top|click|online|site|link|ar)\b|hace clic|haga clic|click|ingresa (al|a este|en el) (siguiente )?(enlace|link)|entra (al|a este) (siguiente )?(enlace|link))/
  },
  {
    titulo: "Menciona un banco, organismo o empresa conocida",
    explicacion: "Los estafadores suelen hacerse pasar por bancos, ANSES, ARCA, correos o servicios conocidos. Esto no significa que el mensaje sea falso: confirmá siempre por el sitio o teléfono oficial.",
    peso: 1,
    patron: /(banco|\bafip\b|\barca\b|\banses\b|\bpami\b|mercado libre|mercado pago|correo argentino|andreani|policia|juzgado|fiscalia|soporte tecnico|netflix|microsoft|\bbna\b|galicia|santander|brubank|naranja x|uala)/
  }
];


/* ---------- PARTE 2: LOS TEXTOS DEL RESULTADO ---------- */

const TEXTOS_NIVEL = {
  ninguna: {
    titulo: "No encontramos señales de alerta conocidas",
    resumen: "Esto NO significa que el mensaje sea seguro. Esta herramienta solo reconoce algunas señales comunes y no puede confirmar quién lo envió ni qué intenciones tiene."
  },
  pocas: {
    titulo: "Encontramos alguna señal de alerta",
    resumen: "Hay pocos indicios, pero conviene ser cuidadoso. Verificá quién te escribió antes de responder."
  },
  varias: {
    titulo: "Encontramos señales de alerta importantes",
    resumen: "Este mensaje tiene características que aparecen seguido en estafas. No respondas ni hagas clic hasta verificarlo por un canal oficial."
  },
  muchas: {
    titulo: "Encontramos muchas señales de alerta",
    resumen: "Este mensaje se parece mucho a las estafas conocidas. Te recomendamos no responder, no tocar ningún enlace y no dar ningún dato."
  }
};

const CONSEJOS = [
  "No hagas clic en enlaces ni descargues archivos de ese mensaje.",
  "No compartas contraseñas, códigos que te lleguen por mensaje ni datos de tu tarjeta.",
  "Si dice ser de un banco u organismo, comunicate por el teléfono o el sitio oficial que ya conocés (no uses los datos del mensaje).",
  "Si parece un familiar, llamalo por su número de siempre antes de hacer cualquier cosa.",
  "Consultá con una persona de confianza antes de actuar."
];

const AVISO_FINAL = "Importante: este análisis solo busca señales conocidas en el texto. No puede confirmar si un mensaje es verdadero o falso, ni garantizar que sea seguro. Ante la duda, consultá con alguien de confianza o con la entidad por sus canales oficiales.";

const MENSAJE_EJEMPLO = "URGENTE: Su cuenta del Banco fue bloqueada por actividad sospechosa. Ingrese a bit.ly/ejemplo y confirme su clave y el código que le llegó en las próximas 24 horas.";


/* ---------- PARTE 3: EL ANÁLISIS ---------- */

// Pasa a minúsculas y quita las tildes, para que "Contraseña" y "contrasena" cuenten igual
function normalizarTexto(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function analizarMensaje(texto) {
  const limpio = normalizarTexto(texto);
  const encontradas = REGLAS_MENSAJES.filter(function (regla) {
    return regla.patron.test(limpio);
  });
  const puntaje = encontradas.reduce(function (suma, regla) {
    return suma + regla.peso;
  }, 0);

  let nivel;
  if (puntaje === 0) {
    nivel = "ninguna";
  } else if (puntaje <= 2) {
    nivel = "pocas";
  } else if (puntaje <= 5) {
    nivel = "varias";
  } else {
    nivel = "muchas";
  }

  return { encontradas: encontradas, nivel: nivel };
}


/* ---------- PARTE 4: MOSTRAR EL RESULTADO EN LA PÁGINA ---------- */

// Crea un elemento HTML con texto (usa textContent: más seguro que insertar HTML)
function crear(etiqueta, texto, clase) {
  const elemento = document.createElement(etiqueta);
  if (texto) { elemento.textContent = texto; }
  if (clase) { elemento.className = clase; }
  return elemento;
}

function mostrarResultado(resultado) {
  const caja = document.getElementById("resultado-mensaje");
  const info = TEXTOS_NIVEL[resultado.nivel];

  caja.replaceChildren();
  caja.className = "resultado resultado-" + resultado.nivel;

  caja.appendChild(crear("h3", info.titulo));
  caja.appendChild(crear("p", info.resumen));

  if (resultado.encontradas.length > 0) {
    caja.appendChild(crear("h4", "Señales que encontramos"));
    const lista = crear("ul", "", "lista-senales");
    resultado.encontradas.forEach(function (regla) {
      const item = document.createElement("li");
      item.appendChild(crear("strong", regla.titulo));
      item.appendChild(document.createTextNode(regla.explicacion));
      lista.appendChild(item);
    });
    caja.appendChild(lista);
  }

  caja.appendChild(crear("h4", "Qué te recomendamos hacer"));
  const consejos = crear("ul", "", "lista-consejos");
  CONSEJOS.forEach(function (consejo) {
    consejos.appendChild(crear("li", consejo));
  });
  caja.appendChild(consejos);

  caja.appendChild(crear("p", AVISO_FINAL, "resultado-aviso"));

  caja.hidden = false;
  caja.scrollIntoView({ behavior: "smooth", block: "start" });
  caja.focus({ preventScroll: true });
}

function mostrarMensajeVacio() {
  const caja = document.getElementById("resultado-mensaje");
  caja.replaceChildren();
  caja.className = "resultado resultado-ninguna";
  caja.appendChild(crear("h3", "Primero pegá un mensaje"));
  caja.appendChild(crear("p", "Copiá el texto que recibiste, pegalo en el cuadro de arriba y volvé a apretar «Revisar mensaje»."));
  caja.hidden = false;
  caja.focus({ preventScroll: true });
}


/* ---------- PARTE 5: CONECTAR LOS BOTONES ---------- */

const cuadroTexto = document.getElementById("texto-mensaje");
const cajaResultado = document.getElementById("resultado-mensaje");

document.getElementById("boton-revisar").addEventListener("click", function () {
  const texto = cuadroTexto.value.trim();
  if (texto === "") {
    mostrarMensajeVacio();
  } else {
    mostrarResultado(analizarMensaje(texto));
  }
});

document.getElementById("boton-ejemplo").addEventListener("click", function () {
  cuadroTexto.value = MENSAJE_EJEMPLO;
  cuadroTexto.focus();
});

document.getElementById("boton-borrar").addEventListener("click", function () {
  cuadroTexto.value = "";
  cajaResultado.replaceChildren();
  cajaResultado.hidden = true;
  cuadroTexto.focus();
});