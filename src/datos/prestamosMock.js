import { obtenerScoreClienteMock } from './clientesMock.js';

let prestamosMock = crearPrestamosIniciales();
let prestamosMockIniciales = clonarPrestamos(prestamosMock);

// Devuelve el listado paginado de prestamos con filtro por estado.
function obtenerPrestamosMock(parametros, signal) {
  let pagina = parametros && parametros.pagina ? parametros.pagina : 1;
  let tamanio = parametros && parametros.tamanioPagina ? parametros.tamanioPagina : 10;
  let estado = parametros && parametros.estado ? parametros.estado : '';

  return ejecutarConLatencia(function ejecutar() {
    let filtrados = filtrarPrestamos(estado);
    let inicio = (pagina - 1) * tamanio;
    let items = filtrados.slice(inicio, inicio + tamanio).map(function mapear(item) {
      return {
        id: item.id,
        cliente: item.cliente,
        monto: item.monto,
        estado: item.estado,
        tipo: item.tipo,
        esDiscrecional: item.esDiscrecional,
        cuotasVencidas: item.cuotasVencidas,
        garantia: item.garantia ? item.garantia.descripcion : 'Sin garantia'
      };
    });

    return {
      elementos: items,
      total: filtrados.length,
      pagina: pagina,
      tamanioPagina: tamanio
    };
  }, signal);
}

// Devuelve el detalle completo de un prestamo por id.
function obtenerPrestamoMock(id, signal) {
  return ejecutarConLatencia(function ejecutar() {
    let prestamo = buscarPrestamoPorId(id);

    if (!prestamo) {
      throw crearErrorMock(404, 'Recurso no encontrado');
    }

    return clonarObjeto(prestamo);
  }, signal);
}

// Devuelve los prestamos asociados a un cliente especifico.
function obtenerPrestamosPorClienteMock(idCliente, signal) {
  return ejecutarConLatencia(function ejecutar() {
    if (!idCliente) {
      throw crearErrorMock(400, 'Cliente invalido', {
        idCliente: 'El cliente es obligatorio.'
      });
    }

    let filtrados = prestamosMock.filter(function filtrar(item) {
      return item.idCliente === String(idCliente);
    });

    return filtrados.map(function mapear(item) {
      return {
        id: item.id,
        tipo: item.tipo,
        monto: item.monto,
        totalAPagar: item.totalAPagar,
        cuotas: item.cuotas,
        estado: item.estado,
        esDiscrecional: item.esDiscrecional,
        cuotasVencidas: item.cuotasVencidas
      };
    });
  }, signal);
}

// Devuelve opciones de simulacion segun el monto solicitado.
function simularPrestamoMock(idCliente, monto, signal) {
  return ejecutarConLatencia(function ejecutar() {
    let score = obtenerScorePrestamo(idCliente);
    let montoMaximo = obtenerMontoMaximo(score);
    let montoSolicitado = Number(monto);

    if (!esNumeroValido(montoSolicitado)) {
      throw crearErrorMock(400, 'Monto invalido', {
        monto: 'El monto debe ser numerico y mayor a cero.'
      });
    }

    if (montoSolicitado > montoMaximo) {
      throw crearErrorMock(400, 'Monto excede maximo', {
        monto: 'El monto supera el maximo permitido para este scoring.'
      });
    }

    let opciones = crearOpcionesSimulacion(montoSolicitado);

    return {
      idCliente: idCliente,
      opciones: opciones
    };
  }, signal);
}

