import { formatearFechaSimple } from '../../../utilidades/ui.js';
import '../../../CSS/moleculasCSS/inicio/TablaResumen.css';

// Tabla generica para mostrar resumenes operativos.
function TablaResumen(props) {
  let filas = Array.isArray(props.filas) ? props.filas : [];
  let disponibleMas = props.linkMas && props.onNavegar;

  return (
    <section className="tabla-resumen">
      <header className="tabla-resumen__header">
        <h3>{props.titulo}</h3>
        {props.descripcion && <span>{props.descripcion}</span>}
      </header>

      {filas.length === 0 && <p className="tabla-resumen__vacio">Sin datos disponibles.</p>}

      {filas.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {filas.map(function renderFila(fila, index) {
              let disponible = fila.disponible !== false && fila.link && props.onNavegar;
              let claveFila = fila.id ? fila.id : 'fila-' + index;
              let claseFila = disponible ? 'tabla-resumen__fila tabla-resumen__fila--clickable' : 'tabla-resumen__fila';

              // La fila completa es clickeable para ir al detalle.
              return (
                <tr
                  key={claveFila}
                  className={claseFila}
                  onClick={function navegar() {
                    if (disponible) {
                      props.onNavegar(fila.link);
                    }
                  }}
                  onKeyDown={function manejarTecla(event) {
                    if (!disponible) {
                      return;
                    }
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      props.onNavegar(fila.link);
                    }
                  }}
                  role={disponible ? 'button' : undefined}
                  tabIndex={disponible ? 0 : undefined}
                  aria-disabled={!disponible}
                >
                  <td>{formatearFechaSimple(fila.fecha)}</td>
                  <td>{fila.cliente}</td>
                  <td className="tabla-resumen__monto">{props.formatearMoneda(fila.monto)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <footer className="tabla-resumen__footer">
        <button
          type="button"
          className="tabla-resumen__ver-mas"
          onClick={function verMas() {
            if (disponibleMas) {
              props.onNavegar(props.linkMas);
            }
          }}
          disabled={!disponibleMas}
        >
          {disponibleMas ? 'Ver completo' : 'No disponible'}
        </button>
      </footer>
    </section>
  );
}

export default TablaResumen;
