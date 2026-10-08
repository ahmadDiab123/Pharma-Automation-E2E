class drugGroupingAssertions {
  getTestData() {
    return Cypress.env("drugGrouping");
  }

  checkDrugGroupingPageIsVisible() {
    cy.findByTestId("page-grouping-drug").should("be.visible");
    cy.findByTestId("grouping-table").should("be.visible");

    return this;
  }

  checkCustomGroupsTabIsActive() {
    cy.findByTestId("grouping-tab-custom")
      .should("be.visible")
      .and("have.attr", "data-active", "true");

    return this;
  }

  checkMedicalGroupsTabIsActive() {
    cy.findByTestId("grouping-tab-medical")
      .should("be.visible")
      .and("have.attr", "data-active", "true");

    return this;
  }

  checkExistingGroupSearchResult() {
    cy.findByTestId("group-row-name-btn")
      .should("contain.text", this.getTestData().existingGroupName);

    return this;
  }

  checkNoGroupsAreFound() {
    cy.findByTestId("grouping-empty").should("be.visible");

    return this;
  }

  checkAutomationCustomGroupsAreDisplayed() {
    const prefix = this.getTestData().baseGroupName;

    cy.get('[data-testid^="group-row-"][data-group-name][data-group-kind="custom"]')
      .filter(`[data-group-name^="${prefix}"]`)
      .should("have.length.at.least", 1);

    return this;
  }

  checkAllCustomGroupsHaveStatus(status) {
    const expectedStatus = status.toLowerCase();
    const expectedLabel = status;

    const checkCurrentPage = () => {
      return cy.get('[data-testid^="group-row-"][data-group-name][data-group-kind="custom"]')
        .should("have.length.at.least", 1)
        .each(($row) => {
          return cy.wrap($row)
            .should("have.attr", "data-status", expectedStatus)
            .find('[data-testid="group-row-status-label"]')
            .should("contain.text", expectedLabel);
        })
        .then(() => {
          return cy.findByTestId("grouping-pagination-next-btn").then(($nextButton) => {
            if ($nextButton.is(":disabled")) {
              return undefined;
            }

            return cy.findByTestId("grouping-pagination")
              .invoke("attr", "data-page")
              .then(Number)
              .then((currentPage) => {
                return cy.wrap($nextButton)
                  .click()
                  .then(() => {
                    return cy.findByTestId("grouping-pagination")
                      .should("have.attr", "data-page", String(currentPage + 1));
                  })
                  .then(checkCurrentPage);
              });
          });
        });
    };

    cy.findByTestId("grouping-status-filter")
      .should("have.attr", "data-value", expectedStatus)
      .find(`[data-testid="grouping-status-filter-${expectedStatus}"]`)
      .should("have.attr", "data-active", "true")
      .and("have.attr", "aria-pressed", "true");
    checkCurrentPage();

    return this;
  }

  checkDisposableAutomationGroupExists() {
    const groupName = Cypress.env("currentDeleteAutomationGroupName");

    cy.get('[data-testid^="group-row-"][data-group-name][data-group-kind="custom"]')
      .filter(`[data-group-name="${groupName}"]`)
      .should("have.length", 1);

    return this;
  }

  checkCustomGroupDeleteConfirmationIsVisible() {
    const groupName = Cypress.env("currentDeleteAutomationGroupName");

    cy.findByTestId("group-delete-modal").should("be.visible");
    cy.findByTestId("group-delete-modal-title")
      .should("be.visible")
      .and("contain.text", groupName);

    return this;
  }

  checkCustomGroupDeleteConfirmationIsClosed() {
    cy.get("[data-testid=group-delete-modal]").should("not.exist");

    return this;
  }

  checkDisposableAutomationGroupIsDeleted() {
    const groupName = Cypress.env("currentDeleteAutomationGroupName");

    cy.findByTestId("grouping-table").should(($table) => {
      expect(
        $table.find(
          `[data-testid^="group-row-"][data-group-name="${groupName}"][data-group-kind="custom"]`
        )
      ).to.have.length(0);
    });
    cy.findByTestId("grouping-empty").should("be.visible");

    return this;
  }

  checkVisibleAutomationGroupStatusesWereToggled() {
    cy.then(() => {
      const expectedStatuses = Cypress.env("toggledAutomationGroupStatuses");

      expect(expectedStatuses, "toggled automation Custom Groups").to.have.length.at.least(1);
      expect(new Set(expectedStatuses.map(({ rowTestId }) => rowTestId))).to.have.length(
        expectedStatuses.length
      );
    });

    return this;
  }

  checkExistingGroupDetailsAreVisible() {
    cy.findByTestId("group-view-drawer").should("be.visible");
    cy.findByTestId("group-view-title")
      .should("contain.text", this.getTestData().existingGroupName);
    cy.findByTestId("group-view-member-count")
      .invoke("attr", "data-count")
      .then(Number)
      .should("be.greaterThan", 0);
    cy.findByTestId("group-view-code-row").should("have.length.at.least", 1);

    return this;
  }

  checkTableRowStatusCodeCountAndPagination() {
    cy.get('[data-testid^="group-row-"][data-group-name]')
      .first()
      .should("have.attr", "data-status");
    cy.findByTestId("group-row-code-count")
      .first()
      .invoke("text")
      .then(Number)
      .should("be.at.least", 0);
    cy.findByTestId("grouping-pagination")
      .scrollIntoView()
      .should("be.visible")
      .invoke("attr", "data-page-count")
      .then(Number)
      .should("be.greaterThan", 1);
    cy.findByTestId("grouping-pagination-next-btn").should("be.enabled");

    return this;
  }

  checkGroupFormIsVisible() {
    cy.findByTestId("group-form-drawer").should("be.visible");
    cy.findByTestId("group-form-name-input").should("be.visible");

    return this;
  }

  checkGroupFormIsClosed() {
    cy.findByTestId("group-form-drawer").should("not.exist");

    return this;
  }

  checkGroupNameMinimumLengthError() {
    cy.findByTestId("group-form-error")
      .should("be.visible")
      .and("contain.text", "Group name must be at least 2 characters");

    return this;
  }

  checkMembersRequiredError() {
    cy.findByTestId("group-form-error")
      .should("be.visible")
      .and("contain.text", "At least one code or active group is required to add this group.");

    return this;
  }

  checkDuplicateGroupNameIsRejected() {
    cy.findByTestId("group-form-error").should("be.visible");

    return this;
  }

  checkOnlyOneCurrentDuplicateAutomationGroupExists() {
    cy.then(() => {
      const groupName = Cypress.env("currentDuplicateAutomationGroupName");

      return cy.get('[data-testid^="group-row-"][data-group-name][data-group-kind="custom"]')
        .filter(`[data-group-name="${groupName}"]`)
        .should("have.length", 1);
    });

    return this;
  }

  checkDrugCodeIsSelected(code) {
    cy.findByTestId("group-form-members-chip")
      .filter(`[data-label*="${code}"]`)
      .should("be.visible");

    return this;
  }

  checkDrugCodeIsRemoved(code) {
    cy.findByTestId("group-form-members")
      .should(($members) => {
        expect(
          $members.find(
            `[data-testid="group-form-members-chip"][data-label*="${code}"]`
          )
        ).to.have.length(0);
      });
    cy.findByTestId("group-form-members-empty").should("be.visible");

    return this;
  }

  checkNoDrugResultsAreFound() {
    cy.findByTestId("group-form-members-code-no-results").should("be.visible");

    return this;
  }

  checkCurrentAutomationGroupExists() {
    cy.then(() => {
      const groupName = Cypress.env("currentDrugGroupingName");

      cy.get('[data-testid^="group-row-"][data-group-name]')
        .filter(`[data-group-name="${groupName}"]`)
        .should("have.length", 1);
    });

    return this;
  }

  checkCurrentAutomationGroupDetails(description) {
    cy.then(() => {
      cy.findByTestId("group-view-title")
        .should("contain.text", Cypress.env("currentDrugGroupingName"));
    });
    cy.findByTestId("group-view-description")
      .should("contain.text", description);

    return this;
  }

  checkCurrentAutomationGroupMembers(expectedCodes, removedCode) {
    expectedCodes.forEach((code) => {
      cy.findByTestId("group-view-code-row")
        .filter(`[data-code="${code}"]`)
        .should("be.visible");
    });

    cy.findByTestId("group-view-code-row")
      .filter(`[data-code="${removedCode}"]`)
      .should("not.exist");

    return this;
  }
}

export default drugGroupingAssertions;
