import { manejarRespuesta } from './httpUtils.js';

let RUTA_BASE = '/api/Client';

// Solicita la lista paginada de clientes segun pagina, tamano y filtro de busqueda.
async function obtenerClientes(parametros, signal) {
  let pagina = parametros && parametros.page ? parametros.page : 1;
  let tamano = parametros && parametros.pageSize ? parametros.pageSize : 10;
  let consulta = '';

  if (parametros && parametros.searchTerm) {
    consulta = parametros.searchTerm;
  } else if (parametros && parametros.query) {
    consulta = parametros.query;
  }
  let estaActivo = true;

  if (parametros && typeof parametros.estaActivo === 'boolean') {
    estaActivo = parametros.estaActivo;
  }

  let queryString = construirQuery(pagina, tamano, consulta, estaActivo);
  let url = RUTA_BASE + '?' + queryString;

  let respuesta = await fetch(url, {
    method: 'GET',
    signal: signal
  });

  let datos = await manejarRespuesta(respuesta);
  return mapearListadoClientes(datos);
}

// Obtiene el detalle de un cliente por id.
async function obtenerClientePorId(id) {
  let respuesta = await fetch(RUTA_BASE + '/' + id, {
    method: 'GET'
  });

  let datos = await manejarRespuesta(respuesta);
  return mapearClienteDetalle(datos);
}

// Crea un cliente nuevo con los datos del formulario.
async function crearCliente(payload) {
  let payloadApi = mapearPayloadCrear(payload);

  let respuesta = await fetch(RUTA_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payloadApi)
  });

  let datos = await manejarRespuesta(respuesta);
  return mapearClienteCreado(datos);
}

// Actualiza los datos editables de un cliente existente.
async function actualizarCliente(id, payload) {
  let payloadApi = mapearPayloadActualizar(id, payload);

  let respuesta = await fetch(RUTA_BASE, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payloadApi)
  });

  return await manejarRespuesta(respuesta);
}

// Elimina un cliente de forma logica desde el listado.
async function eliminarCliente(id) {
  let respuesta = await fetch(RUTA_BASE + '/' + id, {
    method: 'DELETE'
  });

  return await manejarRespuesta(respuesta);
}

// Construye el query string con los parametros requeridos por el backend.
function construirQuery(pagina, tamano, consulta, estaActivo) {
  let parametros = new URLSearchParams();
  parametros.set('page', String(pagina));
  parametros.set('pageSize', String(tamano));
  parametros.set('estaActivo', String(estaActivo));

  if (consulta) {
    parametros.set('searchTerm', consulta);
  }

  return parametros.toString();
}

// Convierte el payload del formulario al contrato esperado por el backend.
function mapearPayloadCrear(payload) {
  let datos = payload ? payload : {};

  return {
    Cuil: datos.cuil,
    Nombre: datos.firstName,
    Apellido: datos.lastName,
    FechaNacimiento: datos.birthDate,
    Telefono: datos.phone,
    Calle: datos.street,
    Localidad: datos.locality,
    Provincia: datos.province
  };
}

// Arma el payload de actualizacion con el Id requerido por la API.
function mapearPayloadActualizar(id, payload) {
  let datos = payload ? payload : {};

  return {
    Id: id,
    Nombre: datos.firstName,
    Apellido: datos.lastName,
    FechaNacimiento: datos.birthDate,
    Telefono: datos.phone,
    Calle: datos.street,
    Localidad: datos.locality,
    Provincia: datos.province
  };
}

// Convierte el listado de clientes de la API a la forma usada por la UI.
function mapearListadoClientes(respuesta) {
  if (!respuesta) {
    return respuesta;
  }

  let items = Array.isArray(respuesta.items)
    ? respuesta.items.map(function mapearItem(item) {
      return mapearClienteListado(item);
    })
    : [];

  return {
    items: items,
    totalCount: respuesta.totalCount,
    page: respuesta.pagedIndex !== undefined ? respuesta.pagedIndex : respuesta.page,
    pageSize: respuesta.pageSize
  };
}

