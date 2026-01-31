import '../../../CSS/moleculasCSS/prestamos/TablaCronogramaPrestamo.css';
import Boton from '../../atomicosJSX/prestamos/Boton.jsx';
import { formatearNumero, formatearFechaSimple } from '../../../utilidades/ui.js';

// Tabla de cronograma para cuotas estimadas y su estado.
function TablaCronogramaPrestamo(props) {
  let cronograma = props.cronograma ? props.cronograma : [];

  return (
    <table className="tabla-cronograma">
      <thead>
        <tr>
          <th>Cuota</th>
          <th>Fecha</th>
          <th>Monto</th>
          <th>Estado</th>
          <th>Accion</th>
        </tr>
      </thead>
      <tbody>
        {cronograma.map(function renderCuota(cuota) {
          let estado = cuota && cuota.estado ? String(cuota.estado).toUpperCase() : '';
          let esPendiente = estado === 'PENDIENTE';

          return (
            <tr key={cuota.numero}>
              <td>{formatearNumero(cuota.numero)}</td>
              <td>{formatearFechaSimple(cuota.fecha)}</td>
              <td>${formatearNumero(cuota.monto)}</td>
              <td>{cuota.estado}</td>
              <td className="tabla-cronograma__accion">
                {esPendiente ? (
                  <Boton
                    texto="Pagar cuota"
                    tipo="secundario"
                    tamanio="sm"
                    onClick={crearManejadorPagar(props, cuota)}
                  />
                ) : (
                  <span className="tabla-cronograma__check" aria-label="Pagada">&#10003;</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// Ejecuta el callback externo cuando se solicita pagar una cuota.
function crearManejadorPagar(props, cuota) {
  return function manejarPago() {
    if (props.onPagarCuota) {
      props.onPagarCuota(cuota);
    }
  };
}

export default TablaCronogramaPrestamo;
