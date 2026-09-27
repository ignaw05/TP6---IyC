// Flujos principales (camino feliz). Cada integrante agrega su escenario en un describe propio.
describe('Agenda - carga inicial', () => {
  it('muestra el mes actual con hoy seleccionado', () => {
    cy.clock(new Date(2026, 9, 10, 10, 0).getTime())
    cy.visit('/')
    cy.get('[data-cy="calendar-title"]').should('have.text', 'Octubre 2026')
    cy.get('[data-cy="calendar-day"].selected').should('have.attr', 'data-date', '2026-10-10')
  })
})

// M05-US2 Escenario 1: cancelación exitosa (+ Escenario 2: motivo opcional)
const HOY = new Date(2026, 9, 10, 10, 0).getTime() // 10/10/2026 10:00, antes de las reservas del 15
const tarjeta = (id) => cy.get(`[data-cy="reservation-card"][data-id="${id}"]`)
const slot = (hora) => cy.get(`[data-cy="slot-status"][data-hora="${hora}"]`)

describe('M05-US2 - Cancelación exitosa', () => {
  beforeEach(() => {
    cy.clock(HOY)
    cy.visit('/')
    cy.window().then((win) => { win.sinRecargar = true })
    cy.get('[data-cy="calendar-day"][data-date="2026-10-15"]').click()
  })

  it('la reserva pasa a Cancelada y el horario vuelve a Disponible', () => {
    slot('14:00').should('have.text', 'Reservado')
    tarjeta(3).find('[data-cy="cancel-reservation"]').click()

    cy.get('[data-cy="cancel-modal"]').should('be.visible')
    cy.get('[data-cy="confirm-cancel"]').click()

    cy.get('[data-cy="cancel-modal"]').should('not.exist')
    cy.get('[data-cy="cancel-success"]').should('have.text', 'La reserva fue cancelada')
    tarjeta(3).find('[data-cy="reservation-status"]').should('have.text', 'Cancelada')
    tarjeta(3).find('[data-cy="cancel-reservation"]').should('not.exist')
    slot('14:00').should('have.text', 'Disponible')

    cy.window().then((win) => {
      expect(win.sinRecargar, 'sin recargar la página').to.equal(true)
      const guardada = JSON.parse(win.localStorage.getItem('agendaya-reservas')).find((r) => r.id === 3)
      expect(guardada.estado).to.equal('Cancelada')
      expect(guardada.motivoCancelacion).to.equal(null)
    })
  })

  it('guarda el motivo de cancelación ingresado', () => {
    tarjeta(2).find('[data-cy="cancel-reservation"]').click()
    cy.get('[data-cy="cancel-reason-input"]').type('El cliente reprogramó')
    cy.get('[data-cy="confirm-cancel"]').click()

    slot('09:00').should('have.text', 'Disponible')
    cy.window().then((win) => {
      const guardada = JSON.parse(win.localStorage.getItem('agendaya-reservas')).find((r) => r.id === 2)
      expect(guardada.motivoCancelacion).to.equal('El cliente reprogramó')
    })
  })
})
