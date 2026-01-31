import { useEffect, useState } from 'react';
import '../../../CSS/moleculasCSS/clientes/FormularioCliente.css';
import InputTexto from '../../atomicosJSX/clientes/InputTexto.jsx';
import InputSeleccion from '../../atomicosJSX/clientes/InputSeleccion.jsx';
import Boton from '../../atomicosJSX/clientes/Boton.jsx';

// Formulario reutilizable para crear o editar clientes con validaciones de UI.
function FormularioCliente(props) {
  let camposIniciales = obtenerCamposIniciales(props.datosIniciales);
  let [campos, setCampos] = useState(camposIniciales);
  let [errores, setErrores] = useState(validarCampos(camposIniciales, props));
  let [intentoEnviar, setIntentoEnviar] = useState(false);

  function sincronizarDatosIniciales() {
    if (props.datosIniciales) {
      let nuevosCampos = obtenerCamposIniciales(props.datosIniciales);
      setCampos(nuevosCampos);
      setErrores(validarCampos(nuevosCampos, props));
      setIntentoEnviar(false);
    }
  }

  useEffect(sincronizarDatosIniciales, [props.datosIniciales]);

  // Recalcula errores cada vez que cambian los campos para habilitar o bloquear el envio.
  function recalcularErrores() {
    setErrores(validarCampos(campos, props));
  }

  useEffect(recalcularErrores, [campos, props.cuilSoloLectura]);

  // Actualiza el estado del formulario cuando el usuario cambia un campo.
  function manejarCambio(evento) {
    let nombreCampo = evento.target.name;
    let valorCampo = evento.target.value;

    setCampos(function actualizar(previo) {
      let copia = { ...previo };
      copia[nombreCampo] = valorCampo;
      return copia;
    });
  }

  // Ejecuta la validacion final y dispara el callback de envio.
  function manejarEnvio(evento) {
    evento.preventDefault();
    setIntentoEnviar(true);

    if (!esFormularioValido(errores)) {
      return;
    }

    if (props.onEnviar) {
      props.onEnviar(construirPayload(campos, props));
    }
  }

  // Decide si se debe mostrar el mensaje de error segun el estado actual del formulario.
  function obtenerMensajeError(nombreCampo) {
    if (!errores[nombreCampo]) {
      return '';
    }

    if (intentoEnviar) {
      return errores[nombreCampo];
    }

    if (campos[nombreCampo]) {
      return errores[nombreCampo];
    }

    return '';
  }

  let formularioDeshabilitado = props.deshabilitado ? true : false;
  let botonDeshabilitado = formularioDeshabilitado || !esFormularioValido(errores);
  let cuilSoloLectura = props.cuilSoloLectura ? true : false;
  let opcionesProvincia = obtenerOpcionesProvincia();

  return (
    <form className="formulario-cliente" onSubmit={manejarEnvio}>
      <section className="formulario-cliente__grid">
        <section className="formulario-cliente__campo">
          <label htmlFor="cliente-nombre">Nombre</label>
          <InputTexto
            id="cliente-nombre"
            name="firstName"
            valor={campos.firstName}
            onChange={manejarCambio}
            placeholder="Ej: Juan"
            deshabilitado={formularioDeshabilitado}
          />
          <span className="formulario-cliente__error">{obtenerMensajeError('firstName')}</span>
        </section>

        <section className="formulario-cliente__campo">
          <label htmlFor="cliente-apellido">Apellido</label>
          <InputTexto
            id="cliente-apellido"
            name="lastName"
            valor={campos.lastName}
            onChange={manejarCambio}
            placeholder="Ej: Perez"
            deshabilitado={formularioDeshabilitado}
          />
          <span className="formulario-cliente__error">{obtenerMensajeError('lastName')}</span>
        </section>

        <section className="formulario-cliente__campo">
          <label htmlFor="cliente-cuil">CUIL</label>
          <InputTexto
            id="cliente-cuil"
            name="cuil"
            valor={campos.cuil}
            onChange={manejarCambio}
            placeholder="11 digitos"
            deshabilitado={formularioDeshabilitado}
            soloLectura={cuilSoloLectura}
          />
          <span className="formulario-cliente__error">{obtenerMensajeError('cuil')}</span>
        </section>

        <section className="formulario-cliente__campo">
          <label htmlFor="cliente-nacimiento">Fecha de nacimiento</label>
          <InputTexto
            id="cliente-nacimiento"
            name="birthDate"
            tipo="date"
            valor={campos.birthDate}
            onChange={manejarCambio}
            deshabilitado={formularioDeshabilitado}
          />
          <span className="formulario-cliente__error">{obtenerMensajeError('birthDate')}</span>
        </section>

        <section className="formulario-cliente__campo">
          <label htmlFor="cliente-telefono">Telefono</label>
          <InputTexto
            id="cliente-telefono"
            name="phone"
            valor={campos.phone}
            onChange={manejarCambio}
            placeholder="Ej: 1133445566"
            deshabilitado={formularioDeshabilitado}
          />
          <span className="formulario-cliente__error">{obtenerMensajeError('phone')}</span>
        </section>

        <section className="formulario-cliente__campo">
          <label htmlFor="cliente-calle">Calle</label>
          <InputTexto
            id="cliente-calle"
            name="street"
            valor={campos.street}
            onChange={manejarCambio}
            placeholder="Ej: Av. Siempre Viva 123"
            deshabilitado={formularioDeshabilitado}
          />
          <span className="formulario-cliente__error">{obtenerMensajeError('street')}</span>
        </section>

        <section className="formulario-cliente__campo">
          <label htmlFor="cliente-localidad">Localidad</label>
          <InputTexto
            id="cliente-localidad"
            name="locality"
            valor={campos.locality}
            onChange={manejarCambio}
            placeholder="Ej: Rosario"
            deshabilitado={formularioDeshabilitado}
          />
          <span className="formulario-cliente__error">{obtenerMensajeError('locality')}</span>
        </section>

        <section className="formulario-cliente__campo">
          <label htmlFor="cliente-provincia">Provincia</label>
          <InputSeleccion
            id="cliente-provincia"
            name="province"
            valor={campos.province}
            onChange={manejarCambio}
            placeholder="Seleccionar provincia"
            deshabilitado={formularioDeshabilitado}
            opciones={opcionesProvincia}
          />
          <span className="formulario-cliente__error">{obtenerMensajeError('province')}</span>
        </section>
      </section>

      <footer className="formulario-cliente__acciones">
        {props.mensajeEstado && (
          <span className="formulario-cliente__estado">{props.mensajeEstado}</span>
        )}
        <section className="formulario-cliente__botones">
          {props.onCancelar && (
            <Boton
              texto="Cancelar"
              tipo="secundario"
              onClick={props.onCancelar}
              deshabilitado={formularioDeshabilitado}
            />
          )}
          <Boton
            texto={props.textoEnviar ? props.textoEnviar : 'Guardar'}
            tipo="primario"
            tipoHtml="submit"
            deshabilitado={botonDeshabilitado}
          />
        </section>
      </footer>
    </form>
  );
}

