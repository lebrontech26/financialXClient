# Documento de Especificacion de Requisitos de Software (SRS)
# Sistema de Gestion Financiera - Modulo de Prestamos
# Estilo IEEE 830 adaptado a Agile / Scrum

1. Introduccion

1.1 Proposito del Documento
Este documento define los requisitos funcionales, reglas de negocio, restricciones tecnicas,
criterios legales y lineamientos de usabilidad del Modulo de Prestamos.

El proposito es asegurar que:
- El Backend (.NET 10) implemente las reglas financieras, legales y de control de riesgo
  de forma deterministica, auditable y trazable.
- El Frontend (React) se limite a la presentacion, guiado del operario y experiencia de usuario,
  sin logica financiera ni decisiones implicitas.
- QA pueda validar comportamientos sin interpretacion subjetiva.
- El sistema soporte auditoria interna y externa, cumplimiento normativo y defensa del consumidor.
- Las excepciones discrecionales queden explicitas y separadas del flujo estandar.

Este documento tiene caracter contractual y normativo.

1.2 Alcance del Modulo
El Modulo de Prestamos permite:
- Creacion y gestion de prestamos.
- Calculo automatico de cuotas, fechas, totales e intereses.
- Gestion obligatoria de garantias (submodulo Garantias).
- Control de vencimientos, pagos y mora.
- Ejecucion de garantia ante incumplimiento.
- Identificacion clara de prestamos discrecionales autorizados por Admin.

2. Arquitectura y Separacion de Responsabilidades

2.1 Frontend - React
El frontend NO contiene logica financiera ni reglas de negocio.
Responsabilidades exclusivas:
- Renderizado de formularios y tablas.
- Seleccion de opciones habilitadas por backend.
- Visualizacion clara de cuotas, fechas y totales.
- Estados visuales (loading, error, confirmacion).
- Indicadores visuales de riesgo y autorizacion.

Prohibiciones explicitas:
- No calcular cuotas, intereses ni totales.
- No validar garantias.
- No decidir montos maximos.
- No modificar valores devueltos por la API.
- No ocultar prestamos discrecionales.

2.2 Backend - API .NET 10
El backend es la unica fuente de verdad.
Responsabilidades:
- Calculo financiero completo.
- Aplicacion de reglas segun scoring.
- Validacion de garantias.
- Control de estados del prestamo.
- Calculo automatico de mora diaria.
- Ejecucion automatica de garantias.
- Auditoria y trazabilidad total.

2.3 Modo demo (mocks)
- En la demo se usan datos mockeados en el frontend.
- El contrato de API y los DTOs deben ser identicos a los del backend real.
- Al conectar backend, se desactiva el flag de mocks sin reescribir la UI.

2.4 Convenciones de desarrollo frontend (obligatorias)
- CSS sin Grid: se permite solo display: flex para maquetado.
- Solo etiquetas semanticas (header, main, section, nav, article, aside, footer, form, button, label, input, etc.).
- JSX y CSS separados: componente.jsx para logica/markup y componente.css para estilos.
- No estilos inline salvo excepcion documentada.
- Respetar estructura de carpetas por atomic design: atomos, moleculas, paginas.
- Funciones declarativas en JS: se prohibe el uso de arrow functions.
- Nombres de funciones, variables y componentes en espanol y descriptivos.
- Codigo comentado para dar contexto y razon de la implementacion.

3. Principios Rectores de Diseno

PR-01 - El sistema interpreta, el humano decide
El sistema:
- Calcula.
- Limita.
- Explica.
- Advierte.
El operario:
- Selecciona entre opciones validas.
- Confirma con el cliente.

PR-02 - La discrecionalidad nunca es silenciosa
Toda excepcion a las reglas:
- Debe ser explicita.
- Debe ser visible.
- Debe ser permanente.
- Debe ser auditable.

4. Reglas de Negocio Fundamentales (NO NEGOCIABLES)

RB-01 - Regimenes de prestamo
El sistema distingue explicitamente:
- Prestamo Estandar: regido por scoring y configuraciones. Autorizado por operario.
- Prestamo Discrecional: fuera de reglas estandar. Autorizado exclusivamente por ADMIN / DUENO.
Los regimenes no pueden mezclarse ni camuflarse.

RB-02 - Prestamo estandar guiado por scoring
El scoring del cliente determina:
- Monto maximo habilitado.
- Tipos de plazo habilitados (semanal o mensual).
- Rangos de duracion.
- Tasa aplicable.
El scoring no aprueba ni rechaza, solo habilita opciones.
Montos maximos por scoring:
- Score 80 a 100 -> maximo 2.000.000.
- Score 60 a 79 -> maximo 1.000.000.
- Score 50 a 59 -> maximo 500.000.
- Score menor a 50 -> maximo 200.000.
Tasa base (configurada por Admin):
- Semanal: 10% (demo).
- Mensual: 30% (demo).
El backend define la tasa final cuando exista configuracion real.

RB-03 - Seleccion de monto y plazo
El operario:
- Ingresa un monto numerico positivo.
- No puede superar el maximo permitido por scoring.
- Selecciona tipo de plazo (semanal o mensual) desde las opciones.
El sistema devuelve una tabla de opciones validas con:
- Duracion.
- Cuota.
- Total a pagar.
- Fechas estimadas.
Rangos de duracion permitidos:
- Semanas: 1 a 8.
- Meses: 1 a 6.

