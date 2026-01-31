import '../../../CSS/moleculasCSS/clientes/TablaClientes.css';
import BadgeCategoria from './BadgeCategoria.jsx';
import Boton from '../../atomicosJSX/clientes/Boton.jsx';
import { formatearNumero } from '../../../utilidades/ui.js';

// Tabla principal del listado de clientes con acciones basicas.
function TablaClientes(props) {
  let clientes = props.clientes ? props.clientes : [];

  // Genera el callback para navegar al detalle del cliente.
  function crearManejadorVer(cliente) {
    return function manejarVer() {
      if (props.onVer) {
        props.onVer(cliente);
      }
    };
  }

  // Genera el callback para editar un cliente seleccionado.
  function crearManejadorEditar(cliente) {
    return function manejarEditar() {
      if (props.onEditar) {
        props.onEditar(cliente);
      }
    };
  }

  // Genera el callback para iniciar un prestamo asociado al cliente.
  function crearManejadorNuevoPrestamo(cliente) {
    return function manejarNuevoPrestamo() {
      if (props.onNuevoPrestamo) {
        props.onNuevoPrestamo(cliente);
      }
    };
  }

  // Genera el callback que abre la confirmacion de borrado.
  function crearManejadorEliminar(cliente) {
    return function manejarEliminar() {
      if (props.onEliminar) {
        props.onEliminar(cliente);
      }
    };
  }

  return (
    <section className="tabla-clientes">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>CUIL</th>
            <th>Score</th>
            <th>Categoria</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(function renderFila(cliente, index) {
            let claveFila = cliente.id ? cliente.id : cliente.cuil ? cliente.cuil : 'fila-' + index;
            return (
              <tr key={claveFila}>
                <td>{cliente.firstName}</td>
                <td>{cliente.lastName}</td>
                <td>{cliente.cuil}</td>
                <td className="tabla-clientes__score">{formatearNumero(cliente.score)}</td>
                <td>
                  <BadgeCategoria categoria={cliente.category} />
                </td>
                <td className="tabla-clientes__acciones">
                  {props.onNuevoPrestamo && (
                    <Boton
                      texto="Nuevo prestamo"
                      tipo="secundario"
                      tamanio="sm"
                      onClick={crearManejadorNuevoPrestamo(cliente)}
                    />
                  )}
                  <Boton
                    texto="Ver"
                    tipo="primario"
                    tamanio="sm"
                    onClick={crearManejadorVer(cliente)}
                  />
                  <Boton
                    texto="Editar"
                    tipo="secundario"
                    tamanio="sm"
                    onClick={crearManejadorEditar(cliente)}
                  />
                  <Boton
                    texto="Eliminar"
                    tipo="peligro"
                    tamanio="sm"
                    onClick={crearManejadorEliminar(cliente)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export default TablaClientes;
