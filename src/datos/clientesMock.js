let clientesMock = crearClientesIniciales();
let clientesMockIniciales = clonarClientes(clientesMock);

// Devuelve el listado paginado de clientes con filtro server-side simulado.
function obtenerClientesMock(parametros, signal) {
  let pagina = parametros && parametros.page ? parametros.page : 1;
  let tamano = parametros && parametros.pageSize ? parametros.pageSize : 10;
  let consulta = parametros && parametros.query ? parametros.query : '';

  return ejecutarConLatencia(function ejecutar() {
    if (consulta && consulta.toLowerCase().includes('error')) {
      throw crearErrorMock(500, 'Error interno del servidor');
    }

    let filtrados = filtrarClientes(consulta);
    let inicio = (pagina - 1) * tamano;
    let items = filtrados.slice(inicio, inicio + tamano).map(function mapear(item) {
      return {
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        cuil: item.cuil,
        score: item.score,
        category: item.category
      };
    });

    return {
      items: items,
      totalCount: filtrados.length,
      page: pagina,
      pageSize: tamano
    };
  }, signal);
}

// Devuelve el detalle completo de un cliente por id.
function obtenerClienteMock(id) {
  return ejecutarConLatencia(function ejecutar() {
    let cliente = buscarClientePorId(id);

    if (!cliente) {
      throw crearErrorMock(404, 'Recurso no encontrado');
    }

    return clonarObjeto(cliente);
  });
}

// Crea un cliente nuevo con validaciones basicas.
function crearClienteMock(payload) {
  return ejecutarConLatencia(function ejecutar() {
    let errores = validarCreacion(payload);

    if (Object.keys(errores).length > 0) {
      throw crearErrorMock(400, 'Error de validacion', errores);
    }

    let cuilNormalizado = normalizarCuil(payload.cuil);
    let existente = clientesMock.find(function encontrar(item) {
      return normalizarCuil(item.cuil) === cuilNormalizado;
    });

    if (existente) {
      throw crearErrorMock(409, 'Conflicto de datos', { cuil: 'CUIL ya existe.' });
    }

    let nuevoId = String(-Date.now());
    let score = calcularScoreInicial(payload);
    let categoria = calcularCategoria(score);
    let cuilFormateado = formatearCuil(payload.cuil);

    let nuevo = {
      id: nuevoId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      cuil: cuilFormateado,
      score: score,
      category: categoria,
      personalData: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        birthDate: payload.birthDate,
        phone: payload.phone,
        address: {
          street: payload.street,
          locality: payload.locality,
          province: payload.province
        }
      },
      status: {
        isActive: true
      },
      currentRiskProfile: {
        scoreFinal: score,
        category: categoria,
        sinEvidenciaCrediticia: false,
        lastCalculatedAt: obtenerFechaHoy()
      },
      scoringHistory: crearHistorialBase(score, categoria),
      financialSummary: crearResumenBasico()
    };

    clientesMock.unshift(nuevo);

    return { id: nuevoId };
  });
}

// Actualiza los datos editables de un cliente existente.
function actualizarClienteMock(id, payload) {
  return ejecutarConLatencia(function ejecutar() {
    let cliente = buscarClientePorId(id);

    if (!cliente) {
      throw crearErrorMock(404, 'Recurso no encontrado');
    }

    let errores = validarEdicion(payload);

    if (Object.keys(errores).length > 0) {
      throw crearErrorMock(400, 'Error de validacion', errores);
    }

    cliente.firstName = payload.firstName;
    cliente.lastName = payload.lastName;
    cliente.personalData.firstName = payload.firstName;
    cliente.personalData.lastName = payload.lastName;
    cliente.personalData.birthDate = payload.birthDate;
    cliente.personalData.phone = payload.phone;
    cliente.personalData.address.street = payload.street;
    cliente.personalData.address.locality = payload.locality;
    cliente.personalData.address.province = payload.province;

    return { id: id };
  });
}

// Elimina un cliente existente del listado.
function eliminarClienteMock(id) {
  return ejecutarConLatencia(function ejecutar() {
    let indice = clientesMock.findIndex(function buscar(item) {
      return item.id === id;
    });

    if (indice === -1) {
      throw crearErrorMock(404, 'Recurso no encontrado');
    }

    clientesMock.splice(indice, 1);

    return null;
  });
}

// Restablece el listado a su estado inicial (util para pruebas).
function resetClientesMock() {
  clientesMock = clonarClientes(clientesMockIniciales);
}

