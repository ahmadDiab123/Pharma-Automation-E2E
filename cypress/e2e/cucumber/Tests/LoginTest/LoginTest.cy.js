import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import loginTestActions from "../../../../pageObjects/loginTest/Actions.cy";
import loginTestAssertions from "../../../../pageObjects/loginTest/Assertions.cy";

const loginAction = new loginTestActions();
const loginAssertion = new loginTestAssertions();

Given("I navigate to the login page", () => {
  loginAction.openLoginPage();
});

Given("I open a protected route without logging in", () => {
  loginAction.openProtectedRouteWithoutLogin();
});

When("I sign in with the {string} account", (account) => {
  loginAction.loginWithAccount(account);
});

When("I sign in with an invalid password", () => {
  loginAction.loginWithInvalidPassword();
});

When("I sign in with an invalid email", () => {
  loginAction.loginWithInvalidEmail();
});

When("I click the Sign in button with empty credentials", () => {
  loginAction.submitEmptyCredentials();
});

When("I log out", () => {
  loginAction.clickLogout();
});

When("I navigate back in the browser", () => {
  loginAction.goBack();
});

When("I refresh the authenticated page", () => {
  loginAction.refreshAuthenticatedPage();
});

Then("I should see the login form", () => {
  loginAssertion.checkLoginPageIsVisible();
});

Then("I should be redirected to the drug grouping page", () => {
  loginAssertion.checkUserIsOnDrugGroupingPage();
});

Then("I should see invalid credentials error", () => {
  loginAssertion.checkInvalidCredentialsError();
});

Then("I should see invalid email error", () => {
  loginAssertion.checkInvalidEmailError();
});

Then("I should see required validation errors for email and password", () => {
  loginAssertion.checkRequiredFieldErrors();
});

Then("I should see the authenticated drug grouping page", () => {
  loginAssertion.checkAuthenticatedDrugGroupingPage();
});

Then("I should be prevented from accessing the protected page", () => {
  loginAssertion.checkProtectedPageIsNotAccessible();
});

Then("I should be logged out", () => {
  loginAssertion.checkUserIsLoggedOut();
});

Then("I should remain authenticated after refresh", () => {
  loginAssertion.checkUserRemainsAuthenticatedAfterRefresh();
});
