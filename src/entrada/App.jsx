import { useEffect, useState } from 'react';
import { PaginaListaClientes, PaginaCrearCliente, PaginaDetalleCliente, PaginaEditarCliente } from '../JSX/paginasJSX/clientes.jsx';
import { PaginaListaPrestamos, PaginaCrearPrestamoEstandar, PaginaCrearPrestamoDiscrecional, PaginaDetallePrestamo } from '../JSX/paginasJSX/prestamos.jsx';
import { PaginaInicio } from '../JSX/paginasJSX/inicio.jsx';

// Enrutador basico para los modulos principales sin dependencias externas.
function App() {
  let [rutaActual, setRutaActual] = useState(obtenerRutaActual());

  // Sincroniza el estado de ruta cuando el usuario navega con atras/adelante.
  function manejarCambioHistorial() {
    setRutaActual(obtenerRutaActual());
  }

  // Registra y limpia el listener del historial del navegador.
  function registrarEventos() {
    window.addEventListener('popstate', manejarCambioHistorial);

    return function limpiarEventos() {
      window.removeEventListener('popstate', manejarCambioHistorial);
    };
  }

  useEffect(registrarEventos, []);

  // Navega a una ruta interna sin recargar la pagina.
  function navegarA(ruta) {
    if (!ruta || ruta === rutaActual) {
      return;
    }

    window.history.pushState({}, '', ruta);
    setRutaActual(obtenerRutaActual());
  }

  let datosRuta = resolverRuta(rutaActual);
  let contenido = null;
  let esInicioActivo = datosRuta.seccion === 'inicio';
  let esClientesActivo = datosRuta.seccion === 'clientes' && datosRuta.pagina !== 'desconocida';
  let esPrestamosActivo = datosRuta.seccion === 'prestamos' && datosRuta.pagina !== 'desconocida';

  // Navega al listado principal de clientes desde el menu.
  function irInicio() {
    navegarA('/');
  }

  // Navega a la seccion Clientes desde el menu.
  function irClientes() {
    navegarA('/clients');
  }

  // Navega a la seccion Prestamos desde el menu.
  function irPrestamos() {
    navegarA('/prestamos');
  }

  // Devuelve la clase activa cuando la seccion actual es Inicio.
  function obtenerClaseInicio(base) {
    if (esInicioActivo) {
      return base + ' ' + base + '--activo';
    }
    return base;
  }

  // Devuelve la clase activa cuando la seccion actual es Clientes.
  function obtenerClaseClientes(base) {
    if (esClientesActivo) {
      return base + ' ' + base + '--activo';
    }
    return base;
  }

  // Devuelve la clase activa cuando la seccion actual es Prestamos.
  function obtenerClasePrestamos(base) {
    if (esPrestamosActivo) {
      return base + ' ' + base + '--activo';
    }
    return base;
  }

  if (datosRuta.seccion === 'inicio') {
    contenido = <PaginaInicio onNavegar={navegarA} />;
  } else if (datosRuta.seccion === 'clientes' && datosRuta.pagina === 'lista') {
    contenido = <PaginaListaClientes onNavegar={navegarA} />;
  } else if (datosRuta.seccion === 'clientes' && datosRuta.pagina === 'crear') {
    contenido = <PaginaCrearCliente onNavegar={navegarA} />;
  } else if (datosRuta.seccion === 'clientes' && datosRuta.pagina === 'detalle') {
    contenido = <PaginaDetalleCliente idCliente={datosRuta.id} onNavegar={navegarA} />;
  } else if (datosRuta.seccion === 'clientes' && datosRuta.pagina === 'editar') {
    contenido = <PaginaEditarCliente idCliente={datosRuta.id} onNavegar={navegarA} />;
  } else if (datosRuta.seccion === 'prestamos' && datosRuta.pagina === 'lista') {
    contenido = <PaginaListaPrestamos onNavegar={navegarA} />;
  } else if (datosRuta.seccion === 'prestamos' && datosRuta.pagina === 'crear-estandar') {
    contenido = <PaginaCrearPrestamoEstandar idCliente={datosRuta.idCliente} onNavegar={navegarA} />;
  } else if (datosRuta.seccion === 'prestamos' && datosRuta.pagina === 'crear-discrecional') {
    contenido = <PaginaCrearPrestamoDiscrecional idCliente={datosRuta.idCliente} onNavegar={navegarA} />;
  } else if (datosRuta.seccion === 'prestamos' && datosRuta.pagina === 'detalle') {
    contenido = <PaginaDetallePrestamo idPrestamo={datosRuta.id} onNavegar={navegarA} />;
  } else {
    contenido = (
      <section style={{ padding: '32px' }}>
        <h1>Ruta no encontrada</h1>
        <button type="button" onClick={irInicio}>
          Volver al inicio
        </button>
      </section>
    );
  }

  return (
    <section className="app-layout">
      <aside className="app-sidebar">
        <header className="app-sidebar__header">
          <span className="app-logo__icono" aria-hidden="true">*</span>
          <span className="app-logo__texto">Buen dia</span>
        </header>
        <nav className="app-sidebar__nav" aria-label="Menu principal">
          <ul className="app-sidebar__lista">
            <li>
              <button type="button" className={obtenerClaseInicio('app-sidebar__boton')} onClick={irInicio}>
                Inicio
              </button>
            </li>
            <li>
              <button type="button" className={obtenerClaseClientes('app-sidebar__boton')} onClick={irClientes}>
                Clientes
              </button>
            </li>
            <li>
              <button type="button" className={obtenerClasePrestamos('app-sidebar__boton')} onClick={irPrestamos}>
                Prestamos
              </button>
            </li>
            <li>
              <span hidden>
                <button type="button" className="app-sidebar__boton app-sidebar__boton--disabled">
                  Inversiones
                </button>
              </span>
            </li>
            <li>
              <span hidden>
                <button type="button" className="app-sidebar__boton app-sidebar__boton--disabled">
                  Reportes
                </button>
              </span>
            </li>
          </ul>
        </nav>
        <footer className="app-sidebar__footer">
          <button type="button" className="app-sidebar__boton app-sidebar__boton--disabled">
            Configuracion
          </button>
          <button type="button" className="app-sidebar__boton app-sidebar__boton--disabled">
            Salir
          </button>
        </footer>
      </aside>
      <section className="app-main">
        <header className="app-topbar">
          <nav className="app-topbar__nav" aria-label="Secciones">
            <ul className="app-topbar__lista">
              <li>
                <button type="button" className={obtenerClaseInicio('app-topbar__boton')} onClick={irInicio}>
                  Inicio
                </button>
              </li>
              <li>
                <button type="button" className={obtenerClaseClientes('app-topbar__boton')} onClick={irClientes}>
                  Clientes
                </button>
              </li>
              <li>
                <button type="button" className={obtenerClasePrestamos('app-topbar__boton')} onClick={irPrestamos}>
                  Prestamos
                </button>
              </li>
            <li>
              <span hidden>
                <button type="button" className="app-topbar__boton app-topbar__boton--disabled">
                  Inversiones
                </button>
              </span>
            </li>
            <li>
              <span hidden>
                <button type="button" className="app-topbar__boton app-topbar__boton--disabled">
                  Reportes
                </button>
              </span>
            </li>
            </ul>
          </nav>
          <section className="app-topbar__perfil">
            <span className="app-topbar__icono" aria-hidden="true">!</span>
            <span className="app-topbar__avatar" aria-hidden="true">FA</span>
            <span className="app-topbar__nombre">Franco Alderetes</span>
          </section>
        </header>
        <main className="app-layout__contenido">
          {contenido}
        </main>
      </section>
    </section>
  );
}

