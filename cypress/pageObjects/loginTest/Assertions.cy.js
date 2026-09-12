class loginTestAssertions {
  checkLoginPageIsVisible() {
    cy.findByTestId("page-login").should("be.visible");
    cy.findByTestId("login-form").should("be.visible");
    cy.findByTestId("login-email-input").should("be.visible");
    cy.findByTestId("login-password-input").should("be.visible");
    cy.findByTestId("login-submit-btn").should("be.visible").and("contain.text", "Sign in");

    return this;
  }

  checkLoginFailed() {
    cy.findByTestId("login-error", { timeout: 7000 }).should("be.visible");
    cy.url().should("include", "/login");

    return this;
  }

  checkInvalidCredentialsError() {
    cy.findByTestId("login-error", { timeout: 7000 })
      .should("be.visible")
      .and("contain.text", "Invalid credentials");

    return this;
  }

  checkInvalidEmailError() {
    cy.findByTestId("login-error", { timeout: 7000 })
      .should("be.visible")
      .and("contain.text", "Invalid credentials");

    return this;
  }

  checkRequiredFieldErrors() {
    cy.findByTestId("login-error", { timeout: 7000 })
      .should("be.visible")
      .and("contain.text", "password must be longer than or equal to 1 characters");

    return this;
  }

  checkUserIsOnDrugGroupingPage() {
    cy.url().should("include", "/grouping/drug");

    return this;
  }

  checkAuthenticatedDrugGroupingPage() {
    cy.url().should("include", "/grouping/drug");
    cy.findByTestId("page-grouping-drug").should("be.visible");
    cy.findByTestId("app-shell").should("be.visible");

    return this;
  }

  checkProtectedPageIsNotAccessible() {
    this.checkLoginPageIsVisible();
    cy.get('[data-testid="page-grouping-drug"]').should("not.exist");

    return this;
  }

  checkUserIsLoggedOut() {
    this.checkProtectedPageIsNotAccessible();

    return this;
  }

  checkUserRemainsAuthenticatedAfterRefresh() {
    this.checkAuthenticatedDrugGroupingPage();

    return this;
  }
}

export default loginTestAssertions;
