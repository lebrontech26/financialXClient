// Obtiene alertas del perfil actual o de la respuesta general.
function obtenerAlertas(cliente) {
  if (cliente.currentRiskProfile && Array.isArray(cliente.currentRiskProfile.alerts)) {
    return cliente.currentRiskProfile.alerts;
  }

  if (Array.isArray(cliente.alerts)) {
    return cliente.alerts;
  }

  return [];
}

export { obtenerAlertas };
