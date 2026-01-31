import '../../../CSS/atomosCSS/clientes/Boton.css';

// Boton reutilizable para acciones primarias, secundarias o de peligro en el modulo Clientes.
function Boton(props) {
  let tipo = props.tipo ? props.tipo : 'primario';
  let tamanio = props.tamanio ? props.tamanio : 'md';
  let clase = 'boton boton--' + tipo + ' boton--' + tamanio;
  let deshabilitado = props.deshabilitado ? true : false;

  return (
    <button
      className={clase}
      type={props.tipoHtml ? props.tipoHtml : 'button'}
      onClick={props.onClick}
      disabled={deshabilitado}
    >
      {props.texto}
    </button>
  );
}

export default Boton;