// Crea un prestamo estandar con validaciones basicas de garantia.
function crearPrestamoEstandarMock(datosPrestamo) {
  return ejecutarConLatencia(function ejecutar() {
    let errores = validarPrestamoEstandar(datosPrestamo);

    if (Object.keys(errores).length > 0) {
      throw crearErrorMock(400, 'Error de validacion', errores);
    }

    let score = obtenerScorePrestamo(datosPrestamo.idCliente);
    let factor = score >= 51 ? 2 : 3;
    let coberturaRequerida = datosPrestamo.monto * factor;

    if (!datosPrestamo.garantia || datosPrestamo.garantia.valorRecuperable < coberturaRequerida) {
      throw crearErrorMock(400, 'Garantia insuficiente', {
        garantia: 'La garantia no cumple la cobertura requerida.'
      });
    }

    let nuevoId = crearId('prestamo');
    let garantiaNormalizada = normalizarGarantia(datosPrestamo.garantia);
    let cronograma = crearCronogramaDemo(datosPrestamo.totalAPagar, datosPrestamo.cuotas, datosPrestamo.plazo, []);
    let auditoria = crearAuditoriaInicial(garantiaNormalizada ? true : false);

    let nuevoPrestamo = crearPrestamoBase(
      nuevoId,
      datosPrestamo.idCliente,
      datosPrestamo.cliente ? datosPrestamo.cliente : 'Cliente sin nombre',
      'ESTANDAR',
      datosPrestamo.monto,
      datosPrestamo.tasaInteres,
      datosPrestamo.plazo,
      datosPrestamo.totalAPagar,
      datosPrestamo.cuotas,
      datosPrestamo.horarioCobroPreferido,
      'ACTIVO',
      false,
      garantiaNormalizada,
      [],
      0,
      cronograma,
      auditoria
    );

    prestamosMock.unshift(nuevoPrestamo);

    return { id: nuevoId };
  });
}

// Crea un prestamo discrecional con motivo obligatorio.
function crearPrestamoDiscrecionalMock(datosPrestamo) {
  return ejecutarConLatencia(function ejecutar() {
    let errores = validarPrestamoDiscrecional(datosPrestamo);

    if (Object.keys(errores).length > 0) {
      throw crearErrorMock(400, 'Error de validacion', errores);
    }

    let totalAPagar = datosPrestamo.totalAPagar
      ? datosPrestamo.totalAPagar
      : calcularTotal(datosPrestamo.monto, datosPrestamo.tasaInteres);
    let cuotas = datosPrestamo.cuotas ? datosPrestamo.cuotas : calcularCuotas(datosPrestamo.plazo);
    let cronograma = crearCronogramaDemo(totalAPagar, cuotas, datosPrestamo.plazo, []);
    let garantiaNormalizada = normalizarGarantia(datosPrestamo.garantia);
    let auditoria = crearAuditoriaInicial(garantiaNormalizada ? true : false);

    let nuevoId = crearId('prestamo');
    let nuevoPrestamo = crearPrestamoBase(
      nuevoId,
      datosPrestamo.idCliente,
      datosPrestamo.cliente ? datosPrestamo.cliente : 'Cliente sin nombre',
      'DISCRECIONAL',
      datosPrestamo.monto,
      datosPrestamo.tasaInteres,
      datosPrestamo.plazo,
      totalAPagar,
      cuotas,
      datosPrestamo.horarioCobroPreferido,
      'ACTIVO',
      true,
      garantiaNormalizada,
      [],
      0,
      cronograma,
      auditoria
    );

    nuevoPrestamo.motivoDiscrecional = datosPrestamo.motivo;
    nuevoPrestamo.auditoria.push(crearEventoAuditoria('Prestamo discrecional autorizado', 'Admin'));

    prestamosMock.unshift(nuevoPrestamo);

    return { id: nuevoId };
  });
}

// Registra un pago y lo agrega al historial del prestamo.
function registrarPagoMock(idPrestamo, datosPago) {
  return ejecutarConLatencia(function ejecutar() {
    let prestamo = buscarPrestamoPorId(idPrestamo);

    if (!prestamo) {
      throw crearErrorMock(404, 'Recurso no encontrado');
    }

    let errores = validarPago(datosPago);

    if (Object.keys(errores).length > 0) {
      throw crearErrorMock(400, 'Error de validacion', errores);
    }

    let pago = {
      id: crearId('pago'),
      monto: datosPago.monto,
      pagadoEn: datosPago.pagadoEn,
      estaEnMora: datosPago.estaEnMora ? true : false,
      interesMoraAplicado: datosPago.interesMoraAplicado ? datosPago.interesMoraAplicado : 0
    };

    prestamo.pagos.push(pago);

    if (prestamo.cuotasVencidas > 0) {
      prestamo.cuotasVencidas = Math.max(0, prestamo.cuotasVencidas - 1);
      if (prestamo.cuotasVencidas === 0 && prestamo.estado === 'EN_MORA') {
        prestamo.estado = 'ACTIVO';
      }
    }

    prestamo.cronograma = crearCronogramaDemo(prestamo.totalAPagar, prestamo.cuotas, prestamo.plazo, prestamo.pagos);
    prestamo.auditoria.push(crearEventoAuditoria('Pago registrado', 'Operario'));

    return { id: pago.id };
  });
}

