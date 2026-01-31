import { useEffect, useRef } from 'react';
import '../../../CSS/paginasCSS/inicio/PaginaInicio.css';
import TarjetaMetrica from '../../atomicosJSX/inicio/TarjetaMetrica.jsx';
import ListaAlertas from '../../moleculasJSX/inicio/ListaAlertas.jsx';
import AccesosRapidos from '../../moleculasJSX/inicio/AccesosRapidos.jsx';
import TablaResumen from '../../moleculasJSX/inicio/TablaResumen.jsx';
import Boton from '../../atomicosJSX/clientes/Boton.jsx';
import { usarEstadoAsync } from '../../../utilidades/usarEstadoAsync.js';
import { obtenerDashboard } from '../../../servicios/dashboardApi.js';
import { formatearFechaSimple, formatearNumero } from '../../../utilidades/ui.js';

// Pagina principal del dashboard de Inicio.
function PaginaInicio(props) {
  let estadoDashboard = usarEstadoAsync(crearDashboardVacio());
  let controladorAbortarRef = useRef(null);

  function limpiarAbortController() {
    if (controladorAbortarRef.current) {
      controladorAbortarRef.current.abort();
      controladorAbortarRef.current = null;
    }
  }

  function cargarDashboard() {
    limpiarAbortController();

    let controlador = new AbortController();
    controladorAbortarRef.current = controlador;

    estadoDashboard.establecerCargando(true);

    obtenerDashboard(controlador.signal)
      .then(function manejarDatos(datos) {
        estadoDashboard.establecerDatos(datos);
      })
      .catch(function manejarError(error) {
        if (error && error.name === 'AbortError') {
          return;
        }
        estadoDashboard.establecerError(error);
      });
  }

  useEffect(function cargar() {
    cargarDashboard();

    return function limpiar() {
      limpiarAbortController();
    };
  }, []);

  if (estadoDashboard.cargando) {
    return (
      <section className="pagina-inicio">
        <section className="pagina-inicio__estado">Cargando inicio...</section>
      </section>
    );
  }

  if (estadoDashboard.error) {
    return (
      <section className="pagina-inicio">
        <section className="pagina-inicio__estado pagina-inicio__estado--error">
          <strong>Ocurrio un error al cargar el inicio.</strong>
          <Boton texto="Reintentar" tipo="secundario" onClick={cargarDashboard} />
        </section>
      </section>
    );
  }

  // Normaliza la respuesta para evitar nulls en el render.
  let datos = estadoDashboard.datos ? estadoDashboard.datos : crearDashboardVacio();
  let clientes = datos.clientes ? datos.clientes : { total: 0, activos: 0, inactivos: 0 };
  let prestamos = datos.prestamos ? datos.prestamos : { activos: 0, enMora: 0, riesgoAlto: 0 };
  let inversiones = datos.inversiones ? datos.inversiones : { capitalTotal: 0, capitalInvertido: 0, capitalDisponible: 0 };
  let fechaActualizacion = formatearFechaSimple(datos.asOf);
  // Marca alertas no navegables cuando el modulo aun no existe.
  let alertas = (datos.alertas ? datos.alertas : []).map(function preparar(alerta) {
    return {
      ...alerta,
      disponible: esRutaDisponible(alerta.link)
    };
  });
  let resumenes = datos.resumenes ? datos.resumenes : {};
  // Soporta tanto arrays legacy como el objeto { items, totalCount, link }.
  let resumenVencimientos = normalizarResumen(resumenes.proximosVencimientos);
  let resumenPagos = normalizarResumen(resumenes.ultimosPagos);
  let resumenPrestamos = normalizarResumen(resumenes.prestamosRecientes);
  // Limita filas visibles para evitar tablas extensas en Inicio.
  let filasVencimientos = limitarFilas(resumenVencimientos.items, 10);
  let filasPagos = limitarFilas(resumenPagos.items, 10);
  let filasPrestamos = limitarFilas(resumenPrestamos.items, 10);
  // Habilita links solo si la ruta existe en el frontend actual.
  let linkMasVencimientos = esRutaDisponible(resumenVencimientos.link) ? resumenVencimientos.link : null;
  let linkMasPagos = esRutaDisponible(resumenPagos.link) ? resumenPagos.link : null;
  let linkMasPrestamos = esRutaDisponible(resumenPrestamos.link) ? resumenPrestamos.link : null;
  let accionesRapidas = construirAccionesRapidas(props.onNavegar);

  return (
    <section className="pagina-inicio">
      <header className="pagina-inicio__encabezado">
        <section>
          <h1>Inicio</h1>
          <p>Resumen ejecutivo del estado operativo.</p>
        </section>
        <section className="pagina-inicio__actualizacion">
          <span>Actualizado</span>
          <strong>{fechaActualizacion}</strong>
        </section>
      </header>

      <section className="pagina-inicio__metricas">
        <TarjetaMetrica
          titulo="Clientes activos"
          valor={formatearNumero(clientes.activos)}
          detalle={formatearNumero(clientes.total) + ' en total'}
          icono="C"
          tono="positivo"
        />
        <TarjetaMetrica
          titulo="Prestamos activos"
          valor={formatearNumero(prestamos.activos)}
          detalle="En curso"
          icono="P"
          tono="neutro"
        />
        <TarjetaMetrica
          titulo="Prestamos en mora"
          valor={formatearNumero(prestamos.enMora)}
          detalle="Requieren seguimiento"
          icono="M"
          tono="critico"
        />
        <TarjetaMetrica
          titulo="Capital invertido"
          valor={formatearMoneda(inversiones.capitalInvertido)}
          detalle="Ultimo corte"
          icono="$"
          tono="positivo"
        />
        <TarjetaMetrica
          titulo="Capital disponible"
          valor={formatearMoneda(inversiones.capitalDisponible)}
          detalle="Para nuevas operaciones"
          icono="D"
          tono="alerta"
        />
      </section>

      <section className="pagina-inicio__seccion">
        <header className="pagina-inicio__seccion-header">
          <h2>Alertas prioritarias</h2>
          <span>Riesgos que requieren atencion inmediata.</span>
        </header>
        <ListaAlertas alertas={alertas} onNavegar={props.onNavegar} />
      </section>

      <section className="pagina-inicio__seccion">
        <header className="pagina-inicio__seccion-header">
          <h2>Accesos rapidos</h2>
          <span>Acciones frecuentes de operacion diaria.</span>
        </header>
        <AccesosRapidos acciones={accionesRapidas} />
      </section>

      <section className="pagina-inicio__resumenes">
        <TablaResumen
          titulo="Proximos vencimientos"
          filas={marcarFilas(filasVencimientos)}
          linkMas={linkMasVencimientos}
          onNavegar={props.onNavegar}
          formatearMoneda={formatearMoneda}
        />
        <TablaResumen
          titulo="Ultimos pagos"
          filas={marcarFilas(filasPagos)}
          linkMas={linkMasPagos}
          onNavegar={props.onNavegar}
          formatearMoneda={formatearMoneda}
        />
        <TablaResumen
          titulo="Prestamos recientes"
          filas={marcarFilas(filasPrestamos)}
          linkMas={linkMasPrestamos}
          onNavegar={props.onNavegar}
          formatearMoneda={formatearMoneda}
        />
      </section>
    </section>
  );
}

