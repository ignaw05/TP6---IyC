// M05-US6 - Tests unitarios de accionesDisponibles y transicionEstadoValida (Jest, ESM)
import { accionesDisponibles, transicionEstadoValida } from '../src/logica-negocio.js'

// Fecha/hora fija: no depende del reloj real. 'YYYY-MM-DDTHH:mm:ss' sin Z se interpreta en hora local,
// igual que esReservaPasada, que construye la fecha con new Date(a, m - 1, d, h, min).
const AHORA = new Date('2026-10-15T10:00:00')

const reservaBase = () => ({
  id: 1,
  fecha: '2026-10-15',
  hora: '14:00',
  cliente: 'Carla Díaz',
  telefono: '2615553333',
  tipoEvento: 'Consulta general',
  estado: 'Pendiente',
  motivoCancelacion: null,
})

describe('accionesDisponibles', () => {
  test('reserva pendiente futura ofrece ver-detalle y cancelar', () => {
    expect(accionesDisponibles(reservaBase(), AHORA)).toEqual(['ver-detalle', 'cancelar'])
  })

  test('reserva confirmada pero pasada solo ofrece ver-detalle', () => {
    const pasada = { ...reservaBase(), fecha: '2026-09-09', estado: 'Confirmada' }
    expect(accionesDisponibles(pasada, AHORA)).toEqual(['ver-detalle'])
  })

  test('reserva cancelada solo ofrece ver-detalle aunque sea futura', () => {
    expect(accionesDisponibles({ ...reservaBase(), estado: 'Cancelada' }, AHORA)).toEqual(['ver-detalle'])
  })

  test('lanza Error Reserva inválida si la reserva es null o undefined', () => {
    expect(() => accionesDisponibles(null, AHORA)).toThrow('Reserva inválida')
    expect(() => accionesDisponibles(undefined, AHORA)).toThrow('Reserva inválida')
  })

  test('devuelve un array nuevo en cada llamada y no muta la reserva', () => {
    const original = reservaBase()
    const copia = structuredClone(original)
    const primera = accionesDisponibles(original, AHORA)
    expect(accionesDisponibles(original, AHORA)).toEqual(primera)
    expect(accionesDisponibles(original, AHORA)).not.toBe(primera)
    expect(original).toEqual(copia)
  })
})

describe('transicionEstadoValida', () => {
  test('pendiente puede pasar a cancelada', () => {
    expect(transicionEstadoValida('Pendiente', 'Cancelada')).toBe(true)
  })

  test('confirmada puede pasar a completado', () => {
    expect(transicionEstadoValida('Confirmada', 'Completado')).toBe(true)
  })

  test('cancelada no puede volver a confirmada', () => {
    expect(transicionEstadoValida('Cancelada', 'Confirmada')).toBe(false)
  })

  test('un estado de origen desconocido siempre es inválido', () => {
    expect(transicionEstadoValida('Inexistente', 'Cancelada')).toBe(false)
  })
})
