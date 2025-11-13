// cypress/pages/LoginPage.js

class LoginPage {
  visit() {
    cy.visit('/signin');
  }

  fillUsername(username) {
    cy.get('[data-test="signin-username"]').clear().type(username);
  }

  fillPassword(password) {
    cy.get('[data-test="signin-password"]').clear().type(password);
  }

  submit() {
    cy.get('[data-test="signin-submit"]').click();
  }

  login(username, password) {
    this.visit();
    this.fillUsername(username);
    this.fillPassword(password);
    this.submit();
  }
}

module.exports = new LoginPage();
