class drugGroupingActions {
  getTestData() {
    const testData = Cypress.env("drugGrouping");

    if (!testData) {
      throw new Error("drugGrouping Cypress environment configuration is required.");
    }

    return testData;
  }

  getCurrentGroupName() {
    const groupName = Cypress.env("currentDrugGroupingName");

    if (!groupName) {
      throw new Error("A current Drug Grouping automation group has not been created.");
    }

    return groupName;
  }

  getAutomationGroupPrefix() {
    return this.getTestData().baseGroupName;
  }

  getCurrentDeleteAutomationGroupName() {
    const groupName = Cypress.env("currentDeleteAutomationGroupName");

    if (!groupName) {
      throw new Error("A disposable automation Drug Grouping name has not been created.");
    }

    return groupName;
  }

  getCurrentDuplicateAutomationGroupName() {
    const groupName = Cypress.env("currentDuplicateAutomationGroupName");

    if (!groupName) {
      throw new Error("An existing automation Drug Grouping name has not been selected.");
    }

    return groupName;
  }

  openDrugGroupingPage() {
    cy.visit("/grouping/drug");

    return this;
  }

  selectCustomGroupsTab() {
    cy.findByTestId("grouping-tab-custom").click();

    return this;
  }

  selectMedicalGroupsTab() {
    cy.findByTestId("grouping-tab-medical").click();

    return this;
  }

  searchGroups(groupName) {
    cy.findByTestId("grouping-search-input")
      .clear()
      .type(groupName);

    return this;
  }

  searchForExistingGroup() {
    this.searchGroups(this.getTestData().existingGroupName);

    return this;
  }

  searchForNonExistingGroup() {
    this.searchGroups(this.getTestData().nonExistingGroupName);

    return this;
  }

  searchForAutomationGroups() {
    this.searchGroups(this.getAutomationGroupPrefix());

    return this;
  }

  filterCustomGroupsByStatus(status) {
    const filterTestIds = {
      Active: "grouping-status-filter-active",
      Inactive: "grouping-status-filter-inactive",
    };
    const filterTestId = filterTestIds[status];

    if (!filterTestId) {
      throw new Error(`Unsupported Custom Group status filter: ${status}`);
    }

    this.selectCustomGroupsTab();
    cy.findByTestId("grouping-search-input").clear();
    cy.findByTestId(filterTestId).click();

    return this;
  }

  prepareDisposableAutomationGroupName() {
    Cypress.env(
      "currentDeleteAutomationGroupName",
      `${this.getAutomationGroupPrefix()} Delete ${Date.now()}`
    );

    return this;
  }

  createDisposableAutomationGroup() {
    const { initialDrugCodes, initialDescription } = this.getTestData();

    this.openNewCustomGroupForm();
    this.typeGroupName(this.getCurrentDeleteAutomationGroupName());
    this.typeGroupDescription(initialDescription);
    initialDrugCodes.forEach((code) => {
      this.searchDrugCode(code);
      this.selectDrugCode(code);
    });
    this.clickSaveGroup();

    return this;
  }

  searchForDisposableAutomationGroup() {
    this.searchGroups(this.getCurrentDeleteAutomationGroupName());

    return this;
  }

  openDeleteForDisposableAutomationGroup() {
    const groupName = this.getCurrentDeleteAutomationGroupName();

    if (!groupName.startsWith(this.getAutomationGroupPrefix())) {
      throw new Error("Refusing to delete a group that is not owned by automation.");
    }

    cy.get('[data-testid^="group-row-"][data-group-name][data-group-kind="custom"]')
      .filter(`[data-group-name="${groupName}"]`)
      .should("have.length", 1)
      .find('[data-testid="group-row-delete-btn"]')
      .click();

    return this;
  }

  cancelCustomGroupDelete() {
    cy.findByTestId("group-delete-cancel-btn").click();

    return this;
  }

  confirmCustomGroupDelete() {
    cy.findByTestId("group-delete-confirm-btn").click();

    return this;
  }

  captureVisibleAutomationGroupNameForDuplicate() {
    const prefix = this.getAutomationGroupPrefix();

    cy.get('[data-testid^="group-row-"][data-group-name][data-group-kind="custom"]')
      .filter(`[data-group-name^="${prefix}"]`)
      .first()
      .invoke("attr", "data-group-name")
      .then((groupName) => {
        if (!groupName) {
          throw new Error("An automation Custom Group is required for duplicate-name validation.");
        }

        Cypress.env("currentDuplicateAutomationGroupName", groupName);
      });

    return this;
  }

  typeCurrentDuplicateAutomationGroupName() {
    cy.then(() => {
      return cy.findByTestId("group-form-name-input")
        .clear()
        .type(this.getCurrentDuplicateAutomationGroupName());
    });

    return this;
  }

  searchForCurrentDuplicateAutomationGroup() {
    cy.then(() => {
      return cy.findByTestId("grouping-search-input")
        .clear()
        .type(this.getCurrentDuplicateAutomationGroupName());
    });

    return this;
  }

