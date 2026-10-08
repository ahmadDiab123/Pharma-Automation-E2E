import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import loginTestActions from "../../../../pageObjects/loginTest/Actions.cy";
import loginTestAssertions from "../../../../pageObjects/loginTest/Assertions.cy";
import drugGroupingActions from "../../../../pageObjects/drugGrouping/Actions.cy";
import drugGroupingAssertions from "../../../../pageObjects/drugGrouping/Assertions.cy";

const loginAction = new loginTestActions();
const loginAssertion = new loginTestAssertions();
const drugGroupingAction = new drugGroupingActions();
const drugGroupingAssertion = new drugGroupingAssertions();

Given("I am logged in as the system administrator", () => {
  loginAction.openLoginPage().loginWithAccount("sysadmin");
  loginAssertion.checkUserIsOnDrugGroupingPage();
});
Given("I am logged in as the super super administrator", () => {
  loginAction.openLoginPage().loginWithAccount("super_super_admin");
  loginAssertion.checkUserIsOnDrugGroupingPage();
});

Given("I navigate to Drug Grouping", () => {
  drugGroupingAction.openDrugGroupingPage();
});

Given("I prepare a unique Custom Group name", () => {
  drugGroupingAction.prepareNextAutomationGroupName();
});

Given("I create the current automation Custom Group", () => {
  drugGroupingAction.createCurrentAutomationGroup();
  drugGroupingAction.searchForCurrentAutomationGroup();
  drugGroupingAssertion.checkCurrentAutomationGroupExists();
});

When("I switch to the Custom Groups tab", () => {
  drugGroupingAction.selectCustomGroupsTab();
});

When("I switch to the Medical Groups tab", () => {
  drugGroupingAction.selectMedicalGroupsTab();
});

When("I search for an existing Custom Group", () => {
  drugGroupingAction.searchForExistingGroup();
});

When("I search for a non-existing Custom Group", () => {
  drugGroupingAction.searchForNonExistingGroup();
});

When("I search for automation Custom Groups", () => {
  drugGroupingAction.searchForAutomationGroups();
});

When("I filter Custom Groups by {string} status", (status) => {
  drugGroupingAction.filterCustomGroupsByStatus(status);
});

Given("I prepare a disposable automation Custom Group", () => {
  drugGroupingAction.prepareDisposableAutomationGroupName();
});

Given("I create the disposable automation Custom Group", () => {
  drugGroupingAction.createDisposableAutomationGroup();
  drugGroupingAction.searchForDisposableAutomationGroup();
});

When("I open Delete for the disposable automation Custom Group", () => {
  drugGroupingAction.openDeleteForDisposableAutomationGroup();
});

When("I cancel Custom Group deletion", () => {
  drugGroupingAction.cancelCustomGroupDelete();
});

When("I confirm Custom Group deletion", () => {
  drugGroupingAction.confirmCustomGroupDelete();
});

When("I search for the disposable automation Custom Group", () => {
  drugGroupingAction.searchForDisposableAutomationGroup();
});

When("I toggle the visible automation Custom Group statuses", () => {
  drugGroupingAction.toggleVisibleAutomationGroupStatuses();
});

When("I open the existing Custom Group details", () => {
  drugGroupingAction.openExistingGroupView();
});

When("I open a new Custom Group form", () => {
  drugGroupingAction.openNewCustomGroupForm();
});

When("I cancel the Custom Group form", () => {
  drugGroupingAction.cancelGroupForm();
});

When("I save a group with a one-character name", () => {
  drugGroupingAction.typeGroupName("A").clickSaveGroup();
});

When("I save a group without members", () => {
  drugGroupingAction.typeGroupName("QA").clickSaveGroup();
});

When("I search select and remove an initial drug code", () => {
  const code = Cypress.env("drugGrouping").initialDrugCodes[0];

  drugGroupingAction.searchDrugCode(code).selectDrugCode(code);
});

When("I remove the selected initial drug code", () => {
  const code = Cypress.env("drugGrouping").initialDrugCodes[0];

  drugGroupingAction.removeDrugCode(code);
});

When("I search for a non-existing drug reference", () => {
  drugGroupingAction.searchDrugCode(Cypress.env("drugGrouping").nonExistingDrugQuery);
});

When("I select an existing automation Custom Group name for duplicate validation", () => {
  drugGroupingAction.captureVisibleAutomationGroupNameForDuplicate();
});

When("I attempt to create a Custom Group with the selected duplicate name", () => {
  const code = Cypress.env("drugGrouping").initialDrugCodes[0];

  drugGroupingAction.typeCurrentDuplicateAutomationGroupName();
  drugGroupingAction.searchDrugCode(code);
  drugGroupingAction.selectDrugCode(code);
  drugGroupingAction.clickSaveGroup();
});

