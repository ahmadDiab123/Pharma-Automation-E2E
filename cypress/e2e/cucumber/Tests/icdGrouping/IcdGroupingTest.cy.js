import { Given, When, Then, Before, After } from "cypress-cucumber-preprocessor/steps";
import loginTestActions from "../../../../pageObjects/loginTest/Actions.cy";
import loginTestAssertions from "../../../../pageObjects/loginTest/Assertions.cy";
import icdGroupingActions from "../../../../pageObjects/icdGrouping/Actions.cy";
import icdGroupingAssertions from "../../../../pageObjects/icdGrouping/Assertions.cy";
import icdGroupingTestData from "../../../../pageObjects/icdGrouping/TestData.cy";

const loginAction = new loginTestActions();
const loginAssertion = new loginTestAssertions();
const actions = new icdGroupingActions();
const assertions = new icdGroupingAssertions();
const testData = new icdGroupingTestData();

Before(() => { actions.protectApplicationData(); });
After(() => { assertions.checkNoDataWasSaved(); });

Given("I am logged in as the system administrator for ICD Grouping", () => {
  loginAction.openLoginPage().loginWithAccount("sysadmin");
  loginAssertion.checkUserIsOnDrugGroupingPage();
});

Given("I navigate to ICD Grouping", () => {
  actions.openIcdGroupingPage();
});

Then("the ICD Grouping page should be ready on Custom Groups", () => {
  assertions.checkPageIsReady();
});

Given("the existing ICD Custom Group and its known member are verified", () => {
  testData.verifyExistingGroup();
});

When("I search ICD Custom Groups by the existing group name", () => { actions.searchExistingName(); });
When("I search ICD Custom Groups by the known ICD member code", () => { actions.searchKnownMemberCode(); });
When("I search ICD Custom Groups for status text {string}", (status) => { actions.searchGroups(status); });
When("I search ICD Custom Groups with a unique nonmatching query", () => { actions.searchNonExistingGroup(); });
When("I clear the ICD Grouping search", () => { actions.clearSearch(); });
When("I open the existing ICD Custom Group from the current results", () => { actions.openExistingGroupView(); });
When("I close the ICD group View drawer", () => { actions.closeGroupView(); });
When("I select the ICD Medical Groups tab", () => { actions.selectMedicalTab(); });
When("I select the ICD Custom Groups tab", () => { actions.selectCustomTab(); });
When("I open the ICD New Custom Group form", () => { actions.openNewGroupForm(); });
When("I enter temporary ICD group details", () => { actions.enterTemporaryDetails(); });
When("I enter the ICD Group Name {string}", (name) => { actions.typeGroupName(name); });
When("I trigger validation on the incomplete ICD group form", () => { actions.triggerIncompleteFormValidation(); });
When("I cancel the ICD group form", () => { actions.cancelGroupForm(); });
When("I close the ICD group form", () => { actions.closeGroupForm(); });

Then("the ICD name search should show the intended group and matching results", () => { assertions.checkNameSearchResults(); });
Then("the ICD code search should show groups containing matching codes", () => { assertions.checkCodeSearchResults(); });
Then("the ICD status text search should show matching statuses with the status filter unchanged", () => { assertions.checkStatusSearchResults(); });
Then("the ICD Custom Group search should be empty", () => { assertions.checkSearchIsEmpty(); });
Then("the normal ICD Custom Group list should return", () => { assertions.checkNormalCustomListReturns(); });
Then("the known ICD member should be visible in the group", () => { assertions.checkKnownMemberIsVisible(); });
Then("the ICD group details and members should match the verified existing group", () => { assertions.checkExistingGroupDetails(); });
Then("the ICD group View drawer should be closed", () => { assertions.checkGroupViewIsClosed(); });
Then("the ICD Medical tab should be active with its current content or empty state", () => { assertions.checkMedicalTabContent(); });
Then("the ICD create form fields and member controls should be visible", () => { assertions.checkCreateFormIsVisible(); });
Then("the ICD create form should be reset", () => { assertions.checkCreateFormIsReset(); });
Then("the ICD group form should have no selected members", () => { assertions.checkNoMembersSelected(); });
Then("the ICD group form should be closed", () => { assertions.checkGroupFormIsClosed(); });
Then("the ICD Group Name minimum length error should be visible", () => { assertions.checkNameMinimumLengthError(); });
Then("the ICD required member error should be visible", () => { assertions.checkRequiredMemberError(); });
Then("no ICD application data write should have been attempted", () => { assertions.checkNoDataWasSaved(); });

