import { useEffect, useRef, useState } from 'react';
import '../../../CSS/paginasCSS/clientes/PaginaListaClientes.css';
import BuscadorClientes from '../../moleculasJSX/clientes/BuscadorClientes.jsx';
import PaginacionClientes from '../../moleculasJSX/clientes/PaginacionClientes.jsx';
import TablaClientes from '../../moleculasJSX/clientes/TablaClientes.jsx';
import DialogoConfirmacion from '../../moleculasJSX/clientes/DialogoConfirmacion.jsx';
import Boton from '../../atomicosJSX/clientes/Boton.jsx';
import { obtenerClientes, eliminarCliente } from '../../../servicios/clientsApi.js';
import { usarEstadoAsync } from '../../../utilidades/usarEstadoAsync.js';

let TAMANO_PAGINA = 10;

// Pagina principal del modulo Clientes con listado, buscador y paginacion.
function PaginaListaClientes(props) {
  let [paginaActual, setPaginaActual] = useState(1);
  let [consulta, setConsulta] = useState('');
  let [clienteParaEliminar, setClienteParaEliminar] = useState(null);
  let [eliminando, setEliminando] = useState(false);
  let estadoListado = usarEstadoAsync({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: TAMANO_PAGINA
  });
  let controladorAbortarRef = useRef(null);

  // Cambia la pagina actual del listado.
  function cambiarPagina(nuevaPagina) {
    setPaginaActual(nuevaPagina);
  }

  // Actualiza la consulta y reinicia la pagina al inicio.
  function actualizarConsulta(nuevaConsulta) {
    setConsulta(nuevaConsulta);
    setPaginaActual(1);
  }

  // Abre la confirmacion de borrado con el cliente seleccionado.
  function abrirConfirmacion(cliente) {
    setClienteParaEliminar(cliente);
  }

  // Cierra la confirmacion de borrado.
  function cerrarConfirmacion() {
    setClienteParaEliminar(null);
  }

  // Navega a la pantalla de alta de clientes.
  function navegarNuevaPagina() {
    if (props.onNavegar) {
      props.onNavegar('/clients/new');
    }
  }

  // Navega al detalle del cliente seleccionado.
  function navegarDetalle(cliente) {
    if (props.onNavegar) {
      props.onNavegar('/clients/' + cliente.id);
    }
  }

  // Navega a la edicion del cliente seleccionado.
  function navegarEditar(cliente) {
    if (props.onNavegar) {
      props.onNavegar('/clients/' + cliente.id + '/edit');
    }
  }

  // Abre el flujo de nuevo prestamo asociado al cliente.
  function navegarNuevoPrestamo(cliente) {
    if (props.onNavegar) {
      props.onNavegar('/prestamos/nuevo/' + cliente.id);
    }
  }

  // Cancela el fetch en curso cuando el usuario cambia el filtro.
  function limpiarAbortController() {
    if (controladorAbortarRef.current) {
      controladorAbortarRef.current.abort();
      controladorAbortarRef.current = null;
    }
  }

  // Consulta la API respetando pagina, filtro y cancelacion de requests previas.
  function cargarClientes() {
    limpiarAbortController();

    let controlador = new AbortController();
    controladorAbortarRef.current = controlador;

    estadoListado.establecerCargando(true);

    obtenerClientes(
      {
        page: paginaActual,
        pageSize: TAMANO_PAGINA,
        query: consulta,
        estaActivo: true
      },
      controlador.signal
    )
      .then(function manejarDatos(datos) {
        estadoListado.establecerDatos(datos);
      })
      .catch(function manejarError(error) {
        if (error && error.name === 'AbortError') {
          return;
        }
        estadoListado.establecerError(error);
      });
  }

  // Refresca la lista cada vez que cambia la pagina o la busqueda.
  function reaccionarCambios() {
    cargarClientes();

    return function limpiarEfecto() {
      limpiarAbortController();
    };
  }

  useEffect(reaccionarCambios, [paginaActual, consulta]);

  // Reintenta la carga cuando ocurre un error.
  function reintentarCarga() {
    cargarClientes();
  }

  // Confirma el borrado y refresca el listado luego de la respuesta.
  function confirmarEliminacion() {
    if (!clienteParaEliminar) {
      return;
    }

    setEliminando(true);

    eliminarCliente(clienteParaEliminar.id)
      .then(function actualizarListado() {
        cerrarConfirmacion();
        cargarClientes();
      })
      .catch(function manejarError(error) {
        estadoListado.establecerError(error);
      })
      .finally(function limpiarEstado() {
        setEliminando(false);
      });
  }

  let datos = estadoListado.datos ? estadoListado.datos : { items: [], totalCount: 0 };
  let totalPaginas = Math.max(1, Math.ceil(datos.totalCount / TAMANO_PAGINA));

  return (
    <section className="pagina-lista-clientes">
      <header className="pagina-lista-clientes__encabezado">
        <section>
          <h1>Clientes</h1>
          <p>Gestion y analisis rapido de tu cartera.</p>
        </section>
        <Boton texto="Nuevo Cliente" tipo="primario" onClick={navegarNuevaPagina} />
      </header>

      <section className="pagina-lista-clientes__busqueda">
        <BuscadorClientes valor={consulta} onBuscar={actualizarConsulta} />
      </section>

      {estadoListado.cargando && (
        <section className="pagina-lista-clientes__estado">Cargando clientes...</section>
      )}

      {!estadoListado.cargando && estadoListado.error && (
        <section className="pagina-lista-clientes__estado pagina-lista-clientes__estado--error">
          <section>
            <strong>Ocurrio un error al cargar clientes.</strong>
            <span>
              {estadoListado.error.message
                ? estadoListado.error.message
                : 'Revisa la conexion o intenta nuevamente.'}
            </span>
          </section>
          <Boton texto="Reintentar" tipo="secundario" onClick={reintentarCarga} />
        </section>
      )}

      {!estadoListado.cargando && !estadoListado.error && datos.items.length === 0 && (
        <section className="pagina-lista-clientes__estado">No hay clientes para mostrar.</section>
      )}

      {!estadoListado.cargando && !estadoListado.error && datos.items.length > 0 && (
        <>
          <TablaClientes
            clientes={datos.items}
            onVer={navegarDetalle}
            onEditar={navegarEditar}
            onNuevoPrestamo={navegarNuevoPrestamo}
            onEliminar={abrirConfirmacion}
          />
          <PaginacionClientes
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            onCambiarPagina={cambiarPagina}
          />
        </>
      )}

      <DialogoConfirmacion
        abierto={!!clienteParaEliminar}
        titulo="Eliminar cliente"
        descripcion="Esta accion elimina el cliente de la lista. Puedes recuperarlo desde el backend si aplica."
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        onConfirmar={confirmarEliminacion}
        onCancelar={cerrarConfirmacion}
        deshabilitado={eliminando}
      />
    </section>
  );
}

export default PaginaListaClientes;
