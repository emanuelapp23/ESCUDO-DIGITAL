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