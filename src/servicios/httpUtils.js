// Helpers compartidos para consumir APIs y normalizar respuestas.

// Determina si el modo demo con datos mock esta activado.
function usarMocks() {
  if (typeof globalThis !== 'undefined' && globalThis.__VITE_USAR_MOCKS__ === true) {
    return true;
  }

  if (typeof process !== 'undefined' && process.env && process.env.VITE_USAR_MOCKS === 'true') {
    return true;
  }

  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_USAR_MOCKS === 'true') {
    return true;
  }

  return false;
}

// Maneja la respuesta HTTP y normaliza errores cuando corresponde.
async function manejarRespuesta(respuesta) {
  if (respuesta.ok) {
    if (respuesta.status === 204) {
      return null;
    }
    return await leerJsonSeguro(respuesta);
  }

  let errorNormalizado = await normalizarError(respuesta);
  throw errorNormalizado;
}

// Extrae el cuerpo JSON sin romper la ejecucion si la respuesta no tiene cuerpo.
async function leerJsonSeguro(respuesta) {
  try {
    let texto = await respuesta.text();

    if (!texto) {
      return null;
    }

    try {
      return JSON.parse(texto);
    } catch (error) {
      return texto;
    }
  } catch (error) {
    return null;
  }
}

// Convierte diferentes codigos de estado en mensajes consistentes para la UI.
async function normalizarError(respuesta) {
  let cuerpo = await leerJsonSeguro(respuesta);
  let mensaje = 'Error inesperado';
  let detalles = null;

  if (respuesta.status === 400) {
    mensaje = 'Error de validacion';
  }

  if (respuesta.status === 403) {
    mensaje = 'Permisos insuficientes';
  }

  if (respuesta.status === 404) {
    mensaje = 'Recurso no encontrado';
  }

  if (respuesta.status === 409) {
    mensaje = 'Conflicto de datos';
  }

  if (respuesta.status >= 500) {
    mensaje = 'Error interno del servidor';
  }

  if (typeof cuerpo === 'string' && cuerpo.trim()) {
    mensaje = cuerpo;
  }

  if (cuerpo && typeof cuerpo === 'object') {
    if (cuerpo.errors) {
      detalles = cuerpo.errors;
    } else if (cuerpo.details) {
      detalles = cuerpo.details;
    }

    if (cuerpo.message) {
      mensaje = cuerpo.message;
    } else if (!cuerpo.errors && cuerpo.title) {
      mensaje = cuerpo.title;
    }
  }

  return {
    status: respuesta.status,
    message: mensaje,
    details: detalles
  };
}

export { usarMocks, manejarRespuesta };
