/// <reference types="cypress" />

import LoginPage from '../../pages/LoginPage';

describe('Custom E2E Flow', () => {
  it('should login and see the dashboard', () => {
    const username = 'Katharina_Bernier'; // usuario demo
    const password = 's3cret';            // contraseña demo

    // usar el Page Object
    LoginPage.login(username, password);

    // verificar que el usuario ve algo típico del dashboard
    cy.contains('Get Started').should('exist');
  });
});