  toggleVisibleAutomationGroupStatuses() {
    const prefix = this.getAutomationGroupPrefix();
    const processedRowTestIds = new Set();

    Cypress.env("toggledAutomationGroupStatuses", []);

    const toggleCurrentPage = () => {
      return cy.get('[data-testid^="group-row-"][data-group-name][data-group-kind="custom"]')
        .filter(`[data-group-name^="${prefix}"]`)
        .each(($row) => {
          const rowTestId = $row.attr("data-testid");

          if (processedRowTestIds.has(rowTestId)) {
            return;
          }

          const currentStatus = $row.attr("data-status");
          const expectedStatus = currentStatus === "active" ? "inactive" : "active";

          if (!rowTestId || !["active", "inactive"].includes(currentStatus)) {
            throw new Error("Automation Custom Group row has an unsupported status.");
          }

          processedRowTestIds.add(rowTestId);
          Cypress.env("toggledAutomationGroupStatuses", [
            ...Cypress.env("toggledAutomationGroupStatuses"),
            { rowTestId, expectedStatus },
          ]);

          return cy.findByTestId(rowTestId)
            .find('[data-testid="group-row-status-toggle"]')
            .click()
            .then(() => {
              return cy.findByTestId(rowTestId)
                .should("have.attr", "data-status", expectedStatus)
                .find('[data-testid="group-row-status-label"]')
                .should("contain.text", expectedStatus === "active" ? "Active" : "Inactive");
            });
        })
        .then(() => {
          return cy.findByTestId("grouping-pagination")
            .invoke("attr", "data-page")
            .then(Number)
            .then((currentPage) => {
              return cy.findByTestId("grouping-pagination-next-btn").then(($nextButton) => {
                if ($nextButton.is(":disabled")) {
                  return undefined;
                }

                return cy.wrap($nextButton)
                  .click()
                  .then(() => {
                    return cy.findByTestId("grouping-pagination")
                      .should("have.attr", "data-page", String(currentPage + 1));
                  })
                  .then(toggleCurrentPage);
              });
            });
        });
    };

    const moveToFirstPage = () => {
      return cy.findByTestId("grouping-pagination-prev-btn").then(($previousButton) => {
        if ($previousButton.is(":disabled")) {
          return undefined;
        }

        return cy.wrap($previousButton).click().then(moveToFirstPage);
      });
    };

    moveToFirstPage().then(toggleCurrentPage);

    return this;
  }

  openExistingGroupView() {
    const groupName = this.getTestData().existingGroupName;

    this.searchGroups(groupName);
    cy.get('[data-testid^="group-row-"][data-group-name]')
      .filter(`[data-group-name="${groupName}"]`)
      .find('[data-testid="group-row-view-btn"]')
      .click();

    return this;
  }

  openNewCustomGroupForm() {
    cy.findByTestId("grouping-new-group-btn").click();

    return this;
  }

  cancelGroupForm() {
    cy.findByTestId("group-form-cancel-btn").click();

    return this;
  }

  typeGroupName(groupName) {
    cy.findByTestId("group-form-name-input")
      .clear()
      .type(groupName);

    return this;
  }

  typeGroupDescription(description) {
    cy.findByTestId("group-form-description-input")
      .clear()
      .type(description);

    return this;
  }

  clickSaveGroup() {
    cy.findByTestId("group-form-save-btn").click();

    return this;
  }

  searchDrugCode(code) {
    cy.findByTestId("group-form-members-code-search-input")
      .clear()
      .type(code);

    return this;
  }

  selectDrugCode(code) {
    cy.findByTestId("group-form-members-code-option")
      .filter(`[data-code="${code}"]`)
      .click();

    return this;
  }

  removeDrugCode(code) {
    cy.findByTestId("group-form-members-chip")
      .filter(`[data-label*="${code}"]`)
      .find('[data-testid="group-form-members-chip-remove-btn"]')
      .click();

    return this;
  }

  prepareNextAutomationGroupName() {
    const baseGroupName = this.getTestData().baseGroupName;

    this.searchGroups(baseGroupName);

    cy.window()
      .then((window) => {
        const accessToken = window.localStorage.getItem("pharma_access");

        if (!accessToken) {
          throw new Error("Authenticated access token is required to generate the group name.");
        }

        return cy.request({
          url: `/api/v1/groups?kind=custom&codeType=drug&q=${encodeURIComponent(baseGroupName)}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then(({ body }) => {
        const existingNames = body.data.map((group) => group.name);
        let suffix = 0;
        let nextGroupName = baseGroupName;

        while (existingNames.includes(nextGroupName)) {
          suffix += 1;
          nextGroupName = `${baseGroupName} ${suffix}`;
        }

        Cypress.env("currentDrugGroupingName", nextGroupName);
      });

    return this;
  }

  typeCurrentAutomationGroupName() {
    this.typeGroupName(this.getCurrentGroupName());

    return this;
  }

  createCurrentAutomationGroup() {
    const { initialDrugCodes, initialDescription } = this.getTestData();

    this.openNewCustomGroupForm();
    this.typeCurrentAutomationGroupName();
    this.typeGroupDescription(initialDescription);
    initialDrugCodes.forEach((code) => {
      this.searchDrugCode(code);
      this.selectDrugCode(code);
    });
    this.clickSaveGroup();

    return this;
  }

  searchForCurrentAutomationGroup() {
    this.searchGroups(this.getCurrentGroupName());

    return this;
  }

  openCurrentAutomationGroupView() {
    const groupName = this.getCurrentGroupName();

    cy.get('[data-testid^="group-row-"][data-group-name]')
      .filter(`[data-group-name="${groupName}"]`)
      .find('[data-testid="group-row-view-btn"]')
      .click();

    return this;
  }

  openCurrentAutomationGroupForEdit() {
    this.searchForCurrentAutomationGroup();
    this.openCurrentAutomationGroupView();
    cy.findByTestId("group-view-edit-btn").click();

    return this;
  }

  updateCurrentAutomationGroupDescription() {
    this.typeGroupDescription(this.getTestData().updatedDescription);
    this.clickSaveGroup();

    return this;
  }

  addAndRemoveDrugCodesDuringEdit() {
    const { initialDrugCodes, additionalDrugCode } = this.getTestData();

    this.searchDrugCode(additionalDrugCode);
    this.selectDrugCode(additionalDrugCode);
    this.removeDrugCode(initialDrugCodes[0]);
    this.clickSaveGroup();

    return this;
  }
}

export default drugGroupingActions;
