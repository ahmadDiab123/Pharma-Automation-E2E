class loginTestActions {
  openLoginPage() {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/login");

    return this;
  }

  openProtectedRouteWithoutLogin() {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/grouping/drug");

    return this;
  }

  clearEmail() {
    cy.findByTestId("login-email-input").clear({ force: true });

    return this;
  }

  typeEmail(email) {
    cy.findByTestId("login-email-input")
      .clear({ force: true })
      .type(email);

    return this;
  }

  clearPassword() {
    cy.findByTestId("login-password-input").clear({ force: true });

    return this;
  }

  typePassword(password) {
    cy.findByTestId("login-password-input")
      .clear({ force: true })
      .type(password);

    return this;
  }

  loginWithAccount(accountKey) {
    const account = Cypress.env("accounts")?.[accountKey];
    const password = Cypress.env("adminPassword");

    if (!account || !password) {
      throw new Error(`Login account configuration not found: ${accountKey}`);
    }

    return this
      .typeEmail(account.email)
      .typePassword(password)
      .clickOnSignInButton();
  }

  loginWithInvalidPassword() {
    const account = Cypress.env("accounts")?.sysadmin;

    if (!account) {
      throw new Error("Login account configuration not found: sysadmin");
    }

    return this
      .typeEmail(account.email)
      .typePassword("InvalidPassword!123")
      .clickOnSignInButton();
  }

  loginWithInvalidEmail() {
    const password = Cypress.env("adminPassword");

    if (!password) {
      throw new Error("adminPassword Cypress environment value is required.");
    }

    return this
      .typeEmail("invalid-login-user@example.invalid")
      .typePassword(password)
      .clickOnSignInButton();
  }

  submitEmptyCredentials() {
    return this
      .clearEmail()
      .clearPassword()
      .clickOnSignInButton();
  }

  clickOnSignInButton() {
    cy.findByTestId("login-submit-btn").click();

    return this;
  }

  clickLogout() {
    cy.findByTestId("signout-btn").click();

    return this;
  }

  goBack() {
    cy.go("back");

    return this;
  }

  refreshAuthenticatedPage() {
    cy.reload();

    return this;
  }
}

export default loginTestActions;