// Crea el dataset inicial de clientes para el modo demo.
function crearClientesIniciales() {
  return [
    crearClienteBase(
      '-1',
      'Juan',
      'Perez',
      '20-12345678-9',
      72,
      2,
      '1988-04-12',
      '1133445566',
      'Av. Siempre Viva 123',
      'Rosario',
      'Santa Fe'
    ),
    crearClienteBase(
      '-2',
      'Laura',
      'Gomez',
      '23-87654321-0',
      58,
      3,
      '1991-08-23',
      '1144556677',
      'Mitre 455',
      'Cordoba',
      'Cordoba'
    ),
    crearClienteBase(
      '-3',
      'Marcelo',
      'Lopez',
      '27-11223344-5',
      83,
      1,
      '1979-11-03',
      '1155667788',
      'San Martin 87',
      'Mendoza',
      'Mendoza'
    ),
    crearClienteBase(
      '-4',
      'Ana',
      'Martinez',
      '20-98765432-1',
      33,
      5,
      '1996-01-30',
      '1166778899',
      'Belgrano 900',
      'La Plata',
      'Buenos Aires'
    ),
    crearClienteBase(
      '-5',
      'Carlos',
      'Fernandez',
      '21-44556677-8',
      65,
      2,
      '1985-07-19',
      '1177889900',
      'Colon 1234',
      'Mar del Plata',
      'Buenos Aires'
    ),
    crearClienteBase(
      '-6',
      'Sofia',
      'Ruiz',
      '23-55554443-2',
      40,
      4,
      '1993-05-11',
      '1188990011',
      'Rivadavia 300',
      'Salta',
      'Salta'
    ),
    crearClienteBase(
      '-7',
      'Lucas',
      'Sanchez',
      '27-66778899-0',
      91,
      1,
      '1982-09-07',
      '1199001122',
      '9 de Julio 456',
      'Neuquen',
      'Neuquen'
    )
  ];
}

// Crea un cliente con estructura completa para el detalle.
function crearClienteBase(id, nombre, apellido, cuil, score, categoria, nacimiento, telefono, calle, localidad, provincia) {
  return {
    id: id,
    firstName: nombre,
    lastName: apellido,
    cuil: cuil,
    score: score,
    category: categoria,
    personalData: {
      firstName: nombre,
      lastName: apellido,
      birthDate: nacimiento,
      phone: telefono,
      address: {
        street: calle,
        locality: localidad,
        province: provincia
      }
    },
    status: {
      isActive: true
    },
    currentRiskProfile: {
      scoreFinal: score,
      category: categoria,
      sinEvidenciaCrediticia: false,
      lastCalculatedAt: obtenerFechaHoy(),
      alerts: categoria >= 4 ? ['Verificar comportamiento de pago'] : []
    },
    scoringHistory: crearHistorialBase(score, categoria),
    financialSummary: crearResumenBasico()
  };
}

// Crea un historial simple de scoring para el detalle.
function crearHistorialBase(scoreFinal, categoria) {
  return [
    {
      calculatedAt: '2024-05-10',
      scoreFinal: scoreFinal,
      category: categoria,
      scoreBase: scoreFinal - 6,
      adjustments: [
        { description: 'Comportamiento de pago', value: '+3' },
        { description: 'Relacion con entidades', value: '+3' }
      ],
      alerts: categoria >= 4 ? ['Alerta por mora reciente'] : [],
      reasons: ['Historico de pagos', 'Regularidad']
    },
    {
      calculatedAt: '2024-02-18',
      scoreFinal: scoreFinal - 5,
      category: categoria,
      scoreBase: scoreFinal - 9,
      adjustments: [
        { description: 'Antiguedad crediticia', value: '+4' }
      ],
      alerts: [],
      reasons: ['Perfil historico']
    }
  ];
}

// Crea un resumen financiero base cuando no hay datos del backend.
function crearResumenBasico() {
  return {
    items: [
      {
        title: 'Situacion crediticia actual',
        text: 'Situacion normal, sin incidencias relevantes.'
      },
      {
        title: 'Historial crediticio (ultimos 24 meses)',
        text: 'Historial estable con pagos dentro de termino.'
      },
      {
        title: 'Recencia de la mora',
        text: 'No se registran moras recientes.'
      },
      {
        title: 'Relacion con entidades financieras',
        text: 'Relacion activa con entidades sin alertas.'
      },
      {
        title: 'Cheques rechazados',
        text: 'No se registran cheques rechazados.'
      }
    ]
  };
}

// Filtra clientes por nombre, apellido o CUIL normalizado.
function filtrarClientes(consulta) {
  if (!consulta) {
    return clientesMock.slice();
  }

  let consultaTexto = consulta.toLowerCase();
  let consultaCuil = normalizarCuil(consulta);

  return clientesMock.filter(function filtrar(item) {
    let texto = (item.firstName + ' ' + item.lastName).toLowerCase();
    let cuilNormalizado = normalizarCuil(item.cuil);

    return texto.includes(consultaTexto) || (consultaCuil && cuilNormalizado.includes(consultaCuil));
  });
}

