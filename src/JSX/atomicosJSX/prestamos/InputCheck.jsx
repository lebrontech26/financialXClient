import '../../../CSS/atomosCSS/prestamos/InputCheck.css';

// Checkbox reutilizable para confirmaciones o toggles.
function InputCheck(props) {
  return (
    <input
      className="input-check-prestamo"
      id={props.id}
      name={props.name}
      type="checkbox"
      checked={props.valor ? true : false}
      onChange={props.onChange}
      disabled={props.deshabilitado}
    />
  );
}

export default InputCheck;
