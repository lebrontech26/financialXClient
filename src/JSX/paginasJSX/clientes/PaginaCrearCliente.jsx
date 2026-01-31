import { useState } from 'react';
import '../../../CSS/paginasCSS/clientes/PaginaCrearCliente.css';
import FormularioCliente from '../../moleculasJSX/clientes/FormularioCliente.jsx';
import { crearCliente } from '../../../servicios/clientsApi.js';
import { usarEstadoAsync } from '../../../utilidades/usarEstadoAsync.js';

// Pagina encargada de orquestar el alta de clientes y la interaccion con el backend.
function PaginaCrearCliente(props) {
  let [mensajeEstado, setMensajeEstado] = useState('');
  let estadoEnvio = usarEstadoAsync(null);

  // Retorna al listado principal de clientes.
  function volverALista() {
    if (props.onNavegar) {
      props.onNavegar('/clients');
    }
  }

  // Envia el payload de creacion y maneja el flujo segun la respuesta del backend.
  function manejarCrearCliente(payload) {
    setMensajeEstado('Calculando scoring / consultando BCRA...');
    estadoEnvio.establecerCargando(true);

    crearCliente(payload)
      .then(function manejarRespuesta(respuesta) {
        setMensajeEstado('Cliente creado correctamente.');
        estadoEnvio.establecerDatos(respuesta);

        if (respuesta && respuesta.id) {
          if (props.onNavegar) {
            props.onNavegar('/clients/' + respuesta.id);
          }
          return;
        }

        volverALista();
      })
      .catch(function manejarError(error) {
        let mensaje = 'Ocurrio un error al crear el cliente.';

        if (error && error.status === 400) {
          if (error.message && error.message !== 'Error de validacion') {
            mensaje = error.message;
          } else {
            mensaje = 'Revisa los datos ingresados e intenta nuevamente.';
          }
        } else if (error && error.status >= 500) {
          mensaje = 'Error del servidor. Intenta mas tarde.';
        }

        setMensajeEstado('');
        estadoEnvio.establecerError({
          mensaje: mensaje,
          detalles: error && error.details ? error.details : null
        });
      });
  }

  return (
    <section className="pagina-crear-cliente">
      <header>
        <h1>Nuevo Cliente</h1>
        <p>Completa los datos para dar de alta un cliente.</p>
      </header>

      {estadoEnvio.error && (
        <section className="pagina-crear-cliente__error">
          <strong>{estadoEnvio.error.mensaje}</strong>
          {estadoEnvio.error.detalles && renderizarDetallesError(estadoEnvio.error.detalles)}
        </section>
      )}

      <FormularioCliente
        onEnviar={manejarCrearCliente}
        onCancelar={volverALista}
        textoEnviar="Guardar"
        mensajeEstado={mensajeEstado}
        deshabilitado={estadoEnvio.cargando}
      />
    </section>
  );
}

// Renderiza errores de validacion devueltos por el backend.
function renderizarDetallesError(detalles) {
  if (typeof detalles !== 'object') {
    return null;
  }

  let entradas = Object.entries(detalles);

  if (entradas.length === 0) {
    return null;
  }

  return (
    <ul>
      {entradas.map(function renderItem(entrada) {
        return (
          <li key={entrada[0]}>
            {entrada[0]}: {String(entrada[1])}
          </li>
        );
      })}
    </ul>
  );
}

export default PaginaCrearCliente;
