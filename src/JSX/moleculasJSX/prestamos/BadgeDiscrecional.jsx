import '../../../CSS/moleculasCSS/prestamos/BadgeDiscrecional.css';

// Badge que identifica prestamos discrecionales de forma permanente.
function BadgeDiscrecional(props) {
  if (!props.mostrar) {
    return null;
  }

  return (
    <small className="badge-discrecional" title="Prestamo discrecional autorizado">
      Discrecional
    </small>
  );
}

export default BadgeDiscrecional;
