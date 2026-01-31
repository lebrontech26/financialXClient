import '../../../CSS/moleculasCSS/inicio/AccesosRapidos.css';

// Muestra accesos rapidos a acciones frecuentes.
function AccesosRapidos(props) {
  let acciones = Array.isArray(props.acciones) ? props.acciones : [];

  return (
    <section className="accesos-rapidos">
      {acciones.map(function renderAccion(accion, index) {
        let disponible = accion.disponible !== false && accion.onClick;

        return (
          <button
            key={accion.titulo + index}
            type="button"
            className="acceso-card"
            onClick={function manejarClick() {
              if (disponible) {
                accion.onClick();
              }
            }}
            disabled={!disponible}
          >
            <span className="acceso-card__titulo">{accion.titulo}</span>
            <span className="acceso-card__descripcion">{accion.descripcion}</span>
            <span className="acceso-card__estado">{disponible ? 'Disponible' : 'No disponible'}</span>
          </button>
        );
      })}
    </section>
  );
}

export default AccesosRapidos;