// Inicializa el formulario con datos externos o valores vacios.
function obtenerCamposIniciales(datosIniciales) {
  let datos = datosIniciales ? datosIniciales : {};

  return {
    firstName: datos.firstName ? datos.firstName : '',
    lastName: datos.lastName ? datos.lastName : '',
    cuil: datos.cuil ? datos.cuil : '',
    birthDate: formatearFecha(datos.birthDate),
    phone: datos.phone ? datos.phone : '',
    street: datos.street ? datos.street : '',
    locality: datos.locality ? datos.locality : '',
    province: datos.province ? datos.province : ''
  };
}

// Ajusta la fecha a formato YYYY-MM-DD para inputs tipo date.
function formatearFecha(valor) {
  if (!valor) {
    return '';
  }

  if (typeof valor === 'string' && valor.includes('T')) {
    return valor.substring(0, 10);
  }

  return valor;
}

// Genera el listado de provincias argentinas para el desplegable.
function obtenerOpcionesProvincia() {
  return obtenerProvinciasArgentina().map(function mapear(nombre) {
    return {
      valor: nombre,
      etiqueta: nombre
    };
  });
}

// Devuelve un listado fijo de provincias para la UI.
function obtenerProvinciasArgentina() {
  return [
    'Buenos Aires',
    'Ciudad Autonoma de Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Cordoba',
    'Corrientes',
    'Entre Rios',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquen',
    'Rio Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucuman'
  ];
}

// Valida reglas de UI para todos los campos del formulario.
function validarCampos(campos, props) {
  let errores = {};

  if (!campos.firstName) {
    errores.firstName = 'El nombre es obligatorio.';
  }

  if (!campos.lastName) {
    errores.lastName = 'El apellido es obligatorio.';
  }

  if (!campos.cuil) {
    errores.cuil = 'El CUIL es obligatorio.';
  } else if (!/^[0-9]{11}$/.test(campos.cuil)) {
    errores.cuil = 'El CUIL debe tener 11 digitos numericos.';
  }

  if (!campos.birthDate) {
    errores.birthDate = 'La fecha de nacimiento es obligatoria.';
  } else if (!esFechaNoFutura(campos.birthDate)) {
    errores.birthDate = 'La fecha de nacimiento no puede ser futura.';
  }

  if (!campos.phone) {
    errores.phone = 'El telefono es obligatorio.';
  } else if (!/^[0-9]+$/.test(campos.phone)) {
    errores.phone = 'El telefono debe ser numerico.';
  } else if (campos.phone.length < 6) {
    errores.phone = 'El telefono debe tener al menos 6 digitos.';
  }

  if (!campos.street) {
    errores.street = 'La calle es obligatoria.';
  }

  if (!campos.locality) {
    errores.locality = 'La localidad es obligatoria.';
  }

  if (!campos.province) {
    errores.province = 'La provincia es obligatoria.';
  }

  if (props && props.cuilSoloLectura) {
    delete errores.cuil;
  }

  return errores;
}

// Verifica que la fecha ingresada no sea posterior al dia actual.
function esFechaNoFutura(valor) {
  let fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return false;
  }

  let hoy = new Date();
  fecha.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);

  return fecha <= hoy;
}

// Determina si existen errores de validacion presentes.
function esFormularioValido(errores) {
  return Object.keys(errores).length === 0;
}

// Prepara el payload final respetando reglas de edicion y campos permitidos.
function construirPayload(campos, props) {
  let payload = {
    firstName: campos.firstName,
    lastName: campos.lastName,
    birthDate: campos.birthDate,
    phone: campos.phone,
    street: campos.street,
    locality: campos.locality,
    province: campos.province
  };

  if (!props || !props.cuilSoloLectura) {
    payload.cuil = campos.cuil;
  }

  return payload;
}

export default FormularioCliente;
