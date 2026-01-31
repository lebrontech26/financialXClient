import { useState } from 'react';
import '../../../CSS/paginasCSS/prestamos/PaginaCrearPrestamoDiscrecional.css';
import Boton from '../../atomicosJSX/prestamos/Boton.jsx';
import InputTexto from '../../atomicosJSX/prestamos/InputTexto.jsx';
import InputAreaTexto from '../../atomicosJSX/prestamos/InputAreaTexto.jsx';
import InputSeleccion from '../../atomicosJSX/prestamos/InputSeleccion.jsx';
import InputCheck from '../../atomicosJSX/prestamos/InputCheck.jsx';
import FormularioGarantia from '../../moleculasJSX/prestamos/FormularioGarantia.jsx';
import BadgeDiscrecional from '../../moleculasJSX/prestamos/BadgeDiscrecional.jsx';
import { crearPrestamoDiscrecional } from '../../../servicios/prestamosApi.js';
import { usarEstadoAsync } from '../../../utilidades/usarEstadoAsync.js';
import {
  formatearNumeroEntrada,
  obtenerNumeroDesdeEntrada,
  generarFranjasHorariasMediaHora
} from '../../../utilidades/ui.js';

// Pagina para alta discrecional con control explicito de motivo y riesgos.
function PaginaCrearPrestamoDiscrecional(props) {
  let [campos, setCampos] = useState(obtenerCamposIniciales());
  let [garantia, setGarantia] = useState(obtenerGarantiaInicial());
  let [mostrarErrores, setMostrarErrores] = useState(false);
  let [mensajeEstado, setMensajeEstado] = useState('');
  let estadoEnvio = usarEstadoAsync(null);

  // Vuelve al listado principal de prestamos.
  function volverALista() {
    if (props.onNavegar) {
      props.onNavegar('/prestamos');
    }
  }

  // Actualiza campos principales del formulario discrecional.
  function manejarCambio(evento) {
    let nombreCampo = evento.target.name;
    let valorCampo = evento.target.value;

    if (nombreCampo === 'monto') {
      valorCampo = formatearNumeroEntrada(valorCampo);
    }

    setCampos(function actualizar(previo) {
      let copia = { ...previo };
      copia[nombreCampo] = valorCampo;
      return copia;
    });
  }

  // Cambia el estado del toggle de garantia.
  function manejarCambioGarantiaRequerida(evento) {
    let activa = evento.target.checked;

    setCampos(function actualizar(previo) {
      let copia = { ...previo };
      copia.requiereGarantia = activa;
      return copia;
    });
  }

  // Sincroniza los datos de garantia cuando aplica.
  function actualizarGarantia(nuevaGarantia) {
    setGarantia(nuevaGarantia);
  }

  // Envia el formulario discrecional al backend (mock).
  function manejarEnvio(evento) {
    evento.preventDefault();
    setMostrarErrores(true);

    let errores = validarCampos(campos, garantia);

    if (Object.keys(errores).length > 0) {
      return;
    }

    let datosPrestamo = construirDatosDiscrecional(props.idCliente, campos, garantia);

    setMensajeEstado('Registrando prestamo discrecional...');
    estadoEnvio.establecerCargando(true);

    crearPrestamoDiscrecional(datosPrestamo)
      .then(function manejarRespuesta(respuesta) {
        setMensajeEstado('Prestamo discrecional creado correctamente.');
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
          mensaje = 'No tienes permisos para crear prestamos discrecionales.';
        }

        setMensajeEstado('');
        estadoEnvio.establecerError({
          mensaje: mensaje,
          detalles: error && error.details ? error.details : null
        });
      });
  }

  let erroresFormulario = validarCampos(campos, garantia);
  let opcionesPlazo = [
    { valor: 'SEMANAS', etiqueta: 'Semanas' },
    { valor: 'MESES', etiqueta: 'Meses' }
  ];
  let opcionesHorario = generarFranjasHorariasMediaHora();

  return (
    <section className="pagina-crear-discrecional">
      <header className="pagina-crear-discrecional__encabezado">
        <section>
          <h1>Nuevo prestamo discrecional</h1>
          <p>Cliente: {props.idCliente ? props.idCliente : 'Sin identificar'}</p>
        </section>
        <Boton texto="Volver" tipo="secundario" onClick={volverALista} />
      </header>

      <article className="pagina-crear-discrecional__aviso">
        <BadgeDiscrecional mostrar={true} />
        <p>
          Este prestamo fue autorizado de forma discrecional y no sigue las reglas estandar del sistema.
        </p>
      </article>

      <form className="formulario-discrecional" onSubmit={manejarEnvio}>
        <section className="formulario-discrecional__campo">
          <label htmlFor="discrecional-monto">Monto</label>
          <InputTexto
            id="discrecional-monto"
            name="monto"
            valor={campos.monto}
            onChange={manejarCambio}
            placeholder="Ej: 200000"
            deshabilitado={estadoEnvio.cargando}
            min="0"
          />
          <small className="formulario-discrecional__error">{mostrarErrores ? erroresFormulario.monto : ''}</small>
        </section>

        <section className="formulario-discrecional__campo">
          <label htmlFor="discrecional-tasa">Tasa de interes (decimal)</label>
          <InputTexto
            id="discrecional-tasa"
            name="tasaInteres"
            tipo="number"
            valor={campos.tasaInteres}
            onChange={manejarCambio}
            placeholder="Ej: 0.5"
            deshabilitado={estadoEnvio.cargando}
            min="0"
            step="0.01"
          />
          <small className="formulario-discrecional__error">{mostrarErrores ? erroresFormulario.tasaInteres : ''}</small>
        </section>

        <section className="formulario-discrecional__fila">
          <section className="formulario-discrecional__campo">
            <label htmlFor="discrecional-plazo-unidad">Unidad de plazo</label>
            <InputSeleccion
              id="discrecional-plazo-unidad"
              name="plazoUnidad"
              valor={campos.plazoUnidad}
              onChange={manejarCambio}
              opciones={opcionesPlazo}
              placeholder="Seleccionar"
              deshabilitado={estadoEnvio.cargando}
            />
            <small className="formulario-discrecional__error">{mostrarErrores ? erroresFormulario.plazoUnidad : ''}</small>
          </section>

          <section className="formulario-discrecional__campo">
            <label htmlFor="discrecional-plazo-valor">Cantidad</label>
            <InputTexto
              id="discrecional-plazo-valor"
              name="plazoValor"
              tipo="number"
              valor={campos.plazoValor}
              onChange={manejarCambio}
              placeholder="Ej: 6"
              deshabilitado={estadoEnvio.cargando}
              min="0"
            />
            <small className="formulario-discrecional__error">{mostrarErrores ? erroresFormulario.plazoValor : ''}</small>
          </section>
        </section>

        <section className="formulario-discrecional__campo">
          <label htmlFor="discrecional-horario">Horario preferido de cobro</label>
          <InputSeleccion
            id="discrecional-horario"
            name="horarioCobroPreferido"
            valor={campos.horarioCobroPreferido}
            onChange={manejarCambio}
            opciones={opcionesHorario}
            placeholder="Seleccionar franja"
            deshabilitado={estadoEnvio.cargando}
          />
          <small className="formulario-discrecional__error">
            {mostrarErrores ? erroresFormulario.horarioCobroPreferido : ''}
          </small>
        </section>

        <section className="formulario-discrecional__campo">
          <label htmlFor="discrecional-motivo">Motivo de la decision</label>
          <InputAreaTexto
            id="discrecional-motivo"
            name="motivo"
            valor={campos.motivo}
            onChange={manejarCambio}
            placeholder="Detalle la razon de la excepcion"
            filas={4}
            deshabilitado={estadoEnvio.cargando}
          />
          <small className="formulario-discrecional__error">{mostrarErrores ? erroresFormulario.motivo : ''}</small>
        </section>

        <section className="formulario-discrecional__campo formulario-discrecional__campo--check">
          <InputCheck
            id="discrecional-garantia"
            name="requiereGarantia"
            valor={campos.requiereGarantia}
            onChange={manejarCambioGarantiaRequerida}
            deshabilitado={estadoEnvio.cargando}
          />
          <label htmlFor="discrecional-garantia">Requiere garantia</label>
        </section>

        {campos.requiereGarantia && (
          <section className="formulario-discrecional__garantia">
            <header>
              <h2>Garantia opcional</h2>
              <p>Completa los datos si la garantia es requerida.</p>
            </header>
            <FormularioGarantia
              datos={garantia}
              errores={erroresFormulario.garantia ? erroresFormulario.garantia : {}}
              mostrarErrores={mostrarErrores}
              onCambiar={actualizarGarantia}
              deshabilitado={estadoEnvio.cargando}
            />
          </section>
        )}

        {estadoEnvio.error && (
          <section className="formulario-discrecional__estado formulario-discrecional__estado--error">
            <strong>{estadoEnvio.error.mensaje}</strong>
            {estadoEnvio.error.detalles && (
              <small>{serializarErrores(estadoEnvio.error.detalles)}</small>
            )}
          </section>
        )}

        {mensajeEstado && (
          <section className="formulario-discrecional__estado">
            {mensajeEstado}
          </section>
        )}

        <footer className="formulario-discrecional__acciones">
          <Boton texto="Cancelar" tipo="secundario" onClick={volverALista} />
          <Boton texto="Guardar" tipo="primario" tipoHtml="submit" deshabilitado={estadoEnvio.cargando} />
        </footer>
      </form>
    </section>
  );
}

