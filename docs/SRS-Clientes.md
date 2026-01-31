# Documento de Especificacion de Requisitos de Software (SRS)
# Sistema de Gestion Financiera - Modulo de Clientes
# Estilo IEEE 830 adaptado a Agile / Scrum

1. Introduccion

1.1 Proposito del Documento
Este documento define los requisitos funcionales, reglas de negocio,
restricciones tecnicas y criterios de usabilidad del Modulo de Clientes.

El proposito es asegurar que:
- El Backend (.NET 10) implemente reglas de negocio cerradas, deterministicas y auditables.
- El Frontend (React) se limite estrictamente a presentacion y experiencia de usuario, sin logica financiera.
- QA pueda validar el sistema sin interpretacion subjetiva.
- El sistema quede preparado para escalabilidad, auditoria y migracion futura a DB relacional.

Este documento tiene caracter contractual y normativo.

1.2 Alcance del Modulo
El Modulo de Clientes permite:
- Alta de clientes.
- Edicion de datos personales.
- Baja logica (inactivacion).
- Consulta de clientes mediante dashboard.
- Busqueda y paginacion server-side.
- Evaluacion automatica del riesgo crediticio mediante datos del BCRA.
- Persistencia del perfil crediticio actual y del historial completo de scoring.

Fuera de alcance (fase actual)
- Gestion de prestamos.
- Garantias.
- Pagos, cuotas o mora interna.
- Gestion contable.
- Decisiones automaticas de otorgamiento.

2. Arquitectura y Separacion de Responsabilidades

2.1 Frontend - React
El frontend NO contiene logica de negocio ni interpretacion financiera.
Responsabilidades exclusivas:
- Renderizado de vistas y componentes UI.
- Captura de datos mediante formularios.
- Validaciones basicas de formato.
- Requests HTTP a la API.
- Manejo de estados visuales (loading, error, empty).
- Optimizar UX (debounce, feedback visual, accesibilidad).

Prohibiciones explicitas:
- No calcular scoring.
- No interpretar reglas crediticias.
- No decidir categorias ni alertas.
- No filtrar clientes en memoria.
- No exponer variables tecnicas, codigos internos ni JSON del BCRA.

2.2 Backend - API .NET 10
El backend es la unica fuente de verdad del sistema.
Responsabilidades:
- Validaciones criticas (unicidad, inmutabilidad).
- Orquestacion con servicios externos (BCRA).
- Implementacion exacta del motor de scoring.
- Interpretacion de datos financieros.
- Persistencia del estado actual y del historial completo.
- Auditoria, trazabilidad y consistencia historica.

2.3 Modo demo (mocks)
- En la demo se usan datos mockeados en el frontend.
- El contrato de API y DTOs debe ser identico al backend real.
- Al conectar backend, se desactiva el flag de mocks sin reescribir la UI.
- La baja logica se simula removiendo registros del mock; en backend real se usa isActive=false.

2.4 Convenciones de desarrollo frontend (obligatorias)
- CSS sin Grid: se permite solo display: flex para maquetado.
- Solo etiquetas semanticas (header, main, section, nav, article, aside, footer, form, button, label, input, etc.).
- JSX y CSS separados: componente.jsx para logica/markup y componente.css para estilos.
- No estilos inline salvo excepcion documentada.
- Respetar estructura de carpetas por atomic design: atomos, moleculas, paginas.
- Funciones declarativas en JS: se prohibe el uso de arrow functions.
- JS vanilla (sin TypeScript).
- Nombres de funciones, variables y componentes en espanol y descriptivos.
- Codigo comentado para dar contexto y razon de la implementacion.

3. Principios Rectores de Diseno

PR-01 - El sistema interpreta, el operario decide
El operario no debe interpretar numeros crudos ni estructuras tecnicas.
Por lo tanto:
- El sistema interpreta los datos del BCRA.
- El sistema explica el significado financiero.
- La UI muestra informacion procesada, contextualizada y explicada.
- El dashboard informa, no decide.

4. Reglas de Negocio Fundamentales (NO NEGOCIABLES)

RB-01 - CUIL unico e inmutable
El CUIL:
- Debe ser unico en todo el sistema, incluyendo clientes inactivos.
- No puede modificarse una vez creado el cliente.
Errores:
- Alta con CUIL existente -> 400 Bad Request (mensaje descriptivo)
- Intento de modificacion -> 400 Bad Request

