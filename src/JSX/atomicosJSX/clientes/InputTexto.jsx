import '../../../CSS/atomosCSS/clientes/InputTexto.css';

// Campo de entrada basico para texto o numeros, reutilizable en formularios del modulo.
function InputTexto(props) {
  return (
    <input
      className="input-texto"
      id={props.id}
      name={props.name}
      type={props.tipo ? props.tipo : 'text'}
      value={props.valor !== undefined ? props.valor : ''}
      onChange={props.onChange}
      placeholder={props.placeholder}
      disabled={props.deshabilitado}
      readOnly={props.soloLectura}
    />
  );
}

export default InputTexto;
