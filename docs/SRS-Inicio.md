# Documento de Especificacion de Requisitos de Software (SRS)
# Sistema de Gestion Financiera - Inicio / Dashboard Principal
# Estilo IEEE 830 adaptado a Agile / Scrum

1. Introduccion

1.1 Proposito del Documento
Este documento define los requisitos funcionales, informativos y de usabilidad del Inicio / Dashboard Principal
del Sistema de Gestion Financiera.

El objetivo del Inicio es:
- Dar una vision ejecutiva inmediata del estado del sistema.
- Permitir al operario/admin entender que esta pasando sin navegar modulos.
- Priorizar acciones operativas criticas.
- No permitir operaciones complejas desde Inicio (solo accesos y alertas).

Este documento tiene caracter normativo.

1.2 Alcance
El Inicio incluye:
- Resumen de Clientes, Prestamos, Inversiones, Pagos y movimiento del efectivo en el dia.
- Alertas operativas y de riesgo.
- Accesos rapidos a acciones frecuentes.
- Informacion interpretada (no tecnica).

Fuera de alcance:
- Alta/edicion completa de entidades.
- Calculos financieros detallados.
- Configuraciones avanzadas.

2. Perfiles de Usuario y Permisos

2.1 Roles
- Operario: conjunto base de funciones definidas para operacion diaria.
- Admin: todas las funciones del Operario + funciones adicionales definidas por negocio.

2.2 Reglas de acceso
- El Inicio es el mismo para ambos roles en contenido y layout.
- El menu y los accesos rapidos muestran solo opciones permitidas por rol.
- Si una opcion no esta implementada aun, debe verse deshabilitada.
- El backend valida permisos. El frontend solo oculta o deshabilita.
- Respuesta no autorizada: 403 Forbidden con mensaje claro para UI.
- En fase demo, el rol queda fijo en Operario hasta integrar el login.

2.3 Funciones base (Operario)
- Se definen como el conjunto minimo de funciones operativas autorizadas.
- El listado exacto se determina por alcance funcional de cada modulo.

2.4 Funciones adicionales (Admin)
- Funciones extra sobre el conjunto del Operario.
- Su definicion final queda pendiente y debe documentarse cuando exista alcance.

3. Principios Rectores

PR-01 - El Inicio informa, no opera
El Inicio:
- Resume.
- Advierte.
- Prioriza.
- No reemplaza a los modulos especificos.

PR-02 - Prioridad visual al riesgo
La informacion critica (mora, incumplimientos, garantias) debe destacarse por encima de metricas neutras.

PR-03 - Informacion interpretada
Esta prohibido mostrar:
- Variables crudas.
- Codigos internos.
- Formulas.

4. Arquitectura FE / BE

4.1 Frontend - React
Responsabilidades:
- Renderizar cards, tablas resumidas y alertas.
- Navegacion hacia modulos.
- Estados visuales (loading / error / empty).
- UX: feedback visual y accesibilidad.

Prohibiciones:
- No calcular metricas.
- No consolidar datos.
- No inferir estados.

Modo demo:
- Se usa el mismo contrato de API con mocks en archivos de datos.
- No se usa localStorage para persistir el dashboard.
- La activacion se controla con flag de entorno (ej: VITE_USAR_MOCKS).
- Al conectar backend, se desactiva el flag de mocks sin reescribir la UI.

4.1.1 Convenciones de desarrollo frontend (obligatorias)
- CSS sin Grid: se permite solo display: flex para maquetado.
- Solo etiquetas semanticas (header, main, section, nav, article, aside, footer, form, button, label, input, etc.).
- JSX y CSS separados: componente.jsx para logica/markup y componente.css para estilos.
- No estilos inline salvo excepcion documentada.
- Respetar estructura de carpetas por atomic design: atomos, moleculas, paginas.
- Funciones declarativas en JS: se prohibe el uso de arrow functions.
- Nombres de funciones, variables y componentes en espanol y descriptivos.
- Codigo comentado para dar contexto y razon de la implementacion.

4.2 Backend - API .NET 10
Responsabilidades:
- Proveer un endpoint agregado y optimizado para Inicio.
- Calcular y consolidar metricas.
- Interpretar estados de riesgo.

5. Endpoint Backend (contrato)

GET /api/dashboard/inicio