// Inicializa los campos principales del formulario discrecional.
function obtenerCamposIniciales() {
  return {
    monto: '',
    tasaInteres: '',
    plazoUnidad: '',
    plazoValor: '',
    horarioCobroPreferido: '',
    motivo: '',
    requiereGarantia: false
  };
}

// Inicializa la garantia con valores vacios.
function obtenerGarantiaInicial() {
  return {
    descripcion: '',
    valorRecuperable: '',
    ubicacion: '',
    observaciones: '',
    fotos: []
  };
}

// Valida reglas basicas del formulario discrecional.
function validarCampos(campos, garantia) {
  let errores = {};

  if (!campos.monto) {
    errores.monto = 'El monto es obligatorio.';
  } else if (!esNumeroEnteroValido(campos.monto)) {
    errores.monto = 'El monto debe ser numerico.';
  }

  if (!campos.tasaInteres) {
    errores.tasaInteres = 'La tasa es obligatoria.';
  } else if (!esNumeroDecimalValido(campos.tasaInteres)) {
    errores.tasaInteres = 'La tasa debe ser numerica.';
  }

  if (!campos.plazoUnidad) {
    errores.plazoUnidad = 'Selecciona una unidad.';
  }

  if (!campos.plazoValor) {
    errores.plazoValor = 'La cantidad es obligatoria.';
  } else if (!esNumeroDecimalValido(campos.plazoValor)) {
    errores.plazoValor = 'La cantidad debe ser numerica.';
  }

  if (!campos.horarioCobroPreferido) {
    errores.horarioCobroPreferido = 'El horario de cobro es obligatorio.';
  }

  if (!campos.motivo) {
    errores.motivo = 'El motivo es obligatorio.';
  }

  if (campos.requiereGarantia) {
    let erroresGarantia = validarGarantia(garantia);
    if (Object.keys(erroresGarantia).length > 0) {
      errores.garantia = erroresGarantia;
    }
  }

  return errores;
}

