# AGENT.md
# Pharma Automation - QA Automation Engineering Contract

This file defines the mandatory conventions, architecture, coding rules,
test-data strategy, and execution standards for this Cypress automation project.

All AI coding agents (including Codex) MUST read and follow this file
before modifying or creating automation code.

---

# 1. Project Overview

This is an E2E QA Automation project for the Pharma system.

Technology stack:

- Cypress
- JavaScript
- Cucumber / Gherkin
- cypress-cucumber-preprocessor v4.x
- Page Object Model (POM)
- Mochawesome reporting

Application base URL is configured through Cypress configuration.

Current Drug Grouping route:

/grouping/drug

---

# 2. Project Architecture

Automation follows this structure:

cypress/
├── e2e/
│   └── cucumber/
│       └── Tests/
│           ├── <feature>.feature
│           ├── <feature>/
│           │   └── <FeatureName>Test.cy.js
│           └── ...
│
├── pageObjects/
│   └── <feature>/
│       ├── Actions.cy.js
│       └── Assertions.cy.js
│
└── ...

Examples:

cypress/e2e/cucumber/Tests/drugGrouping.feature

cypress/e2e/cucumber/Tests/drugGrouping/
└── DrugGroupingTest.cy.js

cypress/pageObjects/drugGrouping/
├── Actions.cy.js
└── Assertions.cy.js

---

# 3. CRITICAL: Cucumber Step Definition Location

The project uses:

nonGlobalStepDefinitions: true

Therefore, step-definition files are resolved relative to the
feature file's folder/name according to the project's configured glob.

For:

cypress/e2e/cucumber/Tests/drugGrouping.feature

the step-definition implementation MUST be located under:

cypress/e2e/cucumber/Tests/drugGrouping/

Example:

cypress/e2e/cucumber/Tests/drugGrouping/DrugGroupingTest.cy.js

DO NOT place the implementation under:

cypress/e2e/cucumber/Tests/DrugGroupingTest/

unless the project configuration explicitly supports that location.

Before creating or moving step-definition files:

1. Inspect the Cucumber configuration.
2. Confirm the configured feature/step-definition glob.
3. Keep the implementation aligned with that configuration.

Do not rely on Windows case-insensitivity as a convention.

---

# 4. Page Object Model

Page Objects are divided into two files.

## Actions.cy.js

Actions contain UI interactions only.

Examples:

- visit page
- click
- type
- clear
- select
- search
- open drawer
- submit form
- remove member
- navigate

Example:

class drugGroupingActions {
    openDrugGroupingPage() {
        cy.visit("/grouping/drug");
        return this;
    }

    clickSaveGroup() {
        cy.findByTestId("group-form-save-btn").click();
        return this;
    }
}

export default drugGroupingActions;

---

## Assertions.cy.js

Assertions contain verification logic only.

Examples:

- element visible
- element exists
- text validation
- URL validation
- selected member verification
- status verification
- table verification
- error verification

Do not put business interactions inside Assertions classes.

---

# 5. POM Method Return Convention

Existing project convention uses:

return this;

for POM methods.

Keep this convention.

However, understand the difference between:

- Cypress command chains
- synchronous JavaScript values
- Cypress callbacks

---

# 6. CRITICAL CYPRESS ASYNC RULE

NEVER do this:

cy.then(() => this.somePomMethod());

if `somePomMethod()` queues Cypress commands and returns `this`.

Example of BAD code:

typeCurrentAutomationGroupName() {
    cy.then(() => this.typeGroupName(this.getCurrentGroupName()));
    return this;
}

This can cause:

"CypressError: cy.then() failed because you are mixing up async and sync code."

Why?

Because:

this.typeGroupName(...)

queues Cypress commands but returns a normal JavaScript object (`this`).

The callback therefore returns a synchronous object while Cypress commands
were queued inside the callback.

---

# 7. Correct POM Async Pattern

If the value is synchronously available, call the POM method directly.

GOOD:

typeCurrentAutomationGroupName() {
    this.typeGroupName(this.getCurrentGroupName());
    return this;
}

GOOD:

searchForCurrentAutomationGroup() {
    this.searchGroups(this.getCurrentGroupName());
    return this;
}

GOOD:

openCurrentAutomationGroupView() {
    const groupName = this.getCurrentGroupName();

    cy.get('[data-testid^="group-row-"][data-group-name]')
        .filter(`[data-group-name="${groupName}"]`)
        .find('[data-testid="group-row-view-btn"]')
        .click();

    return this;
}