When("I return to the selected duplicate Custom Group search", () => {
  drugGroupingAction.cancelGroupForm();
  drugGroupingAction.searchForCurrentDuplicateAutomationGroup();
});

When("I edit the current automation group description", () => {
  drugGroupingAction.openCurrentAutomationGroupForEdit();
  drugGroupingAction.updateCurrentAutomationGroupDescription();
  drugGroupingAction.searchForCurrentAutomationGroup();
  drugGroupingAction.openCurrentAutomationGroupView();
});

When("I add and remove drug codes during the current automation group edit", () => {
  drugGroupingAction.openCurrentAutomationGroupForEdit();
  drugGroupingAction.addAndRemoveDrugCodesDuringEdit();
  drugGroupingAction.searchForCurrentAutomationGroup();
  drugGroupingAction.openCurrentAutomationGroupView();
});

Then("the Drug Grouping page should be visible on Custom Groups", () => {
  drugGroupingAssertion.checkDrugGroupingPageIsVisible();
  drugGroupingAssertion.checkCustomGroupsTabIsActive();
});

Then("the existing Custom Group should be shown", () => {
  drugGroupingAssertion.checkExistingGroupSearchResult();
});

Then("the Custom Group empty state should be shown", () => {
  drugGroupingAssertion.checkNoGroupsAreFound();
});

Then("the automation Custom Groups should be displayed", () => {
  drugGroupingAssertion.checkAutomationCustomGroupsAreDisplayed();
});

Then("only Custom Groups with {string} status should be displayed", (status) => {
  drugGroupingAssertion.checkAllCustomGroupsHaveStatus(status);
});

Then("the disposable automation Custom Group should exist", () => {
  drugGroupingAssertion.checkDisposableAutomationGroupExists();
});

Then("the Custom Group delete confirmation should be visible", () => {
  drugGroupingAssertion.checkCustomGroupDeleteConfirmationIsVisible();
});

Then("the Custom Group delete confirmation should be closed", () => {
  drugGroupingAssertion.checkCustomGroupDeleteConfirmationIsClosed();
});

Then("the disposable automation Custom Group should be deleted", () => {
  drugGroupingAssertion.checkDisposableAutomationGroupIsDeleted();
});

Then("the visible automation Custom Group statuses should be toggled", () => {
  drugGroupingAssertion.checkVisibleAutomationGroupStatusesWereToggled();
});

Then("the existing Custom Group details and members should be visible", () => {
  drugGroupingAssertion.checkExistingGroupDetailsAreVisible();
});

Then("the Custom Group table status code count and pagination should be valid", () => {
  drugGroupingAssertion.checkTableRowStatusCodeCountAndPagination();
});

Then("the Medical Groups tab should be active", () => {
  drugGroupingAssertion.checkMedicalGroupsTabIsActive();
});

Then("the Custom Group form should be visible", () => {
  drugGroupingAssertion.checkGroupFormIsVisible();
});

Then("the Custom Group form should be closed", () => {
  drugGroupingAssertion.checkGroupFormIsClosed();
});

Then("the Group Name minimum length validation should be shown", () => {
  drugGroupingAssertion.checkGroupNameMinimumLengthError();
});

Then("the group members required validation should be shown", () => {
  drugGroupingAssertion.checkMembersRequiredError();
});

Then("the duplicate Custom Group name should be rejected", () => {
  drugGroupingAssertion.checkDuplicateGroupNameIsRejected();
});

Then("only the original Custom Group with the selected duplicate name should exist", () => {
  drugGroupingAssertion.checkOnlyOneCurrentDuplicateAutomationGroupExists();
});

Then("the initial drug code should be selected", () => {
  drugGroupingAssertion.checkDrugCodeIsSelected(Cypress.env("drugGrouping").initialDrugCodes[0]);
});

Then("the initial drug code should be removed", () => {
  drugGroupingAssertion.checkDrugCodeIsRemoved(Cypress.env("drugGrouping").initialDrugCodes[0]);
});

Then("no drug reference results should be shown", () => {
  drugGroupingAssertion.checkNoDrugResultsAreFound();
});

Then("the current automation Custom Group should be created", () => {
  drugGroupingAssertion.checkCurrentAutomationGroupExists();
});

Then("the current automation Custom Group description should be updated", () => {
  drugGroupingAssertion.checkCurrentAutomationGroupDetails(
    Cypress.env("drugGrouping").updatedDescription
  );
});

Then("the current automation Custom Group members should be updated", () => {
  const { initialDrugCodes, additionalDrugCode } = Cypress.env("drugGrouping");

  drugGroupingAssertion.checkCurrentAutomationGroupMembers(
    [initialDrugCodes[1], additionalDrugCode],
    initialDrugCodes[0]
  );
});
