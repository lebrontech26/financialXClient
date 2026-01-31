# Cambios y decisiones - 24/1/2026 00:15 horas

## Contexto
- Se reviso la documentacion en `ClientApp/docs` y el backend en `src` para alinear el contrato real.
- Se validaron endpoints reales de Clientes y respuestas actuales (200/400/404).

## Decisiones
- Integrar solo el modulo de Clientes con la API real (`/api/Client`).
- Mantener mocks para los demas modulos (Inicio y Prestamos).
- Clientes queda fuera del switch global de mocks; el flag sigue aplicando a otros modulos.
- Evitar cambios de contrato en backend; documentar y adaptar frontend a lo existente.
- Resolver el 404 en Vite con proxy `/api` hacia el backend.

## Cambios en documentacion
- `ClientApp/docs/SRS-Clientes.md`
  - Rutas singulares `/api/Client`.
  - Parametros reales: `page`, `pageSize`, `estaActivo`, `searchTerm`.
  - Alta devuelve 200 OK (no 201).
  - Duplicado CUIL devuelve 400 Bad Request con mensaje descriptivo (no 409).
  - Validaciones de campos usan 400 con ProblemDetails.

## Cambios en frontend (Clientes)
- `ClientApp/src/servicios/clientsApi.js`
  - Usa `/api/Client` y mapea payloads al contrato real (Nombre/Apellido/Cuil/etc).
  - Convierte respuestas del backend al formato esperado por la UI.
  - Incluye `estaActivo` y `searchTerm` en el query.
  - Ignora el switch global de mocks para Clientes.
- `ClientApp/src/servicios/httpUtils.js`
  - Normaliza errores ProblemDetails (`errors`) y mensajes en texto plano.
- `ClientApp/src/JSX/paginasJSX/clientes/PaginaCrearCliente.jsx`
  - Mensaje 400 con texto descriptivo cuando aplica.
- `ClientApp/src/JSX/paginasJSX/clientes/PaginaEditarCliente.jsx`
  - Mensaje 400 con texto descriptivo cuando aplica.
- `ClientApp/src/JSX/paginasJSX/clientes/PaginaDetalleCliente.jsx`
  - Estado muestra "Sin datos" cuando el backend no expone `status`.

## Cambios en frontend (Prestamos)
- `ClientApp/src/JSX/paginasJSX/prestamos/PaginaCrearPrestamoEstandar.jsx`
  - Cuando `VITE_USAR_MOCKS` esta activo, usa cliente mock.
- `ClientApp/src/JSX/paginasJSX/prestamos/PaginaDetallePrestamo.jsx`
  - Cuando `VITE_USAR_MOCKS` esta activo, usa cliente mock.

## Cambios en tests
- `ClientApp/src/__tests__/clientes.test.jsx`
  - Se mockea `clientsApi` con `clientesMock` para mantener tests desacoplados del backend real.

## Cambios en backend
- `src/Backend.WebAPI.Hades/Program.cs`
  - Se agrego CORS para `http://localhost:5173` con policy `FrontendDev`.
  - Se activo `UseCors` antes de `UseAuthorization`.

## Infra/Dev
- `ClientApp/vite.config.js`
  - Proxy `/api` hacia `http://localhost:5020` para evitar 404 en Vite.

## Notas de verificacion
- Se confirmo que los endpoints reales de Clientes responden con:
  - 200 OK en alta, listado y detalle.
  - 400 Bad Request en duplicados y validaciones (ProblemDetails).
  - 404 Not Found en id inexistente.

# Cambios y decisiones - 31/1/2026

## Frontend - Elementos ocultos en la UI
- Boton "Nuevo estandar" en el listado de Prestamos.
- Boton "Nuevo discrecional" en el listado de Prestamos.
- Boton "Inversiones" en el sidebar y en el topbar.
- Boton "Reportes" en el sidebar y en el topbar.
