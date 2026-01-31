import {
  obtenerPrestamosMock,
  obtenerPrestamosPorClienteMock,
  obtenerPrestamoMock,
  simularPrestamoMock,
  crearPrestamoEstandarMock,
  crearPrestamoDiscrecionalMock,
  registrarPagoMock,
  ejecutarGarantiaMock
} from '../datos/prestamosMock.js';
import { API_URL, manejarRespuesta, usarMocks } from './httpUtils.js';

let RUTA_BASE = API_URL + '/api/prestamos';

// Solicita el listado paginado de prestamos con filtros opcionales.
async function obtenerPrestamos(parametros, signal) {
  if (usarMocks()) {
    return await obtenerPrestamosMock(parametros, signal);
  }

  let pagina = parametros && parametros.pagina ? parametros.pagina : 1;
  let tamanio = parametros && parametros.tamanioPagina ? parametros.tamanioPagina : 10;
  let estado = parametros && parametros.estado ? parametros.estado : '';
  let queryString = construirQuery(pagina, tamanio, estado);
  let url = RUTA_BASE + '?' + queryString;

  let respuesta = await fetch(url, {
    method: 'GET',
    signal: signal
  });

  return await manejarRespuesta(respuesta);
}

// Obtiene el detalle de un prestamo por id.
async function obtenerPrestamoPorId(id, signal) {
  if (usarMocks()) {
    return await obtenerPrestamoMock(id, signal);
  }

  let respuesta = await fetch(RUTA_BASE + '/' + id, {
    method: 'GET',
    signal: signal
  });

  return await manejarRespuesta(respuesta);
}

// Solicita las opciones de simulacion para un cliente con monto definido.
async function simularPrestamo(idCliente, monto, signal) {
  if (usarMocks()) {
    return await simularPrestamoMock(idCliente, monto, signal);
  }

  let url = construirUrlSimulacion(idCliente, monto);
  let respuesta = await fetch(url, {
    method: 'GET',
    signal: signal
  });

  return await manejarRespuesta(respuesta);
}

// Obtiene los prestamos asociados a un cliente.
async function obtenerPrestamosPorCliente(idCliente, signal) {
  if (usarMocks()) {
    return await obtenerPrestamosPorClienteMock(idCliente, signal);
  }

  let url = RUTA_BASE + '?idCliente=' + encodeURIComponent(idCliente);
  let respuesta = await fetch(url, {
    method: 'GET',
    signal: signal
  });

  return await manejarRespuesta(respuesta);
}

// Crea un prestamo estandar con seleccion guiada y garantia.
async function crearPrestamoEstandar(datos) {
  if (usarMocks()) {
    return await crearPrestamoEstandarMock(datos);
  }

  let respuesta = await fetch(RUTA_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });

  return await manejarRespuesta(respuesta);
}

// Crea un prestamo discrecional autorizado por ADMIN.
async function crearPrestamoDiscrecional(datos) {
  if (usarMocks()) {
    return await crearPrestamoDiscrecionalMock(datos);
  }

  let respuesta = await fetch(RUTA_BASE + '/discrecional', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });

  return await manejarRespuesta(respuesta);
}

// Registra un pago asociado al prestamo.
async function registrarPago(idPrestamo, datosPago) {
  if (usarMocks()) {
    return await registrarPagoMock(idPrestamo, datosPago);
  }

  let respuesta = await fetch(RUTA_BASE + '/' + idPrestamo + '/pagos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosPago)
  });

  return await manejarRespuesta(respuesta);
}

// Ejecuta la garantia para un prestamo en incumplimiento.
async function ejecutarGarantia(idPrestamo) {
  if (usarMocks()) {
    return await ejecutarGarantiaMock(idPrestamo);
  }

  let respuesta = await fetch(RUTA_BASE + '/' + idPrestamo + '/ejecutar-garantia', {
    method: 'POST'
  });

  return await manejarRespuesta(respuesta);
}

// Construye el query string con los parametros requeridos por el backend.
function construirQuery(pagina, tamanio, estado) {
  let parametros = new URLSearchParams();
  parametros.set('pagina', String(pagina));
  parametros.set('tamanioPagina', String(tamanio));

  if (estado) {
    parametros.set('estado', estado);
  }

  return parametros.toString();
}

// Construye la url de simulacion con monto opcional.
function construirUrlSimulacion(idCliente, monto) {
  let parametros = new URLSearchParams();
  parametros.set('idCliente', String(idCliente));

  if (monto !== undefined && monto !== null && monto !== '') {
    parametros.set('monto', String(monto));
  }

  return RUTA_BASE + '/simulaciones?' + parametros.toString();
}

export {
  obtenerPrestamos,
  obtenerPrestamoPorId,
  obtenerPrestamosPorCliente,
  simularPrestamo,
  crearPrestamoEstandar,
  crearPrestamoDiscrecional,
  registrarPago,
  ejecutarGarantia
};
