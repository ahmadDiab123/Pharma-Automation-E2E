import { existingGroupName, existingMemberCode } from "./TestData.cy";
import { unsavedEditDescription } from "./TestData.cy";
import { codeOption, codeChip, customGroupOption, customGroupChip, capturedGroupRow } from "./Selectors.cy";

function searchDiagnosisReferences(query) {
  cy.intercept("GET", "**/api/v1/reference/search?*", (request) => {
    const params = new URL(request.url).searchParams;
    if (params.get("type") === "diagnosis" && params.get("q") === query) {
      // Limit conditional-cache handling to this ICD reference search.
      delete request.headers["if-none-match"];
      delete request.headers["if-modified-since"];
      request.alias = "icdReferenceSearch";
    }
  });
  cy.wrap(query, { log: false }).as("icdReferenceQuery");
  return cy.findByTestId("group-form-members-code-search-input")
    .clear().type(query, { parseSpecialCharSequences: false });
}

function clickCapturedRow(group, buttonTestId) {
  const visitPage = () => {
    return cy.findByTestId("grouping-table").then(($table) => {
      const row = $table.find(capturedGroupRow(group));
      if (row.length) {
        return cy.wrap(row).find(`[data-testid="${buttonTestId}"]`).click();
      }
      return cy.findByTestId("grouping-pagination-next-btn").then(($next) => {
        if ($next.is(":disabled")) {
          throw new Error(`Captured ICD Custom Group ${group.name} (${group.id}) is missing from the list.`);
        }
        return cy.findByTestId("grouping-pagination").invoke("attr", "data-page").then((page) => {
          cy.wrap($next).click();
          return cy.findByTestId("grouping-pagination")
            .should("have.attr", "data-page", String(Number(page) + 1)).then(visitPage);
        });
      });
    });
  };
  return visitPage();
}

