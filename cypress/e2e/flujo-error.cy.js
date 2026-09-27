// Flujos de error y casos borde. Cada integrante agrega su escenario en un describe propio.
describe('Agenda - día sin reservas', () => {
  it('muestra el mensaje de día vacío y ninguna tarjeta', () => {
    cy.clock(new Date(2026, 9, 10, 10, 0).getTime())
    cy.visit('/')
    cy.get('[data-cy="empty-day-message"]').should('have.text', 'No hay reservas programadas para este día')
    cy.get('[data-cy="reservation-card"]').should('not.exist')
  })
})
