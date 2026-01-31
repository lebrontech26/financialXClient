import { useEffect, useState, Fragment } from 'react';
import '../../../CSS/paginasCSS/clientes/PaginaDetalleCliente.css';
import Boton from '../../atomicosJSX/clientes/Boton.jsx';
import RiskGauge from '../../moleculasJSX/clientes/RiskGauge.jsx';
import { obtenerClientePorId } from '../../../servicios/clientsApi.js';
import { obtenerPrestamosPorCliente } from '../../../servicios/prestamosApi.js';
import BadgeEstadoPrestamo from '../../moleculasJSX/prestamos/BadgeEstadoPrestamo.jsx';
import BadgeDiscrecional from '../../moleculasJSX/prestamos/BadgeDiscrecional.jsx';
import { usarEstadoAsync } from '../../../utilidades/usarEstadoAsync.js';
import { obtenerTextoInterpretativo, obtenerTextoCategoria, normalizarCategoria } from '../../../domain/clientes/interpretacionRiesgo.js';
import { construirResumenFinanciero } from '../../../domain/clientes/resumenFinanciero.js';
import { obtenerAlertas } from '../../../domain/clientes/alertasCliente.js';
import { ordenarHistorial, resumirAjustes, resumirMotivos } from '../../../domain/clientes/historialScoring.js';
import { formatearFechaSimple, construirDireccion, obtenerTextoSeguro, formatearNumero } from '../../../utilidades/ui.js';

