# 3.2. Caso 5 (M05-US08 + M05-US4) – López, Álvaro

## 3.2.1. Aporte individual – M05 Gestión de Agenda

Además de la base del proyecto (estructura del repositorio, frontend inicial en HTML/CSS/JS vanilla, configuración de Vite, Jest y Cypress, y README con las instrucciones de ejecución), el aporte individual dentro del módulo M05 estuvo orientado al flujo de visualización del detalle de un turno (M05-US08, con escenario compartido M05-US4 escenario 1: detalle del turno al hacer clic / Ver detalle).

El flujo permite, desde la agenda del día, hacer clic en la tarjeta de una reserva y ver un modal con el detalle del turno: cliente, teléfono, fecha, hora, tipo de evento y estado. Las funciones asociadas son `obtenerReservaPorId` (localizar la reserva por su id) y `formatearDetalle` (preparar sus datos para la vista).

Al igual que el resto del frontend, el flujo no utiliza backend: las reservas se guardan en localStorage, lo que permite que cada test controle su propio estado inicial.

## 3.2.2. Cambios realizados en el frontend y la lógica de negocio

`obtenerReservaPorId(reservas, id)`: se robusteció la búsqueda. Tolera que `reservas` no sea un array (`null`/`undefined` devuelven `null` sin lanzar) y compara por `String(...)` en ambos lados, de modo que una reserva con id numérico se encuentra aunque el id llegue como texto (el `data-id` del DOM siempre es string); en los demás casos devuelve la reserva correspondiente o `null` si no existe, sin modificar el array original.

`formatearDetalle(reserva)`: se agregaron validaciones. Lanza `Error('Reserva inválida')` si la reserva es nula o indefinida; el teléfono se normaliza con trim y, si queda vacío o ausente, se muestra `'Sin teléfono'`; en los demás casos devuelve un objeto nuevo con cliente, teléfono, fecha, hora, tipo de evento y estado, sin modificar el objeto original.

`app.js`: cada valor del modal de detalle (`renderDetalle`) se envolvió en un `span` con atributo `data-cy` propio, sin cambiar textos ni estilos, para poder afirmar campo por campo en el test E2E. El flujo de detalle usa las funciones bajo prueba (`obtenerReservaPorId` para resolver la reserva seleccionada y `formatearDetalle` para presentarla, también en la tarjeta de la lista).

## 3.2.3. Criterios de testeabilidad

Los elementos que intervienen en el flujo tienen atributos `data-cy`, por lo que el test no depende de clases CSS ni de textos:

- `calendar-day` (con `data-date`): día del calendario para posicionarse en la fecha del turno.
- `reservation-card` (con `data-id`): tarjeta de la reserva.
- `reservation-name`: nombre del cliente en la tarjeta (punto de clic).
- `reservation-detail`: modal de detalle del turno.
- `detail-client`: cliente en el detalle.
- `detail-phone`: teléfono en el detalle.
- `detail-date`: fecha en el detalle.
- `detail-time`: hora en el detalle.
- `detail-event-type`: tipo de evento en el detalle.
- `detail-status`: estado en el detalle.
- `detail-close`: botón Cerrar del modal.
