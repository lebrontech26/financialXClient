// Definiciones JSDoc para tipar modelos de prestamos sin logica ejecutable.
/**
 * @typedef {Object} ResumenPrestamo
 * @property {string} id
 * @property {string} cliente
 * @property {number} monto
 * @property {string} estado
 * @property {string} tipo
 * @property {boolean} esDiscrecional
 * @property {number} cuotasVencidas
 * @property {string} garantia
 */

/**
 * @typedef {Object} PrestamoDetalle
 * @property {string} id
 * @property {string} idCliente
 * @property {string} cliente
 * @property {string} tipo
 * @property {number} monto
 * @property {number} tasaInteres
 * @property {Object} plazo
 * @property {string} plazo.unidad
 * @property {number} plazo.valor
 * @property {number} totalAPagar
 * @property {number} cuotas
 * @property {string} horarioCobroPreferido
 * @property {string} estado
 * @property {boolean} esDiscrecional
 * @property {string} [motivoDiscrecional]
 * @property {Garantia|null} garantia
 * @property {Array<Pago>} pagos
 * @property {Array<CuotaCronograma>} cronograma
 * @property {Array<EventoAuditoria>} auditoria
 * @property {number} cuotasVencidas
 */

/**
 * @typedef {Object} Garantia
 * @property {string} descripcion
 * @property {number} valorRecuperable
 * @property {string} ubicacion
 * @property {string} estado
 * @property {string} [observaciones]
 * @property {Array<string>} [fotos]
 */

/**
 * @typedef {Object} Pago
 * @property {string} id
 * @property {number} monto
 * @property {string} pagadoEn
 * @property {boolean} estaEnMora
 * @property {number} interesMoraAplicado
 */

/**
 * @typedef {Object} CuotaCronograma
 * @property {number} numero
 * @property {string} fecha
 * @property {number} monto
 * @property {string} estado
 */

/**
 * @typedef {Object} EventoAuditoria
 * @property {string} id
 * @property {string} descripcion
 * @property {string} fecha
 * @property {string} responsable
 */

/**
 * @typedef {Object} OpcionSimulacionPrestamo
 * @property {string} id
 * @property {string} descripcion
 * @property {string} plazo
 * @property {Object} plazoObjeto
 * @property {string} plazoObjeto.unidad
 * @property {number} plazoObjeto.valor
 * @property {number} cuotas
 * @property {number} cuota
 * @property {number} totalAPagar
 * @property {string} primerPago
 * @property {number} monto
 * @property {number} tasaInteres
 */

/**
 * @typedef {Object} RespuestaSimulacionPrestamo
 * @property {string} idCliente
 * @property {Array<OpcionSimulacionPrestamo>} opciones
 */

/**
 * @typedef {Object} RespuestaPaginadaPrestamos
 * @property {Array<ResumenPrestamo>} elementos
 * @property {number} total
 * @property {number} pagina
 * @property {number} tamanioPagina
 */

/**
 * @typedef {Object} ErrorApi
 * @property {number} status
 * @property {string} message
 * @property {Object} [details]
 */

export { };