---

# 8. When cy.then() IS Allowed

cy.then() is allowed when it is genuinely needed to:

- read a Cypress value
- transform a Cypress value
- perform logic based on a resolved Cypress value
- return another Cypress chain

Example:

cy.get('[data-testid="grouping-pagination"]')
    .invoke("attr", "data-page-count")
    .then((pageCount) => {
        expect(Number(pageCount)).to.be.greaterThan(1);
    });

Another valid pattern:

cy.window().then((win) => {
    return cy.request({
        method: "GET",
        url: "/api/v1/groups"
    });
});

Do NOT use cy.then() simply to execute another POM method.

---

# 9. Selectors

Preferred selector:

cy.findByTestId("value")

when the project custom command supports it.

Existing project behavior should be respected.

Known important selectors include:

page:

page-grouping-drug

tabs:

grouping-tab-custom
grouping-tab-medical

actions:

grouping-new-group-btn
grouping-search-input
grouping-download-btn
grouping-upload-btn

table:

grouping-table
grouping-loading
grouping-empty

pagination:

grouping-pagination
grouping-pagination-prev-btn
grouping-pagination-next-btn

form:

group-form-drawer
group-form-name-input
group-form-description-input
group-form-error
group-form-save-btn
group-form-cancel-btn
group-form-close-btn

members:

group-form-members
group-form-members-code-search-input
group-form-members-code-option
group-form-members-code-option-code
group-form-members-code-option-primary
group-form-members-code-no-results
group-form-members-chip
group-form-members-chip-remove-btn
group-form-members-empty

view:

group-view-drawer
group-view-title
group-view-edit-btn
group-view-member-count
group-view-code-row
group-view-nested-row

---

# 10. CRITICAL: Negative Existence Assertions

The project's custom findByTestId command behaves like cy.get().

Therefore:

DO NOT use:

cy.findByTestId("group-form-members-chip")
    .filter(...)
    .should("not.exist");

when the entire collection may legitimately contain zero elements.

Why?

findByTestId may fail immediately when zero elements are found,
before .should("not.exist") can perform the assertion.

Use cy.get() with a selector when zero elements are an expected state.

GOOD:

cy.get('[data-testid="group-form-members-chip"]')
    .filter(`[data-label*="${code}"]`)
    .should("not.exist");

Then separately verify the empty state:

cy.findByTestId("group-form-members-empty")
    .should("be.visible");

This rule applies to all negative existence checks where zero
elements are a valid expected result.

---

# 11. Visibility vs Existence

Do not blindly replace:

.should("be.visible")

with:

.should("exist")

just to make a test pass.

If an element exists but Cypress considers it not visible because of:

- overflow
- clipping
- parent layout
- scrolling
- hidden containers
- CSS positioning

first inspect the actual UI/DOM behavior.

For example, pagination currently uses:

grouping-pagination

If Cypress reports that the element exists but is clipped by a parent,
DO NOT immediately:

- remove the visibility assertion
- add force: true
- weaken the assertion to exist

Instead determine whether:

1. pagination is actually expected to be visible to the user
2. the container requires scrolling
3. the element is intentionally clipped
4. another visible pagination element should be asserted
5. the selector targets the correct element

Only then modify the assertion.

---

# 12. Do Not Use force:true as a First Fix

Avoid:

.click({ force: true })

.type("...", { force: true })

unless there is a documented UI reason.

force:true can hide real UI defects.

First understand why Cypress considers the element not actionable.

---

# 13. Gherkin Standards

Feature files must remain readable from a QA/business perspective.

Use:

Feature
Scenario
Given
When
Then
And

Example:

Scenario: Search for an existing Custom Group
    Given I am logged in as the system administrator
    And I navigate to Drug Grouping
    When I search for an existing Custom Group
    Then the matching Custom Group should be displayed

Do not put implementation details such as:

- CSS selectors
- API endpoints
- Cypress commands
- JavaScript implementation details

inside Gherkin.

---

# 14. Step Definitions Must Stay Thin

Step definitions should delegate to Page Objects.

GOOD:

When("I search for an existing Custom Group", () => {
    drugGroupingActions.searchExistingCustomGroup();
});

