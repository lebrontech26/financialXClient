import '../../../CSS/moleculasCSS/inicio/ListaAlertas.css';

// Listado de alertas con severidad y accion.
function ListaAlertas(props) {
  let alertas = Array.isArray(props.alertas) ? props.alertas : [];

  if (alertas.length === 0) {
    return <p className="lista-alertas__vacio">Sin alertas relevantes.</p>;
  }

  return (
    <section className="lista-alertas">
      {alertas.map(function renderAlerta(alerta, index) {
        let severidad = alerta.severidad ? alerta.severidad : 'BAJA';
        let severidadClase = String(severidad).toLowerCase();
        let disponible = alerta.disponible !== false && alerta.link && props.onNavegar;

        return (
          <article className="alerta-card" data-severidad={severidadClase} key={alerta.tipo + index}>
            <header className="alerta-card__header">
              <div>
                <strong>{alerta.titulo}</strong>
              </div>
              <span className="alerta-card__nivel">{severidad}</span>
            </header>
            <p className="alerta-card__descripcion">{alerta.descripcion}</p>
            <button
              type="button"
              className="alerta-card__accion"
              onClick={function navegar() {
                if (disponible) {
                  props.onNavegar(alerta.link);
                }
              }}
              disabled={!disponible}
            >
              {disponible ? 'Ver detalle' : 'No disponible'}
            </button>
          </article>
        );
      })}
    </section>
  );
}

export default ListaAlertas;
