import '../../../CSS/atomosCSS/prestamos/InputAreaTexto.css';

// Area de texto reutilizable para descripciones o motivos.
function InputAreaTexto(props) {
  return (
    <textarea
      className="input-area-prestamo"
      id={props.id}
      name={props.name}
      value={props.valor !== undefined ? props.valor : ''}
      onChange={props.onChange}
      placeholder={props.placeholder}
      disabled={props.deshabilitado}
      rows={props.filas ? props.filas : 3}
    />
  );
}

export default InputAreaTexto;
