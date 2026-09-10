const { defineConfig } = require("cypress");
const cucumber = require("cypress-cucumber-preprocessor").default;

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("file:preprocessor", cucumber());
    },
    specPattern: "cypress/e2e/**/*.feature",
    baseUrl: "http://20.196.24.233", 
    screenshotOnRunFailure: false,
    screenshotsFolder: "My Screenshots",
    trashAssetsBeforeRuns: true,
    video: false,
    videosFolder: "My Videos",
    videoCompression: 30,
    reporter: "mochawesome",
    reporterOptions: {
      reportDir: "cypress/myReport",
      overwrite: false,
      html: true,
      json: false,
      timestamp: "mmddyyyy_HHMMss"
    }
  }
});