RB-04 - Garantia obligatoria (regimen estandar)
Todo prestamo estandar requiere garantia.
La exigencia depende del scoring:
- Scoring >= 51 -> cobertura >= 200% del monto del prestamo.
- Scoring < 51 -> cobertura >= 300% del monto del prestamo.
Si la garantia no cumple:
- El prestamo no puede continuar.

RB-05 - Valor de garantia
La garantia se evalua por su valor estimado de venta rapida.
Este valor lo carga el operario o perito provisto por la empresa.

RB-06 - Prestamo discrecional
Solo ADMIN puede:
- Omitir garantia.
- Definir monto libre.
- Definir tasa libre.
- Definir plazo libre.
Debe quedar registrado:
- Rol.
- Usuario.
- Fecha.
- Motivo.

RB-07 - Identificacion visual obligatoria
Todo prestamo discrecional o estandar debe mostrarse con indicador visual permanente.
El prestamo discrecional debe incluir tooltip explicativo obligatorio.

RB-08 - Mora
Mora automatica del 1% diario.
Se calcula sobre el total del prestamo (capital + intereses).
Calculada exclusivamente por backend. No editable desde frontend.

RB-09 - Incumplimiento prolongado
Si existen mas de 2 cuotas vencidas (sean semanales o mensuales):
- El sistema ejecuta automaticamente la garantia.
- El evento es reversible solo por ADMIN y queda auditado.

RB-10 - Ajuste de vencimientos por feriados
Si una fecha de vencimiento cae en domingo o feriado oficial de Argentina:
- Se mueve automaticamente al siguiente dia habil.
- No se aplica recargo por mora en ese ajuste.
El backend es responsable del ajuste; el frontend solo renderiza la fecha resultante.

5. Modelo de Datos

5.1 Entidad Prestamo
  {
    "id": "uuid",
    "idCliente": "uuid",
    "tipo": "ESTANDAR | DISCRECIONAL",
    "monto": 200000,
  "tasaInteres": 0.12,
  "plazo": {
    "unidad": "SEMANAS | MESES",
    "valor": 6
  },
    "totalAPagar": 240000,
    "cuotas": 6,
    "estado": "ACTIVO",
    "horarioCobroPreferido": "string (HH:mm-HH:mm, franja de 30 min)",
    "esDiscrecional": false,
    "autorizadoPor": {
      "rol": "OPERARIO | ADMIN",
      "idUsuario": "uuid",
      "autorizadoEn": "ISO8601"
  },
  "creadoEn": "ISO8601"
}

5.2 Entidad Garantia
{
  "id": "uuid",
  "idPrestamo": "uuid",
  "valorRecuperable": 400000,
  "descripcion": "Celular Samsung",
  "fotos": [],
  "ubicacion": "Deposito",
  "estado": "ACEPTADA",
  "creadoEn": "ISO8601"
}

5.3 Entidad Pago
{
  "id": "uuid",
  "idPrestamo": "uuid",
  "monto": 40000,
  "pagadoEn": "ISO8601",
  "estaEnMora": false,
  "interesMoraAplicado": 0
}

6. Requisitos Funcionales

RF-01 - Calculo de opciones de prestamo
El sistema debe recibir idCliente y monto, validar el maximo por scoring
y devolver las opciones validas segun configuracion (semanas 1-8, meses 1-6).

RF-02 - Creacion de prestamo estandar
Seleccion guiada. Validacion de garantia. Confirmacion explicita del cliente.
El prestamo siempre queda asociado a un cliente existente.
Se registra el horario preferido de cobro informado para el prestamo (franja de 30 min).

RF-03 - Creacion de prestamo discrecional
Formulario libre. Disponible solo para rol ADMIN. Registro obligatorio de responsabilidad.
Se registra el horario preferido de cobro informado para el prestamo (franja de 30 min).

RF-04 - Activacion del prestamo
Generacion de documentacion. Entrega de capital. Cambio de estado a ACTIVO.

RF-05 - Control de vencimientos
Seguimiento automatico. Registro de pagos. Calculo de mora.
Los vencimientos se ajustan a dia habil si caen en domingo o feriado oficial de Argentina.

RF-06 - Ejecucion de garantia
Ante incumplimiento prolongado. Registro reversible con auditoria. Cierre del prestamo.

RF-07 - Integracion con modulo Clientes
Desde el listado de clientes debe existir accion "Nuevo prestamo".
El detalle del cliente debe mostrar los prestamos asociados (estado, monto, cuotas, total).

7. Usabilidad y Accesibilidad
- Informacion clara y explicada.
- No depender solo del color.
- Confirmaciones explicitas.
- Lenguaje comprensible para operarios no tecnicos.

8. Auditoria y Trazabilidad
- Todo evento se registra.
- No se sobrescribe informacion.
- Acceso restringido por rol.

9. Cierre
Este documento define el Modulo de Prestamos actualizado.
El backlog tecnico asociado se documenta en Backlog-Prestamos-Backend.md y Backlog-Prestamos-Frontend.md.
Es coherente con el modulo de Clientes y el enfoque demo con mocks.