RB-02 - Borrado logico obligatorio
Los clientes nunca se eliminan fisicamente.
El borrado:
- Establece isActive=false.
- Mantiene todos los datos asociados (perfil actual e historial).
Justificacion:
- Integridad referencial futura.
- Auditoria.
- Cumplimiento normativo.

RB-03 - Scoring obligatorio al alta
Todo cliente debe intentar calcular scoring al alta.
El scoring:
- Se calcula exclusivamente en backend.
- Usa tablas oficiales del BCRA.
- Es deterministico, reproducible y auditable.
Caso especial - Sin evidencia crediticia:
- El cliente se crea igualmente.
- Se marca explicitamente sinEvidenciaCrediticia=true.

RB-04 - Busqueda siempre server-side
Toda busqueda y paginacion se ejecuta en la API.
Esta prohibido filtrar datos precargados en frontend.

5. Modelo de Datos

5.1 Entidad Cliente
{
  "id": "uuid-v4",
  "cuil": "string (11 digits, unique, immutable)",
  "personalData": {
    "firstName": "string",
    "lastName": "string",
    "birthDate": "ISO8601",
    "phone": "string",
    "address": {
      "street": "string",
      "locality": "string",
      "province": "string"
    }
  },
  "status": {
    "isActive": true,
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  },
  "currentRiskProfile": {
    "scoreFinal": 72,
    "category": 2,
    "sinEvidenciaCrediticia": false,
    "lastCalculatedAt": "ISO8601"
  }
}

5.2 Entidad Historial de Scoring
Cada calculo genera un nuevo registro, nunca se sobreescribe.
{
  "id": "uuid",
  "clientId": "uuid",
  "calculatedAt": "ISO8601",
  "scoreBase": 80,
  "adjustments": [
    {
      "code": "CHEQUE_RECHAZADO",
      "description": "1 cheque rechazado en los ultimos 12 meses",
      "value": -8
    }
  ],
  "scoreFinal": 72,
  "category": 2,
  "alerts": ["Mora reciente detectada"],
  "reasons": ["Cheque rechazado reciente"],
  "bcraSnapshot": { "raw": "json" }
}

6. Requisitos Funcionales del Modulo

RF-01 - Alta de Cliente
Se deben capturar datos personales completos.
El CUIL debe validarse como unico.
Antes de persistir:
- Se consulta BCRA.
- Se calcula scoring.
- Se asigna categoria.
Se persiste:
- Cliente.
- Perfil actual.
- Registro de historial.

RF-02 - Edicion de Cliente
Se permite modificar:
- Datos personales.
No se permite modificar:
- CUIL.
- Scoring.
- Categoria.

RF-03 - Baja Logica de Cliente
El cliente se marca como inactivo.
No se elimina informacion historica.
Se requiere confirmacion explicita del usuario.

RF-04 - Dashboard de Clientes
Listado paginado (10 por pagina).
Columnas minimas:
Nombre, Apellido, CUIL, Score, Categoria.
Acciones:
Ver detalle, Editar, Eliminar (baja logica).

RF-05 - Busqueda de Clientes
Filtros por:
Nombre, Apellido, CUIL.
Siempre server-side.
Debounce obligatorio en frontend.

RF-06 - Integracion con Prestamos
- Desde la tabla de clientes debe existir la accion "Nuevo prestamo".
- La accion navega a /prestamos/nuevo/:idCliente.
- El detalle del cliente debe listar prestamos asociados.
- Las fechas de vencimiento provienen del backend ya ajustadas a dia habil segun calendario oficial de Argentina.

7. Requisitos Funcionales - Detalle de Cliente (Informacion Financiera)

RF-DET-01 - Estructura de la Vista
La vista de detalle debe mostrar tres secciones:
Datos personales.
Informacion financiera interpretada.
Historial de scoring.
En la seccion de datos personales debe existir la accion "Nuevo prestamo".

RF-DET-02 - Indicador principal de riesgo (Velocimetro)
Escala fija 0-100.
Segmentacion exacta por categorias:
0-34: Critico
35-49: Alto
50-64: Medio
65-79: Medio-Bajo
80-100: Bajo
Marcador en el valor exacto del score.
Debajo del velocimetro se debe mostrar:
- Score numerico.
- Categoria textual.
- Texto interpretativo obligatorio.

