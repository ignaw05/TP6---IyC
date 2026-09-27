// Tests unitarios de src/logica-negocio.js (node:test, sin dependencias).
// Cada integrante agrega los tests de sus funciones.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reservasDePrueba } from '../src/logica-negocio.js'

test('los datos de prueba tienen las 7 reservas', () => {
  assert.equal(reservasDePrueba.length, 7)
})
