# Testeo — Rama `test/lopez` (M05-US08: visualización de detalle de turno)

## 1. Resumen
- **Rama:** `test/lopez`
- **Rama base / destino del merge:** `main` (`origin/main`)
- **Módulo:** M05 Gestión de Agenda — AgendaYA
- **Historia cubierta:** M05-US08 (detalle de turno), con escenario compartido M05-US4 Esc. 1
- **Funciones bajo prueba:** `obtenerReservaPorId` y `formatearDetalle` en `src/logica-negocio.js:66-79`
- **Estado verificado:** `npm test -- tests/lopez.test.js` → **9/9 passed** (Jest, 28/09/2026)

La rama respeta el acuerdo de trabajo (`como trabajar.md`): cada integrante toca solo sus archivos
(`src/logica-negocio.js` en su parte, `tests/lopez.test.js`, `cypress/e2e/06-ver-detalle-reserva.cy.js`)
más un ajuste mínimo de testabilidad en `frontend/app.js`.

## 2. Commits de la rama (sobre `main`)

Base: `08632e0 Merge pull request #4 from ignaw05/test/deluca`

| Commit | Mensaje | Contenido |
|---|---|---|
| `455ac1c` | `feat(M05-US08): obtenerReservaPorId, formatearDetalle y flujo de detalle` | Robustez de las 2 funciones en `src/logica-negocio.js` |
| `3654588` | `test(M05-US08): tests unitarios generados por IA sin modificar` | `tests/lopez.test.js` nuevo, 9 casos |
| `fee7431` | `test(M05-US08): e2e visualización de detalle de turno` | `cypress/e2e/06-ver-detalle-reserva.cy.js` nuevo + `data-cy` en `frontend/app.js` |
| `5b16842` | `test(M05-US08): screenshots del flujo de detalle` | `cy.screenshot('01-tarjeta-visible')` y `('02-detalle-abierto')` en el e2e |

Ver con: `git log --oneline main..test/lopez` y `git diff --name-status main...test/lopez`.

## 3. Cambio productivo: `src/logica-negocio.js`

### `obtenerReservaPorId(reservas, id)` (`src/logica-negocio.js:66-67`)
Antes: `reservas.find((r) => r.id === id) ?? null`.
Después:
- Tolera `reservas` no-array (`null`/`undefined` → `[]`, retorna `null` sin lanzar).
- Comparación por `String(...)` a ambos lados, así encuentra ids numéricos aunque lleguen como texto desde el DOM (`dataset.id` siempre es string).
- Búsqueda no mutante (solo `find`).

### `formatearDetalle(r)` (`src/logica-negocio.js:69-79`)
- Lanza `Error('Reserva inválida')` si `r` es `null`/`undefined` (antes fallaba con `TypeError` críptico o devolvía basura).
- Teléfono: `String(r.telefono ?? '').trim() || 'Sin teléfono'` — cubre `''`, `'   '` y ausente. Antes solo cubría falsy directo (`r.telefono || ...`), sin trim.
- Retorna objeto nuevo con `{ cliente, telefono, fecha, hora, tipoEvento, estado }`; no muta el original.

## 4. Tests unitarios: `tests/lopez.test.js` (generados por IA, sin modificar)

9 casos, patrón Arrange/Act/Assert con factory `reserva()` (`tests/lopez.test.js:3-13`):

**`obtenerReservaPorId` (5 casos):**
1. Retorna la reserva del id indicado (`tests/lopez.test.js:16-20`).
2. Encuentra la reserva aunque el id llegue como texto `'2'` (`tests/lopez.test.js:22-26`).
3. Retorna `null` si el id no existe (`tests/lopez.test.js:28-30`).
4. Retorna `null` sin lanzar si `reservas` es `null`/`undefined` (`tests/lopez.test.js:32-35`).
5. No muta el array original (compara con `structuredClone`) (`tests/lopez.test.js:37-44`).

