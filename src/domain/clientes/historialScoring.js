// Ordena el historial de scoring de forma descendente por fecha.
function ordenarHistorial(historial) {
  if (!Array.isArray(historial)) {
    return [];
  }

  return historial.slice().sort(function comparar(a, b) {
    return new Date(b.calculatedAt) - new Date(a.calculatedAt);
  });
}

// Resume los ajustes en una frase corta para la tabla.
function resumirAjustes(ajustes) {
  if (!Array.isArray(ajustes) || ajustes.length === 0) {
    return 'Sin ajustes';
  }
  return ajustes.length + ' ajustes';
}

// Resume motivos en una frase corta para la tabla principal.
function resumirMotivos(motivos) {
  if (!Array.isArray(motivos) || motivos.length === 0) {
    return 'Sin motivos';
  }
  return motivos
    .slice(0, 2)
    .map(function convertir(motivo) {
      return String(motivo);
    })
    .join(', ');
}

export { ordenarHistorial, resumirAjustes, resumirMotivos };
