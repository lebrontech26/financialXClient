import { useEffect, useState } from 'react';
import '../../../CSS/paginasCSS/prestamos/PaginaListaPrestamos.css';
import Boton from '../../atomicosJSX/prestamos/Boton.jsx';
import InputSeleccion from '../../atomicosJSX/prestamos/InputSeleccion.jsx';
import BadgeEstadoPrestamo from '../../moleculasJSX/prestamos/BadgeEstadoPrestamo.jsx';
import BadgeDiscrecional from '../../moleculasJSX/prestamos/BadgeDiscrecional.jsx';
import { obtenerPrestamos } from '../../../servicios/prestamosApi.js';
import { usarEstadoAsync } from '../../../utilidades/usarEstadoAsync.js';
import { formatearNumero } from '../../../utilidades/ui.js';

let TAMANIO_PAGINA = 10;

// Pagina inicial del modulo Prestamos con listado basico en modo demo.
function PaginaListaPrestamos(props) {
  let [categoriaSeleccionada, setCategoriaSeleccionada] = useState('ACTIVO');
  let estadoListado = usarEstadoAsync({
    elementos: [],
    total: 0,
    pagina: 1,
    tamanioPagina: TAMANIO_PAGINA
  });

  // Solicita el listado inicial de prestamos.
  function cargarPrestamos() {
    estadoListado.establecerCargando(true);

    let parametros = {
      pagina: 1,
      tamanioPagina: TAMANIO_PAGINA
    };

    if (categoriaSeleccionada && categoriaSeleccionada !== 'DISCRECIONAL') {
      parametros.estado = categoriaSeleccionada;
    }

    obtenerPrestamos(parametros)
      .then(function manejarDatos(datos) {
        estadoListado.establecerDatos(aplicarFiltroDiscrecional(datos, categoriaSeleccionada));
      })
      .catch(function manejarError(error) {
        estadoListado.establecerError(error);
      });
  }

  useEffect(cargarPrestamos, [categoriaSeleccionada]);

  // Abre el detalle del prestamo seleccionado.
  function navegarDetalle(prestamo) {
    if (props.onNavegar) {
      props.onNavegar('/prestamos/' + prestamo.id);
    }
  }

  // Navega al alta estandar con un cliente demo.
  function navegarEstandar() {
    if (props.onNavegar) {
      props.onNavegar('/prestamos/nuevo/-1');
    }
  }

  // Navega a la alta discrecional para un cliente demo.
  function navegarDiscrecional() {
    if (props.onNavegar) {
      props.onNavegar('/prestamos/nuevo-discrecional/-1');
    }
  }

  // Actualiza la categoria seleccionada para filtrar el listado.
  function cambiarCategoria(evento) {
    setCategoriaSeleccionada(evento.target.value);
  }

  // Reintenta la carga ante errores.
  function reintentarCarga() {
    cargarPrestamos();
  }

  let datos = estadoListado.datos ? estadoListado.datos : { elementos: [], total: 0 };
  let opcionesCategoria = [
    { valor: 'ACTIVO', etiqueta: 'Activos' },
    { valor: 'EN_MORA', etiqueta: 'En mora' },
    { valor: 'GARANTIA_EJECUTADA', etiqueta: 'Garantia ejecutada' },
    { valor: 'DISCRECIONAL', etiqueta: 'Discrecionales' }
  ];

  return (
    <section className="pagina-lista-prestamos">
      <header className="pagina-lista-prestamos__encabezado">
        <section>
          <h1>Prestamos</h1>
          <p>Resumen operativo de la cartera activa.</p>
        </section>
        <section className="pagina-lista-prestamos__acciones">
          <span hidden>
            <Boton texto="Nuevo estandar" tipo="primario" onClick={navegarEstandar} />
          </span>
          <span hidden>
            <Boton texto="Nuevo discrecional" tipo="secundario" onClick={navegarDiscrecional} />
          </span>
        </section>
      </header>

      <section className="pagina-lista-prestamos__filtro">
        <label htmlFor="prestamos-categoria">Categoria</label>
        <InputSeleccion
          id="prestamos-categoria"
          name="categoriaPrestamo"
          valor={categoriaSeleccionada}
          onChange={cambiarCategoria}
          opciones={opcionesCategoria}
        />
      </section>

      {estadoListado.cargando && (
        <section className="pagina-lista-prestamos__estado">Cargando prestamos...</section>
      )}

      {!estadoListado.cargando && estadoListado.error && (
        <section className="pagina-lista-prestamos__estado pagina-lista-prestamos__estado--error">
          <article>
            <strong>Ocurrio un error al cargar prestamos.</strong>
            <p>
              {estadoListado.error.message
                ? estadoListado.error.message
                : 'Revisa la conexion o intenta nuevamente.'}
            </p>
          </article>
          <Boton texto="Reintentar" tipo="secundario" onClick={reintentarCarga} />
        </section>
      )}

      {!estadoListado.cargando && !estadoListado.error && datos.elementos.length === 0 && (
        <section className="pagina-lista-prestamos__estado">
          No hay prestamos para la categoria seleccionada.
        </section>
      )}

      {!estadoListado.cargando && !estadoListado.error && datos.elementos.length > 0 && (
        <ul className="pagina-lista-prestamos__lista">
          {datos.elementos.map(function renderItem(prestamo) {
            let claseDetalle = obtenerClaseDetalle(prestamo);
            let claseTarjeta = claseDetalle ? 'tarjeta-prestamo ' + claseDetalle : 'tarjeta-prestamo';

            return (
              <li key={prestamo.id} className="pagina-lista-prestamos__item">
                <article className={claseTarjeta}>
                  <header className="tarjeta-prestamo__encabezado">
                    <section>
                      <h2>{prestamo.cliente}</h2>
                      <p>{prestamo.tipo}</p>
                    </section>
                    <section className="tarjeta-prestamo__badges">
                      <BadgeEstadoPrestamo estado={prestamo.estado} />
                      <BadgeDiscrecional mostrar={prestamo.esDiscrecional} />
                    </section>
                  </header>
                  <section className="tarjeta-prestamo__detalles">
                    <article className="tarjeta-prestamo__detalle">
                      <small>Monto</small>
                      <strong>${formatearNumero(prestamo.monto)}</strong>
                    </article>
                    <article className="tarjeta-prestamo__detalle">
                      <small>Cuotas vencidas</small>
                      <strong>{formatearNumero(prestamo.cuotasVencidas)}</strong>
                    </article>
                    <article className="tarjeta-prestamo__detalle">
                      <small>Garantia</small>
                      <strong>{prestamo.garantia}</strong>
                    </article>
                  </section>
                  <footer className="tarjeta-prestamo__acciones">
                    <Boton
                      texto="Ver detalle"
                      tipo="secundario"
                      onClick={function irDetalle() {
                        navegarDetalle(prestamo);
                      }}
                    />
                  </footer>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function aplicarFiltroDiscrecional(datos, categoria) {
  if (!datos || !Array.isArray(datos.elementos)) {
    return datos;
  }

  if (categoria !== 'DISCRECIONAL') {
    return datos;
  }

  let filtrados = datos.elementos.filter(function filtrar(item) {
    return item.esDiscrecional;
  });

  return {
    ...datos,
    elementos: filtrados,
    total: filtrados.length,
    pagina: 1
  };
}

function obtenerClaseDetalle(prestamo) {
  if (!prestamo) {
    return '';
  }

  if (prestamo.esDiscrecional) {
    return 'tarjeta-prestamo--detalle tarjeta-prestamo--detalle-discrecional';
  }

  if (prestamo.estado === 'EN_MORA') {
    return 'tarjeta-prestamo--detalle tarjeta-prestamo--detalle-mora';
  }

  if (prestamo.estado === 'ACTIVO') {
    return 'tarjeta-prestamo--detalle tarjeta-prestamo--detalle-activo';
  }

  return '';
}

export default PaginaListaPrestamos;