// Valida reglas de garantia cuando aplica en discrecional.
function validarGarantia(garantia) {
  let errores = {};

  if (!garantia.descripcion) {
    errores.descripcion = 'La descripcion es obligatoria.';
  }

  if (!garantia.valorRecuperable) {
    errores.valorRecuperable = 'El valor recuperable es obligatorio.';
  } else if (!esNumeroEnteroValido(garantia.valorRecuperable)) {
    errores.valorRecuperable = 'El valor recuperable debe ser numerico.';
  }

  if (!garantia.ubicacion) {
    errores.ubicacion = 'La ubicacion es obligatoria.';
  }

  return errores;
}

// Construye los datos respetando las reglas discrecionales.
function construirDatosDiscrecional(idCliente, campos, garantia) {
  let datosPrestamo = {
    idCliente: idCliente,
    cliente: obtenerNombreClienteDemo(idCliente),
    monto: obtenerNumeroDesdeEntrada(campos.monto),
    tasaInteres: Number(campos.tasaInteres),
    plazo: {
      unidad: campos.plazoUnidad,
      valor: Number(campos.plazoValor)
    },
    horarioCobroPreferido: campos.horarioCobroPreferido,
    motivo: campos.motivo
  };

  if (campos.requiereGarantia) {
    datosPrestamo.garantia = {
      descripcion: garantia.descripcion,
      valorRecuperable: obtenerNumeroDesdeEntrada(garantia.valorRecuperable),
      ubicacion: garantia.ubicacion,
      observaciones: garantia.observaciones,
      fotos: garantia.fotos
    };
  }

  return datosPrestamo;
}

// Devuelve un nombre demo para mantener coherencia visual.
function obtenerNombreClienteDemo(idCliente) {
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
function esNumeroEnteroValido(valor) {
  let numero = obtenerNumeroDesdeEntrada(valor);
  return !Number.isNaN(numero) && numero > 0;
}

function esNumeroDecimalValido(valor) {
  let numero = Number(valor);
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

export default PaginaCrearPrestamoDiscrecional;
