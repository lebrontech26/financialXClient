import '../../../CSS/moleculasCSS/prestamos/FormularioGarantia.css';
import InputTexto from '../../atomicosJSX/prestamos/InputTexto.jsx';
import InputAreaTexto from '../../atomicosJSX/prestamos/InputAreaTexto.jsx';
import { formatearNumeroEntrada } from '../../../utilidades/ui.js';

// Seccion reutilizable para registrar garantias sin logica de negocio en frontend.
function FormularioGarantia(props) {
  let datos = props.datos ? props.datos : obtenerGarantiaVacia();
  let errores = props.errores ? props.errores : {};
  let mostrarErrores = props.mostrarErrores ? true : false;
  let deshabilitado = props.deshabilitado ? true : false;

  // Notifica cambios de cualquier campo al componente padre.
  function manejarCambio(evento) {
    if (!props.onCambiar) {
      return;
    }

    let nombreCampo = evento.target.name;
    let valorCampo = evento.target.value;

    if (nombreCampo === 'valorRecuperable') {
      valorCampo = formatearNumeroEntrada(valorCampo);
    }
    let copia = copiarGarantia(datos);
    copia[nombreCampo] = valorCampo;
    props.onCambiar(copia);
  }

  // Captura nombres de archivos para la evidencia cuando existan.
  function manejarCambioArchivos(evento) {
    if (!props.onCambiar) {
      return;
    }

    let archivos = Array.from(evento.target.files || []);
    let nombres = archivos.map(function obtenerNombre(archivo) {
      return archivo.name;
    });

    let copia = copiarGarantia(datos);
    copia.fotos = nombres;
    props.onCambiar(copia);
  }

  // Devuelve el texto de error si corresponde mostrarlo.
  function obtenerError(nombreCampo) {
    if (!mostrarErrores) {
      return '';
    }

    return errores[nombreCampo] ? errores[nombreCampo] : '';
  }

  return (
    <section className="formulario-garantia">
      <section className="formulario-garantia__campo">
        <label htmlFor="garantia-descripcion">Descripcion del bien</label>
        <InputTexto
          id="garantia-descripcion"
          name="descripcion"
          valor={datos.descripcion}
          onChange={manejarCambio}
          placeholder="Ej: Auto Renault 2018"
          deshabilitado={deshabilitado}
        />
        <small className="formulario-garantia__error">{obtenerError('descripcion')}</small>
      </section>

      <section className="formulario-garantia__campo">
        <label htmlFor="garantia-valor">Valor recuperable estimado</label>
        <InputTexto
          id="garantia-valor"
          name="valorRecuperable"
          valor={datos.valorRecuperable}
          onChange={manejarCambio}
          placeholder="Ej: 300000"
          deshabilitado={deshabilitado}
          min="0"
        />
        <small className="formulario-garantia__error">{obtenerError('valorRecuperable')}</small>
      </section>

      <section className="formulario-garantia__campo">
        <label htmlFor="garantia-ubicacion">Ubicacion fisica</label>
        <InputTexto
          id="garantia-ubicacion"
          name="ubicacion"
          valor={datos.ubicacion}
          onChange={manejarCambio}
          placeholder="Ej: Deposito central"
          deshabilitado={deshabilitado}
        />
        <small className="formulario-garantia__error">{obtenerError('ubicacion')}</small>
      </section>

      <section className="formulario-garantia__campo">
        <label htmlFor="garantia-observaciones">Observaciones</label>
        <InputAreaTexto
          id="garantia-observaciones"
          name="observaciones"
          valor={datos.observaciones}
          onChange={manejarCambio}
          placeholder="Notas adicionales de la garantia"
          filas={3}
          deshabilitado={deshabilitado}
        />
      </section>

      <section className="formulario-garantia__campo">
        <label htmlFor="garantia-fotos">Fotos del bien (opcional)</label>
        <input
          className="formulario-garantia__archivo"
          id="garantia-fotos"
          name="fotos"
          type="file"
          multiple
          onChange={manejarCambioArchivos}
          disabled={deshabilitado}
        />
        {datos.fotos && datos.fotos.length > 0 && (
          <small className="formulario-garantia__archivo-lista">
            {datos.fotos.join(', ')}
          </small>
        )}
      </section>
    </section>
  );
}

// Inicializa la garantia con valores vacios controlados.
function obtenerGarantiaVacia() {
  return {
    descripcion: '',
    valorRecuperable: '',
    ubicacion: '',
    observaciones: '',
    fotos: []
  };
}

// Clona la garantia para evitar mutaciones directas.
function copiarGarantia(garantia) {
  return {
    descripcion: garantia.descripcion ? garantia.descripcion : '',
    valorRecuperable: garantia.valorRecuperable ? garantia.valorRecuperable : '',
    ubicacion: garantia.ubicacion ? garantia.ubicacion : '',
    observaciones: garantia.observaciones ? garantia.observaciones : '',
    fotos: garantia.fotos ? garantia.fotos.slice() : []
  };
}

export default FormularioGarantia;
