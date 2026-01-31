# Backlog Tecnico - Modulo de Prestamos (Frontend)

Convenciones:
- FE-xx: Frontend (React)

Reglas no negociables:
- Backend calcula todo.
- Frontend no interpreta.
- Garantia obligatoria (salvo discrecional Admin).
- Scoring habilita opciones, no decide.
- Toda excepcion debe quedar auditada.

PARTE 2 - FRONTEND (React) MODULO DE PRESTAMOS

Convenciones
El backend es la unica fuente de verdad. El frontend no calcula cuotas, intereses, mora ni montos maximos.
El frontend guia, muestra y confirma. Toda discrecionalidad debe ser visible y explicita.

FE-01 - Bootstrap del modulo Prestamos (ruteo + estructura de carpetas)
Prioridad: Alta
Descripcion tecnica
Crear estructura base prestamos/ siguiendo el patron del modulo Clientes:
- paginas/: ListaPrestamosPage, CrearPrestamoEstandarPage,
  CrearPrestamoDiscrecionalPage, DetallePrestamoPage
- componentes/: TablaPrestamos, TablaSimulacionPrestamo, FormularioGarantia,
  BadgeEstadoPrestamo, BadgeDiscrecional, DialogoConfirmacion
- servicios/: prestamosApi
- tipos/: prestamos
Configurar rutas:
/prestamos
/prestamos/nuevo/:idCliente
/prestamos/nuevo-discrecional/:idCliente
/prestamos/:id

Criterios de aceptacion
- Navegacion funcional entre rutas.
- Estructura modular clara.
- Sin logica financiera en UI.

FE-02 - API Prestamos (fetch + tipado + manejo de errores)
Prioridad: Alta
Descripcion tecnica
Implementar prestamosApi.js como unica via de acceso al backend, con metodos:
- obtenerPrestamos({ pagina, tamanioPagina, estado })
- obtenerPrestamoPorId(id)
- simularPrestamo(idCliente, monto)
- obtenerPrestamosPorCliente(idCliente)
- crearPrestamoEstandar(payload)
- crearPrestamoDiscrecional(payload)
- registrarPago(idPrestamo, payload)
- ejecutarGarantia(idPrestamo)
Normalizacion de errores:
400 validacion, 403 permisos, 404 no existe, 409 conflicto, 5xx error server
Definir tipos minimos (JSDoc):
ResumenPrestamo, DetallePrestamo, OpcionSimulacionPrestamo, Garantia, Pago, ErrorApi

Criterios de aceptacion
- Todas las paginas consumen datos solo desde prestamosApi.
- Errores normalizados en UI.
- Tipos coinciden con DTOs de backend.

FE-03 - Dashboard de prestamos activos
Prioridad: Alta
Descripcion tecnica
Implementar ListaPrestamosPage como dashboard principal.
Carga inicial: GET /api/prestamos?pagina=1&tamanioPagina=10
Selector de categoria:
- Activos, En mora, Garantia ejecutada, Discrecionales.
El frontend solicita a la API segun categoria seleccionada.
Estados obligatorios: loading, empty, error (con retry real).
TablaPrestamos: columnas minimas:
Cliente, Monto, Estado, Mora, Garantia, Tipo (Estandar / Discrecional), Acciones
Indicadores:
BadgeEstadoPrestamo, BadgeDiscrecional con tooltip obligatorio, alerta si hay mora.
Acciones: Ver detalle -> /prestamos/:id

Criterios de aceptacion
- Loading visible hasta respuesta.
- Empty consistente.
- Error con retry real.
- Filtrado por categoria resuelto por backend (en demo se permite fallback frontend).

FE-05 - Alta de prestamo estandar (wizard guiado)
Prioridad: Alta
Descripcion tecnica
Paso 1 - Monto y opciones: ingresar monto, calcular opciones y seleccionar opcion valida y horario preferido de cobro (franja de 30 min).
Tabla de opciones: columnas:
Cantidad de cuotas, Valor de la cuota, Total a devolver, Primer pago, Accion Seleccionar
La tabla permite filtrar por Semanas o Meses para mostrar solo el tipo elegido.
Paso 2 - Registro de garantia: FormularioGarantia con descripcion, valor estimado,
fotos, ubicacion, observaciones.
Paso 3 - Confirmacion final: resumen completo + condiciones de mora y ejecucion.
Confirmacion legal obligatoria (checkbox explicito).
Submit: POST /api/prestamos