RF-DET-03 - Resumen financiero interpretado
Mostrar items financieros explicados:
- Situacion crediticia.
- Historial reciente.
- Recencia de mora.
- Relacion con entidades.
- Cheques rechazados.
- Evidencia crediticia.
Prohibido mostrar:
- Codigos.
- JSON.
- Variables tecnicas.

RF-DET-04 - Alertas de Riesgo
Mostrar alertas informativas, no tecnicas.

RF-DET-05 - Historial de Scoring
Tabla cronologica descendente.
Posibilidad de expansion para ver:
Score base, ajustes, motivos y alertas.

8. Usabilidad y Accesibilidad
- Informacion clara y visual.
- No depender solo del color.
- Estados de carga y error obligatorios.
- Mensajes comprensibles para operarios no tecnicos.

9. Backlog Tecnico - Modulo de Clientes

Convenciones
- BE-xx: Backend (.NET 10)
- FE-xx: Frontend (React)
Reglas no negociables:
- CUIL unico/inmutable, borrado logico, scoring al alta, busqueda/paginacion server-side.
- Front no interpreta: no expone JSON BCRA ni variables crudas; muestra interpretacion.

PARTE 1 - BACKEND (.NET 10)

BE-01 - Bootstrap API Modulo Clientes (estructura + convenciones)
Prioridad: Alta
Descripcion tecnica
- ClientController
- Capa Application: ClientService, ScoringService (interfaces)
- Capa Domain: entidades y value objects
- Capa Infrastructure: repos JSON (fase actual) y gateway BCRA
- DTOs de request/response, manejo de errores (ProblemDetails)
- Logs minimos (requestId/correlationId)

Criterios de aceptacion
- Solucion compila y corre.
- Controllers thin (sin logica de negocio).
- Capas separadas (API/Application/Domain/Infrastructure).

BE-02 - Persistencia inicial JSON (clientes + scoring history)
Prioridad: Alta
Descripcion tecnica
- Persistir en JSON: cliente (estado actual), historial de scoring (append-only).
- Repositorios con interfaces: IClientRepository, IScoringHistoryRepository.
- Operaciones consistentes para paginacion/busqueda.

Criterios de aceptacion
- Se pueden crear, leer, actualizar (datos personales) y desactivar clientes.
- Se guarda historial en cada calculo de scoring (append).
- Application no conoce JSON.

BE-03 - Validaciones criticas: CUIL unico e inmutable (RB-01)
Prioridad: Alta
Descripcion tecnica
- Validar formato CUIL (11 digitos numericos).
- Validar unicidad global (activos e inactivos).
- Bloquear cambio de CUIL en edicion (payload distinto -> 400).
Respuestas esperadas:
- Alta con CUIL existente -> 400 Bad Request (mensaje descriptivo).
- Update intentando cambiar CUIL -> 400 Bad Request.

Criterios de aceptacion
- Tests unitarios para duplicado, update con cambio y formato invalido.

BE-04 - Gateway BCRA (cliente HTTP + normalizacion de respuesta)
Prioridad: Alta
Descripcion tecnica
- Implementar IBcraGateway con metodos de scoring.
- Manejar timeouts, errores de red, respuestas incompletas.
- Normalizar a BcraData consumible por ScoringService.

Criterios de aceptacion
- Gateway mockeable (tests del motor scoring).
- Errores del gateway traducidos a comportamiento de negocio.

BE-05 - Motor de Scoring (formula + clamp + categorias)
Prioridad: Alta
Descripcion tecnica
ScoreFinal = Clamp(ScoreBase + Sumatoria Penalizaciones, 0, 100)
Categorias exactas:
- 80-100 -> Cat 1 (Bajo)
- 65-79 -> Cat 2 (Medio-Bajo)
- 50-64 -> Cat 3 (Medio)
- 35-49 -> Cat 4 (Alto)
- 0-34 -> Cat 5 (Critico)

Criterios de aceptacion
- Clamp correcto 0..100.
- Rangos exactos con tests borde.

BE-06 - ScoringService (extendido, aislado, testeable)
Prioridad: Alta
Descripcion tecnica
CalculateScore(BcraData data) retorna:
scoreBase, adjustments[], scoreFinal, category, alerts[], reasons[], bcraSnapshot.