function crearDashboardVacio() {
  return {
    asOf: null,
    clientes: { total: 0, activos: 0, inactivos: 0 },
    prestamos: { activos: 0, enMora: 0, riesgoAlto: 0 },
    inversiones: { capitalTotal: 0, capitalInvertido: 0, capitalDisponible: 0 },
    pagos: { hoy: 0, vencidos: 0 },
    alertas: [],
    resumenes: {
      proximosVencimientos: { items: [], totalCount: 0, link: null },
      ultimosPagos: { items: [], totalCount: 0, link: null },
      prestamosRecientes: { items: [], totalCount: 0, link: null }
    }
  };
}

function construirAccionesRapidas(onNavegar) {
  return [
    {
      titulo: 'Nuevo Cliente',
      descripcion: 'Inicia el alta de un cliente.',
      disponible: !!onNavegar,
      onClick: function navegar() {
        if (onNavegar) {
          onNavegar('/clients/new');
        }
      }
    },
    {
      titulo: 'Ver Clientes',
      descripcion: 'Accede al listado principal.',
      disponible: !!onNavegar,
      onClick: function navegar() {
        if (onNavegar) {
          onNavegar('/clients');
        }
      }
    },
    {
      titulo: 'Registrar Pago',
      descripcion: 'Carga un pago manual.',
      disponible: false
    },
    {
      titulo: 'Ver Inversiones',
      descripcion: 'Consulta el portafolio actual.',
      disponible: false
    }
  ];
}

function formatearMoneda(valor) {
  let numero = typeof valor === 'number' ? valor : Number(valor);

  if (Number.isNaN(numero)) {
    return '-';
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(numero);
}

function esRutaDisponible(ruta) {
  if (!ruta) {
    return false;
  }

  let path = ruta.split('?')[0];

  if (path === '/' || path === '/inicio') {
    return true;
  }

  if (path === '/clients' || path.startsWith('/clients/')) {
    return true;
  }

  return false;
}

function marcarFilas(filas) {
  let lista = Array.isArray(filas) ? filas : [];

  return lista.map(function preparar(fila) {
    return {
      ...fila,
      disponible: esRutaDisponible(fila.link)
    };
  });
}

function normalizarResumen(resumen) {
  if (Array.isArray(resumen)) {
    return {
      items: resumen,
      totalCount: resumen.length,
      link: null
    };
  }

  if (resumen && typeof resumen === 'object') {
    let items = Array.isArray(resumen.items) ? resumen.items : [];
    let totalCount = typeof resumen.totalCount === 'number' ? resumen.totalCount : items.length;
    let link = resumen.link ? resumen.link : null;

    return {
      items: items,
      totalCount: totalCount,
      link: link
    };
  }

  return {
    items: [],
    totalCount: 0,
    link: null
  };
}

function limitarFilas(filas, maximo) {
  if (!Array.isArray(filas)) {
    return [];
  }

  return filas.slice(0, maximo);
}

export default PaginaInicio;
