import { useEffect } from 'react';
import '../../../CSS/paginasCSS/prestamos/PaginaDetallePrestamo.css';
import Boton from '../../atomicosJSX/prestamos/Boton.jsx';
import BadgeEstadoPrestamo from '../../moleculasJSX/prestamos/BadgeEstadoPrestamo.jsx';
import BadgeDiscrecional from '../../moleculasJSX/prestamos/BadgeDiscrecional.jsx';
import TablaCronogramaPrestamo from '../../moleculasJSX/prestamos/TablaCronogramaPrestamo.jsx';
import { obtenerPrestamoPorId } from '../../../servicios/prestamosApi.js';
import { obtenerClientePorId } from '../../../servicios/clientsApi.js';
import { obtenerClienteMock } from '../../../datos/clientesMock.js';
import { usarEstadoAsync } from '../../../utilidades/usarEstadoAsync.js';
import { formatearNumero, formatearFechaSimple } from '../../../utilidades/ui.js';
import { obtenerTextoCategoria, normalizarCategoria } from '../../../domain/clientes/interpretacionRiesgo.js';

// Pagina de detalle para visualizar la informacion del prestamo.
function PaginaDetallePrestamo(props) {
  let estadoDetalle = usarEstadoAsync(null);
  let estadoCliente = usarEstadoAsync(null);

  // Consulta el detalle del prestamo seleccionado.
  function cargarDetalle() {
    if (!props.idPrestamo) {
      estadoDetalle.establecerError({ message: 'Prestamo no encontrado.' });
      return;
    }

    estadoDetalle.establecerCargando(true);

    obtenerPrestamoPorId(props.idPrestamo)
      .then(function manejarDatos(datos) {
        estadoDetalle.establecerDatos(datos);
        cargarClienteAsociado(datos);
      })
      .catch(function manejarError(error) {
        estadoDetalle.establecerError(error);
      });
  }

  useEffect(cargarDetalle, [props.idPrestamo]);

  // Busca el cliente asociado para mostrar su categoria en el resumen.
  function cargarClienteAsociado(prestamo) {
    if (!prestamo || !prestamo.idCliente) {
      return;
    }

    estadoCliente.establecerCargando(true);

    obtenerClienteParaPrestamo(prestamo.idCliente)
      .then(function manejarDatos(datos) {
        estadoCliente.establecerDatos(datos);
      })
      .catch(function manejarError(error) {
        estadoCliente.establecerError(error);
      });
  }

  // Vuelve al listado principal.
  function volverALista() {
    if (props.onNavegar) {
      props.onNavegar('/prestamos');
    }
  }

  let prestamo = estadoDetalle.datos;
  let textoCategoriaCliente = obtenerCategoriaClienteTexto(estadoCliente);

  return (
    <section className="pagina-detalle-prestamo">
      <header className="pagina-detalle-prestamo__encabezado">
        <section>
          <h1>Detalle del prestamo</h1>
          <p>ID: {props.idPrestamo ? props.idPrestamo : 'Sin identificar'}</p>
        </section>
        <Boton texto="Volver" tipo="secundario" onClick={volverALista} />
      </header>

      {estadoDetalle.cargando && (
        <section className="pagina-detalle-prestamo__estado">Cargando detalle...</section>
      )}

      {!estadoDetalle.cargando && estadoDetalle.error && (
        <section className="pagina-detalle-prestamo__estado pagina-detalle-prestamo__estado--error">
          <article>
            <strong>Ocurrio un error al cargar el prestamo.</strong>
            <p>
              {estadoDetalle.error.message
                ? estadoDetalle.error.message
                : 'Revisa la conexion o intenta nuevamente.'}
            </p>
          </article>
        </section>
      )}

      {!estadoDetalle.cargando && !estadoDetalle.error && prestamo && (
        <section className="pagina-detalle-prestamo__contenido">
          <article className="detalle-prestamo__panel">
            <header className="detalle-prestamo__encabezado">
              <section>
                <h2>Resumen</h2>
                <p>Informacion general del prestamo.</p>
              </section>
              <section className="detalle-prestamo__badges">
                <BadgeEstadoPrestamo estado={prestamo.estado} />
                <BadgeDiscrecional mostrar={prestamo.esDiscrecional} />
              </section>
            </header>
            <section className="detalle-prestamo__fila">
              <article>
                <small>Cliente</small>
                <strong>{prestamo.cliente}</strong>
              </article>
              <article>
                <small>Categoria cliente</small>
                <strong>{textoCategoriaCliente}</strong>
              </article>
              <article>
                <small>Tipo</small>
                <strong>{prestamo.tipo}</strong>
              </article>
              <article>
                <small>Monto</small>
                <strong>${formatearNumero(prestamo.monto)}</strong>
              </article>
              <article>
                <small>Total a pagar</small>
                <strong>${formatearNumero(prestamo.totalAPagar)}</strong>
              </article>
              <article>
                <small>Plazo</small>
                <strong>{formatearPlazo(prestamo.plazo)}</strong>
              </article>
              <article>
                <small>Tasa</small>
                <strong>{formatearTasa(prestamo.tasaInteres)}</strong>
              </article>
              <article>
                <small>Horario de cobro</small>
                <strong>{formatearHorarioCobro(prestamo.horarioCobroPreferido)}</strong>
              </article>
              <article>
                <small>Cuotas</small>
                <strong>{formatearNumero(prestamo.cuotas)}</strong>
              </article>
              <article>
                <small>Cuotas vencidas</small>
                <strong>{formatearNumero(prestamo.cuotasVencidas)}</strong>
              </article>
            </section>
            {prestamo.esDiscrecional && prestamo.motivoDiscrecional && (
              <section className="detalle-prestamo__nota">
                <strong>Motivo discrecional:</strong> {prestamo.motivoDiscrecional}
              </section>
            )}
          </article>

          <article className="detalle-prestamo__panel">
            <h2>Cronograma y pagos</h2>
            {prestamo.cronograma && prestamo.cronograma.length > 0 ? (
              <TablaCronogramaPrestamo cronograma={prestamo.cronograma} />
            ) : (
              <p>No hay cronograma disponible.</p>
            )}

            <section className="detalle-prestamo__subseccion">
              <h3>Pagos registrados</h3>
              {prestamo.pagos && prestamo.pagos.length > 0 ? (
                <ul className="detalle-prestamo__lista">
                  {prestamo.pagos.map(function renderPago(pago) {
                    return (
                      <li key={pago.id} className="detalle-prestamo__item">
                        <article className="detalle-prestamo__pago">
                          <section>
                            <small>Fecha</small>
                            <strong>{formatearFechaSimple(pago.pagadoEn)}</strong>
                          </section>
                          <section>
                            <small>Monto</small>
                            <strong>${formatearNumero(pago.monto)}</strong>
                          </section>
                          <section>
                            <small>Mora</small>
                            <strong>{pago.estaEnMora ? 'Si' : 'No'}</strong>
                          </section>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>No hay pagos registrados.</p>
              )}
            </section>
          </article>

          <article className="detalle-prestamo__panel">
            <h2>Garantia</h2>
            {prestamo.garantia ? (
              <section className="detalle-prestamo__fila">
                <article>
                  <small>Descripcion</small>
                  <strong>{prestamo.garantia.descripcion}</strong>
                </article>
                <article>
                  <small>Valor recuperable</small>
                  <strong>${formatearNumero(prestamo.garantia.valorRecuperable)}</strong>
                </article>
                <article>
                  <small>Estado</small>
                  <strong>{prestamo.garantia.estado}</strong>
                </article>
              </section>
            ) : (
              <p>Sin garantia registrada.</p>
            )}
          </article>

          <article className="detalle-prestamo__panel">
            <h2>Auditoria</h2>
            {prestamo.auditoria && prestamo.auditoria.length > 0 ? (
              <ul className="detalle-prestamo__lista">
                {prestamo.auditoria.map(function renderEvento(evento, indice) {
                  return (
                    <li key={evento.id ? evento.id : 'evento-' + indice} className="detalle-prestamo__item">
                      <article className="detalle-prestamo__evento">
                        <section>
                          <small>Evento</small>
                          <strong>{evento.descripcion}</strong>
                        </section>
                        <section>
                          <small>Fecha</small>
                          <strong>{formatearFechaSimple(evento.fecha)}</strong>
                        </section>
                        <section>
                          <small>Responsable</small>
                          <strong>{evento.responsable}</strong>
                        </section>
                      </article>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No hay eventos registrados.</p>
            )}
          </article>
        </section>
      )}
    </section>
  );
}

// Usa mocks para clientes cuando prestamos corre en modo demo.
function obtenerClienteParaPrestamo(idCliente) {
  if (esClienteMock(idCliente)) {
    return obtenerClienteMock(idCliente);
  }

  return obtenerClientePorId(idCliente);
}

function esClienteMock(idCliente) {
  let numero = Number(idCliente);
  return !Number.isNaN(numero) && numero < 0;
}

// Formatea la unidad de plazo para mostrarla en la UI.
function formatearPlazo(plazo) {
  if (!plazo) {
    return 'Sin plazo';
  }

  if (plazo.unidad === 'SEMANAS') {
    return formatearNumero(plazo.valor) + ' semanas';
  }

  if (plazo.unidad === 'MESES') {
    return formatearNumero(plazo.valor) + ' meses';
  }

  return formatearNumero(plazo.valor) + ' ' + plazo.unidad;
}

// Formatea la tasa en porcentaje para la vista.
function formatearTasa(valor) {
  if (valor === undefined || valor === null) {
    return 'Sin tasa';
  }

  let porcentaje = Number(valor) * 100;
  if (Number.isNaN(porcentaje)) {
    return String(valor);
  }

  return porcentaje.toFixed(2) + '%';
}

function formatearHorarioCobro(valor) {
  if (!valor) {
    return 'Sin definir';
  }

  return String(valor);
}

// Obtiene el texto de categoria del cliente asociado al prestamo.
function obtenerCategoriaClienteTexto(estadoCliente) {
  if (!estadoCliente || estadoCliente.cargando) {
    return 'Cargando...';
  }

  if (estadoCliente.error || !estadoCliente.datos) {
    return '-';
  }

  let cliente = estadoCliente.datos;
  let categoria = cliente.currentRiskProfile && cliente.currentRiskProfile.category !== undefined
    ? cliente.currentRiskProfile.category
    : cliente.category;

  if (categoria === undefined || categoria === null) {
    return '-';
  }

  let categoriaNormalizada = normalizarCategoria(categoria);
  return obtenerTextoCategoria(categoriaNormalizada) + ' (' + formatearNumero(categoriaNormalizada) + ')';
}

export default PaginaDetallePrestamo;
