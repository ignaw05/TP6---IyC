// M05-US8 Escenario 1 + M05-US4 Escenario 1: visualización de detalle de turno (López)
const CLAVE = 'agendaya-reservas'
const ID = 'r-test-detalle'

const reservaDelTest = {
  id: ID,
  fecha: '2026-10-15',
  hora: '14:00',
  cliente: 'Carla Díaz',
  telefono: '2615553333',
  tipoEvento: 'Consulta general',
  estado: 'Pendiente',
  motivoCancelacion: null,
}

const tarjeta = () => cy.get(`[data-cy="reservation-card"][data-id="${ID}"]`)
const detalle = () => cy.get('[data-cy="reservation-detail"]')

describe('AgendaYA - M05 Gestión de Agenda', () => {
  beforeEach(() => {
    cy.clock(new Date('2026-10-15T10:00:00').getTime(), ['Date'])
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(CLAVE, JSON.stringify([reservaDelTest]))
      },
    })
  })

  afterEach(function () {
    if (this.currentTest && this.currentTest.state === 'failed') {
      cy.screenshot(`fallo-${this.currentTest.title}`)
    }
  })

  it('M05-US8/M05-US4: muestra el detalle del turno al hacer clic en la tarjeta', () => {
    // Arrange
    tarjeta().should('be.visible')
    tarjeta().find('[data-cy="reservation-name"]').should('have.text', 'Carla Díaz')

    // Act
    cy.get('[data-cy="calendar-day"][data-date="2026-10-15"]').click()
    tarjeta().find('[data-cy="reservation-name"]').click()

    // Assert
    detalle().should('be.visible')
    detalle().find('[data-cy="detail-client"]').should('have.text', 'Carla Díaz')
    detalle().find('[data-cy="detail-phone"]').should('have.text', '2615553333')
    detalle().find('[data-cy="detail-date"]').should('have.text', '2026-10-15')
    detalle().find('[data-cy="detail-time"]').should('have.text', '14:00')
    detalle().find('[data-cy="detail-event-type"]').should('have.text', 'Consulta general')
    detalle().find('[data-cy="detail-status"]').should('have.text', 'Pendiente')
  })
})
