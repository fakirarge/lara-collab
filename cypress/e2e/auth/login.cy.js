// cypress/e2e/auth/login.cy.js

describe('Authentication - Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should login with valid credentials', () => {
    cy.get('input[name="email"]').type(Cypress.env('adminEmail'));
    cy.get('input[name="password"]').type(Cypress.env('adminPassword'));
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    cy.get('input[name="email"]').type('wrong@email.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Should show error message
    cy.contains('credentials').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();

    // Should show validation errors
    cy.contains('email').should('be.visible');
    cy.contains('password').should('be.visible');
  });

  it('should remember me checkbox work', () => {
    cy.get('input[name="remember"]').check();
    cy.get('input[name="email"]').type(Cypress.env('adminEmail'));
    cy.get('input[name="password"]').type(Cypress.env('adminPassword'));
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
  });
});

