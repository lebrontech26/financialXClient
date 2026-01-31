import { useEffect, useState } from 'react';
import '../../../CSS/paginasCSS/prestamos/PaginaCrearPrestamoEstandar.css';
import Boton from '../../atomicosJSX/prestamos/Boton.jsx';
import InputTexto from '../../atomicosJSX/prestamos/InputTexto.jsx';
import InputSeleccion from '../../atomicosJSX/prestamos/InputSeleccion.jsx';
import InputCheck from '../../atomicosJSX/prestamos/InputCheck.jsx';
import TablaSimulacionPrestamo from '../../moleculasJSX/prestamos/TablaSimulacionPrestamo.jsx';
import FormularioGarantia from '../../moleculasJSX/prestamos/FormularioGarantia.jsx';
import BadgeEstadoPrestamo from '../../moleculasJSX/prestamos/BadgeEstadoPrestamo.jsx';
import { simularPrestamo, crearPrestamoEstandar } from '../../../servicios/prestamosApi.js';
import { obtenerClientePorId } from '../../../servicios/clientsApi.js';
import { obtenerClienteMock } from '../../../datos/clientesMock.js';
import { usarEstadoAsync } from '../../../utilidades/usarEstadoAsync.js';
import {
  formatearNumero,
  formatearNumeroEntrada,
  obtenerNumeroDesdeEntrada,
  generarFranjasHorariasMediaHora
} from '../../../utilidades/ui.js';

