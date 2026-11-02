 🛡️ Escudo Digital

Herramienta **gratuita** para detectar **señales de alerta** de estafas digitales en mensajes, enlaces y capturas de pantalla. Está pensada para adultos mayores y personas con pocos conocimientos tecnológicos.

🌐 **Probala acá:** https://emanuelapp23.github.io/ESCUDO-DIGITAL/

> ⚠️ **Escudo Digital no puede asegurar que algo sea seguro.** Solo busca señales de alerta conocidas. Que no encuentre ninguna **no significa** que un mensaje, enlace o imagen sea confiable. Ante la duda: no hagas clic, no des datos y verificá por los canales oficiales.

---

## ¿Qué hace?

| Función | Qué revisa |
|---|---|
| 💬 **Revisar un mensaje** | Busca señales típicas de estafa en un texto: urgencia, amenazas de bloqueo, pedidos de claves o códigos, premios, transferencias, "mamá, cambié de número", pedidos de instalar programas, entre otras. |
| 🔗 **Revisar un enlace** | Analiza **cómo está escrito** el enlace: acortadores, direcciones numéricas, nombres que imitan marcas (por ejemplo `mercadol1bre.com`), terminaciones poco habituales, `@` ocultos y más. Muestra a qué sitio lleva realmente. |
| 📷 **Revisar una captura** | Lee el texto de una imagen con OCR y lo pasa por el analizador de mensajes. El texto leído se puede corregir antes de revisarlo. |
| 🆘 **Ya hice clic** | Guía de qué hacer, en orden, si ya se hizo clic, se dieron datos o se hizo un pago. |
| 📚 **Aprender** | Consejos básicos y una práctica de 8 mensajes inventados ("¿estafa o mensaje real?"). |
| 📋 **Copiar resumen** | Genera un resumen del análisis (sin el mensaje original) para mostrárselo a alguien de confianza. |

## Principios del proyecto

- **Costo cero:** sin servidores propios, sin APIs pagas ni suscripciones.
- **Privacidad:** el análisis ocurre en el navegador de la persona. Los mensajes y enlaces no se envían a ningún servidor, y la página no guarda datos.
- **Honestidad:** nunca afirma que algo es seguro. Los resultados siempre explican *por qué* se marcó una señal y recuerdan sus límites.
- **Accesibilidad:** letra grande, buen contraste, botones amplios, bajo brillo y los niveles de alerta con título escrito, no solo color.

## Límites conocidos

- Las reglas están escritas **a mano** a partir de patrones comunes de estafas. Es posible que pasen por alto estafas nuevas o que marquen mensajes legítimos.
- El analizador de enlaces **no visita** la página ni la compara con listas de sitios peligrosos: solo revisa la forma del enlace.
- La lista de marcas y organismos es corta y conviene verificarla y ampliarla.
- El OCR puede equivocarse con letra chica, fondos oscuros o imágenes borrosas.
- Una captura tiene más información que su texto (número del remitente, aspecto del mensaje). Esta herramienta solo analiza el texto.
- La guía "Ya hice clic" reúne pasos generales y **no reemplaza** el asesoramiento de un banco ni de un profesional. Antes de usarla como guía oficial, conviene revisarla con las entidades correspondientes.
- Los mensajes de práctica son **inventados**.

## Cómo está hecho

Sitio estático con HTML, CSS y JavaScript, sin frameworks ni pasos de compilación.

```
escudo-digital/
├── index.html
├── css/
│   └── estilos.css
├── img/                       (logos)
└── js/
    ├── analizador-mensajes.js
    ├── analizador-enlaces.js
    ├── analizador-capturas.js
    ├── simulacro.js
    └── copiar-resumen.js
```

## Cómo probarlo en tu computadora

1. Descargá o cloná el repositorio.
2. Abrilo con [Visual Studio Code](https://code.visualstudio.com/) y la extensión **Live Server**.
3. Clic derecho sobre `index.html` → **Open with Live Server**.

La lectura de capturas necesita servir la página con `http://` o `https://` (por eso Live Server), no abrir el archivo con doble clic.

## Cómo mejorar las reglas

- **Mensajes:** en `js/analizador-mensajes.js`, copiá un bloque dentro de `REGLAS_MENSAJES` y cambiá su título, explicación, peso y patrón. Los patrones se escriben **sin tildes ni ñ**.
- **Enlaces:** en `js/analizador-enlaces.js`, la lista `MARCAS` define qué dominios son oficiales y las reglas se agregan en `REGLAS_ENLACES`.
- **Práctica:** en `js/simulacro.js`, la lista `MENSAJES` admite nuevos casos. Si agregás estafas reales, quitá antes todo dato personal.

## Servicios externos

La lectura de capturas usa [Tesseract.js](https://github.com/naptha/tesseract.js), una librería de OCR gratuita y de código abierto. La librería y los datos del idioma se descargan desde un CDN la primera vez que se usa esa función. **La imagen en sí no se sube a ningún servidor.**

## Autor

Creado por **Emanuel Larrauri**.

## Licencia

Todavía no se eligió una licencia. Hasta entonces, todos los derechos están reservados por el autor. Si querés que otras personas puedan reutilizar o adaptar el proyecto, conviene agregar una licencia (por ejemplo, desde la opción "Add file → Create new file → LICENSE" de GitHub).
