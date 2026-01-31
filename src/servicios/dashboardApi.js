import { obtenerDashboardMock } from '../datos/dashboardMock.js';
import { manejarRespuesta, usarMocks } from './httpUtils.js';

let RUTA_BASE = '/api/dashboard/inicio';

// Solicita el resumen general del dashboard de Inicio.
async function obtenerDashboard(signal) {
  if (usarMocks()) {
    return await obtenerDashboardMock(signal);
  }

  let respuesta = await fetch(RUTA_BASE, {
    method: 'GET',
    signal: signal
  });

  return await manejarRespuesta(respuesta);
}

export { obtenerDashboard };