Given("an available diagnosis reference and its description are discovered", () => { testData.discoverDiagnosisReference(); });
Given("an active diagnosis Custom Group is discovered for nesting", () => { testData.discoverActiveNestedGroup(); });
Given("an independent ICD Edit baseline with a direct diagnosis member is captured", () => { testData.captureExistingGroupBaseline("Edit"); });
Given("an independent ICD Delete target baseline is captured", () => { testData.captureExistingGroupBaseline("Delete"); });

When("I select the ICD Code members tab", () => { actions.selectMemberTab("code"); });
When("I select the ICD Custom Group members tab", () => { actions.selectMemberTab("custom"); });
When("I search ICD members by the discovered code", () => { actions.searchDiscoveredReference("code"); });
When("I search ICD members by the discovered description", () => { actions.searchDiscoveredReference("description"); });
When("I clear the ICD reference search", () => { actions.clearReferenceSearch(); });
When("I search ICD members with a unique nonmatching reference query", () => { actions.searchNonExistingReference(); });
When("I toggle the discovered ICD code option", () => { actions.toggleDiscoveredCodeOption(); });
When("I remove the discovered ICD code chip", () => { actions.removeDiscoveredCodeChip(); });
When("I search for the discovered nested ICD Custom Group", () => { actions.searchNestedGroup(); });
When("I select the discovered nested ICD Custom Group", () => { actions.selectNestedGroup(); });
When("I remove the discovered nested ICD Custom Group chip", () => { actions.removeNestedGroupChip(); });
When("I search for the captured ICD {string} group", (purpose) => { actions.searchCapturedGroup(purpose); });
When("I open the captured ICD {string} group View drawer", (purpose) => { actions.openCapturedGroupView(purpose); });
When("I open ICD Edit from the View drawer", () => { actions.openEditFromView(); });
When("I modify the ICD Edit description without saving", () => { actions.modifyUnsavedEditDescription(); });
When("I remove a direct ICD member from the unsaved Edit form", () => { actions.removeUnsavedEditMember(); });
When("I dismiss the ICD Edit form using {string}", (action) => { actions.dismissEditForm(action); });
When("I filter ICD Custom Groups by {string} status", (status) => { actions.filterCustomGroups(status); });
When("I restore the ICD Custom Group status filter to All", () => { actions.filterCustomGroups("All"); });
When("I open Delete confirmation for the exact captured ICD group", () => { actions.openCapturedDeleteConfirmation(); });
When("I cancel the ICD Delete confirmation", () => { actions.cancelDeleteConfirmation(); });

Then("the discovered ICD code and description should be returned", () => { assertions.checkDiscoveredReferenceResults(); });
Then("exactly one discovered ICD member should be selected", () => { assertions.checkDiscoveredCodeIsSelected(); });
Then("the discovered ICD code should be unselected with no chips", () => { assertions.checkDiscoveredCodeIsUnselected(); });
Then("the ICD reference search and its results should be cleared", () => { assertions.checkReferenceSearchIsCleared(); });
Then("no matching diagnosis references should be returned", () => { assertions.checkNoReferenceResults(); });
Then("the exact discovered nested ICD Custom Group option should be shown", () => { assertions.checkNestedGroupOption(); });
Then("exactly one nested ICD Custom Group should be selected", () => { assertions.checkNestedGroupIsSelected(); });
Then("the nested ICD Custom Group should be unselected with no chips", () => { assertions.checkNestedGroupIsRemoved(); });
Then("the captured ICD {string} group should appear in search", (purpose) => { assertions.checkCapturedGroupSearch(purpose); });
Then("the captured ICD {string} group details should match its baseline", (purpose) => { assertions.checkCapturedGroupView(purpose); });
Then("the ICD Edit form should be prepopulated from its baseline", () => { assertions.checkEditPrepopulation(); });
Then("the temporary ICD Edit changes should be local to the form", () => { assertions.checkUnsavedEditChanges(); });
Then("the captured ICD {string} group should remain unchanged in storage", (purpose) => { testData.verifyCapturedGroupUnchanged(purpose); });
Then("the ICD status filter and its results should match {string}", (status) => { assertions.checkStatusFilterResults(status); });
Then("the ICD All filter should restore the unfiltered request and list", () => { assertions.checkAllFilterRestored(); });
Then("the ICD Delete confirmation should identify the target and explain soft deletion", () => { assertions.checkDeleteConfirmation(); });
Then("the ICD Delete modal should close and the same group row should remain", () => { assertions.checkDeleteWasCanceled(); });
