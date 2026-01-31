import { useEffect, useRef, useState } from 'react';
import InputTexto from '../../atomicosJSX/clientes/InputTexto.jsx';
import '../../../CSS/moleculasCSS/clientes/BuscadorClientes.css';

// Buscador con debounce para evitar una llamada a la API por cada tecla.
function BuscadorClientes(props) {
  let esperaMs = props.esperaMs ? props.esperaMs : 500;
  let [valorBusqueda, setValorBusqueda] = useState(props.valor ? props.valor : '');
  let temporizadorRef = useRef(null);
  let idInput = props.id ? props.id : 'buscador-clientes-input';

  // Guarda el texto que ingresa el usuario para disparar la busqueda.
  function manejarCambio(evento) {
    setValorBusqueda(evento.target.value);
  }

  // Sincroniza el valor cuando cambia desde el exterior (por ejemplo, al resetear filtros).
  function sincronizarValorExterno() {
    if (props.valor !== undefined && props.valor !== valorBusqueda) {
      setValorBusqueda(props.valor);
    }
  }

  useEffect(sincronizarValorExterno, [props.valor]);

  // Aplica el debounce y ejecuta la busqueda cuando el usuario se detiene.
  function programarBusqueda() {
    if (temporizadorRef.current) {
      clearTimeout(temporizadorRef.current);
    }

    temporizadorRef.current = setTimeout(function ejecutarBusqueda() {
      if (props.onBuscar) {
        props.onBuscar(valorBusqueda);
      }
    }, esperaMs);

    return function limpiarTemporizador() {
      if (temporizadorRef.current) {
        clearTimeout(temporizadorRef.current);
      }
    };
  }

  useEffect(programarBusqueda, [valorBusqueda, esperaMs, props.onBuscar]);

  return (
    <section className="buscador-clientes" role="search">
      <label className="buscador-clientes__label" htmlFor={idInput}>
        Buscar
      </label>
      <InputTexto
        id={idInput}
        valor={valorBusqueda}
        onChange={manejarCambio}
        placeholder={props.placeholder ? props.placeholder : 'Buscar por nombre o CUIL...'}
      />
    </section>
  );
}

export default BuscadorClientes;
