import '../../../CSS/moleculasCSS/clientes/PaginacionClientes.css';
import Boton from '../../atomicosJSX/clientes/Boton.jsx';

// Control de paginacion simple con acciones Anterior y Siguiente.
function PaginacionClientes(props) {
  let paginaActual = props.paginaActual ? props.paginaActual : 1;
  let totalPaginas = props.totalPaginas ? props.totalPaginas : 1;

  // Retrocede una pagina si es posible.
  function irAnterior() {
    if (props.onCambiarPagina && paginaActual > 1) {
      props.onCambiarPagina(paginaActual - 1);
    }
  }

  // Avanza una pagina si aun existen resultados.
  function irSiguiente() {
    if (props.onCambiarPagina && paginaActual < totalPaginas) {
      props.onCambiarPagina(paginaActual + 1);
    }
  }

  return (
    <nav className="paginacion-clientes" aria-label="Paginacion">
      <Boton
        texto="Anterior"
        tipo="secundario"
        tamanio="sm"
        onClick={irAnterior}
        deshabilitado={paginaActual <= 1}
      />
      <span className="paginacion-clientes__info">
        Pagina {paginaActual} de {totalPaginas}
      </span>
      <Boton
        texto="Siguiente"
        tipo="secundario"
        tamanio="sm"
        onClick={irSiguiente}
        deshabilitado={paginaActual >= totalPaginas}
      />
    </nav>
  );
}

export default PaginacionClientes;