Then("the matching Custom Group should be displayed", () => {
    drugGroupingAssertions.checkExistingCustomGroupDisplayed();
});

Avoid putting large Cypress workflows directly into step definitions.

---

# 15. Login

Login automation already exists.

Use the existing Login POM and conventions.

Do not recreate login logic inside every feature.

For Drug Grouping tests, the current primary automation role is:

system administrator

Existing Login POM methods should be reused.

Do not modify Login automation unless the requested task genuinely requires it.

---

# 16. Drug Grouping Scope

Current implemented scope:

DG-01
DG-02
DG-03
DG-04
DG-05
DG-06
DG-08
DG-09
DG-10
DG-11
DG-12
DG-13
DG-14
DG-15

DG-07 is intentionally skipped for now because Medical Groups
currently have no records and the empty-state scenario is data-dependent.

Pending future scenarios include:

DG-16 nested group
DG-17 activate/deactivate
DG-18 dependency warning
DG-19 download
DG-20 upload dry-run
DG-21 import apply
DG-23 duplicate group name
DG-24 role permissions

Delete is currently NOT supported by the application.

Do not invent a delete workflow.

When Delete is implemented in the application, add the relevant
automation scenarios and cleanup strategy.

---

# 17. Drug Grouping Route

Current route:

/grouping/drug

Prefer direct relative navigation through:

cy.visit("/grouping/drug");

when appropriate.

Do not invent sidebar selectors.

If sidebar navigation is automated, first verify that a stable
data-testid exists.

---

# 18. Test Data Strategy

Created Custom Groups currently cannot be deleted through the UI.

Therefore DO NOT reuse the same group name across test runs.

Use sequential unique names:

QA Automation Ahmad
QA Automation Ahmad 1
QA Automation Ahmad 2
QA Automation Ahmad 3
...

The automation should determine the next unused name.

The current automation may use a read-only authenticated API lookup
to determine which name is available.

This read-only API lookup is allowed for TEST DATA DISCOVERY.

It must NOT replace the actual UI workflow being tested.

Example:

Allowed:

UI:
open New Group
type group name
select members
save

API:
read existing group names only to determine the next unique test name

Not allowed:

API:
create group
API:
edit group
API:
delete group

when the scenario is intended to test the UI workflow.

---

# 19. No Cleanup Until Delete Exists

Do NOT attempt to clean created Custom Groups through undocumented APIs.

Current strategy:

create unique sequential groups
keep them for now

When application Delete functionality is officially available:

- add Delete test scenarios
- add safe cleanup
- prevent test-data accumulation where possible

---

# 20. Current Drug Test Codes

Approved automation test drug codes:

3819-155601-0391
3819-155602-0391
6666-155604-1171
6666-155601-1171
6666-155602-1171
4955-962301-3851
0042-104305-1362
0042-104301-0491

Current basic Create scenario uses:

3819-155601-0391
3819-155602-0391

Current Edit/Add-Remove scenario uses:

6666-155604-1171

Do not randomly replace these test values without a reason.

---

# 21. Existing Group Data

A known existing Custom Group is:

Chronic Care Bundle

It was observed as inactive and containing two code members.

It may be used as READ-ONLY test data when appropriate.

Do not modify it unless a scenario explicitly requires modifying
an existing group and the test-data impact has been considered.

Never assume current record counts remain unchanged.

For example, do not hardcode:

47 Custom Groups

or:

0 Medical Groups

as permanent assertions.

Those values were discovery-time observations and can change.

---

# 22. Independent Test Scenarios

Tests should be independently executable whenever practical.

Do not assume:

Scenario B runs immediately after Scenario A.

Avoid cross-scenario state dependencies.

For CRUD scenarios:

- determine required test data
- prepare it independently
- perform the UI action
- verify the result

---

# 23. Create Group

A valid Custom Group requires:

- valid group name
- at least one member

Group Name rules currently include:

- required
- minimum 2 trimmed characters

Description is optional.

Members can include:

- drug codes
- active Medical Groups
- active Custom Groups

Do not assume a group can be created without members.

---

# 24. Edit Group

When editing a Custom Group:

- search/open the intended group
- verify the correct group is opened
- edit only the intended fields
- save
- verify the updated state

For DG-14 the current test updates the description.

For DG-15:

- add the approved additional drug code
- remove the intended initial code
- save
- verify final membership

Do not accidentally modify unrelated fields.

---

# 25. Nested Groups

