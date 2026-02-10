// cypress/support/commands.js

// Custom command for login
Cypress.Commands.add('login', (email = Cypress.env('adminEmail'), password = Cypress.env('adminPassword')) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
});

// Custom command for logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Custom command for creating a project
Cypress.Commands.add('createProject', (projectName, clientCompanyId = 1) => {
  cy.visit('/projects');
  cy.get('[data-testid="create-project-button"]').click();
  cy.get('input[name="name"]').type(projectName);
  cy.get('select[name="client_company_id"]').select(clientCompanyId.toString());
  cy.get('button[type="submit"]').click();
  cy.contains(projectName).should('be.visible');
});

// Custom command for creating a task
Cypress.Commands.add('createTask', (taskName, projectId) => {
  cy.visit(`/projects/${projectId}`);
  cy.get('[data-testid="create-task-button"]').click();
  cy.get('input[name="name"]').type(taskName);
  cy.get('button[type="submit"]').click();
  cy.contains(taskName).should('be.visible');
});

// Custom command for API calls with auth
Cypress.Commands.add('apiRequest', (method, url, body = null) => {
  return cy.getCookie('XSRF-TOKEN').then((cookie) => {
    return cy.request({
      method,
      url: `${Cypress.env('apiUrl')}${url}`,
      body,
      headers: {
        'X-XSRF-TOKEN': cookie?.value,
      },
      failOnStatusCode: false,
    });
  });
});

// Custom command for checking if element is visible in viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const rect = subject[0].getBoundingClientRect();
  expect(rect.top).to.be.greaterThan(0);
  expect(rect.left).to.be.greaterThan(0);
  expect(rect.bottom).to.be.lessThan(Cypress.config('viewportHeight'));
  expect(rect.right).to.be.lessThan(Cypress.config('viewportWidth'));
  return subject;
});

