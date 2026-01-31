import '../../../CSS/atomosCSS/clientes/InputSeleccion.css';

// Selector reutilizable para listas desplegables en formularios de Clientes.
function InputSeleccion(props) {
  let opciones = props.opciones ? props.opciones : [];
  let valor = props.valor !== undefined ? props.valor : '';
  let deshabilitado = props.deshabilitado ? true : false;

  return (
    <select
      className="input-seleccion"
      id={props.id}
      name={props.name}
      value={valor}
      onChange={props.onChange}
      disabled={deshabilitado}
    >
      {props.placeholder && (
        <option value="">{props.placeholder}</option>
      )}
      {opciones.map(function renderOpcion(opcion, index) {
        let clave = opcion.valor ? opcion.valor : 'opcion-' + index;
        return (
          <option key={clave} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        );
      })}
    </select>
  );
}

export default InputSeleccion;
