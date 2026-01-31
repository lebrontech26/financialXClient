import '../../../CSS/atomosCSS/prestamos/InputTexto.css';

// Campo de entrada basico reutilizable en formularios del modulo Prestamos.
function InputTexto(props) {
  return (
    <input
      className="input-texto-prestamo"
      id={props.id}
      name={props.name}
      type={props.tipo ? props.tipo : 'text'}
      value={props.valor !== undefined ? props.valor : ''}
      onChange={props.onChange}
      placeholder={props.placeholder}
      disabled={props.deshabilitado}
      readOnly={props.soloLectura}
      min={props.min}
      max={props.max}
      step={props.step}
    />
  );
}

export default InputTexto;
