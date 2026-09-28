// #7 M05-US2 Escenario 2: motivo de cancelación opcional con máximo de 200 caracteres (Abadie)
const CLAVE = 'agendaya-reservas'
const ID = 'r-test-motivo'
const LARGO_200 = 'a'.repeat(200)
const LARGO_201 = 'a'.repeat(201)
const ERROR_TOO_LONG = 'El motivo no puede superar los 200 caracteres'

const reservaDelTest = {
  id: ID,
  fecha: '2026-10-15',
  hora: '14:00',
  cliente: 'Diego Medina',
  telefono: '2615557777',
  tipoEvento: 'Consulta general',
  estado: 'Pendiente',
  motivoCancelacion: null,
}

const tarjeta = () => cy.get(`[data-cy="reservation-card"][data-id="${ID}"]`)
const abrirModal = () => {
  cy.get('[data-cy="calendar-day"][data-date="2026-10-15"]').click()
  tarjeta().find('[data-cy="cancel-reservation"]').click()
}
const estadoEnLocalStorage = (win) => JSON.parse(win.localStorage.getItem(CLAVE)).find((r) => r.id === ID)

describe('AgendaYA - M05 Gestión de Agenda - Motivo de cancelación', () => {
  beforeEach(() => {
    // La app toma el día actual de new Date(), así que se congela el reloj igual que en los demás specs.
    cy.clock(new Date('2026-10-15T10:00:00').getTime(), ['Date'])
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(CLAVE, JSON.stringify([reservaDelTest]))
      },
    })
  })

  it('M05-US2: un motivo de más de 200 caracteres muestra el error y no cancela la reserva', () => {
    // Arrange: la reserva está Pendiente y el modal de cancelación está cerrado.
    tarjeta().find('[data-cy="reservation-status"]').should('have.text', 'Pendiente')
    cy.get('[data-cy="cancel-modal"]').should('not.exist')
    cy.get('[data-cy="cancel-reason-error"]').should('not.exist')

    // Act: se abre el modal y se escribe un motivo de 201 caracteres, luego se intenta confirmar.
    abrirModal()
    cy.get('[data-cy="cancel-reason-input"]').type(LARGO_201, { delay: 0 })
    // El input handler deshabilita el botón, así que el click normal es imposible:
    // se usa force para exercising la guarda de la lógica en el click handler.
    cy.get('[data-cy="confirm-cancel"]').should('be.disabled').click({ force: true })

    // Assert: error visible, el flujo no avanzó y nada se guardó.
    cy.get('[data-cy="cancel-reason-error"]').should('be.visible').and('have.text', ERROR_TOO_LONG)
    cy.get('[data-cy="cancel-modal"]').should('be.visible')
    cy.get('[data-cy="cancel-success"]').should('not.exist')
    tarjeta().find('[data-cy="reservation-status"]').should('have.text', 'Pendiente')
    cy.window().then((win) => {
      expect(estadoEnLocalStorage(win).estado).to.equal('Pendiente')
      expect(estadoEnLocalStorage(win).motivoCancelacion).to.equal(null)
    })
  })

  it('M05-US2: un motivo de exactamente 200 caracteres sí cancela la reserva', () => {
    // Arrange: la reserva está Pendiente y el motivo límite es válido.
    tarjeta().find('[data-cy="reservation-status"]').should('have.text', 'Pendiente')
    expect(LARGO_200).to.have.length(200)

    // Act: se abre el modal, se escriben 200 caracteres y se confirma sin forzar.
    abrirModal()
    cy.get('[data-cy="cancel-reason-input"]').type(LARGO_200, { delay: 0 })

    // Assert: sin error, con botón habilitado, y la cancelación se persiste.
    cy.get('[data-cy="cancel-reason-error"]').should('not.be.visible')
    cy.get('[data-cy="confirm-cancel"]').should('be.enabled')
    cy.get('[data-cy="confirm-cancel"]').click()
    cy.get('[data-cy="cancel-modal"]').should('not.exist')
    cy.get('[data-cy="cancel-success"]').should('be.visible').and('have.text', 'La reserva fue cancelada')
    tarjeta().find('[data-cy="reservation-status"]').should('have.text', 'Cancelada')
    cy.window().then((win) => {
      expect(estadoEnLocalStorage(win).estado).to.equal('Cancelada')
      expect(estadoEnLocalStorage(win).motivoCancelacion).to.equal(LARGO_200)
    })
  })
})
