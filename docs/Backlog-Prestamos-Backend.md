# Backlog Tecnico - Modulo de Prestamos (Backend)

Convenciones:
- BE-xx: Backend (.NET 10)

Reglas no negociables:
- Backend calcula todo.
- Frontend no interpreta.
- Garantia obligatoria (salvo discrecional Admin).
- Scoring habilita opciones, no decide.
- Toda excepcion debe quedar auditada.

PARTE 1 - BACKEND (.NET 10)

BE-01 - Bootstrap API Modulo Prestamos (estructura + convenciones)
Prioridad: Alta
Descripcion tecnica
Crear estructura inicial del modulo Prestamos:
- LoansController
- Capa Application: LoanService, LoanSimulationService, GuaranteeService
- Capa Domain: entidades Loan, Guarantee, Installment, Payment
- Value Objects: Money, Term, InterestRate
- Enums de estados
- Capa Infrastructure: repositorios JSON (fase actual) + abstraccion migrable a DB
- DTOs request/response, manejo de errores (ProblemDetails), CorrelationId, logs minimos

Criterios de aceptacion
- La solucion compila y corre.
- Controllers thin (sin logica de negocio).
- Separacion clara API / Application / Domain / Infrastructure.

BE-02 - Persistencia inicial JSON (prestamos, garantias, pagos)
Prioridad: Alta
Descripcion tecnica
- Persistir en JSON: prestamos, garantias (1..N), pagos (append-only)
- Repositorios con interfaces: ILoanRepository, IGuaranteeRepository, IPaymentRepository
- Regla: no se sobrescriben eventos historicos
- Estados con timestamps
- Preparado para migrar a DB relacional

Criterios de aceptacion
- Se pueden crear y consultar prestamos.
- Garantias y pagos se asocian correctamente.
- Application no conoce el formato JSON.

BE-03 - Maquina de estados del prestamo (contractual)
Prioridad: Alta
Descripcion tecnica
Estados explicitos:
BORRADOR, SIMULADO, PENDIENTE_GARANTIA, LISTO_PARA_CONFIRMAR,
ACTIVO, EN_MORA, INCUMPLIDO, GARANTIA_EJECUTADA, CERRADO

Reglas:
- Transiciones validas solo desde Domain.
- Estados invalidos -> excepcion de dominio.

Criterios de aceptacion
- No se puede saltar estados.
- Estados quedan auditados.
- Tests unitarios de transiciones.

BE-04 - Calculo de opciones de prestamo segun scoring (core)
Prioridad: Alta
Endpoint: GET /api/prestamos/simulaciones?idCliente=&monto=
Descripcion tecnica
- Leer scoring del cliente.
- Validar monto solicitado contra el maximo habilitado.
- Determinar monto maximo, tipos de plazo habilitados (semanal/mensual),
  rangos de duracion y tasa aplicable.
- Generar tabla de opciones: duracion, cuota, total, fechas.
- Ajustar fechas segun calendario oficial de Argentina (domingos/feriados -> siguiente dia habil).
- El frontend solo envia monto y renderiza resultados (sin calculos).

Criterios de aceptacion
- Opciones coherentes con scoring.
- Frontend solo renderiza.
- Tests por categoria de scoring.

BE-05 - Validacion de garantia (cobertura por scoring)
Prioridad: Alta
Descripcion tecnica
Reglas:
- Scoring >= 51 -> cobertura >= 200% del monto del prestamo.
- Scoring < 51 -> cobertura >= 300% del monto del prestamo.
La garantia se valida por el valor estimado cargado por el operario/perito.

Criterios de aceptacion
- Garantia insuficiente -> error de negocio.
- Garantia valida -> permite avanzar.
- Tests de borde.

BE-06 - Submodulo Garantias (registro + evidencia)
Prioridad: Alta
Descripcion tecnica
Registrar garantia con:
- Descripcion detallada, valor estimado, fotos, ubicacion, estado, observaciones.
Reglas:
- No se permite prestamo activo sin garantia valida (salvo discrecional).
- Garantias quedan auditadas.

Criterios de aceptacion
- Se pueden registrar multiples garantias.
- Evidencia asociada correctamente.
- No se pierde informacion historica.

BE-07 - Alta de prestamo estandar (flujo completo)
Prioridad: Alta
Endpoint: POST /api/prestamos
Flujo exacto
- Validar cliente existente.
- Validar scoring.
- Validar opcion elegida (simulacion).
- Validar garantia.
- Generar documentacion.
- Cambiar estado a ACTIVO.

Criterios de aceptacion
- No se permite bypass de pasos.
- El prestamo queda activo solo al final.
- Auditoria completa.

BE-08 - Alta de prestamo discrecional (ADMIN)
Prioridad: Alta
Endpoint: POST /api/prestamos/discrecional
Descripcion tecnica
Formulario libre que permite:
- Monto discrecional, tasa discrecional, plazo discrecional, garantia opcional.
Reglas:
- Solo rol ADMIN.
- Motivo obligatorio.
- Marcado permanente como DISCRECIONAL.

Criterios de aceptacion
- Visible en listados.
- No se confunde con estandar.
- Totalmente auditable.

BE-09 - Identificacion y marcado visual (flag backend)
Prioridad: Media
Descripcion tecnica
Agregar flag en Loan:
- esDiscrecional, rolAutorizador
Usado por FE para iconos, tooltips y alertas.

Criterios de aceptacion
- Flag inmutable.
- No editable post-creacion.

BE-10 - Registro de pagos (append-only)
Prioridad: Media
Endpoint: POST /api/prestamos/{id}/pagos
Descripcion tecnica
Registrar pagos:
- Fecha real, monto, detectar mora, calcular interes por mora.
Reglas:
- No se borra ni edita un pago.
- Mora 1% diario sobre total (capital + intereses), backend-only.

Criterios de aceptacion
- Pagos correctos actualizan estado.
- Mora calculada solo en backend.

BE-11 - Ejecucion de garantia (con reversibilidad auditada)
Prioridad: Media
Descripcion tecnica
Ante mas de 2 cuotas vencidas:
- Cambiar estado, registrar ejecucion, cerrar prestamo.
- Permitir reversion solo ADMIN con motivo obligatorio.
- Toda reversion queda auditada.

Criterios de aceptacion
- Ejecucion controlada.
- Reversion registrada.
- No se pierde historial.

BE-12 - Listado de prestamos activos (dashboard)
Prioridad: Media
Endpoint: GET /api/prestamos
Comportamiento
- Server-side.
- Filtros por estado y discrecionalidad (esDiscrecional).
- Indicador discrecional.
Nota:
- El backend debe aplicar los filtros y retornar solo la categoria solicitada.

Criterios de aceptacion
- Performance aceptable.
- No logica en FE.
