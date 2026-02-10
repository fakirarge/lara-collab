// cypress/e2e/tasks/task-management.cy.js

describe('Task Management', () => {
  let projectId;

  before(() => {
    cy.login();
    // Create a project for testing
    cy.createProject('E2E Test Project');
    cy.url().then((url) => {
      projectId = url.split('/').pop();
    });
  });

  beforeEach(() => {
    cy.login();
  });

  it('should create a new task', () => {
    cy.visit(`/projects/${projectId}`);

    const taskName = `Test Task ${Date.now()}`;
    cy.get('[data-testid="create-task-button"]').click();
    cy.get('input[name="name"]').type(taskName);
    cy.get('textarea[name="description"]').type('Test task description');
    cy.get('button[type="submit"]').click();

    cy.contains(taskName).should('be.visible');
  });

  it('should edit a task', () => {
    cy.visit(`/projects/${projectId}`);

    cy.get('[data-testid="task-card"]').first().click();
    cy.get('[data-testid="edit-task-button"]').click();

    const newName = `Updated Task ${Date.now()}`;
    cy.get('input[name="name"]').clear().type(newName);
    cy.get('button[type="submit"]').click();

    cy.contains(newName).should('be.visible');
  });

  it('should complete a task', () => {
    cy.visit(`/projects/${projectId}`);

    cy.get('[data-testid="task-card"]').first().within(() => {
      cy.get('[data-testid="complete-checkbox"]').check();
    });

    cy.contains('completed').should('be.visible');
    cy.get('[data-testid="task-card"]').first().should('have.class', 'completed');
  });

  it('should assign a task to user', () => {
    cy.visit(`/projects/${projectId}`);

    cy.get('[data-testid="task-card"]').first().click();
    cy.get('[data-testid="assign-user-button"]').click();
    cy.get('[data-testid="user-option"]').first().click();

    cy.contains('assigned').should('be.visible');
  });

  it('should add a comment to task', () => {
    cy.visit(`/projects/${projectId}`);

    cy.get('[data-testid="task-card"]').first().click();

    const comment = `Test comment ${Date.now()}`;
    cy.get('textarea[name="comment"]').type(comment);
    cy.get('[data-testid="submit-comment"]').click();

    cy.contains(comment).should('be.visible');
  });

  it('should log time on task', () => {
    cy.visit(`/projects/${projectId}`);

    cy.get('[data-testid="task-card"]').first().click();
    cy.get('[data-testid="log-time-button"]').click();

    cy.get('input[name="minutes"]').type('60');
    cy.get('button[type="submit"]').click();

    cy.contains('logged').should('be.visible');
    cy.contains('60').should('be.visible');
  });
});

