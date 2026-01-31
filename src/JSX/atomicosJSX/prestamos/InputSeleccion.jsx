import '../../../CSS/atomosCSS/prestamos/InputSeleccion.css';

// Selector basico reutilizable para opciones controladas por backend.
function InputSeleccion(props) {
  let opciones = props.opciones ? props.opciones : [];

  return (
    <select
      className="input-seleccion-prestamo"
      id={props.id}
      name={props.name}
      value={props.valor !== undefined ? props.valor : ''}
      onChange={props.onChange}
      disabled={props.deshabilitado}
    >
      {props.placeholder && (
        <option value="" disabled>
          {props.placeholder}
        </option>
      )}
      {opciones.map(function renderOpcion(opcion) {
        return (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        );
      })}
    </select>
  );
}

export default InputSeleccion;
