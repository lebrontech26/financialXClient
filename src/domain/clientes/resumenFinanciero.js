// Construye cards interpretadas para el resumen financiero.
function construirResumenFinanciero(cliente, sinEvidencia) {
  let titulos = [
    'Situacion crediticia actual',
    'Historial crediticio (ultimos 24 meses)',
    'Recencia de la mora',
    'Relacion con entidades financieras',
    'Cheques rechazados'
  ];

  let summary = cliente.financialSummary;
  let mapaResumen = construirMapaResumen(summary);
  let tarjetas = titulos.map(function crearTarjeta(titulo) {
    if (mapaResumen[titulo]) {
      return mapaResumen[titulo];
    }
    return construirFallbackResumen(titulo, cliente);
  });

  if (sinEvidencia) {
    tarjetas.push({
      titulo: 'Evidencia crediticia',
      texto: 'No se detecta evidencia crediticia suficiente en BCRA.',
      badge: 'Sin evidencia'
    });
  }

  return tarjetas;
}

// Construye un mapa rapido cuando el backend entrega resumen interpretado.
function construirMapaResumen(summary) {
  let mapa = {};

  if (summary && Array.isArray(summary.items)) {
    summary.items.forEach(function mapearItem(item) {
      if (item && item.title) {
        let texto = item.text ? item.text : item.description ? item.description : '';
        mapa[item.title] = {
          titulo: item.title,
          texto: texto,
          badge: item.badge
        };
      }
    });
  }

  return mapa;
}

// Fallback cuando el backend aun no envia resumen interpretado.
function construirFallbackResumen(titulo, cliente) {
  if (titulo === 'Situacion crediticia actual') {
    let situacion = obtenerValorNumerico(cliente, 'maxSituacionActual');
    let texto = interpretarSituacion(situacion);
    return { titulo: titulo, texto: texto };
  }

  if (titulo === 'Cheques rechazados') {
    let cheques = obtenerValorNumerico(cliente, 'chequesRechazados');
    let textoCheque = interpretarCheques(cheques);
    return { titulo: titulo, texto: textoCheque };
  }

  return {
    titulo: titulo,
    texto: 'Sin datos suficientes para interpretar este indicador.'
  };
}

// Traduce valores de situacion crediticia a mensajes legibles.
function interpretarSituacion(valor) {
  if (valor === null || valor === undefined) {
    return 'Sin datos suficientes para interpretar la situacion.';
  }
  if (valor === 1) {
    return 'Situacion normal, sin incidencias relevantes.';
  }
  if (valor === 2) {
    return 'Riesgo bajo con senales menores en el comportamiento crediticio.';
  }
  if (valor === 3) {
    return 'Dificultades parciales detectadas en el historial reciente.';
  }
  return 'Compromiso alto, se observan incidencias significativas.';
}

// Interpreta la cantidad de cheques rechazados con texto amigable.
function interpretarCheques(valor) {
  if (valor === null || valor === undefined) {
    return 'Sin datos suficientes para interpretar cheques rechazados.';
  }
  if (valor === 0) {
    return 'No se registran cheques rechazados.';
  }
  return 'Se registran ' + valor + ' cheques rechazados.';
}

// Intenta leer un valor numerico de diferentes posiciones del objeto cliente.
function obtenerValorNumerico(cliente, clave) {
  if (!cliente) {
    return null;
  }

  if (cliente.financialSummary && typeof cliente.financialSummary[clave] === 'number') {
    return cliente.financialSummary[clave];
  }

  if (typeof cliente[clave] === 'number') {
    return cliente[clave];
  }

  return null;
}

export {
  construirResumenFinanciero,
  construirMapaResumen,
  construirFallbackResumen,
  interpretarSituacion,
  interpretarCheques,
  obtenerValorNumerico
};
