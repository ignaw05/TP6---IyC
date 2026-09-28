import { obtenerReservaPorId, formatearDetalle } from '../src/logica-negocio.js'

const reserva = (cambios = {}) => ({
  id: 1,
  fecha: '2026-10-15',
  hora: '09:00',
  cliente: 'Luis Pérez',
  telefono: '2615552222',
  tipoEvento: 'Consulta general',
  estado: 'Confirmada',
  motivoCancelacion: null,
  ...cambios,
})

describe('obtenerReservaPorId', () => {
  it('retorna la reserva correspondiente al id indicado', () => {
    const reservas = [reserva({ id: 1 }), reserva({ id: 2, cliente: 'Carla Díaz' })]

    expect(obtenerReservaPorId(reservas, 2)).toEqual(reserva({ id: 2, cliente: 'Carla Díaz' }))
  })

  it('encuentra la reserva aunque el id llegue como texto', () => {
    const reservas = [reserva({ id: 2 })]

    expect(obtenerReservaPorId(reservas, '2')).toEqual(reserva({ id: 2 }))
  })

  it('retorna null si el id no existe', () => {
    expect(obtenerReservaPorId([reserva({ id: 1 })], 999)).toBeNull()
  })

  it('retorna null sin lanzar si las reservas no son un array', () => {
    expect(obtenerReservaPorId(null, 1)).toBeNull()
    expect(obtenerReservaPorId(undefined, 1)).toBeNull()
  })

  it('no muta el array original', () => {
    const reservas = [reserva({ id: 1 }), reserva({ id: 2 })]
    const copia = structuredClone(reservas)

    obtenerReservaPorId(reservas, 2)

    expect(reservas).toEqual(copia)
  })
})

describe('formatearDetalle', () => {
  it('devuelve los datos del turno formateados para el detalle', () => {
    expect(formatearDetalle(reserva())).toEqual({
      cliente: 'Luis Pérez',
      telefono: '2615552222',
      fecha: '2026-10-15',
      hora: '09:00',
      tipoEvento: 'Consulta general',
      estado: 'Confirmada',
    })
  })

  it('muestra "Sin teléfono" si el teléfono viene vacío o con espacios', () => {
    expect(formatearDetalle(reserva({ telefono: '' })).telefono).toBe('Sin teléfono')
    expect(formatearDetalle(reserva({ telefono: '   ' })).telefono).toBe('Sin teléfono')
    expect(formatearDetalle(reserva({})).telefono).toBe('2615552222')
  })

  it('lanza error si la reserva es nula o indefinida', () => {
    expect(() => formatearDetalle(null)).toThrow('Reserva inválida')
    expect(() => formatearDetalle(undefined)).toThrow('Reserva inválida')
  })

  it('no muta el objeto original', () => {
    const original = reserva()
    const copia = structuredClone(original)

    formatearDetalle(original)

    expect(original).toEqual(copia)
  })
})
