// Flujos de error y casos borde. Cada integrante agrega su escenario en un describe propio.
describe('Agenda - día sin reservas', () => {
  it('muestra el mensaje de día vacío y ninguna tarjeta', () => {
    cy.clock(new Date(2026, 9, 10, 10, 0).getTime())
    cy.visit('/')
    cy.get('[data-cy="empty-day-message"]').should('have.text', 'No hay reservas programadas para este día')
    cy.get('[data-cy="reservation-card"]').should('not.exist')
  })
})

// M05-US2: casos de error de la cancelación
const HOY = new Date(2026, 9, 10, 10, 0).getTime()
const tarjeta = (id) => cy.get(`[data-cy="reservation-card"][data-id="${id}"]`)

describe('M05-US2 - Cancelación con error', () => {
  beforeEach(() => {
    cy.clock(HOY)
    cy.visit('/')
    cy.get('[data-cy="calendar-day"][data-date="2026-10-15"]').click()
    tarjeta(3).find('[data-cy="cancel-reservation"]').click()
  })

  it('un motivo de más de 200 caracteres muestra error y no deja confirmar', () => {
    cy.get('[data-cy="cancel-reason-input"]').type('a'.repeat(201), { delay: 0 })
    cy.get('[data-cy="cancel-reason-error"]')
      .should('be.visible')
      .and('have.text', 'El motivo no puede superar los 200 caracteres')
    cy.get('[data-cy="confirm-cancel"]').should('be.disabled')
  })

  it('desistir cierra el modal sin cambiar la reserva', () => {
    cy.get('[data-cy="abort-cancel"]').click()
    cy.get('[data-cy="cancel-modal"]').should('not.exist')
    tarjeta(3).find('[data-cy="reservation-status"]').should('have.text', 'Pendiente')
    cy.get('[data-cy="slot-status"][data-hora="14:00"]').should('have.text', 'Reservado')
    cy.get('[data-cy="cancel-success"]').should('not.exist')
  })
})