Nested group support exists.

Future automation may use an existing active Custom Group as a nested member
of a newly created QA Automation group.

Do not:

- create circular references
- self-reference the group
- modify the existing source group
- assume dependency behavior without observing the application

Implement DG-16 only after the basic CRUD scenarios are stable.

---

# 26. Destructive Operations

Treat these as destructive:

- delete
- import apply
- activate/deactivate
- bulk upload
- dependency changes

Do not automate destructive actions against production-like business data
without explicit approval and controlled test data.

Import validation/dry-run is safer than Import Apply.

---

# 27. API Usage

API calls may be used for:

- read-only test-data discovery
- investigating application behavior
- understanding backend responses
- debugging automation

Do not use APIs to bypass the UI workflow being tested.

If a test scenario is intended to verify:

Create Group

the actual creation must happen through the UI.

If a read-only API lookup is used, document why it is needed.

---

# 28. Application Source Inspection

When selectors or behavior are unclear:

1. inspect the current DOM
2. inspect frontend source/bundle if needed
3. inspect network/API behavior if needed
4. confirm the actual UI behavior
5. only then implement or modify the test

Do not guess selectors.

Do not invent data-testid values.

---

# 29. Do Not Modify Application Code for Convenience

Automation should adapt to the existing application.

Do NOT modify application/frontend code merely to make Cypress easier.

If a stable test selector is genuinely missing:

1. identify the problem
2. report it
3. request/obtain approval before changing application code

Prefer existing data-testid selectors.

---

# 30. Configuration Safety

Avoid modifying:

- Cypress configuration
- Cucumber configuration
- support files
- global exception handling
- reporting configuration
- Login automation

unless the requested task genuinely requires the change.

If configuration must change:

- explain why
- make the smallest possible change
- verify existing tests are not broken

---

# 31. Global Exception Handling

Preserve the existing global exception handling.

Do not remove or weaken global error handling simply to hide
application errors during automation.

If an exception needs to be ignored:

- verify that it is a known/expected application behavior
- document the reason
- avoid broad exception suppression

---

# 32. Reporting

Mochawesome reporting is configured to output reports under:

cypress/myReport

Do not change reporting configuration unless specifically required.

---

# 33. Test Execution Requirements

After modifying automation:

1. Run syntax/static checks if applicable.
2. Run the smallest relevant Cypress scope first.
3. If it passes, run the broader related suite.
4. Inspect the actual Cypress result.
5. Report failures honestly.

Do NOT claim:

"Passed"

unless Cypress actually produced a successful result.

Do NOT infer test success from:

- code review
- syntax validation
- no visible error
- no reporter artifact
- successful file creation

A test is only considered passed when the actual Cypress execution confirms it.

---

# 34. Failure Investigation

When a test fails:

DO NOT immediately weaken the assertion.

First classify the failure:

1. Test implementation bug
2. Selector problem
3. Cypress command-chain problem
4. Timing/wait problem
5. Application behavior
6. Data/environment problem
7. Layout/visibility problem
8. Configuration/problem with Cucumber step resolution

Then fix the root cause.

---

# 35. Cypress Waiting Strategy

Prefer Cypress retryability.

Avoid unnecessary:

cy.wait(1000)

unless there is a documented reason.

Prefer:

.should(...)
.contains(...)
.findByTestId(...)
.intercept(...)
.wait("@alias")

when appropriate.

Do not add arbitrary waits just to make flaky tests pass.

---

# 36. Pagination

Pagination assertions must reflect actual UI behavior.

Known selectors:

grouping-pagination
grouping-pagination-prev-btn
grouping-pagination-next-btn

Known behavior:

- pagination is client-side
- page size is currently 10 rows

Do not hardcode exact total page count unless the test data contract guarantees it.

A good assertion is usually:

- pagination exists
- page count > 1 when enough records exist
- next button is enabled when another page exists

If visibility fails because of clipping, inspect the DOM/layout first.

---

# 37. Search

Drug Grouping search supports group name/code through:

q

Search scenarios should verify the UI result.

For no-result searches:

- do not assume a specific record count unless guaranteed
- verify the appropriate empty/no-result state

---

# 38. Selector Robustness

Prefer:

data-testid

over:

- generated CSS classes
- nth-child
- deeply nested selectors
- implementation-specific styling classes

Dynamic group rows use:

group-row-<id>

with useful attributes such as:

