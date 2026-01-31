// Genera el texto interpretativo segun la categoria de riesgo actual.
function obtenerTextoInterpretativo(categoria) {
  if (categoria === 1) {
    return 'El cliente presenta un perfil de riesgo bajo segun su comportamiento crediticio historico.';
  }
  if (categoria === 2) {
    return 'El cliente presenta un perfil de riesgo medio-bajo, con senales moderadas en su historial crediticio.';
  }
  if (categoria === 3) {
    return 'El cliente presenta un perfil de riesgo medio. Se recomienda revisar alertas y antecedentes antes de avanzar.';
  }
  if (categoria === 4) {
    return 'El cliente presenta un perfil de riesgo alto segun su historial crediticio. Se recomienda cautela operativa.';
  }
  return 'El cliente presenta un perfil de riesgo critico. Se recomienda una validacion reforzada antes de operar.';
}

// Obtiene el texto de la categoria para mostrar en el historial.
function obtenerTextoCategoria(categoria) {
  let valor = normalizarCategoria(categoria);

  if (valor === 1) {
    return 'Bajo';
  }
  if (valor === 2) {
    return 'Medio-Bajo';
  }
  if (valor === 3) {
    return 'Medio';
  }
  if (valor === 4) {
    return 'Alto';
  }
  return 'Critico';
}

// Convierte la categoria a numero y aplica un valor seguro por defecto.
function normalizarCategoria(categoria) {
  let valor = Number(categoria);

  if (Number.isNaN(valor) || valor < 1 || valor > 5) {
    return 5;
  }

  return valor;
}

export { obtenerTextoInterpretativo, obtenerTextoCategoria, normalizarCategoria };
