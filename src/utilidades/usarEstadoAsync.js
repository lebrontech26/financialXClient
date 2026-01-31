import { useState } from 'react';

// Hook reutilizable para centralizar el manejo de estados asincronicos.
// Sirve para evitar duplicar la logica de cargando / error / datos.
function usarEstadoAsync(valorInicial) {
  // Estado interno del hook.
  // - cargando: indica si la operacion asincronica esta en curso
  // - error: almacena el error si la operacion falla
  // - datos: contiene el resultado (clientes, prestamos, etc.)
  let [estado, setEstado] = useState({
    cargando: false,
    error: null,
    datos: valorInicial
  });

  // Activa o desactiva el estado de carga y limpia errores cuando corresponde.
  function establecerCargando(valor) {
    setEstado(function actualizar(previo) {
      return {
        cargando: valor,
        error: valor ? null : previo.error,
        datos: previo.datos
      };
    });
  }

  // Registra un error sin perder los datos existentes.
  function establecerError(error) {
    setEstado(function actualizar(previo) {
      return {
        cargando: false,
        error: error,
        datos: previo.datos
      };
    });
  }

  // Define nuevos datos y limpia errores previos.
  function establecerDatos(datos) {
    setEstado(function actualizar(previo) {
      return {
        cargando: false,
        error: null,
        datos: datos
      };
    });
  }

  // Retorna el estado actual junto con las funciones para modificarlo.
  return {
    cargando: estado.cargando,
    error: estado.error,
    datos: estado.datos,
    establecerCargando: establecerCargando,
    establecerError: establecerError,
    establecerDatos: establecerDatos
  };
}

// Exporta el hook para reutilizarlo en distintos modulos.
export { usarEstadoAsync };