Criterios de aceptacion
- Reproduce reglas del BCRA definidas para el proyecto.
- No depende de controllers ni repositorios.
- Testeable en aislamiento.

BE-07 - Alta de Cliente + Scoring (POST /api/Client)
Prioridad: Alta
Flujo exacto
- Validar formato y unicidad del CUIL.
- Consultar BCRA (gateway).
- Extraer variables/features, calcular scoring y categoria.
- Persistir cliente (estado actual) y historial (registro nuevo).
Caso sin evidencia crediticia:
- Se crea igual si el CUIL existe.
- currentRiskProfile.sinEvidenciaCrediticia=true.

Criterios de aceptacion
- Scoring OK: cliente + historial.
- Sin evidencia: cliente + historial con flag.
- CUIL duplicado: 400 (mensaje descriptivo).
- Validaciones de campos obligatorios: 400 Bad Request (ProblemDetails).
- Respuesta exitosa: 200 OK.
- Historial append-only.

BE-08 - Manejo de fallo de scoring al alta ("Sin Scoring")
Prioridad: Alta
Descripcion tecnica
- Si falla scoring (gateway, datos invalidos externos), el cliente se guarda con estado "Sin Scoring".
- Se expone currentRiskProfile nulo o scoreFinal null + statusScoring="SIN_SCORING".
- Se loguea la razon tecnica.

Criterios de aceptacion
- El alta no se bloquea por error externo.
- Response permite mostrar estado inequívoco en FE.

BE-09 - Listado paginado y busqueda (GET /api/Client)
Prioridad: Alta
Parametros: page (default 1), pageSize (default 10), estaActivo (default true), searchTerm (opcional)
Comportamiento:
- Filtra por nombre, apellido o CUIL.
- Devuelve solo clientes activos.
- Respuesta paginada con total real.

Criterios de aceptacion
- totalCount real, pageSize default 10.
- No retorna inactivos.
- Busqueda no depende del FE.

BE-10 - Detalle de cliente + historial (GET /api/Client/{id})
Prioridad: Alta
Respuesta minima:
- client (personalData, status, currentRiskProfile)
- scoringHistory[] (DESC)
- financialSummary[] interpretado (recomendado).

Criterios de aceptacion
- 404 si no existe.
- Historial DESC.
- No expone info tecnica innecesaria.

BE-11 - Edicion de cliente (PUT /api/Client)
Prioridad: Media
Reglas
- Editables: nombre, apellido, birthDate, phone, address.
- No editable: CUIL (si viene distinto -> 400).
- Scoring no modificable.
Nota:
- El Id del cliente se envia en el body.

Criterios de aceptacion
- Actualiza datos personales y updatedAt.
- Rechaza cambios de CUIL.
- No altera scoring/historial.

BE-12 - Baja logica (DELETE /api/Client/{id})
Prioridad: Media
Reglas
- Set isActive=false.
- No borrar datos (cliente + historial permanecen).

Criterios de aceptacion
- Cliente desaparece del listado.
- Historial conserva integridad.
- Idempotencia (doble delete no rompe).

BE-13 - FinancialSummary interpretado para UI
Prioridad: Media
Descripcion tecnica
- Agregar financialSummary interpretado para operario en GET /api/Client/{id}.
Formato sugerido:
financialSummary: [{ key, title, text, badge? }]

Criterios de aceptacion
- Textos no tecnicos.
- Coherentes con PR-01.
- FE consume sin mapping adicional.

PARTE 2 - FRONTEND (React)

FE-01 - Bootstrap del modulo Clientes (ruteo + estructura)
Prioridad: Alta
Descripcion tecnica
- pages: ClientsListPage, ClientCreatePage, ClientEditPage, ClientDetailPage
- components: ClientsTable, SearchBar, Pagination, ConfirmDialog, ClientForm
- services: clientsApi
- types: clients
Rutas:
/clients, /clients/new, /clients/:id, /clients/:id/edit

Criterios de aceptacion
- Navegacion funcional entre rutas.
- Estructura modular clara.
- Sin logica de negocio local.

FE-02 - API Client Layer (fetch + manejo de errores)
Prioridad: Alta
Descripcion tecnica
clientsApi con:
- getClients({ page, pageSize, estaActivo, searchTerm })
- getClientById(id)
- createClient(payload)
- updateClient(payload)
- deleteClient(id)
Normalizacion de errores: 400, 404, 5xx.