data-group-name
data-status
data-group-kind

Use these attributes when they provide a stable selector.

---

# 39. Code Style

Follow existing project style.

Prefer readable methods with one clear responsibility.

Good:

openNewCustomGroupForm()
typeGroupName()
typeGroupDescription()
searchDrugCode()
selectDrugCode()
removeDrugCode()
clickSaveGroup()

Avoid giant methods that perform unrelated workflows.

---

# 40. Do Not Duplicate Existing Methods

Before creating a new POM method:

1. inspect the existing Actions/Assertions files
2. reuse an existing method when possible
3. only add a new method when it represents a meaningful reusable action/assertion

Avoid duplicate methods with slightly different names.

---

# 41. Environment Variables

Credentials and test configuration belong in Cypress environment configuration.

Do not hardcode passwords inside:

- feature files
- step definitions
- Page Objects

Do not print credentials in logs.

Use the existing environment structure.

---

# 42. Scope Control

When asked to fix one test:

DO NOT refactor the whole project.

Change only what is necessary.

Avoid unrelated:

- renaming
- formatting
- architecture changes
- config changes
- application changes

Keep diffs focused.

---

# 43. Before Editing Existing Code

Always inspect the current implementation first.

Do not assume the code still matches an earlier version.

Before changing a method:

- read the current file
- understand how it is called
- check whether other scenarios depend on it
- preserve compatible behavior

---

# 44. Definition of Done

A task is complete only when:

- requested scenarios are implemented
- feature files are valid
- step definitions resolve correctly
- POM architecture is respected
- selectors are stable
- Cypress async rules are respected
- test data strategy is respected
- no unrelated files are changed unnecessarily
- actual Cypress execution has been performed
- results are reported accurately

If execution cannot be completed because of environment limitations,
state that explicitly.

---

# 45. Current Known Issues / Lessons Learned

## Issue 1 - Cucumber step not found

Symptom:

Step implementation missing for:
I am logged in as the system administrator

Root cause:

nonGlobalStepDefinitions=true requires the step-definition file to be
under the feature's matching directory.

Fix:

drugGrouping.feature
    ->
cypress/e2e/cucumber/Tests/drugGrouping/DrugGroupingTest.cy.js

---

## Issue 2 - Cypress cy.then async/sync error

Symptom:

CypressError:
cy.then() failed because you are mixing up async and sync code.

Root cause:

A POM method was called inside cy.then() while returning this.

Incorrect:

cy.then(() => this.typeGroupName(...));

Correct:

this.typeGroupName(...);

Use cy.then() only when actually handling Cypress-resolved values.

---

## Issue 3 - Negative chip assertion

Symptom:

findByTestId("group-form-members-chip") times out when there are
zero chips.

Root cause:

The custom findByTestId command behaves like cy.get() and therefore
fails immediately when no element exists.

Correct:

cy.get('[data-testid="group-form-members-chip"]')
    .filter(...)
    .should("not.exist");

Then verify:

cy.findByTestId("group-form-members-empty")
    .should("be.visible");

---

## Issue 4 - Pagination visibility

Symptom:

grouping-pagination exists but:

.should("be.visible")

fails because Cypress reports clipping by a parent.

Do NOT automatically weaken this to:

.should("exist")

Investigate the actual layout and intended user-visible behavior first.

---

# 46. AI Agent Working Rules

Before making changes:

1. Read AGENT.md.
2. Inspect relevant existing files.
3. Understand current implementation.
4. Do not assume previous generated code is correct.
5. Make the smallest safe change.
6. Run the relevant test.
7. Inspect the actual result.
8. Report exactly what passed/failed.

When fixing a failure:

- identify root cause first
- fix root cause
- avoid assertion weakening
- avoid force:true unless justified
- avoid arbitrary waits
- avoid unrelated refactoring

When uncertain:

- inspect the application/source/DOM
- inspect existing project conventions
- do not invent behavior

---

# 47. Priority Order

When rules conflict, follow this priority:

1. Application correctness
2. Existing project architecture
3. Test reliability
4. Stable selectors
5. Maintainability
6. Convenience

Never sacrifice test validity merely to make a test green.

---

# 48. Final Principle

The goal is not:

"Make Cypress pass."

The goal is:

"Create reliable, maintainable QA automation that accurately verifies
the real Pharma application behavior."

Every automation change must preserve that principle.