class icdGroupingActions {
  protectApplicationData() {
    const writes = [];
    cy.wrap(writes, { log: false }).as("icdUnexpectedWrites");
    cy.intercept({ url: "**/api/v1/**", middleware: true }, (request) => {
      const path = new URL(request.url).pathname;
      // Browser ETag revalidation can produce 304 with no intercepted body.
      // Fetch real group responses so list assertions can inspect current data.
      if (request.method === "GET" && (path === "/api/v1/groups" || path.startsWith("/api/v1/groups/"))) {
        delete request.headers["if-none-match"];
        delete request.headers["if-modified-since"];
      }
      const authentication = ["/api/v1/auth/login", "/api/v1/auth/refresh"].includes(path);
      if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && !authentication) {
        writes.push(`${request.method} ${path}`);
        request.reply({ statusCode: 405, body: { ok: false, error: {
          code: "ICD_READ_ONLY_GUARD", message: "ICD Batch 1 prohibits data mutations",
        } } });
      }
    });
    return this;
  }

  openIcdGroupingPage() {
    cy.intercept("GET", "**/api/v1/groups?*", (request) => {
      const query = new URL(request.url).searchParams;
      if (query.get("codeType") === "diagnosis" && query.get("kind") === "custom" && !query.get("q")) {
        request.alias = "icdInitialCustomGroups";
      }
    });
    cy.visit("/grouping/icd");
    cy.wait("@icdInitialCustomGroups").as("icdInitialResponse");
    return this;
  }

  searchGroups(query) {
    cy.intercept("GET", "**/api/v1/groups?*", (request) => {
      const params = new URL(request.url).searchParams;
      if (params.get("codeType") === "diagnosis" && params.get("kind") === "custom" &&
          params.get("q") === query) {
        request.alias = "icdSearchResults";
      }
    });
    cy.wrap(query, { log: false }).as("icdSearchQuery");
    cy.findByTestId("grouping-search-input").clear().type(query, { parseSpecialCharSequences: false });
    return this;
  }

  searchExistingName() {
    this.searchGroups(existingGroupName);
    return this;
  }

  searchKnownMemberCode() {
    this.searchGroups(existingMemberCode);
    return this;
  }

  searchNonExistingGroup() {
    this.searchGroups(`ICD-NO-MATCH-${Date.now()}-${Cypress._.random(100000, 999999)}`);
    return this;
  }

  clearSearch() {
    cy.findByTestId("grouping-search-input").clear();
    return this;
  }

  openExistingGroupView() {
    const openOnCurrentPage = () => {
      return cy.findByTestId("grouping-table").then(($table) => {
        const row = $table.find('[data-testid^="group-row-"][data-group-name][data-group-kind="custom"]')
          .filter(`[data-group-name="${existingGroupName}"]`);
        if (row.length) {
          return cy.wrap(row).find('[data-testid="group-row-view-btn"]').click();
        }
        return cy.findByTestId("grouping-pagination-next-btn").then(($next) => {
          if ($next.is(":disabled")) {
            throw new Error(`Required ICD Custom Group ${existingGroupName} is missing from the current results.`);
          }
          return cy.findByTestId("grouping-pagination").invoke("attr", "data-page").then((page) => {
            cy.wrap($next).click();
            return cy.findByTestId("grouping-pagination")
              .should("have.attr", "data-page", String(Number(page) + 1)).then(openOnCurrentPage);
          });
        });
      });
    };
    openOnCurrentPage();
    return this;
  }

  closeGroupView() {
    cy.findByTestId("group-view-close-btn").click();
    return this;
  }

  selectMedicalTab() {
    cy.intercept("GET", "**/api/v1/groups?*", (request) => {
      const params = new URL(request.url).searchParams;
      if (params.get("codeType") === "diagnosis" && params.get("kind") === "medical" && !params.get("q")) {
        request.alias = "icdMedicalGroups";
      }
    });
    cy.findByTestId("grouping-tab-medical").click();
    return this;
  }

  selectCustomTab() {
    cy.findByTestId("grouping-tab-custom").click();
    return this;
  }

  openNewGroupForm() {
    cy.findByTestId("grouping-new-group-btn").click();
    return this;
  }

  typeGroupName(name) {
    cy.findByTestId("group-form-name-input").clear();
    if (name) {
      cy.findByTestId("group-form-name-input").type(name, { parseSpecialCharSequences: false });
    }
    return this;
  }

  enterTemporaryDetails() {
    this.typeGroupName(`ICD Unsaved ${Date.now()}`);
    cy.findByTestId("group-form-description-input").type("Unsaved ICD validation details");
    return this;
  }

  triggerIncompleteFormValidation() {
    // Both approved invalid states have no members. The request guard also
    // blocks writes if a future frontend regression bypasses validation.
    cy.findByTestId("group-form-save-btn").click();
    return this;
  }

  cancelGroupForm() {
    cy.findByTestId("group-form-cancel-btn").click();
    return this;
  }

  closeGroupForm() {
    cy.findByTestId("group-form-close-btn").click();
    return this;
  }

  selectMemberTab(tab) {
    if (!["code", "custom"].includes(tab)) {
      throw new Error(`Unsupported ICD member tab: ${tab}`);
    }
    cy.findByTestId(`group-form-members-tab-${tab}`).click();
    return this;
  }

  searchDiscoveredReference(field) {
    if (!["code", "description"].includes(field)) {
      throw new Error(`Unsupported ICD reference search field: ${field}`);
    }
    cy.get("@icdReference").then((reference) => {
      return searchDiagnosisReferences(field === "code" ? reference.code : reference.descriptionQuery);
    });
    return this;
  }

  clearReferenceSearch() {
    cy.findByTestId("group-form-members-code-search-input").clear();
    return this;
  }

  searchNonExistingReference() {
    searchDiagnosisReferences(`ICD-REFERENCE-NO-MATCH-${Date.now()}-${Cypress._.random(100000, 999999)}`);
    return this;
  }

  toggleDiscoveredCodeOption() {
    cy.get("@icdReference").then((reference) => {
      return cy.get(codeOption(reference.code)).click();
    });
    cy.findByTestId("group-form-members-selection").scrollIntoView();
    return this;
  }

  removeDiscoveredCodeChip() {
    cy.get("@icdReference").then((reference) => {
      return cy.get(codeChip(reference.code))
        .find('[data-testid="group-form-members-chip-remove-btn"]').click();
    });
    return this;
  }

  searchNestedGroup() {
    cy.get("@icdNestedGroup").then((group) => {
      return cy.findByTestId("group-form-members-group-search-input")
        .clear().type(group.name, { parseSpecialCharSequences: false });
    });
    return this;
  }

  selectNestedGroup() {
    cy.get("@icdNestedGroup").then((group) => {
      return cy.get(customGroupOption(group)).click();
    });
    cy.findByTestId("group-form-members-selection").scrollIntoView();
    return this;
  }

  removeNestedGroupChip() {
    cy.get("@icdNestedGroup").then((group) => {
      return cy.get(customGroupChip(group))
        .find('[data-testid="group-form-members-chip-remove-btn"]').click();
    });
    return this;
  }

  searchCapturedGroup(purpose) {
    cy.get(`@icd${purpose}Baseline`).then((group) => {
      cy.intercept("GET", "**/api/v1/groups?*", (request) => {
        const params = new URL(request.url).searchParams;
        if (params.get("codeType") === "diagnosis" && params.get("kind") === "custom" && params.get("q") === group.name) {
          request.alias = "icdCapturedGroupSearch";
          request.continue();
        }
      });
      return cy.findByTestId("grouping-search-input").clear()
        .type(group.name, { parseSpecialCharSequences: false });
    });
    return this;
  }

  openCapturedGroupView(purpose) {
    cy.get(`@icd${purpose}Baseline`).then((group) => {
      return clickCapturedRow(group, "group-row-view-btn");
    });
    return this;
  }

  openEditFromView() {
    cy.findByTestId("group-view-edit-btn").click();
    return this;
  }

  modifyUnsavedEditDescription() {
    cy.findByTestId("group-form-description-input").clear().type(unsavedEditDescription);
    return this;
  }

  removeUnsavedEditMember() {
    cy.get("@icdEditMember").then((member) => {
      return cy.get(codeChip(member.codeValue))
        .find('[data-testid="group-form-members-chip-remove-btn"]').click();
    });
    return this;
  }

  dismissEditForm(action) {
    if (action === "Cancel") {
      this.cancelGroupForm();
    } else if (action === "Close") {
      this.closeGroupForm();
    } else {
      throw new Error(`Unsupported ICD Edit dismissal: ${action}`);
    }
    return this;
  }

  filterCustomGroups(status) {
    const value = status.toLowerCase();
    if (!["active", "inactive", "all"].includes(value)) {
      throw new Error(`Unsupported ICD status filter: ${status}`);
    }
    const alias = value === "all" ? "icdRestoredAllResponse" : "icdStatusFilterResponse";
    cy.intercept("GET", "**/api/v1/groups?*", (request) => {
      const params = new URL(request.url).searchParams;
      if (params.get("codeType") === "diagnosis" && params.get("kind") === "custom" && !params.get("q") &&
          (value === "all" ? !params.has("status") : params.get("status") === value)) {
        request.alias = alias;
        // The Batch 1 navigation spy also matches unsearched group requests.
        // Continue after aliasing so that it cannot overwrite this filter alias.
        request.continue();
      }
    });
    cy.findByTestId(`grouping-status-filter-${value}`).click();
    return this;
  }

  openCapturedDeleteConfirmation() {
    cy.get("@icdDeleteBaseline").then((group) => {
      return clickCapturedRow(group, "group-row-delete-btn");
    });
    return this;
  }

  cancelDeleteConfirmation() {
    cy.findByTestId("group-delete-cancel-btn").click();
    return this;
  }
}

export default icdGroupingActions;