// Ejecuta la garantia y actualiza el estado del prestamo.
function ejecutarGarantiaMock(idPrestamo) {
  return ejecutarConLatencia(function ejecutar() {
    let prestamo = buscarPrestamoPorId(idPrestamo);

    if (!prestamo) {
      throw crearErrorMock(404, 'Recurso no encontrado');
    }

    prestamo.estado = 'GARANTIA_EJECUTADA';
    prestamo.auditoria.push(crearEventoAuditoria('Garantia ejecutada', 'Sistema'));

    return { id: prestamo.id };
  });
}

// Restablece el listado a su estado inicial (util para pruebas).
function resetPrestamosMock() {
  prestamosMock = clonarPrestamos(prestamosMockIniciales);
}

// Crea el dataset inicial de prestamos para el modo demo.
function crearPrestamosIniciales() {
  let prestamoUnoPagos = [
    {
      id: 'pago-1',
      monto: 100000,
      pagadoEn: '2026-01-10',
      estaEnMora: false,
      interesMoraAplicado: 0
    }
  ];

  let prestamoDiscrecional = crearPrestamoBase(
    'prestamo-3',
    '-3',
    'Marcelo Lopez',
    'DISCRECIONAL',
    400000,
    0.6,
    { unidad: 'MESES', valor: 6 },
    640000,
    6,
    '15:00-15:30',
    'ACTIVO',
    true,
    null,
    [],
    0,
    null,
    crearAuditoriaInicial(false)
  );

  prestamoDiscrecional.motivoDiscrecional = 'Operacion fuera de politica por cliente premium.';
  prestamoDiscrecional.auditoria.push(crearEventoAuditoria('Prestamo discrecional autorizado', 'Admin'));

  return [
    crearPrestamoBase(
      'prestamo-1',
      '-1',
      'Juan Perez',
      'ESTANDAR',
      200000,
      0.5,
      { unidad: 'MESES', valor: 3 },
      300000,
      3,
      '09:00-09:30',
      'ACTIVO',
      false,
      {
        valorRecuperable: 450000,
        descripcion: 'Auto Renault 2018',
        fotos: [],
        ubicacion: 'Deposito central',
        estado: 'ACEPTADA'
      },
      prestamoUnoPagos,
      0,
      null,
      crearAuditoriaInicial(true)
    ),
    crearPrestamoBase(
      'prestamo-2',
      '-2',
      'Laura Gomez',
      'ESTANDAR',
      150000,
      0.4,
      { unidad: 'SEMANAS', valor: 8 },
      210000,
      8,
      '11:30-12:00',
      'EN_MORA',
      false,
      {
        valorRecuperable: 320000,
        descripcion: 'Moto Honda',
        fotos: [],
        ubicacion: 'Sucursal Centro',
        estado: 'ACEPTADA'
      },
      [],
      2,
      null,
      crearAuditoriaInicial(true)
    ),
    prestamoDiscrecional
  ];
}

// Crea un objeto prestamo con estructura comun para la demo.
function crearPrestamoBase(
  id,
  idCliente,
  cliente,
  tipo,
  monto,
  tasaInteres,
  plazo,
  totalAPagar,
  cuotas,
  horarioCobroPreferido,
  estado,
  esDiscrecional,
  garantia,
  pagos,
  cuotasVencidas,
  cronograma,
  auditoria
) {
  let cronogramaFinal = cronograma ? cronograma : crearCronogramaDemo(totalAPagar, cuotas, plazo, pagos);
  let auditoriaFinal = auditoria ? auditoria : crearAuditoriaInicial(garantia ? true : false);

  return {
    id: id,
    idCliente: idCliente,
    cliente: cliente,
    tipo: tipo,
    monto: monto,
    tasaInteres: tasaInteres,
    plazo: plazo,
    totalAPagar: totalAPagar,
    cuotas: cuotas,
    horarioCobroPreferido: horarioCobroPreferido ? horarioCobroPreferido : '',
    estado: estado,
    esDiscrecional: esDiscrecional,
    garantia: garantia,
    pagos: pagos,
    cuotasVencidas: cuotasVencidas,
    cronograma: cronogramaFinal,
    auditoria: auditoriaFinal
  };
}

