// Tests unitarios de src/logica-negocio.js (node:test, sin dependencias).
// Cada integrante agrega los tests de sus funciones.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cancelarReserva, liberarSlot, reservasDePrueba } from '../src/logica-negocio.js'

test('los datos de prueba tienen las 7 reservas', () => {
  assert.equal(reservasDePrueba.length, 7)
})

const confirmada = reservasDePrueba.find((r) => r.id === 2) // Luis Pérez 09:00 Confirmada

test('cancelarReserva devuelve una nueva reserva Cancelada sin mutar la original', () => {
  const original = structuredClone(confirmada)
  const cancelada = cancelarReserva(confirmada, 'Viaje')
  assert.equal(cancelada.estado, 'Cancelada')
  assert.equal(cancelada.motivoCancelacion, 'Viaje')
  assert.notEqual(cancelada, confirmada)
  assert.deepEqual(confirmada, original)
})

test('cancelarReserva sin motivo guarda null', () => {
  assert.equal(cancelarReserva(confirmada).motivoCancelacion, null)
})

test('cancelarReserva rechaza reservas inválidas o en estado final', () => {
  assert.throws(() => cancelarReserva(null), /Reserva inválida/)
  assert.throws(() => cancelarReserva(undefined), /Reserva inválida/)
  assert.throws(() => cancelarReserva({ ...confirmada, estado: 'Cancelada' }), /La reserva ya está cancelada/)
  assert.throws(() => cancelarReserva({ ...confirmada, estado: 'Completado' }), /No se puede cancelar una reserva completada/)
})

test('liberarSlot pone en Disponible solo el slot de la reserva, sin mutar', () => {
  const slots = [{ hora: '09:00', estado: 'Reservado' }, { hora: '10:00', estado: 'Reservado' }]
  const copia = structuredClone(slots)
  const resultado = liberarSlot(slots, confirmada)
  assert.deepEqual(resultado, [{ hora: '09:00', estado: 'Disponible' }, { hora: '10:00', estado: 'Reservado' }])
  assert.deepEqual(slots, copia)
})

test('liberarSlot con una hora inexistente devuelve una copia sin cambios', () => {
  const slots = [{ hora: '09:00', estado: 'Reservado' }]
  const resultado = liberarSlot(slots, { ...confirmada, hora: '11:30' })
  assert.deepEqual(resultado, slots)
  assert.notEqual(resultado, slots)
})
