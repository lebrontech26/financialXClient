let dashboardMock = crearDashboardBase();

// Devuelve el resumen general para el Inicio con latencia simulada.
function obtenerDashboardMock(signal) {
  return ejecutarConLatencia(function ejecutar() {
    return clonarObjeto(dashboardMock);
  }, signal);
}

// Genera datos base para el modo demo.
function crearDashboardBase() {
  let ahora = new Date().toISOString();
  let hoy = new Date();

  return {
    asOf: ahora,
    clientes: {
      total: 120,
      activos: 110,
      inactivos: 10
    },
    prestamos: {
      activos: 45,
      enMora: 6,
      riesgoAlto: 3
    },
    inversiones: {
      capitalTotal: 5000000,
      capitalInvertido: 4200000,
      capitalDisponible: 800000
    },
    pagos: {
      hoy: 8,
      vencidos: 4
    },
    alertas: [
      {
        tipo: 'MORA',
        titulo: 'Prestamos en mora',
        descripcion: '6 prestamos presentan mora activa',
        severidad: 'ALTA',
        link: '/prestamos?estado=mora'
      },
      {
        tipo: 'GARANTIA',
        titulo: 'Garantias ejecutables',
        descripcion: '2 prestamos requieren validacion de garantia',
        severidad: 'MEDIA',
        link: '/prestamos?estado=garantia'
      },
      {
        tipo: 'CLIENTES',
        titulo: 'Clientes inactivos',
        descripcion: '10 clientes quedaron inactivos en el ultimo trimestre',
        severidad: 'BAJA',
        link: '/clients'
      }
    ],
    resumenes: {
      // Fechas relativas a hoy para que el demo siempre tenga datos frescos.
      proximosVencimientos: {
        items: [
          {
            id: 'venc-1',
            fecha: formatearFechaISO(sumarDias(hoy, 1)),
            cliente: 'Julia Martinez',
            monto: 180000,
            link: '/prestamos/venc-1'
          },
          {
            id: 'venc-2',
            fecha: formatearFechaISO(sumarDias(hoy, 2)),
            cliente: 'Lucas Morales',
            monto: 95000,
            link: '/prestamos/venc-2'
          },
          {
            id: 'venc-3',
            fecha: formatearFechaISO(sumarDias(hoy, 2)),
            cliente: 'Ana Suarez',
            monto: 245000,
            link: '/prestamos/venc-3'
          }
        ],
        totalCount: 3,
        link: '/prestamos?filtro=proximos'
      },
      ultimosPagos: {
        items: [
          {
            id: 'pago-1',
            fecha: formatearFechaISO(hoy),
            cliente: 'Bruno Diaz',
            monto: 42000,
            link: '/pagos/pago-1'
          },
          {
            id: 'pago-2',
            fecha: formatearFechaISO(hoy),
            cliente: 'Rocio Mendez',
            monto: 63500,
            link: '/pagos/pago-2'
          },
          {
            id: 'pago-3',
            fecha: formatearFechaISO(hoy),
            cliente: 'Ramiro Blanco',
            monto: 51000,
            link: '/pagos/pago-3'
          }
        ],
        totalCount: 3,
        link: '/pagos?filtro=hoy'
      },
      prestamosRecientes: {
        items: [
          {
            id: 'prest-1',
            fecha: formatearFechaISO(sumarDias(hoy, 0)),
            cliente: 'Erika Soto',
            monto: 320000,
            link: '/prestamos/prest-1'
          },
          {
            id: 'prest-2',
            fecha: formatearFechaISO(sumarDias(hoy, -1)),
            cliente: 'Gonzalo Ruiz',
            monto: 210000,
            link: '/prestamos/prest-2'
          },
          {
            id: 'prest-3',
            fecha: formatearFechaISO(sumarDias(hoy, -2)),
            cliente: 'Dante Torres',
            monto: 175000,
            link: '/prestamos/prest-3'
          }
        ],
        totalCount: 3,
        link: '/prestamos?filtro=recientes'
      }
    }
  };
}

function sumarDias(fecha, dias) {
  let copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

function formatearFechaISO(fecha) {
  let anio = fecha.getFullYear();
  let mes = String(fecha.getMonth() + 1).padStart(2, '0');
  let dia = String(fecha.getDate()).padStart(2, '0');

  return anio + '-' + mes + '-' + dia;
}

// Ejecuta la accion con latencia simulada y soporte de abort.
function ejecutarConLatencia(accion, signal) {
  return new Promise(function resolver(resolve, reject) {
    if (signal && signal.aborted) {
      reject(crearAbortError());
      return;
    }

    let delay = obtenerDelay();
    let temporizador = setTimeout(function ejecutar() {
      if (signal && signal.aborted) {
        reject(crearAbortError());
        return;
      }

      try {
        resolve(accion());
      } catch (error) {
        reject(error);
      }
    }, delay);

    if (signal) {
      signal.addEventListener(
        'abort',
        function cancelar() {
          clearTimeout(temporizador);
          reject(crearAbortError());
        },
        { once: true }
      );
    }
  });
}

// Obtiene la latencia simulada para las respuestas mock.
function obtenerDelay() {
  if (typeof globalThis !== 'undefined' && typeof globalThis.__MOCK_DELAY_MS__ === 'number') {
    return globalThis.__MOCK_DELAY_MS__;
  }

  return 450;
}

// Crea un error de abort compatible con AbortController.
function crearAbortError() {
  let error = new Error('AbortError');
  error.name = 'AbortError';
  return error;
}

// Clona el objeto para evitar mutaciones externas.
function clonarObjeto(valor) {
  return JSON.parse(JSON.stringify(valor));
}

export { obtenerDashboardMock };