// Completa el estado de la garantia cuando el backend real aun no responde.
function normalizarGarantia(garantia) {
  if (!garantia) {
    return null;
  }

  return {
    descripcion: garantia.descripcion ? garantia.descripcion : '',
    valorRecuperable: garantia.valorRecuperable ? garantia.valorRecuperable : 0,
    ubicacion: garantia.ubicacion ? garantia.ubicacion : '',
    observaciones: garantia.observaciones ? garantia.observaciones : '',
    fotos: garantia.fotos ? garantia.fotos : [],
    estado: garantia.estado ? garantia.estado : 'ACEPTADA'
  };
}

// Genera opciones de simulacion segun monto y reglas de plazo.
function crearOpcionesSimulacion(monto) {
  let opciones = [];
  let tasaSemanal = 0.10;
  let tasaMensual = 0.30;

  for (let semanas = 1; semanas <= 8; semanas++) {
    let totalSemanal = calcularTotalConTasa(monto, tasaSemanal, semanas);
    let cuotaSemanal = calcularCuota(totalSemanal, semanas);
    let textoPlazo = semanas === 1 ? '1 semana' : semanas + ' semanas';

    opciones.push(
      crearOpcionSimulacion(
        'semana-' + semanas,
        'Plan semanal ' + textoPlazo,
        textoPlazo,
        { unidad: 'SEMANAS', valor: semanas },
        semanas,
        cuotaSemanal,
        totalSemanal,
        calcularPrimerPago('SEMANAS'),
        monto,
        tasaSemanal
      )
    );
  }

  for (let meses = 1; meses <= 6; meses++) {
    let totalMensual = calcularTotalConTasa(monto, tasaMensual, meses);
    let cuotaMensual = calcularCuota(totalMensual, meses);
    let textoPlazo = meses === 1 ? '1 mes' : meses + ' meses';

    opciones.push(
      crearOpcionSimulacion(
        'mes-' + meses,
        'Plan mensual ' + textoPlazo,
        textoPlazo,
        { unidad: 'MESES', valor: meses },
        meses,
        cuotaMensual,
        totalMensual,
        calcularPrimerPago('MESES'),
        monto,
        tasaMensual
      )
    );
  }

  return opciones;
}

// Crea una opcion de simulacion para renderizar en la UI.
function crearOpcionSimulacion(id, descripcion, plazoTexto, plazoObjeto, cuotas, cuota, totalAPagar, primerPago, monto, tasaInteres) {
  return {
    id: id,
    descripcion: descripcion,
    plazo: plazoTexto,
    plazoObjeto: plazoObjeto,
    cuotas: cuotas,
    cuota: cuota,
    totalAPagar: totalAPagar,
    primerPago: primerPago,
    monto: monto,
    tasaInteres: tasaInteres
  };
}

// Devuelve un score consistente con el modulo Clientes.
function obtenerScorePrestamo(idCliente) {
  let scoreCliente = obtenerScoreClienteMock(idCliente);

  if (scoreCliente !== null && scoreCliente !== undefined && !Number.isNaN(Number(scoreCliente))) {
    return Number(scoreCliente);
  }

  return 55;
}

// Filtra prestamos por estado si corresponde.
function filtrarPrestamos(estado) {
  if (!estado) {
    return prestamosMock.slice();
  }

  let estadoNormalizado = String(estado).toUpperCase();

  return prestamosMock.filter(function filtrar(item) {
    return item.estado === estadoNormalizado;
  });
}

// Busca un prestamo por id en el dataset actual.
function buscarPrestamoPorId(id) {
  return prestamosMock.find(function encontrar(item) {
    return item.id === id;
  });
}