// Pagina para dar de alta un prestamo estandar con flujo guiado.
function PaginaCrearPrestamoEstandar(props) {
  let [pasoActual, setPasoActual] = useState(1);
  let [montoSolicitado, setMontoSolicitado] = useState('');
  let [mostrarErroresMonto, setMostrarErroresMonto] = useState(false);
  let [horarioCobroPreferido, setHorarioCobroPreferido] = useState('');
  let [mostrarErroresHorario, setMostrarErroresHorario] = useState(false);
  let [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  let [garantia, setGarantia] = useState(obtenerGarantiaInicial());
  let [mostrarErroresGarantia, setMostrarErroresGarantia] = useState(false);
  let [confirmacionLegal, setConfirmacionLegal] = useState(false);
  let [mensajeEstado, setMensajeEstado] = useState('');
  let estadoCliente = usarEstadoAsync(null);
  let estadoSimulacion = usarEstadoAsync({ opciones: [] });
  let estadoEnvio = usarEstadoAsync(null);

  // Carga el cliente para obtener score y tope maximo.
  function cargarCliente() {
    if (!props.idCliente) {
      return;
    }

    estadoCliente.establecerCargando(true);

    obtenerClienteParaPrestamo(props.idCliente)
      .then(function manejarDatos(datos) {
        estadoCliente.establecerDatos(datos);
      })
      .catch(function manejarError(error) {
        estadoCliente.establecerError(error);
      });
  }

  useEffect(cargarCliente, [props.idCliente]);

  // Vuelve al listado principal de prestamos.
  function volverALista() {
    if (props.onNavegar) {
      props.onNavegar('/prestamos');
    }
  }

  // Actualiza el monto solicitado y limpia la seleccion previa.
  function manejarCambioMonto(evento) {
    setMontoSolicitado(formatearNumeroEntrada(evento.target.value));
    setOpcionSeleccionada(null);
    setPasoActual(1);
    estadoSimulacion.establecerDatos({ opciones: [] });
  }

  // Actualiza el horario preferido de cobro.
  function manejarCambioHorario(evento) {
    setHorarioCobroPreferido(evento.target.value);
    setMostrarErroresHorario(false);
  }

  // Solicita opciones de pago segun monto valido.
  function solicitarOpciones() {
    setMostrarErroresMonto(true);

    let datosCliente = estadoCliente.datos ? estadoCliente.datos : null;
    let score = obtenerScoreCliente(datosCliente);
    let montoMaximo = obtenerMontoMaximo(score);
    let mensajeError = validarMonto(montoSolicitado, montoMaximo);

    if (mensajeError) {
      return;
    }

    estadoSimulacion.establecerCargando(true);

    simularPrestamo(props.idCliente, obtenerNumeroDesdeEntrada(montoSolicitado))
      .then(function manejarDatos(datos) {
        estadoSimulacion.establecerDatos(datos);
      })
      .catch(function manejarError(error) {
        estadoSimulacion.establecerError(error);
      });
  }

  // Avanza al paso 2 con la opcion seleccionada.
  function seleccionarOpcion(opcion) {
    setOpcionSeleccionada(opcion);
    if (!horarioCobroPreferido) {
      setMostrarErroresHorario(true);
      return;
    }

    setPasoActual(2);
  }

  // Regresa al paso anterior segun la etapa actual.
  function volverPasoAnterior() {
    if (pasoActual === 2) {
      setPasoActual(1);
      return;
    }

    if (pasoActual === 3) {
      setPasoActual(2);
    }
  }

  // Actualiza el estado de la garantia mientras el usuario completa el formulario.
  function actualizarGarantia(nuevaGarantia) {
    setGarantia(nuevaGarantia);
  }

  // Confirma el paso de garantia tras validar campos obligatorios.
  function confirmarGarantia() {
    setMostrarErroresGarantia(true);

    let datosCliente = estadoCliente.datos ? estadoCliente.datos : null;
    let score = obtenerScoreCliente(datosCliente);
    let montoMaximo = obtenerMontoMaximo(score);
    let montoNumerico = Number(montoSolicitado);
    let valorMinimo = obtenerValorGarantiaMinimo(montoNumerico, score, montoMaximo);

    if (!esGarantiaValida(garantia, valorMinimo)) {
      return;
    }

    setPasoActual(3);
  }

  // Actualiza el checkbox legal obligatorio antes de enviar.
  function manejarConfirmacionLegal(evento) {
    setConfirmacionLegal(evento.target.checked);
  }

  // Ejecuta el envio final del prestamo estandar.
  function confirmarPrestamo() {
    if (!opcionSeleccionada || !confirmacionLegal || !horarioCobroPreferido) {
      if (!horarioCobroPreferido) {
        setMostrarErroresHorario(true);
      }
      return;
    }

    let datosPrestamo = construirDatosEstandar(
      props.idCliente,
      opcionSeleccionada,
      garantia,
      datosCliente,
      horarioCobroPreferido
    );

    setMensajeEstado('Registrando prestamo estandar...');
    estadoEnvio.establecerCargando(true);

    crearPrestamoEstandar(datosPrestamo)
      .then(function manejarRespuesta(respuesta) {
        setMensajeEstado('Prestamo creado correctamente.');
        estadoEnvio.establecerDatos(respuesta);

        if (respuesta && respuesta.id && props.onNavegar) {
          props.onNavegar('/prestamos/' + respuesta.id);
        }
      })
      .catch(function manejarError(error) {
        let mensaje = 'Ocurrio un error al crear el prestamo.';

        if (error && error.status === 400) {
          mensaje = 'Revisa los datos ingresados e intenta nuevamente.';
        }
        if (error && error.status === 403) {
          mensaje = 'No tienes permisos para crear prestamos.';
        }

        setMensajeEstado('');
        estadoEnvio.establecerError({
          mensaje: mensaje,
          detalles: error && error.details ? error.details : null
        });
      });
  }

  let datosCliente = estadoCliente.datos ? estadoCliente.datos : null;
  let score = obtenerScoreCliente(datosCliente);
  let montoMaximo = obtenerMontoMaximo(score);
  let tasaSemanal = obtenerTasaSemanalDemo();
  let tasaMensual = obtenerTasaMensualDemo();
  let mensajeErrorMonto = validarMonto(montoSolicitado, montoMaximo);
  let mensajeErrorHorario = validarHorarioCobro(horarioCobroPreferido);
  let opcionesHorario = generarFranjasHorariasMediaHora();
  let datosSimulacion = estadoSimulacion.datos ? estadoSimulacion.datos : { opciones: [] };
  let montoNumerico = obtenerNumeroDesdeEntrada(montoSolicitado);
  let valorGarantiaMinimo = obtenerValorGarantiaMinimo(montoNumerico, score, montoMaximo);
  let erroresGarantia = validarGarantia(garantia, valorGarantiaMinimo);
  let moraDiaria = opcionSeleccionada ? calcularMoraDiaria(opcionSeleccionada.monto) : 0;

  return (
    <section className="pagina-crear-prestamo">
      <header className="pagina-crear-prestamo__encabezado">
        <section>
          <h1>Nuevo prestamo estandar</h1>
          <p>Cliente: {props.idCliente ? props.idCliente : 'Sin identificar'}</p>
        </section>
        <Boton texto="Volver" tipo="secundario" onClick={volverALista} />
      </header>

      <section className="pagina-crear-prestamo__pasos">
        <article className={pasoActual === 1 ? 'paso paso--activo' : 'paso'}>
          <small>1</small>
          <p>Monto y opciones</p>
        </article>
        <article className={pasoActual === 2 ? 'paso paso--activo' : 'paso'}>
          <small>2</small>
          <p>Garantia</p>
        </article>
        <article className={pasoActual === 3 ? 'paso paso--activo' : 'paso'}>
          <small>3</small>
          <p>Confirmacion</p>
        </article>
      </section>

      {pasoActual === 1 && (
        <section className="paso-contenido">
          <article className="paso-contenido__panel">
            <header>
              <h2>Monto solicitado</h2>
              <p>Define el monto para calcular las opciones semanales o mensuales.</p>
            </header>

            {estadoCliente.cargando && (
              <section className="paso-contenido__estado">Cargando cliente...</section>
            )}

            {!estadoCliente.cargando && estadoCliente.error && (
              <section className="paso-contenido__estado paso-contenido__estado--error">
                <strong>No se pudo cargar el cliente.</strong>
              </section>
            )}

            {!estadoCliente.cargando && !estadoCliente.error && (
              <section className="resumen-cliente">
                <article>
                  <small>Score actual</small>
                  <strong>{formatearNumero(score)}</strong>
                </article>
                <article>
                  <small>Monto maximo</small>
                  <strong>${formatearNumero(montoMaximo)}</strong>
                </article>
                <article>
                  <small>Interes semanal</small>
                  <strong>{formatearTasa(tasaSemanal)}</strong>
                </article>
                <article>
                  <small>Interes mensual</small>
                  <strong>{formatearTasa(tasaMensual)}</strong>
                </article>
              </section>
            )}

            <section className="formulario-monto">
              <label htmlFor="monto-solicitado">Monto a solicitar</label>
              <InputTexto
                id="monto-solicitado"
                name="montoSolicitado"
                valor={montoSolicitado}
                onChange={manejarCambioMonto}
                placeholder="Ej: 500000"
                deshabilitado={estadoEnvio.cargando}
                min="0"
              />
              <small className="formulario-monto__error">
                {mostrarErroresMonto && mensajeErrorMonto ? mensajeErrorMonto : ''}
              </small>
            </section>

            <section className="formulario-monto">
              <label htmlFor="horario-cobro">Horario preferido de cobro</label>
              <InputSeleccion
                id="horario-cobro"
                name="horarioCobroPreferido"
                valor={horarioCobroPreferido}
                onChange={manejarCambioHorario}
                opciones={opcionesHorario}
                placeholder="Seleccionar franja"
                deshabilitado={estadoEnvio.cargando}
              />
              <small className="formulario-monto__error">
                {mostrarErroresHorario && mensajeErrorHorario ? mensajeErrorHorario : ''}
              </small>
            </section>

            <section className="formulario-monto__acciones">
              <Boton
                texto="Calcular opciones"
                tipo="primario"
                onClick={solicitarOpciones}
                deshabilitado={!!mensajeErrorMonto}
              />
            </section>

            {estadoSimulacion.cargando && (
              <section className="paso-contenido__estado">Cargando opciones...</section>
            )}

            {!estadoSimulacion.cargando && estadoSimulacion.error && (
              <section className="paso-contenido__estado paso-contenido__estado--error">
                <article>
                  <strong>Ocurrio un error al simular.</strong>
                  <p>
                    {estadoSimulacion.error.message
                      ? estadoSimulacion.error.message
                      : 'Revisa la conexion o intenta nuevamente.'}
                  </p>
                </article>
              </section>
            )}

            {!estadoSimulacion.cargando && !estadoSimulacion.error && datosSimulacion.opciones.length === 0 && (
              <section className="paso-contenido__estado">Ingresa un monto para ver opciones.</section>
            )}

            {!estadoSimulacion.cargando && !estadoSimulacion.error && datosSimulacion.opciones.length > 0 && (
              <TablaSimulacionPrestamo
                opciones={datosSimulacion.opciones}
                opcionSeleccionada={opcionSeleccionada}
                onSeleccionar={seleccionarOpcion}
              />
            )}
          </article>
        </section>
      )}

      {pasoActual === 2 && (
        <section className="paso-contenido">
          <article className="paso-contenido__panel">
            <header>
              <h2>Garantia obligatoria</h2>
              <p>Completa la informacion solicitada para validar cobertura.</p>
            </header>

            <section className="resumen-garantia">
              <article>
                <small>Valor minimo requerido</small>
                <strong>${formatearNumero(valorGarantiaMinimo)}</strong>
              </article>
              <article>
                <small>Factor aplicado</small>
                <strong>{obtenerFactorCobertura(score)}x</strong>
              </article>
            </section>

            <FormularioGarantia
              datos={garantia}
              errores={erroresGarantia}
              mostrarErrores={mostrarErroresGarantia}
              onCambiar={actualizarGarantia}
              deshabilitado={estadoEnvio.cargando}
            />

            <footer className="paso-contenido__acciones">
              <Boton texto="Volver" tipo="secundario" onClick={volverPasoAnterior} />
              <Boton texto="Continuar" tipo="primario" onClick={confirmarGarantia} />
            </footer>
          </article>
        </section>
      )}

      {pasoActual === 3 && opcionSeleccionada && (
        <section className="paso-contenido">
          <article className="paso-contenido__panel">
            <header>
              <h2>Confirmacion final</h2>
              <p>Verifica los datos antes de confirmar el prestamo.</p>
            </header>

            <section className="resumen-prestamo">
              <article>
                <small>Tipo</small>
                <strong>Estandar</strong>
              </article>
              <article>
                <small>Monto</small>
                <strong>${formatearNumero(opcionSeleccionada.monto)}</strong>
              </article>
              <article>
                <small>Total a pagar</small>
                <strong>${formatearNumero(opcionSeleccionada.totalAPagar)}</strong>
              </article>
              <article>
                <small>Cuota</small>
                <strong>${formatearNumero(opcionSeleccionada.cuota)}</strong>
              </article>
              <article>
                <small>Plazo</small>
                <strong>{opcionSeleccionada.plazo}</strong>
              </article>
              <article>
                <small>Tasa</small>
                <strong>{formatearTasa(opcionSeleccionada.tasaInteres)}</strong>
              </article>
              <article>
                <small>Horario de cobro</small>
                <strong>{horarioCobroPreferido}</strong>
              </article>
              <article>
                <small>Estado inicial</small>
                <BadgeEstadoPrestamo estado="ACTIVO" />
              </article>
            </section>

            <section className="resumen-prestamo__garantia">
              <h3>Garantia registrada</h3>
              <article>
                <small>Descripcion</small>
                <strong>{garantia.descripcion}</strong>
              </article>
              <article>
                <small>Valor recuperable</small>
                <strong>${formatearNumero(garantia.valorRecuperable)}</strong>
              </article>
              <article>
                <small>Ubicacion</small>
                <strong>{garantia.ubicacion}</strong>
              </article>
              <article>
                <small>Observaciones</small>
                <strong>{garantia.observaciones ? garantia.observaciones : 'Sin observaciones'}</strong>
              </article>
            </section>

            <section className="resumen-prestamo__condiciones">
              <h3>Condiciones clave</h3>
              <p>
                Mora diaria del 1% sobre el capital: ${formatearNumero(moraDiaria)} por dia.
              </p>
              <p>Mas de 2 cuotas vencidas habilita ejecucion automatica de garantia.</p>
            </section>

            <section className="resumen-prestamo__confirmacion">
              <InputCheck
                id="confirmacion-legal"
                name="confirmacionLegal"
                valor={confirmacionLegal}
                onChange={manejarConfirmacionLegal}
                deshabilitado={estadoEnvio.cargando}
              />
              <label htmlFor="confirmacion-legal">
                Confirmo que el cliente acepta las condiciones del prestamo.
              </label>
            </section>

            {estadoEnvio.error && (
              <section className="paso-contenido__estado paso-contenido__estado--error">
                <article>
                  <strong>{estadoEnvio.error.mensaje}</strong>
                  {estadoEnvio.error.detalles && (
                    <small>{serializarErrores(estadoEnvio.error.detalles)}</small>
                  )}
                </article>
              </section>
            )}

            {mensajeEstado && (
              <section className="paso-contenido__estado">
                {mensajeEstado}
              </section>
            )}

            <footer className="paso-contenido__acciones">
              <Boton texto="Volver" tipo="secundario" onClick={volverPasoAnterior} />
              <Boton
                texto="Confirmar prestamo"
                tipo="primario"
                onClick={confirmarPrestamo}
                deshabilitado={!confirmacionLegal || estadoEnvio.cargando}
              />
            </footer>
          </article>
        </section>
      )}
    </section>
  );
}

// Usa mocks para clientes cuando el modulo de prestamos esta en modo demo.
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

// Inicializa los campos de garantia en blanco.
function obtenerGarantiaInicial() {
  return {
    descripcion: '',
    valorRecuperable: '',
    ubicacion: '',
    observaciones: '',
    fotos: []
  };
}

// Obtiene el score desde la estructura del cliente.
function obtenerScoreCliente(cliente) {
  if (!cliente) {
    return 0;
  }

  if (cliente.currentRiskProfile && cliente.currentRiskProfile.scoreFinal !== undefined) {
    return Number(cliente.currentRiskProfile.scoreFinal);
  }

  if (cliente.score !== undefined) {
    return Number(cliente.score);
  }

  return 0;
}

// Determina el monto maximo segun score.
function obtenerMontoMaximo(score) {
  if (Number.isNaN(Number(score))) {
    return 200000;
  }

  if (score >= 80) {
    return 2000000;
  }

  if (score >= 60) {
    return 1000000;
  }

  if (score >= 50) {
    return 500000;
  }

  return 200000;
}

// Valida el monto ingresado segun reglas de negocio.
function validarMonto(valor, maximo) {
  if (!valor) {
    return 'El monto es obligatorio.';
  }

  let numero = obtenerNumeroDesdeEntrada(valor);
  if (Number.isNaN(numero) || numero <= 0) {
    return 'El monto debe ser un numero positivo.';
  }

  if (numero > maximo) {
    return 'El monto supera el maximo permitido.';
  }

  return '';
}

function validarHorarioCobro(valor) {
  if (!valor) {
    return 'El horario de cobro es obligatorio.';
  }

  return '';
}

// Determina el factor de cobertura segun scoring.
function obtenerFactorCobertura(score) {
  return score >= 51 ? 2 : 3;
}

// Calcula el valor minimo de garantia segun monto y score.
function obtenerValorGarantiaMinimo(monto, score, maximo) {
  if (!esNumeroValido(monto) || monto > maximo) {
    return 0;
  }

  return monto * obtenerFactorCobertura(score);
}

// Valida reglas basicas del formulario de garantia.
function validarGarantia(garantia, valorMinimo) {
  let errores = {};

  if (!garantia.descripcion) {
    errores.descripcion = 'La descripcion es obligatoria.';
  }

  if (!garantia.valorRecuperable) {
    errores.valorRecuperable = 'El valor recuperable es obligatorio.';
  } else if (!esNumeroValido(garantia.valorRecuperable)) {
    errores.valorRecuperable = 'El valor recuperable debe ser numerico.';
  } else if (valorMinimo > 0 && obtenerNumeroDesdeEntrada(garantia.valorRecuperable) < valorMinimo) {
    errores.valorRecuperable = 'El valor recuperable no cubre el minimo requerido.';
  }

  if (!garantia.ubicacion) {
    errores.ubicacion = 'La ubicacion es obligatoria.';
  }

  return errores;
}

// Determina si el formulario de garantia es valido.
function esGarantiaValida(garantia, valorMinimo) {
  return Object.keys(validarGarantia(garantia, valorMinimo)).length === 0;
}

// Construye los datos finales para el alta estandar.
function construirDatosEstandar(idCliente, opcion, garantia, datosCliente, horarioCobroPreferido) {
  return {
    idCliente: idCliente,
    cliente: obtenerNombreCliente(datosCliente, idCliente),
    monto: opcion.monto,
    tasaInteres: opcion.tasaInteres,
    plazo: opcion.plazoObjeto,
    totalAPagar: opcion.totalAPagar,
    cuotas: opcion.cuotas,
    horarioCobroPreferido: horarioCobroPreferido,
    garantia: {
      descripcion: garantia.descripcion,
      valorRecuperable: obtenerNumeroDesdeEntrada(garantia.valorRecuperable),
      ubicacion: garantia.ubicacion,
      observaciones: garantia.observaciones,
      fotos: garantia.fotos
    }
  };
}

// Devuelve el nombre del cliente si se conoce o usa un fallback demo.
function obtenerNombreCliente(datosCliente, idCliente) {
  if (datosCliente && datosCliente.firstName && datosCliente.lastName) {
    return datosCliente.firstName + ' ' + datosCliente.lastName;
  }

  let mapa = {
    '-1': 'Juan Perez',
    '-2': 'Laura Gomez',
    '-3': 'Marcelo Lopez',
    '-4': 'Ana Martinez',
    '-5': 'Carlos Fernandez',
    '-6': 'Sofia Ruiz',
    '-7': 'Lucas Sanchez'
  };

  return mapa[idCliente] ? mapa[idCliente] : 'Cliente sin nombre';
}

// Valida valores numericos positivos.
function esNumeroValido(valor) {
  let numero = obtenerNumeroDesdeEntrada(valor);
  return !Number.isNaN(numero) && numero > 0;
}

// Serializa errores simples para mostrar un resumen rapido.
function serializarErrores(detalles) {
  if (!detalles || typeof detalles !== 'object') {
    return '';
  }

  let entradas = Object.entries(detalles);
  return entradas.map(function unir(entrada) {
    return entrada[1];
  }).join(' ');
}

// Formatea la tasa en porcentaje para mostrarla en el resumen.
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

// Calcula la mora diaria tomando el 1% del capital.
function calcularMoraDiaria(capital) {
  let base = Number(capital);

  if (Number.isNaN(base) || base <= 0) {
    return 0;
  }

  return Math.round(base * 0.01);
}

// Devuelve la tasa semanal configurada para la demo.
function obtenerTasaSemanalDemo() {
  return 0.10;
}

// Devuelve la tasa mensual configurada para la demo.
function obtenerTasaMensualDemo() {
  return 0.30;
}

export default PaginaCrearPrestamoEstandar;
