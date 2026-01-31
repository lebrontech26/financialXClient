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

// Todos los servicios de prestamos usan datos mock mientras el backend
// no implemente /api/prestamos.

// Solicita el listado paginado de prestamos con filtros opcionales.
async function obtenerPrestamos(parametros, signal) {
  return await obtenerPrestamosMock(parametros, signal);
}

// Obtiene el detalle de un prestamo por id.
async function obtenerPrestamoPorId(id, signal) {
  return await obtenerPrestamoMock(id, signal);
}

// Solicita las opciones de simulacion para un cliente con monto definido.
async function simularPrestamo(idCliente, monto, signal) {
  return await simularPrestamoMock(idCliente, monto, signal);
}

// Obtiene los prestamos asociados a un cliente.
async function obtenerPrestamosPorCliente(idCliente, signal) {
  return await obtenerPrestamosPorClienteMock(idCliente, signal);
}

// Crea un prestamo estandar con seleccion guiada y garantia.
async function crearPrestamoEstandar(datos) {
  return await crearPrestamoEstandarMock(datos);
}

// Crea un prestamo discrecional autorizado por ADMIN.
async function crearPrestamoDiscrecional(datos) {
  return await crearPrestamoDiscrecionalMock(datos);
}

// Registra un pago asociado al prestamo.
async function registrarPago(idPrestamo, datosPago) {
  return await registrarPagoMock(idPrestamo, datosPago);
}

// Ejecuta la garantia para un prestamo en incumplimiento.
async function ejecutarGarantia(idPrestamo) {
  return await ejecutarGarantiaMock(idPrestamo);
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