// Valida los datos del prestamo estandar.
function validarPrestamoEstandar(datosPrestamo) {
  let errores = {};

  if (!datosPrestamo || !datosPrestamo.idCliente) {
    errores.idCliente = 'El cliente es obligatorio.';
  }
  if (!datosPrestamo || !datosPrestamo.monto) {
    errores.monto = 'El monto es obligatorio.';
  }
  if (!datosPrestamo || !datosPrestamo.tasaInteres) {
    errores.tasaInteres = 'La tasa es obligatoria.';
  }
  if (!datosPrestamo || !datosPrestamo.plazo || !datosPrestamo.plazo.unidad || !datosPrestamo.plazo.valor) {
    errores.plazo = 'El plazo es obligatorio.';
  }
  if (!datosPrestamo || !datosPrestamo.horarioCobroPreferido) {
    errores.horarioCobroPreferido = 'El horario de cobro es obligatorio.';
  }
  if (!datosPrestamo || !datosPrestamo.garantia || !datosPrestamo.garantia.valorRecuperable) {
    errores.garantia = 'La garantia es obligatoria.';
  }

  return errores;
}

// Valida los datos del prestamo discrecional.
function validarPrestamoDiscrecional(datosPrestamo) {
  let errores = {};

  if (!datosPrestamo || !datosPrestamo.idCliente) {
    errores.idCliente = 'El cliente es obligatorio.';
  }
  if (!datosPrestamo || !datosPrestamo.monto) {
    errores.monto = 'El monto es obligatorio.';
  }
  if (!datosPrestamo || !datosPrestamo.tasaInteres) {
    errores.tasaInteres = 'La tasa es obligatoria.';
  }
  if (!datosPrestamo || !datosPrestamo.plazo || !datosPrestamo.plazo.unidad || !datosPrestamo.plazo.valor) {
    errores.plazo = 'El plazo es obligatorio.';
  }
  if (!datosPrestamo || !datosPrestamo.horarioCobroPreferido) {
    errores.horarioCobroPreferido = 'El horario de cobro es obligatorio.';
  }
  if (!datosPrestamo || !datosPrestamo.motivo) {
    errores.motivo = 'El motivo es obligatorio.';
  }

  return errores;
}

// Valida los datos de registro de pago.
function validarPago(datosPago) {
  let errores = {};

  if (!datosPago || !datosPago.monto) {
    errores.monto = 'El monto es obligatorio.';
  }
  if (!datosPago || !datosPago.pagadoEn) {
    errores.pagadoEn = 'La fecha de pago es obligatoria.';
  }

  return errores;
}

// Calcula un total simple para la demo cuando falta el backend real.
function calcularTotal(monto, tasaInteres) {
  let base = Number(monto) ? Number(monto) : 0;
  let tasa = Number(tasaInteres) ? Number(tasaInteres) : 0;
  return Math.round(base + base * tasa);
}

// Calcula el total con interes simple segun periodos.
function calcularTotalConTasa(monto, tasa, periodos) {
  let base = Number(monto);
  let tasaNumerica = Number(tasa);
  let cantidad = Number(periodos);

  if (!esNumeroValido(base) || !esNumeroValido(tasaNumerica) || !esNumeroValido(cantidad)) {
    return 0;
  }

  return Math.round(base + base * tasaNumerica * cantidad);
}

// Calcula la cuota base dividiendo por cantidad de periodos.
function calcularCuota(total, periodos) {
  let cantidad = Number(periodos);

  if (!esNumeroValido(total) || !esNumeroValido(cantidad)) {
    return 0;
  }

  return Math.round(total / cantidad);
}

// Calcula la fecha del primer pago segun la unidad del plazo.
function calcularPrimerPago(unidad) {
  let hoy = new Date();
  let fecha = new Date(hoy);

  if (unidad === 'SEMANAS') {
    fecha.setDate(fecha.getDate() + 7);
  } else {
    fecha.setMonth(fecha.getMonth() + 1);
  }

  return formatearFecha(fecha);
}

// Calcula la cantidad de cuotas basica segun el plazo.
function calcularCuotas(plazo) {
  if (!plazo || !plazo.valor) {
    return 1;
  }

  let valor = Number(plazo.valor);
  if (Number.isNaN(valor) || valor <= 0) {
    return 1;
  }

  return valor;
}

