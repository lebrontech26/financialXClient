import '../../../CSS/moleculasCSS/prestamos/BadgeEstadoPrestamo.css';

// Badge simple para destacar estados dentro del modulo Prestamos.
function BadgeEstadoPrestamo(props) {
  let estado = props.estado ? props.estado : 'SIN_ESTADO';
  let clase = 'badge-estado-prestamo badge-estado-prestamo--' + normalizarEstado(estado);

  return (
    <small className={clase}>{estado}</small>
  );
}

// Normaliza el estado para mapear estilos.
function normalizarEstado(estado) {
  return String(estado).toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export default BadgeEstadoPrestamo;