Criterios de aceptacion
- Todas las paginas consumen API solo desde clientsApi.
- Errores normalizados en UI.

FE-03 - Dashboard Clientes: tabla + estados
Prioridad: Alta
Descripcion tecnica
ClientsListPage:
- GET /api/Client?page=1&pageSize=10&estaActivo=true&searchTerm=
- loading, empty, error con reintentar.
ClientsTable:
- Columnas: Nombre, Apellido, CUIL, Score, Categoria, Acciones.
- Acciones: Ver, Editar, Eliminar.

Criterios de aceptacion
- Loading visible hasta respuesta.
- Empty consistente.
- Error con retry real.

FE-04 - Paginacion server-side
Prioridad: Alta
Descripcion tecnica
Pagination:
- Next/Prev, pagina actual.
- totalPages = Math.ceil(totalCount/pageSize).
- Cambios disparan GET con searchTerm y page.
- Al cambiar searchTerm -> reset page=1.

Criterios de aceptacion
- Cambiar pagina hace nueva llamada.
- PageSize fijo 10.
- Search resetea a 1.

FE-05 - Buscador reactivo con debounce + cancelacion
Prioridad: Alta
Descripcion tecnica
SearchBar con debounce ~500ms y AbortController.
Prohibido filtrar en memoria.

Criterios de aceptacion
- No hay request por cada tecla.
- Cancelacion de requests previas.

FE-06 - Formulario Alta Cliente con validaciones UI
Prioridad: Alta
Descripcion tecnica
Campos requeridos:
firstName, lastName, cuil, birthDate, phone, street, locality, province.
Validaciones:
- CUIL 11 digitos numericos.
- BirthDate valida y no futura.
- Phone numerico minimo (segun UX).
Submit:
- POST /api/Client.

Criterios de aceptacion
- Guardar deshabilitado si invalido.
- Mensajes de error claros.

FE-07 - Alta con scoring: spinners, bloqueo UI, feedback
Prioridad: Alta
Descripcion tecnica
- Bloquear form en submit.
- Mostrar "Calculando scoring / consultando BCRA...".
- 200 -> navegar a detalle o toast.
- 400 -> "CUIL ya existe" o validaciones (ProblemDetails).
- 5xx -> error generico + reintentar.

FE-08 - Vista Detalle Cliente
Prioridad: Alta
Descripcion tecnica
Ruta /clients/:id con:
- Seccion A: Datos personales.
- Seccion B: Informacion financiera interpretada (RiskGauge).
- Seccion C: Historial de scoring (tabla).
Accion:
- Boton "Nuevo prestamo" al final de la seccion Datos personales (navega a /prestamos/nuevo/:idCliente).

Criterios de aceptacion
- No hay JSON/codigos crudos.
- Velocimetro correcto y rangos exactos.
- Loading/error/404 correctos.

FE-09 - UI Semaforo / CategoryBadge
Prioridad: Media
Descripcion tecnica
Badge de categoria con colores por rango.

FE-10 - Edicion de Cliente (CUIL read-only)
Prioridad: Media
Descripcion tecnica
- GET /api/Client/{id}, formulario con CUIL bloqueado.
- PUT /api/Client.

FE-11 - Borrado logico: confirmacion + refresh
Prioridad: Media
Descripcion tecnica
- ConfirmDialog -> DELETE /api/Client/{id}.
- Refrescar listado manteniendo searchTerm/page.

FE-12 - Manejo centralizado de estados
Prioridad: Media
Descripcion tecnica
Hook useAsyncState() o equivalente: { loading, error, data }.

FE-13 - Accesibilidad y UX minima
Prioridad: Baja

FE-14 - Pruebas UI minimas
Prioridad: Baja

FE-15 - Telemetria basica (opcional)
Prioridad: Baja

FE-16 - Convenciones frontend obligatorias
Prioridad: Alta
Descripcion tecnica
- CSS sin Grid (solo flex).
- Etiquetas semanticas obligatorias.
- JSX y CSS separados por componente.
- JS vanilla (sin TypeScript).
- Funciones declarativas (sin arrow).
- Nombres en espanol y descriptivos.
- Codigo comentado para contexto.

10. Cierre
Este documento define el Modulo de Clientes actualizado.
Es coherente con el modo demo con mocks y la integracion con Prestamos.