Criterios de aceptacion
- No se puede avanzar sin completar cada paso.
- Confirmacion legal requerida.
- Errores backend visibles y bloqueantes.

FE-06 - Alta de prestamo discrecional (ADMIN)
Prioridad: Alta
Descripcion tecnica
Formulario independiente con:
- Monto, tasa, plazo, horario preferido de cobro (franja de 30 min), requiere garantia (si/no), motivo obligatorio.
Advertencia visible y permanente: "Este prestamo fue autorizado de forma discrecional
y no sigue las reglas estandar del sistema."
Submit: POST /api/prestamos/discrecional

Criterios de aceptacion
- Acceso restringido a ADMIN.
- Motivo obligatorio.
- Badge discrecional visible en listados y detalle.

FE-07 - Submodulo Garantias (UI)
Prioridad: Alta
Descripcion tecnica
FormularioGarantia reutilizable en alta y detalle.
Campos obligatorios:
Descripcion detallada, valor estimado, fotos, ubicacion, observaciones.
Reglas: el frontend no valida suficiencia, backend decide.

Criterios de aceptacion
- Evidencia correctamente asociada.
- Mensajes claros cuando la garantia no cumple.

FE-08 - Detalle de prestamo
Prioridad: Alta
Descripcion tecnica
Ruta: /prestamos/:id
Secciones obligatorias:
- A: Resumen (monto, plazo, tasa, estado, tipo, horario preferido de cobro - franja de 30 min).
- B: Cronograma y pagos (cuotas, pagos, mora interpretada).
- C: Garantia (datos, fotos, estado, ejecucion si aplica).
- D: Auditoria basica (eventos relevantes, solo lectura).

Criterios de aceptacion
- No mostrar variables tecnicas crudas.
- Estados claros y comprensibles.
- Navegacion consistente.

FE-15 - Integracion con modulo Clientes
Prioridad: Alta
Descripcion tecnica
- En la tabla de clientes debe existir la accion "Nuevo prestamo".
- La accion navega a /prestamos/nuevo/:idCliente.
- El detalle del cliente debe listar prestamos asociados con estado, monto, cuotas y total.
- Debe mostrarse el badge discrecional cuando corresponda.

Criterios de aceptacion
- El prestamo queda asociado al cliente al crear.
- El nuevo prestamo aparece en el detalle del cliente y en la lista de prestamos.
- La navegacion a detalle de prestamo es directa desde el cliente.

FE-09 - Registro de pagos
Prioridad: Media
Descripcion tecnica
Registrar pago desde modal o seccion dedicada.
Campos: monto, fecha real de pago, confirmacion explicita.
Submit: POST /api/prestamos/{id}/pagos

Criterios de aceptacion
- Pagos no editables.
- Mora visible tras el registro.

FE-10 - Ejecucion de garantia (ADMIN)
Prioridad: Media
Descripcion tecnica
Accion solo para ADMIN.
Confirmacion fuerte con advertencia legal.
Submit: POST /api/prestamos/{id}/ejecutar-garantia
Reversion: solo ADMIN, motivo obligatorio.

Criterios de aceptacion
- UX explicita y no ambigua.
- Reversion auditada.

FE-11 - Manejo centralizado de estados async
Prioridad: Media
Descripcion tecnica
Implementar hook usarEstadoAsync(): { cargando, error, datos }
Aplicar a: listado, simulacion, alta, detalle, pagos.

Criterios de aceptacion
- Look & feel consistente.
- Menor duplicacion de logica.

FE-12 - Accesibilidad y UX minima
Prioridad: Baja
Descripcion tecnica
Modales con focus trap. Labels accesibles. Errores visibles y comprensibles.

Criterios de aceptacion
- Navegacion por teclado.
- Mensajes claros para operarios no tecnicos.

FE-13 - Pruebas UI minimas
Prioridad: Baja
Descripcion tecnica
Smoke tests con Vitest + Testing Library:
Render del dashboard, simulacion, alta estandar, alta discrecional, registro de pagos.

Criterios de aceptacion
- Tests pasan local sin flakes.

FE-14 - Telemetria basica (opcional)
Prioridad: Baja
Descripcion tecnica
Eventos: prestamo_simulado, prestamo_creado_estandar, prestamo_creado_discrecional,
pago_registrado, garantia_ejecutada

Criterios de aceptacion
- La falla de analytics no afecta la UX.
