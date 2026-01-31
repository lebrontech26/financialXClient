import '../../../CSS/atomosCSS/prestamos/Boton.css';

// Boton reutilizable para acciones principales del modulo Prestamos.
function Boton(props) {
  let tipo = props.tipo ? props.tipo : 'primario';
  let tamanio = props.tamanio ? props.tamanio : 'md';
  let clase = 'boton-prestamo boton-prestamo--' + tipo + ' boton-prestamo--' + tamanio;
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