// Pagina de detalle con informacion personal y financiera del cliente.
function PaginaDetalleCliente(props) {
  let [filaExpandida, setFilaExpandida] = useState(null);
  let estadoDetalle = usarEstadoAsync(null);
  let estadoPrestamos = usarEstadoAsync([]);

  // Regresa al listado general de clientes.
  function volverALista() {
    if (props.onNavegar) {
      props.onNavegar('/clients');
    }
  }

  // Navega a la edicion del cliente actual.
  function editarCliente() {
    if (props.onNavegar && props.idCliente) {
      props.onNavegar('/clients/' + props.idCliente + '/edit');
    }
  }

  // Navega al alta de prestamo estandar para el cliente actual.
  function crearNuevoPrestamo() {
    if (props.onNavegar && props.idCliente) {
      props.onNavegar('/prestamos/nuevo/' + props.idCliente);
    }
  }

  // Carga el detalle del cliente desde la API.
  function cargarDetalle() {
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

  useEffect(cargarDetalle, [props.idCliente]);

  // Carga los prestamos asociados al cliente para mostrar el resumen.
  function cargarPrestamosCliente() {
    if (!props.idCliente) {
      return;
    }

    estadoPrestamos.establecerCargando(true);

    obtenerPrestamosPorCliente(props.idCliente)
      .then(function manejarDatos(datos) {
        estadoPrestamos.establecerDatos(datos);
      })
      .catch(function manejarError(error) {
        estadoPrestamos.establecerError(error);
      });
  }

  useEffect(cargarPrestamosCliente, [props.idCliente]);

  // Abre el detalle del prestamo desde la tabla de prestamos del cliente.
  function navegarDetallePrestamo(prestamo) {
    if (props.onNavegar) {
      props.onNavegar('/prestamos/' + prestamo.id);
    }
  }

  if (estadoDetalle.cargando) {
    return (
      <section className="pagina-detalle-cliente">
        <section className="pagina-detalle-cliente__estado">Cargando detalle...</section>
      </section>
    );
  }

  if (estadoDetalle.error) {
    if (estadoDetalle.error.status === 404) {
      return (
        <section className="pagina-detalle-cliente">
          <section className="pagina-detalle-cliente__estado pagina-detalle-cliente__estado--error">
            <strong>Cliente no encontrado.</strong>
            <Boton texto="Volver" tipo="secundario" onClick={volverALista} />
          </section>
        </section>
      );
    }

    return (
      <section className="pagina-detalle-cliente">
        <section className="pagina-detalle-cliente__estado pagina-detalle-cliente__estado--error">
          <strong>Ocurrio un error al cargar el detalle.</strong>
          <Boton texto="Reintentar" tipo="secundario" onClick={cargarDetalle} />
        </section>
      </section>
    );
  }

  let cliente = estadoDetalle.datos ? estadoDetalle.datos : {};
  let datosPersonales = cliente.personalData ? cliente.personalData : cliente;
  let direccion = datosPersonales.address ? datosPersonales.address : cliente.address;
  let riesgoActual = cliente.currentRiskProfile ? cliente.currentRiskProfile : {};
  let scoreFinal = riesgoActual.scoreFinal !== undefined ? riesgoActual.scoreFinal : cliente.score !== undefined ? cliente.score : 0;
  let categoria =
    riesgoActual.category !== undefined
      ? riesgoActual.category
      : cliente.category !== undefined
      ? cliente.category
      : 5;
  categoria = normalizarCategoria(categoria);
  let sinEvidencia = !!riesgoActual.sinEvidenciaCrediticia;
  let historial = ordenarHistorial(cliente.scoringHistory);
  let resumenFinanciero = construirResumenFinanciero(cliente, sinEvidencia);
  let alertas = obtenerAlertas(cliente);
  let textoInterpretativo = obtenerTextoInterpretativo(categoria);
  let prestamosCliente = estadoPrestamos.datos ? estadoPrestamos.datos : [];
  let textoEstado = 'Sin datos';

  if (cliente.status && typeof cliente.status.isActive === 'boolean') {
    textoEstado = cliente.status.isActive ? 'Activo' : 'Inactivo';
  }

  return (
    <section className="pagina-detalle-cliente">
      <header className="pagina-detalle-cliente__encabezado">
        <section>
          <h1>Detalle del Cliente</h1>
          <p>Visualizacion general del perfil financiero.</p>
        </section>
        <section className="pagina-detalle-cliente__acciones">
          <Boton texto="Editar" tipo="secundario" onClick={editarCliente} />
          <Boton texto="Volver" tipo="secundario" onClick={volverALista} />
        </section>
      </header>

      <section className="pagina-detalle-cliente__grid">
        <section className="detalle-card">
          <h2>Datos personales</h2>
          <section className="detalle-card__contenido">
            <article>
              <strong>Nombre y Apellido</strong>
              <span>
                {obtenerTextoSeguro(datosPersonales.firstName)}{' '}
                {obtenerTextoSeguro(datosPersonales.lastName)}
              </span>
            </article>
            <article>
              <strong>CUIL</strong>
              <span>{obtenerTextoSeguro(cliente.cuil)}</span>
            </article>
            <article>
              <strong>Fecha nacimiento</strong>
              <span>{formatearFechaSimple(datosPersonales.birthDate)}</span>
            </article>
            <article>
              <strong>Telefono</strong>
              <span>{obtenerTextoSeguro(datosPersonales.phone)}</span>
            </article>
            <article>
              <strong>Domicilio</strong>
              <span>{construirDireccion(direccion, cliente)}</span>
            </article>
            <article>
              <strong>Estado</strong>
              <span>{textoEstado}</span>
            </article>
          </section>
          <section className="detalle-card__acciones">
            <Boton texto="Nuevo prestamo" tipo="primario" onClick={crearNuevoPrestamo} />
          </section>
        </section>

        <section className="detalle-card">
          <h2>Informacion financiera</h2>
          <section className="detalle-financiera__principal">
            <RiskGauge score={scoreFinal} category={categoria} size="lg" showLabels={true} />
            <section className="detalle-financiera__texto">
              <p>{textoInterpretativo}</p>
              {sinEvidencia && (
                <p>
                  El cliente no presenta evidencia crediticia suficiente en BCRA.
                  El score se asigna con informacion limitada.
                </p>
              )}
            </section>
          </section>

          <section className="detalle-financiera__resumen">
            {resumenFinanciero.map(function renderResumen(item, index) {
              let claseIcono = item.badge ? 'resumen-card--' + item.badge : '';
              let claseCompleta = 'resumen-card ' + claseIcono;

              return (
                <article className={claseCompleta} key={item.titulo + index}>
                  <h3>{item.titulo}</h3>
                  <p>{item.texto}</p>
                </article>
              );
            })}
          </section>

          <section className="detalle-financiera__alertas">
            <h3>Alertas</h3>
            {alertas.length > 0 ? (
              <ul>
                {alertas.map(function renderAlerta(alerta, index) {
                  return <li key={index}>{String(alerta)}</li>;
                })}
              </ul>
            ) : (
              <p>Sin alertas relevantes.</p>
            )}
          </section>
        </section>

        <section className="detalle-card detalle-card--full">
          <h2>Prestamos del cliente</h2>
          <section className="detalle-prestamos">
            {estadoPrestamos.cargando && (
              <p className="detalle-prestamos__estado">Cargando prestamos...</p>
            )}

            {!estadoPrestamos.cargando && estadoPrestamos.error && (
              <p className="detalle-prestamos__estado detalle-prestamos__estado--error">
                No se pudieron cargar los prestamos asociados.
              </p>
            )}

            {!estadoPrestamos.cargando && !estadoPrestamos.error && prestamosCliente.length === 0 && (
              <p className="detalle-prestamos__estado">No hay prestamos registrados para este cliente.</p>
            )}

            {!estadoPrestamos.cargando && !estadoPrestamos.error && prestamosCliente.length > 0 && (
              <table className="detalle-prestamos__tabla">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Monto</th>
                    <th>Cuotas</th>
                    <th>Total</th>
                    <th>Vencidas</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {prestamosCliente.map(function renderPrestamo(prestamo, index) {
                    let claveFila = prestamo.id ? prestamo.id : 'prestamo-' + index;
                    let textoTipo = prestamo.tipo === 'DISCRECIONAL' ? 'Discrecional' : 'Estandar';

                    return (
                      <tr key={claveFila}>
                        <td>
                          <section className="detalle-prestamos__tipo">
                            <strong>{textoTipo}</strong>
                            <BadgeDiscrecional mostrar={prestamo.esDiscrecional} />
                          </section>
                        </td>
                        <td>${formatearNumero(prestamo.monto)}</td>
                        <td>{formatearNumero(prestamo.cuotas)}</td>
                        <td>${formatearNumero(prestamo.totalAPagar)}</td>
                        <td>{formatearNumero(prestamo.cuotasVencidas)}</td>
                        <td>
                          <BadgeEstadoPrestamo estado={prestamo.estado} />
                        </td>
                        <td>
                          <section className="detalle-prestamos__acciones">
                            <Boton
                              texto="Ver"
                              tipo="secundario"
                              onClick={function abrirDetalle() {
                                navegarDetallePrestamo(prestamo);
                              }}
                            />
                          </section>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        </section>

        {/* Es el historial de scoring del cliente. Se arma desde scoringHistory (mock) y muestra cada calculo pasado:
            fecha (calculatedAt), score final, categoria, cantidad de ajustes y un resumen de motivos. Al expandir,
            se ve el detalle de scoreBase, la lista de adjustments (descripcion + valor), reasons y alerts. */}
        <section className="detalle-card detalle-card--full">
          <h2>Historial</h2>
          {historial.length === 0 && <p>No hay historial disponible.</p>}
          {historial.length > 0 && (
            <section className="historial-tabla">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Score</th>
                    <th>Categoria</th>
                    <th>Ajustes</th>
                    <th>Motivos</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map(function renderFila(item, index) {
                    let claveFila = item.calculatedAt ? item.calculatedAt : 'fila-' + index;
                    let estaExpandida = filaExpandida === claveFila;

                    return (
                      <Fragment key={claveFila}>
                        <tr>
                          <td>{formatearFechaSimple(item.calculatedAt)}</td>
                          <td>{obtenerTextoSeguro(item.scoreFinal)}</td>
                          <td>{obtenerTextoCategoria(item.category)}</td>
                          <td>{resumirAjustes(item.adjustments)}</td>
                          <td>{resumirMotivos(item.reasons)}</td>
                          <td>
                            <button
                              type="button"
                              className="historial-tabla__toggle"
                              onClick={function alternar() {
                                setFilaExpandida(estaExpandida ? null : claveFila);
                              }}
                            >
                              {estaExpandida ? 'Ocultar' : 'Ver detalle'}
                            </button>
                          </td>
                        </tr>
                        {estaExpandida && (
                          <tr className="historial-tabla__detalle">
                            <td colSpan="6">
                              <section>
                                <strong>Score base:</strong> {obtenerTextoSeguro(item.scoreBase)}
                              </section>
                              <section>
                                <strong>Ajustes:</strong>
                                <ul>
                                  {item.adjustments && item.adjustments.length > 0 ? (
                                    item.adjustments.map(function renderAjuste(ajuste, indice) {
                                      let textoAjuste = ajuste && ajuste.description ? ajuste.description : ajuste;
                                      let valorAjuste = ajuste && ajuste.value !== undefined ? ajuste.value : '';
                                      return (
                                        <li key={indice}>
                                          {String(textoAjuste)}{valorAjuste !== '' ? ' (' + valorAjuste + ')' : ''}
                                        </li>
                                      );
                                    })
                                  ) : (
                                    <li>Sin ajustes.</li>
                                  )}
                                </ul>
                              </section>
                              <section>
                                <strong>Motivos:</strong>
                                <ul>
                                  {item.reasons && item.reasons.length > 0 ? (
                                    item.reasons.map(function renderMotivo(motivo, indice) {
                                      return <li key={indice}>{String(motivo)}</li>;
                                    })
                                  ) : (
                                    <li>Sin motivos.</li>
                                  )}
                                </ul>
                              </section>
                              <section>
                                <strong>Alertas:</strong>
                                <ul>
                                  {item.alerts && item.alerts.length > 0 ? (
                                    item.alerts.map(function renderAlerta(alerta, indice) {
                                      return <li key={indice}>{alerta}</li>;
                                    })
                                  ) : (
                                    <li>Sin alertas.</li>
                                  )}
                                </ul>
                              </section>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}
        </section>
      </section>
    </section>
  );
}

export default PaginaDetalleCliente;