// Lee la ruta actual del navegador y asegura un valor util para el enrutador.
function obtenerRutaActual() {
  if (typeof window === 'undefined') {
    return '/';
  }

  let ruta = window.location.pathname;
  return ruta && ruta.length > 0 ? ruta : '/';
}

// Resuelve la ruta de Clientes y Prestamos en base a la url.
function resolverRuta(ruta) {
  if (!ruta || ruta === '/' || ruta === '/inicio' || ruta === '/index') {
    return { seccion: 'inicio' };
  }

  let partes = ruta.split('/').filter(Boolean);

  if (partes[0] !== 'clients' && partes[0] !== 'prestamos') {
    return { seccion: 'desconocida', pagina: 'desconocida' };
  }

  if (partes[0] === 'prestamos') {
    if (partes.length === 1) {
      return { seccion: 'prestamos', pagina: 'lista' };
    }

    if (partes.length === 3 && partes[1] === 'nuevo') {
      return { seccion: 'prestamos', pagina: 'crear-estandar', idCliente: partes[2] };
    }

    if (partes.length === 3 && partes[1] === 'nuevo-discrecional') {
      return { seccion: 'prestamos', pagina: 'crear-discrecional', idCliente: partes[2] };
    }

    if (partes.length === 2) {
      return { seccion: 'prestamos', pagina: 'detalle', id: partes[1] };
    }

    return { seccion: 'prestamos', pagina: 'desconocida' };
  }

  if (partes.length === 1) {
    return { seccion: 'clientes', pagina: 'lista' };
  }

  if (partes.length === 2 && partes[1] === 'new') {
    return { seccion: 'clientes', pagina: 'crear' };
  }

  if (partes.length === 2) {
    return { seccion: 'clientes', pagina: 'detalle', id: partes[1] };
  }

  if (partes.length === 3 && partes[2] === 'edit') {
    return { seccion: 'clientes', pagina: 'editar', id: partes[1] };
  }

  return { seccion: 'clientes', pagina: 'desconocida' };
}

export default App;