Respuesta minima esperada:
{
  "actualizadoEn": "ISO8601",
  "clientes": {
    "total": 120,
    "activos": 110,
    "inactivos": 10
  },
  "prestamos": {
    "activos": 45,
    "enMora": 6,
    "riesgoAlto": 3
  },
  "inversiones": {
    "capitalTotal": 5000000,
    "capitalInvertido": 4200000,
    "capitalDisponible": 800000
  },
  "pagos": {
    "hoy": 8,
    "vencidos": 4
  },
  "alertas": [
    {
      "tipo": "MORA",
      "titulo": "Prestamos en mora",
      "descripcion": "6 prestamos presentan mora activa",
      "severidad": "ALTA",
      "enlace": "/prestamos?estado=mora"
    }
  ],
  "resumenes": {
    "proximosVencimientos": {
      "elementos": [
        {
          "id": "uuid",
          "fecha": "ISO8601",
          "cliente": "string",
          "monto": 120000,
          "enlace": "/prestamos/uuid"
        }
      ],
      "total": 12,
      "enlace": "/prestamos?filtro=proximos"
    },
    "ultimosPagos": {
      "elementos": [
        {
          "id": "uuid",
          "fecha": "ISO8601",
          "cliente": "string",
          "monto": 50000,
          "enlace": "/pagos/uuid"
        }
      ],
      "total": 6,
      "enlace": "/pagos?filtro=hoy"
    },
    "prestamosRecientes": {
      "elementos": [
        {
          "id": "uuid",
          "fecha": "ISO8601",
          "cliente": "string",
          "monto": 300000,
          "enlace": "/prestamos?filtro=recientes"
        }
      ],
      "total": 10,
      "enlace": "/prestamos?filtro=recientes"
    }
  }
}

Notas:
- Las listas de resumen deben venir limitadas a 5 filas.
- El orden de alertas es por severidad: ALTA, MEDIA, BAJA (descendente).
- El frontend no reordena ni filtra datos.

6. Estructura Visual del Inicio

6.1 Layout General
- Header (titulo + usuario + fecha).
- Seccion A: Metricas clave (cards).
- Seccion B: Alertas prioritarias.
- Seccion C: Accesos rapidos.
- Seccion D: Resumenes operativos.

6.2 Seccion A - Metricas Clave (Cards)
Cards obligatorias:
- Clientes activos.
- Prestamos activos.
- Prestamos en mora.
- Capital invertido.
- Capital disponible.

Reglas:
- Valores provistos por backend.
- Iconografia clara.
- No mas de 6 cards.
- Formato de moneda definido por backend o config global (ARS).

6.3 Seccion B - Alertas
Listado de alertas ordenadas por severidad:
- Mora activa.
- Incumplimientos prolongados.
- Garantias ejecutables.

Cada alerta debe mostrar:
- Titulo.
- Descripcion interpretada.
- Nivel (ALTA / MEDIA / BAJA).
- Enlace directo al modulo correspondiente.

6.4 Seccion C - Accesos Rapidos
Acciones base:
- Nuevo Cliente.
- Ver Clientes.
- Registrar Pago.
- Ver Inversiones.

Reglas:
- Navegacion directa.
- No ejecutar logica desde Inicio.
- Opciones no implementadas: se muestran deshabilitadas.
- Accesos adicionales visibles solo para Admin.

6.5 Seccion D - Resumenes Operativos
Tablas resumidas (max. 10 filas cada una):
- Proximos vencimientos.
- Ultimos pagos registrados.
- Prestamos recientemente creados.

Cada fila debe permitir:
- Ver detalle (enlace provisto por backend).

Columnas minimas:
- Proximos vencimientos: fecha, cliente, monto.
- Ultimos pagos: fecha, cliente, monto.
- Prestamos recientes: fecha, cliente, monto.

Reglas de datos:
- Proximos vencimientos: solo los vencimientos dentro de los proximos 2 dias (hoy + 2), maximo 10 filas.
- Ultimos pagos: solo pagos del dia actual, maximo 10 filas.
- Prestamos recientes: ultimos 10 registros en orden descendente; al ingresar uno nuevo, se antepone y el ultimo sale.
- El boton "Ver completo" debe mostrarse siempre como acceso rapido; si no hay enlace disponible, queda deshabilitado.
Notas:
- Las fechas de vencimiento deben venir ya ajustadas a dia habil cuando caen domingo o feriado oficial de Argentina.

7. Requisitos Funcionales

RF-INI-01 - Carga del Dashboard
Al ingresar al sistema se debe cargar automaticamente el Inicio.

RF-INI-02 - Actualizacion
Los datos deben refrescarse al recargar la vista.
(No polling automatico en fase inicial.)

RF-INI-03 - Navegacion
Todos los enlaces deben dirigir a vistas existentes.

RF-INI-04 - Roles y permisos
La UI debe reflejar el rol del usuario (Operario/Admin) y mostrar solo opciones permitidas.

8. Usabilidad y Accesibilidad
- No depender solo del color para alertas.
- Textos claros para operarios no tecnicos.
- Estados loading y error visibles.

9. Auditoria
El Inicio no genera eventos financieros.
Solo lectura.

10. Futuras correcciones
- Normalizar formato de fechas del backend (ISO con hora) para evitar desfases al interpretar fechas en el frontend.

11. Cierre
Este documento define el Inicio / Dashboard Principal del sistema.
Sirve como punto de entrada unico, informativo y operativo.
Es coherente con Clientes, Prestamos e Inversiones.
