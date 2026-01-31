import { useEffect, useRef } from 'react';
import '../../../CSS/moleculasCSS/clientes/DialogoConfirmacion.css';
import Boton from '../../atomicosJSX/clientes/Boton.jsx';

// Modal de confirmacion reutilizable para evitar acciones destructivas sin aviso.
function DialogoConfirmacion(props) {
  let contenedorRef = useRef(null);
  let focoPrevioRef = useRef(null);

  // Cierra el dialogo si el usuario presiona Escape.
  function manejarTeclaEscape(evento) {
    if (evento.key === 'Escape' && props.onCancelar) {
      props.onCancelar();
    }
  }

  // Mantiene el foco dentro del dialogo mientras esta abierto.
  function manejarTeclaTab(evento) {
    if (evento.key !== 'Tab') {
      return;
    }

    let elementos = obtenerElementosFoco();

    if (elementos.length === 0) {
      return;
    }

    let primero = elementos[0];
    let ultimo = elementos[elementos.length - 1];

    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
      return;
    }

    if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  }

  // Enfoca el primer elemento disponible al abrir el dialogo.
  function enfocarPrimerElemento() {
    let elementos = obtenerElementosFoco();

    if (elementos.length > 0) {
      elementos[0].focus();
    }
  }

  // Obtiene los elementos enfocables dentro del dialogo.
  function obtenerElementosFoco() {
    if (!contenedorRef.current) {
      return [];
    }

    let selectores = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let lista = contenedorRef.current.querySelectorAll(selectores);
    return Array.from(lista);
  }

  // Registra listeners solo cuando el dialogo esta abierto.
  function registrarEventosDialogo() {
    if (props.abierto) {
      focoPrevioRef.current = document.activeElement;
      setTimeout(enfocarPrimerElemento, 0);
      document.addEventListener('keydown', manejarTeclaEscape);
      document.addEventListener('keydown', manejarTeclaTab);
    }

    return function limpiarEventos() {
      document.removeEventListener('keydown', manejarTeclaEscape);
      document.removeEventListener('keydown', manejarTeclaTab);

      if (focoPrevioRef.current && focoPrevioRef.current.focus) {
        focoPrevioRef.current.focus();
      }
    };
  }

  useEffect(registrarEventosDialogo, [props.abierto]);

  if (!props.abierto) {
    return null;
  }

  return (
    <aside className="dialogo-confirmacion" role="dialog" aria-modal="true">
      <button
        type="button"
        className="dialogo-confirmacion__overlay"
        onClick={props.onCancelar}
        aria-label="Cerrar dialogo"
        tabIndex={-1}
      ></button>
      <section className="dialogo-confirmacion__contenido" ref={contenedorRef} tabIndex={-1}>
        <h3>{props.titulo ? props.titulo : 'Confirmar accion'}</h3>
        <p>{props.descripcion ? props.descripcion : 'Esta accion no se puede deshacer.'}</p>
        <footer className="dialogo-confirmacion__acciones">
          <Boton
            texto={props.textoCancelar ? props.textoCancelar : 'Cancelar'}
            tipo="secundario"
            onClick={props.onCancelar}
            deshabilitado={props.deshabilitado}
          />
          <Boton
            texto={props.textoConfirmar ? props.textoConfirmar : 'Confirmar'}
            tipo="peligro"
            onClick={props.onConfirmar}
            deshabilitado={props.deshabilitado}
          />
        </footer>
      </section>
    </aside>
  );
}

export default DialogoConfirmacion;
