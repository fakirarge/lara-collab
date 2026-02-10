// cypress/e2e/projects/project-management.cy.js

describe('Project Management', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should display projects list', () => {
    cy.visit('/projects');
    cy.contains('Projects').should('be.visible');
    cy.get('[data-testid="projects-table"]').should('exist');
  });

  it('should create a new project', () => {
    cy.visit('/projects');
    cy.get('[data-testid="create-project-button"]').click();

    const projectName = `Test Project ${Date.now()}`;
    cy.get('input[name="name"]').type(projectName);
    cy.get('textarea[name="description"]').type('Test project description');
    cy.get('select[name="client_company_id"]').select('1');
    cy.get('button[type="submit"]').click();

    // Should show success message
    cy.contains('created').should('be.visible');
    cy.contains(projectName).should('be.visible');
  });

  it('should edit a project', () => {
    cy.visit('/projects');

    // Click first project's edit button
    cy.get('[data-testid="project-row"]').first().within(() => {
      cy.get('[data-testid="edit-button"]').click();
    });

    const newName = `Updated Project ${Date.now()}`;
    cy.get('input[name="name"]').clear().type(newName);
    cy.get('button[type="submit"]').click();

    cy.contains('updated').should('be.visible');
    cy.contains(newName).should('be.visible');
  });

  it('should view project details', () => {
    cy.visit('/projects');

    cy.get('[data-testid="project-row"]').first().click();

    // Should show project details
    cy.url().should('include', '/projects/');
    cy.get('[data-testid="project-name"]').should('be.visible');
    cy.get('[data-testid="task-groups"]').should('be.visible');
  });

  it('should delete a project', () => {
    // Create a project to delete
    const projectName = `Delete Test ${Date.now()}`;
    cy.createProject(projectName);

    cy.get('[data-testid="project-row"]').contains(projectName).parents('[data-testid="project-row"]').within(() => {
      cy.get('[data-testid="delete-button"]').click();
    });

    // Confirm deletion
    cy.get('[data-testid="confirm-delete"]').click();

    cy.contains('deleted').should('be.visible');
    cy.contains(projectName).should('not.exist');
  });
});

