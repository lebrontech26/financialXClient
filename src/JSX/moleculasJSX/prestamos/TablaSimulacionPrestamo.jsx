import { useEffect, useState } from 'react';
import '../../../CSS/moleculasCSS/prestamos/TablaSimulacionPrestamo.css';
import Boton from '../../atomicosJSX/prestamos/Boton.jsx';
import { formatearNumero, formatearFechaSimple } from '../../../utilidades/ui.js';

// Tabla de opciones para seleccionar el plan de prestamo ofrecido por backend.
function TablaSimulacionPrestamo(props) {
  let opciones = props.opciones ? props.opciones : [];
  let opcionSeleccionada = props.opcionSeleccionada ? props.opcionSeleccionada : null;
  let mostrarAccion = props.mostrarAccion !== false;
  let [unidadSeleccionada, setUnidadSeleccionada] = useState('SEMANAS');

  // Mantiene una unidad valida para evitar listar semanas y meses juntos.
  function sincronizarUnidadSeleccionada() {
    if (opciones.length === 0) {
      return;
    }

    let unidadDisponible = obtenerUnidadDisponible(opciones, unidadSeleccionada);
    if (unidadDisponible !== unidadSeleccionada) {
      setUnidadSeleccionada(unidadDisponible);
    }
  }

  useEffect(sincronizarUnidadSeleccionada, [opciones, unidadSeleccionada]);

  // Ejecuta la seleccion de una opcion valida.
  function seleccionarOpcion(opcion) {
    if (props.onSeleccionar) {
      props.onSeleccionar(opcion);
    }
  }

  function seleccionarSemanas() {
    if (tieneOpcionesUnidad(opciones, 'SEMANAS')) {
      setUnidadSeleccionada('SEMANAS');
    }
  }

  function seleccionarMeses() {
    if (tieneOpcionesUnidad(opciones, 'MESES')) {
      setUnidadSeleccionada('MESES');
    }
  }

  let unidadVisible = obtenerUnidadDisponible(opciones, unidadSeleccionada);
  let opcionesFiltradas = filtrarOpcionesPorUnidad(opciones, unidadVisible);
  let haySemanas = tieneOpcionesUnidad(opciones, 'SEMANAS');
  let hayMeses = tieneOpcionesUnidad(opciones, 'MESES');

  return (
    <section className="tabla-simulacion__contenedor">
      <header className="tabla-simulacion__filtros">
        <p>Mostrar opciones por tipo de plazo</p>
        <section className="tabla-simulacion__botones">
          <Boton
            texto="Semanas"
            tipo={unidadVisible === 'SEMANAS' ? 'primario' : 'secundario'}
            tamanio="sm"
            onClick={seleccionarSemanas}
            deshabilitado={!haySemanas}
          />
          <Boton
            texto="Meses"
            tipo={unidadVisible === 'MESES' ? 'primario' : 'secundario'}
            tamanio="sm"
            onClick={seleccionarMeses}
            deshabilitado={!hayMeses}
          />
        </section>
      </header>
      <table className="tabla-simulacion">
        <thead>
          <tr>
            <th>Cantidad de cuotas</th>
            <th>Valor de la cuota</th>
            <th>Total a devolver</th>
            <th>Primer pago</th>
            {mostrarAccion && <th>Accion</th>}
          </tr>
        </thead>
        <tbody>
          {opcionesFiltradas.map(function renderOpcion(opcion) {
            let estaSeleccionada = opcionSeleccionada && opcionSeleccionada.id === opcion.id;
            let claseFila = estaSeleccionada ? 'tabla-simulacion__fila tabla-simulacion__fila--activa' : 'tabla-simulacion__fila';

            return (
              <tr key={opcion.id} className={claseFila}>
                <td>{formatearNumero(opcion.cuotas)}</td>
                <td>${formatearNumero(opcion.cuota)}</td>
                <td>${formatearNumero(opcion.totalAPagar)}</td>
                <td>{formatearFechaSimple(opcion.primerPago)}</td>
                {mostrarAccion && (
                  <td>
                    <Boton
                      texto={estaSeleccionada ? 'Seleccionado' : 'Seleccionar'}
                      tipo={estaSeleccionada ? 'secundario' : 'primario'}
                      tamanio="sm"
                      onClick={function manejarClick() {
                        seleccionarOpcion(opcion);
                      }}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function filtrarOpcionesPorUnidad(opciones, unidad) {
  if (!opciones || opciones.length === 0) {
    return [];
  }

  let unidadNormalizada = unidad ? String(unidad).toUpperCase() : '';
  if (!unidadNormalizada) {
    return opciones;
  }

  return opciones.filter(function filtrar(opcion) {
    return obtenerUnidadOpcion(opcion) === unidadNormalizada;
  });
}

function tieneOpcionesUnidad(opciones, unidad) {
  if (!opciones || opciones.length === 0) {
    return false;
  }

  let unidadNormalizada = unidad ? String(unidad).toUpperCase() : '';
  if (!unidadNormalizada) {
    return false;
  }

  return opciones.some(function validar(opcion) {
    return obtenerUnidadOpcion(opcion) === unidadNormalizada;
  });
}

function obtenerUnidadDisponible(opciones, preferida) {
  let unidadPreferida = preferida ? String(preferida).toUpperCase() : '';

  if (tieneOpcionesUnidad(opciones, unidadPreferida)) {
    return unidadPreferida;
  }

  if (tieneOpcionesUnidad(opciones, 'SEMANAS')) {
    return 'SEMANAS';
  }

  if (tieneOpcionesUnidad(opciones, 'MESES')) {
    return 'MESES';
  }

  return unidadPreferida;
}

function obtenerUnidadOpcion(opcion) {
  if (opcion && opcion.plazoObjeto && opcion.plazoObjeto.unidad) {
    return String(opcion.plazoObjeto.unidad).toUpperCase();
  }

  if (opcion && opcion.plazo) {
    let texto = String(opcion.plazo).toLowerCase();
    if (texto.includes('semana')) {
      return 'SEMANAS';
    }
    if (texto.includes('mes')) {
      return 'MESES';
    }
  }

  return '';
}

export default TablaSimulacionPrestamo;
