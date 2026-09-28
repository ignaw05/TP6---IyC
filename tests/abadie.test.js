// M05-US2 Escenario 2 - Tests unitarios de validarMotivoCancelacion y normalizarMotivo (Jest, ESM)
import { validarMotivoCancelacion, normalizarMotivo, MAX_MOTIVO } from '../src/logica-negocio.js'

const LARGO_200 = 'a'.repeat(200)
const LARGO_201 = 'a'.repeat(201)
const ERROR_TOO_LONG = 'El motivo no puede superar los 200 caracteres'

describe('validarMotivoCancelacion', () => {
  test('motivo undefined es válido porque el motivo es opcional', () => {
    expect(validarMotivoCancelacion(undefined)).toEqual({ valido: true, error: null })
  })

  test('motivo null es válido porque el motivo es opcional', () => {
    expect(validarMotivoCancelacion(null)).toEqual({ valido: true, error: null })
  })

  test('motivo vacío es válido', () => {
    expect(validarMotivoCancelacion('')).toEqual({ valido: true, error: null })
  })

  test('un motivo común de texto es válido', () => {
    expect(validarMotivoCancelacion('El cliente reprogramó')).toEqual({ valido: true, error: null })
  })

  test('un motivo de exactamente 200 caracteres es válido (caso límite)', () => {
    expect(LARGO_200).toHaveLength(MAX_MOTIVO)
    expect(validarMotivoCancelacion(LARGO_200)).toEqual({ valido: true, error: null })
  })

  test('un motivo de 201 caracteres es inválido y devuelve el mensaje de error', () => {
    expect(LARGO_201).toHaveLength(MAX_MOTIVO + 1)
    expect(validarMotivoCancelacion(LARGO_201)).toEqual({ valido: false, error: ERROR_TOO_LONG })
  })

  test('el límite se cuenta sobre el motivo ya recortado, no sobre los espacios exteriores', () => {
    expect(validarMotivoCancelacion(`   ${LARGO_200}   `)).toEqual({ valido: true, error: null })
  })

  test('no lanza excepción ante un motivo que no es string y devuelve el objeto resultado', () => {
    expect(() => validarMotivoCancelacion(12345)).not.toThrow()
    expect(validarMotivoCancelacion(12345)).toEqual({ valido: true, error: null })
    expect(() => validarMotivoCancelacion({})).not.toThrow()
    expect(validarMotivoCancelacion({})).toEqual({ valido: true, error: null })
  })

  test('no muta el motivo recibido', () => {
    const motivo = `  ${LARGO_201}  `
    const copia = motivo
    validarMotivoCancelacion(motivo)
    expect(motivo).toBe(copia)
    expect(motivo).toHaveLength(LARGO_201.length + 4)
  })
})

describe('normalizarMotivo', () => {
  test('motivo null devuelve null', () => {
    expect(normalizarMotivo(null)).toBeNull()
  })

  test('motivo undefined devuelve null', () => {
    expect(normalizarMotivo(undefined)).toBeNull()
  })

  test('motivo vacío devuelve null', () => {
    expect(normalizarMotivo('')).toBeNull()
  })

  test('un motivo con solo espacios devuelve null porque queda vacío tras el trim', () => {
    expect(normalizarMotivo('   ')).toBeNull()
  })

  test('un motivo común se devuelve sin cambios', () => {
    expect(normalizarMotivo('El cliente reprogramó')).toBe('El cliente reprogramó')
  })

  test('recorta los espacios exteriores y colapsa los espacios internos múltiples', () => {
    expect(normalizarMotivo('  El   cliente  reprogramó  ')).toBe('El cliente reprogramó')
  })

  test('colapsa una corrida larga de espacios internos a un solo espacio', () => {
    expect(normalizarMotivo('hola          mundo')).toBe('hola mundo')
  })

  test('un motivo de 200 caracteres sin espacios se devuelve intacto', () => {
    expect(normalizarMotivo(LARGO_200)).toBe(LARGO_200)
  })

  test('conserva los saltos de línea y los tabs internos', () => {
    expect(normalizarMotivo('linea 1\nlinea 2')).toBe('linea 1\nlinea 2')
    expect(normalizarMotivo('columna 1\tcolumna 2')).toBe('columna 1\tcolumna 2')
  })

  test('no muta el motivo recibido', () => {
    const motivo = '  hola    mundo  '
    const original = motivo
    const resultado = normalizarMotivo(motivo)
    expect(resultado).toBe('hola mundo')
    expect(motivo).toBe(original)
    expect(motivo).toHaveLength(original.length)
  })

  test('es idempotente: normalizar dos veces da el mismo resultado', () => {
    const unaVez = normalizarMotivo('  a   b     c  ')
    expect(normalizarMotivo(unaVez)).toBe(unaVez)
    expect(unaVez).toBe('a b c')
  })
})