// Determina el monto maximo habilitado segun el scoring.
function obtenerMontoMaximo(score) {
  let valor = Number(score);

  if (Number.isNaN(valor)) {
    return 200000;
  }

  if (valor >= 80) {
    return 2000000;
  }

  if (valor >= 60) {
    return 1000000;
  }

  if (valor >= 50) {
    return 500000;
  }

  return 200000;
}

// Valida valores numericos positivos.
function esNumeroValido(valor) {
  let numero = Number(valor);
  return !Number.isNaN(numero) && numero > 0;
}

// Genera cronograma demo basado en fecha actual y cantidad de cuotas.
function crearCronogramaDemo(totalAPagar, cuotas, plazo, pagos) {
  let cuotasTotales = cuotas ? cuotas : 1;
  let montoCuota = cuotasTotales > 0 ? Math.round(totalAPagar / cuotasTotales) : totalAPagar;
  let cronograma = [];
  let fechaBase = new Date();
  let pagosRegistrados = pagos ? pagos.length : 0;

  for (let indice = 1; indice <= cuotasTotales; indice++) {
    let fechaCuota = new Date(fechaBase);

    if (plazo && plazo.unidad === 'SEMANAS') {
      fechaCuota.setDate(fechaCuota.getDate() + 7 * indice);
    } else {
      fechaCuota.setMonth(fechaCuota.getMonth() + indice);
    }

    cronograma.push({
      numero: indice,
      fecha: formatearFecha(fechaCuota),
      monto: montoCuota,
      estado: indice <= pagosRegistrados ? 'PAGADA' : 'PENDIENTE'
    });
  }

  return cronograma;
}

// Crea la auditoria inicial segun el flujo del prestamo.
function crearAuditoriaInicial(conGarantia) {
  let auditoria = [];

  auditoria.push(crearEventoAuditoria('Prestamo creado', 'Operario'));

  if (conGarantia) {
    auditoria.push(crearEventoAuditoria('Garantia registrada', 'Operario'));
  }

  return auditoria;
}

// Genera un evento de auditoria basico.
function crearEventoAuditoria(descripcion, responsable) {
  return {
    id: crearId('evento'),
    descripcion: descripcion,
    fecha: obtenerFechaISO(),
    responsable: responsable
  };
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
      signal.addEventListener('abort', function cancelar() {
        clearTimeout(temporizador);
        reject(crearAbortError());
      }, { once: true });
    }
  });
}

// Obtiene la latencia simulada para las respuestas mock.
function obtenerDelay() {
  if (typeof globalThis !== 'undefined' && typeof globalThis.__MOCK_DELAY_MS__ === 'number') {
    return globalThis.__MOCK_DELAY_MS__;
  }

  return 500;
}

// Crea un error con la forma esperada por la UI.
function crearErrorMock(status, mensaje, detalles) {
  return {
    status: status,
    message: mensaje,
    details: detalles
  };
}

// Crea un error de abort compatible con AbortController.
function crearAbortError() {
  let error = new Error('AbortError');
  error.name = 'AbortError';
  return error;
}

// Genera una fecha ISO simple.
function obtenerFechaISO() {
  let hoy = new Date();
  return formatearFecha(hoy);
}

// Formatea una fecha en formato YYYY-MM-DD.
function formatearFecha(fecha) {
  let mes = String(fecha.getMonth() + 1).padStart(2, '0');
  let dia = String(fecha.getDate()).padStart(2, '0');

  return fecha.getFullYear() + '-' + mes + '-' + dia;
}

// Clona un objeto para evitar mutaciones externas.
function clonarObjeto(valor) {
  return JSON.parse(JSON.stringify(valor));
}

// Clona el listado de prestamos para reinicios.
function clonarPrestamos(lista) {
  return lista.map(function copiar(item) {
    return clonarObjeto(item);
  });
}

// Crea un identificador simple para el modo demo.
function crearId(prefijo) {
  return prefijo + '-' + String(Date.now()) + '-' + String(Math.floor(Math.random() * 1000));
}

export {
  obtenerPrestamosMock,
  obtenerPrestamosPorClienteMock,
  obtenerPrestamoMock,
  simularPrestamoMock,
  crearPrestamoEstandarMock,
  crearPrestamoDiscrecionalMock,
  registrarPagoMock,
  ejecutarGarantiaMock,
  resetPrestamosMock
};