**`formatearDetalle` (4 casos):**
6. Devuelve los datos formateados del turno (`tests/lopez.test.js:48-57`).
7. Teléfono `''` o `'   '` → `'Sin teléfono'`; teléfono normal se conserva (`tests/lopez.test.js:59-63`).
8. `null`/`undefined` → `throw 'Reserva inválida'` (`tests/lopez.test.js:65-68`).
9. No muta el objeto original (`tests/lopez.test.js:70-77`).

Ejecución:
```bash
npm test -- tests/lopez.test.js
# PASS tests/lopez.test.js — 9 passed
```

## 5. Test E2E: `cypress/e2e/06-ver-detalle-reserva.cy.js`

Flujo probado: tarjeta visible → clic en día `2026-10-15` + clic en nombre → modal de detalle con los 6 campos.

- **Determinismo:** `cy.clock(new Date('2026-10-15T10:00:00'))` (`:21`) y semilla en `localStorage` (`agendaya-reservas`) vía `onBeforeLoad` (`:22-26`), con reserva `Carla Díaz / 2615553333 / 2026-10-15 14:00 / Consulta general / Pendiente` (`:5-14`).
- **Arrange:** tarjeta visible y nombre correcto (`:31-32`) + screenshot `01-tarjeta-visible` (`:33`).
- **Act:** clic en `[data-cy="calendar-day"][data-date="2026-10-15"]` y en `[data-cy="reservation-name"]` (`:36-37`).
- **Assert:** modal `[data-cy="reservation-detail"]` visible y cada campo (`detail-client/phone/date/time/event-type/status`) con el valor esperado (`:40-46`) + screenshot `02-detalle-abierto` (`:47`).

Ejecución (requiere el front levantado):
```bash
npm run dev        # vite frontend en http://localhost:5173 (ver cypress.config.js:5)
npx cypress run --e2e --spec cypress/e2e/06-ver-detalle-reserva.cy.js
```

## 6. Ajuste de testabilidad en UI: `frontend/app.js:95-100`

El modal `renderDetalle()` interpolaba texto plano, imposible de asertar campo por campo. Se envolvió cada valor en `<span data-cy="detail-*">` sin cambiar textos ni estilos:

- `detail-client`, `detail-phone`, `detail-date`, `detail-time`, `detail-event-type`, `detail-status`.

El flujo usa las funciones bajo prueba (`obtenerReservaPorId` en `:89`, `formatearDetalle` en `:91`, y `formatearDetalle(r).telefono` en la tarjeta `:66`). Documentado como posible bug/olor encontrado al testear: la UI presuponía ids del mismo tipo que el modelo; el clic resuelve con `String(r.id) === card.dataset.id` (`frontend/app.js:140`).

## 7. Archivos afectados

```
A  cypress/e2e/06-ver-detalle-reserva.cy.js
A  tests/lopez.test.js
M  frontend/app.js            (solo spans data-cy en renderDetalle)
M  src/logica-negocio.js      (solo obtenerReservaPorId + formatearDetalle)
```

No se tocan tests ni specs de otros integrantes.

## 8. Solicitud de merge a `main` (sin merge forzado)

- **NO hacer:** `git merge --force`, `push --force`, ni merge local a `main`. La integración debe quedar como Pull Request revisable.
- **Rama ya pusheada como:** `test/lopez` (push normal, sin `--force`).
- **PR a crear en GitHub:** base `main` ← compare `test/lopez`.
  - Enlace directo: `https://github.com/ignaw05/TP6---IyC/compare/main...test/lopez?expand=1`
  - Título sugerido: `test(M05-US08): detalle de turno — tests unitarios + e2e (lopez)`
  - Cuerpo sugerido: resumen de este archivo (secciones 2–6) + checklist:
    - [ ] `npm test -- tests/lopez.test.js` en verde (9/9 verificado localmente)
    - [ ] E2E `06-ver-detalle-reserva.cy.js` en verde contra `npm run dev`
    - [ ] Sin conflictos con `main`; merge con **Create a merge commit** o **Squash** según criterio del equipo, nunca force-push
    - [ ] No incluye cambios de otros integrantes ni `package-lock.json`
- Si GitHub marca la rama como desactualizada, actualizar con `git pull --rebase origin main` (o botón `Update branch`) y re-correr los tests; jamás reescribir historia publicada con `--force`.
