import { useEffect, useState } from 'react';
import '../../../CSS/paginasCSS/clientes/PaginaEditarCliente.css';
import Boton from '../../atomicosJSX/clientes/Boton.jsx';
import FormularioCliente from '../../moleculasJSX/clientes/FormularioCliente.jsx';
import { obtenerClientePorId, actualizarCliente } from '../../../servicios/clientsApi.js';
import { usarEstadoAsync } from '../../../utilidades/usarEstadoAsync.js';

// Pagina de edicion de cliente con CUIL bloqueado segun requisitos.
function PaginaEditarCliente(props) {
  let [mensajeEstado, setMensajeEstado] = useState('');
  let estadoDetalle = usarEstadoAsync(null);
  let estadoEnvio = usarEstadoAsync(null);

  // Vuelve al detalle del cliente actual.
  function volverADetalle() {
    if (props.onNavegar && props.idCliente) {
      props.onNavegar('/clients/' + props.idCliente);
    }
  }

  // Vuelve al listado principal cuando no existe el cliente.
  function volverALista() {
    if (props.onNavegar) {
      props.onNavegar('/clients');
    }
  }

  // Carga el cliente seleccionado para prellenar el formulario de edicion.
  function cargarCliente() {
    if (!props.idCliente) {
      return;
    }

    estadoDetalle.establecerCargando(true);

    obtenerClientePorId(props.idCliente)
      .then(function manejarDatos(datos) {
        estadoDetalle.establecerDatos(datos);
      })
      .catch(function manejarError(error) {
        estadoDetalle.establecerError(error);
      });
  }

  useEffect(cargarCliente, [props.idCliente]);

  // Envia la actualizacion al backend y navega al detalle si todo sale bien.
  function manejarActualizarCliente(payload) {
    if (!props.idCliente) {
      return;
    }

    setMensajeEstado('Actualizando cliente...');
    estadoEnvio.establecerCargando(true);

    actualizarCliente(props.idCliente, payload)
      .then(function manejarRespuesta() {
        setMensajeEstado('Cliente actualizado correctamente.');
        estadoEnvio.establecerDatos(true);
        volverADetalle();
      })
      .catch(function manejarError(error) {
        let mensaje = 'Ocurrio un error al actualizar el cliente.';

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

  if (estadoDetalle.cargando) {
    return (
      <section className="pagina-editar-cliente">
        <p>Cargando cliente...</p>
      </section>
    );
  }

  if (estadoDetalle.error) {
    if (estadoDetalle.error.status === 404) {
      return (
        <section className="pagina-editar-cliente">
          <h1>Cliente no encontrado</h1>
          <Boton texto="Volver" tipo="secundario" onClick={volverALista} />
        </section>
      );
    }

    return (
      <section className="pagina-editar-cliente">
        <h1>Ocurrio un error</h1>
        <Boton texto="Reintentar" tipo="secundario" onClick={cargarCliente} />
      </section>
    );
  }

  let datosFormulario = mapearDatosFormulario(estadoDetalle.datos);

  return (
    <section className="pagina-editar-cliente">
      <header>
        <h1>Editar Cliente</h1>
        <p>Actualiza datos basicos del cliente seleccionado.</p>
      </header>

      {estadoEnvio.error && (
        <section className="pagina-editar-cliente__error">
          <strong>{estadoEnvio.error.mensaje}</strong>
          {estadoEnvio.error.detalles && renderizarDetallesError(estadoEnvio.error.detalles)}
        </section>
      )}

      <FormularioCliente
        datosIniciales={datosFormulario}
        onEnviar={manejarActualizarCliente}
        onCancelar={volverADetalle}
        textoEnviar="Guardar cambios"
        mensajeEstado={mensajeEstado}
        deshabilitado={estadoEnvio.cargando}
        cuilSoloLectura={true}
      />
    </section>
  );
}

// Mapea la respuesta del backend a los campos visibles del formulario.
function mapearDatosFormulario(cliente) {
  if (!cliente) {
    return {};
  }

  let datosPersonales = cliente.personalData ? cliente.personalData : cliente;
  let direccion = datosPersonales.address ? datosPersonales.address : cliente.address;

  return {
    firstName: datosPersonales.firstName ? datosPersonales.firstName : '',
    lastName: datosPersonales.lastName ? datosPersonales.lastName : '',
    cuil: cliente.cuil ? cliente.cuil : datosPersonales.cuil ? datosPersonales.cuil : '',
    birthDate: datosPersonales.birthDate ? datosPersonales.birthDate : '',
    phone: datosPersonales.phone ? datosPersonales.phone : '',
    street: direccion && direccion.street ? direccion.street : cliente.street ? cliente.street : '',
    locality: direccion && direccion.locality ? direccion.locality : cliente.locality ? cliente.locality : '',
    province: direccion && direccion.province ? direccion.province : cliente.province ? cliente.province : ''
  };
}

// Renderiza detalles de validacion del backend de forma legible.
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

export default PaginaEditarCliente;