// Busca un cliente por id en el dataset actual.
function buscarClientePorId(id) {
  return clientesMock.find(function encontrar(item) {
    return item.id === id;
  });
}

// Devuelve el score actual de un cliente o null si no existe.
function obtenerScoreClienteMock(id) {
  let cliente = buscarClientePorId(id);

  if (!cliente) {
    return null;
  }

  if (cliente.currentRiskProfile && cliente.currentRiskProfile.scoreFinal !== undefined) {
    return Number(cliente.currentRiskProfile.scoreFinal);
  }

  if (cliente.score !== undefined) {
    return Number(cliente.score);
  }

  return null;
}

// Valida campos obligatorios del payload de creacion.
function validarCreacion(payload) {
  let errores = {};

  if (!payload || !payload.firstName) {
    errores.firstName = 'El nombre es obligatorio.';
  }
  if (!payload || !payload.lastName) {
    errores.lastName = 'El apellido es obligatorio.';
  }
  if (!payload || !payload.cuil) {
    errores.cuil = 'El CUIL es obligatorio.';
  } else if (!/^[0-9]{11}$/.test(normalizarCuil(payload.cuil))) {
    errores.cuil = 'El CUIL debe tener 11 digitos numericos.';
  }
  if (!payload || !payload.birthDate) {
    errores.birthDate = 'La fecha de nacimiento es obligatoria.';
  }
  if (!payload || !payload.phone) {
    errores.phone = 'El telefono es obligatorio.';
  }
  if (!payload || !payload.street) {
    errores.street = 'La calle es obligatoria.';
  }
  if (!payload || !payload.locality) {
    errores.locality = 'La localidad es obligatoria.';
  }
  if (!payload || !payload.province) {
    errores.province = 'La provincia es obligatoria.';
  }

  return errores;
}

// Valida campos obligatorios del payload de edicion.
function validarEdicion(payload) {
  let errores = {};

  if (!payload || !payload.firstName) {
    errores.firstName = 'El nombre es obligatorio.';
  }
  if (!payload || !payload.lastName) {
    errores.lastName = 'El apellido es obligatorio.';
  }
  if (!payload || !payload.birthDate) {
    errores.birthDate = 'La fecha de nacimiento es obligatoria.';
  }
  if (!payload || !payload.phone) {
    errores.phone = 'El telefono es obligatorio.';
  }
  if (!payload || !payload.street) {
    errores.street = 'La calle es obligatoria.';
  }
  if (!payload || !payload.locality) {
    errores.locality = 'La localidad es obligatoria.';
  }
  if (!payload || !payload.province) {
    errores.province = 'La provincia es obligatoria.';
  }

  return errores;
}

// Calcula un score base deterministico para demo.
function calcularScoreInicial(payload) {
  let base = 60;
  let numeros = normalizarCuil(payload.cuil);

  if (numeros.length >= 2) {
    base = base + Number(numeros.substring(numeros.length - 2));
  }

  if (base > 95) {
    base = 95;
  }

  return base;
}

// Calcula la categoria segun reglas de score.
function calcularCategoria(score) {
  if (score >= 80) {
    return 1;
  }
  if (score >= 65) {
    return 2;
  }
  if (score >= 50) {
    return 3;
  }
  if (score >= 35) {
    return 4;
  }
  return 5;
}

// Normaliza el CUIL a un string numerico sin simbolos.
function normalizarCuil(cuil) {
  if (!cuil) {
    return '';
  }

  return String(cuil).replace(/[^0-9]/g, '');
}

// Formatea el CUIL cuando se recibe con 11 digitos.
function formatearCuil(cuil) {
  let normalizado = normalizarCuil(cuil);

  if (normalizado.length !== 11) {
    return normalizado;
  }

  return (
    normalizado.substring(0, 2) +
    '-' +
    normalizado.substring(2, 10) +
    '-' +
    normalizado.substring(10)
  );
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

// Genera una fecha de hoy en formato ISO.
function obtenerFechaHoy() {
  let hoy = new Date();
  let mes = String(hoy.getMonth() + 1).padStart(2, '0');
  let dia = String(hoy.getDate()).padStart(2, '0');

  return hoy.getFullYear() + '-' + mes + '-' + dia;
}

// Clona un cliente para evitar mutaciones externas.
function clonarObjeto(valor) {
  return JSON.parse(JSON.stringify(valor));
}

// Clona el listado de clientes para reinicios.
function clonarClientes(lista) {
  return lista.map(function copiar(item) {
    return clonarObjeto(item);
  });
}

export {
  obtenerClientesMock,
  obtenerClienteMock,
  crearClienteMock,
  actualizarClienteMock,
  eliminarClienteMock,
  resetClientesMock,
  obtenerScoreClienteMock
};