// Convierte un cliente del listado al formato esperado por la UI.
function mapearClienteListado(item) {
  if (!item) {
    return item;
  }

  return {
    id: item.id,
    cuil: item.cuil,
    firstName: item.nombre,
    lastName: item.apellido,
    score: item.puntajeFinal,
    category: item.categoria,
    sinEvidenciaCrediticia: !!item.sinEvidenciaCrediticia
  };
}

// Convierte la respuesta de creacion a la forma usada por la UI.
function mapearClienteCreado(item) {
  if (!item) {
    return item;
  }

  return {
    id: item.id,
    cuil: item.cuil,
    firstName: item.nombre,
    lastName: item.apellido,
    score: item.scoreFinal,
    category: item.categoria,
    sinEvidenciaCrediticia: !!item.sinEvidenciaCrediticia
  };
}

// Convierte el detalle de cliente a la estructura usada por la UI.
function mapearClienteDetalle(item) {
  if (!item) {
    return item;
  }

  let direccion = {
    street: item.calle,
    locality: item.localidad,
    province: item.provincia
  };

  let perfilActual = item.perfilActual ? mapearPerfilActual(item.perfilActual) : null;
  let historial = Array.isArray(item.historialScoring)
    ? item.historialScoring.map(function mapearHistorialItem(historialItem) {
      return mapearHistorialScoring(historialItem);
    })
    : [];

  if (perfilActual && (!perfilActual.alerts || perfilActual.alerts.length === 0) && historial.length > 0) {
    perfilActual.alerts = historial[0].alerts;
  }

  let resumenFinanciero = item.resumenFinanciero
    ? mapearResumenFinanciero(item.resumenFinanciero)
    : null;

  return {
    id: item.id,
    cuil: item.cuil,
    firstName: item.nombre,
    lastName: item.apellido,
    birthDate: item.fechaNacimiento,
    phone: item.telefono,
    street: item.calle,
    locality: item.localidad,
    province: item.provincia,
    personalData: {
      firstName: item.nombre,
      lastName: item.apellido,
      birthDate: item.fechaNacimiento,
      phone: item.telefono,
      address: direccion
    },
    address: direccion,
    currentRiskProfile: perfilActual,
    scoringHistory: historial,
    financialSummary: resumenFinanciero
  };
}

// Mapea el resumen financiero del backend al formato esperado por la UI.
function mapearResumenFinanciero(resumen) {
  if (!resumen || !Array.isArray(resumen.items)) {
    return null;
  }

  return {
    items: resumen.items.map(function mapearItem(item) {
      return {
        title: item.titulo,
        text: item.texto,
        badge: item.icono
      };
    })
  };
}

// Mapea el perfil actual de riesgo.
function mapearPerfilActual(perfil) {
  return {
    scoreFinal: perfil.puntajeFinal,
    category: perfil.categoria,
    sinEvidenciaCrediticia: !!perfil.sinEvidenciaCrediticia,
    lastCalculatedAt: perfil.calculadoEn,
    alerts: []
  };
}

// Mapea un registro de historial de scoring.
function mapearHistorialScoring(item) {
  let ajustes = Array.isArray(item.ajustes)
    ? item.ajustes.map(function mapearAjuste(ajuste) {
      return {
        description: ajuste.descripcion ? ajuste.descripcion : ajuste.tipoAjuste,
        value: ajuste.valor
      };
    })
    : [];

  return {
    id: item.id,
    calculatedAt: item.calculadoEn,
    scoreBase: item.puntajeBase,
    scoreFinal: item.puntajeFinal,
    category: item.categoria,
    sinEvidenciaCrediticia: !!item.sinEvidenciaCrediticia,
    adjustments: ajustes,
    alerts: Array.isArray(item.alertas) ? item.alertas : [],
    reasons: []
  };
}

export {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente
};
