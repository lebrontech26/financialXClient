// Definiciones JSDoc para tipar modelos de clientes sin logica ejecutable.
/**
 * @typedef {Object} ClientSummary
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} cuil
 * @property {number} score
 * @property {number} category
 */

/**
 * @typedef {Object} ClientDetail
 * @property {string} id
 * @property {string} cuil
 * @property {Object} personalData
 * @property {boolean} statusIsActive
 * @property {Object} currentRiskProfile
 */

/**
 * @typedef {Object} ClientCreateRequest
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} cuil
 * @property {string} birthDate
 * @property {string} phone
 * @property {string} street
 * @property {string} locality
 * @property {string} province
 */

/**
 * @typedef {Object} ClientUpdateRequest
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} birthDate
 * @property {string} phone
 * @property {string} street
 * @property {string} locality
 * @property {string} province
 */

/**
 * @typedef {Object} PagedResponse
 * @property {Array} items
 * @property {number} totalCount
 * @property {number} page
 * @property {number} pageSize
 */

/**
 * @typedef {Object} ApiError
 * @property {number} status
 * @property {string} message
 * @property {Object} [details]
 */

export { };
