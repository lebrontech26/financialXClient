import { obtenerDashboardMock } from '../datos/dashboardMock.js';

// Solicita el resumen general del dashboard de Inicio.
// Usa datos mock mientras el backend no implemente /api/dashboard/inicio.
async function obtenerDashboard(signal) {
  return await obtenerDashboardMock(signal);
}

export { obtenerDashboard };
