{
  "baseUrl": "http://lara-collab.test",
  "viewportWidth": 1280,
  "viewportHeight": 720,
  "video": false,
  "screenshotOnRunFailure": true,
  "defaultCommandTimeout": 10000,
  "requestTimeout": 10000,
  "responseTimeout": 10000,
  "e2e": {
    "setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    "specPattern": "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    "supportFile": "cypress/support/e2e.js"
  },
  "env": {
    "apiUrl": "http://lara-collab.test/api",
    "adminEmail": "admin@mail.com",
    "adminPassword": "password"
  }
}

