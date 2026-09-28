// M05-US6 Escenario 2: un evento Cancelado no ofrece la opción Cancelar (Bustelo)
// La reserva Confirmada de las 09:00 queda en pasado con la fecha congelada (10:00),
// por eso su botón se renderiza deshabilitado (no ausente): Confirmada no es estado
// final y ocultarlo rompería M05-US2 y transicionEstadoValida('Confirmada','Cancelada').
const CLAVE = 'agendaya-reservas'
const ID_CONFIRMADA = 'r-test-confirmada'
const ID_CANCELADA = 'r-test-cancelada-ok'

const reservaConfirmada = {
  id: ID_CONFIRMADA,
  fecha: '2026-10-15',
  hora: '09:00',
  cliente: 'Luis Pérez',
  telefono: '2615552222',
  tipoEvento: 'Consulta general',
  estado: 'Confirmada',
  motivoCancelacion: null,
}

const reservaCancelada = {
  id: ID_CANCELADA,
  fecha: '2026-10-15',
  hora: '11:00',
  cliente: 'Pedro Ruiz',
  telefono: '2615555555',
  tipoEvento: 'Consulta general',
  estado: 'Cancelada',
  motivoCancelacion: null,
}

const tarjetaConfirmada = () => cy.get(`[data-cy="reservation-card"][data-id="${ID_CONFIRMADA}"]`)
const tarjetaCancelada = () => cy.get(`[data-cy="reservation-card"][data-id="${ID_CANCELADA}"]`)

describe('AgendaYA - M05 Gestión de Agenda', () => {
  beforeEach(() => {
    cy.clock(new Date('2026-10-15T10:00:00').getTime(), ['Date'])
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(CLAVE, JSON.stringify([reservaConfirmada, reservaCancelada]))
      },
    })
  })

  it('M05-US6 Escenario 2: un evento cancelado no ofrece la opción Cancelar', () => {
    // Arrange
    cy.get('[data-cy="calendar-day"][data-date="2026-10-15"]').click()
    tarjetaConfirmada().find('[data-cy="reservation-status"]').should('have.text', 'Confirmada')
    tarjetaCancelada().find('[data-cy="reservation-status"]').should('have.text', 'Cancelada')

    // Act
    tarjetaConfirmada().find('[data-cy="cancel-reservation"]').then(([boton]) => {
      boton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    })

    // Assert
    tarjetaCancelada().find('[data-cy="cancel-reservation"]').should('not.exist')
    tarjetaConfirmada().find('[data-cy="cancel-reservation"]').should('be.disabled')
    cy.get('[data-cy="cancel-modal"]').should('not.exist')
    cy.get('[data-cy="slot-status"][data-hora="09:00"]').should('have.text', 'Reservado')
    cy.get('[data-cy="slot-status"][data-hora="11:00"]').should('have.text', 'Disponible')
    cy.window().then((win) => {
      const guardadas = JSON.parse(win.localStorage.getItem(CLAVE))
      expect(guardadas.find((r) => r.id === ID_CONFIRMADA).estado).to.equal('Confirmada')
      expect(guardadas.find((r) => r.id === ID_CANCELADA).estado).to.equal('Cancelada')
    })
  })
})
