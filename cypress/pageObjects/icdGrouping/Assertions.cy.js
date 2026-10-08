import { existingGroupName, existingMemberCode } from "./TestData.cy";
import { unsavedEditDescription, deleteWarning } from "./TestData.cy";
import { memberCodeOptions, memberChips, codeOption, codeChip, customGroupOption, customGroupChip, capturedGroupRow } from "./Selectors.cy";

const rowSelector = '[data-testid^="group-row-"][data-group-name][data-group-kind]';

class icdGroupingAssertions {
  checkPageIsReady() {
    cy.get("@icdInitialResponse").then(({ response }) => {
      expect(response.statusCode).to.equal(200);
      expect(response.body.ok).to.equal(true);
      cy.wrap(response.body.data, { log: false }).as("icdInitialGroups");
    });
    cy.location("pathname").should("equal", "/grouping/icd");
    cy.findByTestId("page-grouping-icd").should("be.visible")
      .and("have.attr", "data-code-type", "diagnosis");
    cy.get('[data-testid="grouping-loading"]').should("not.exist");
    cy.findByTestId("grouping-table").should("be.visible");
    cy.findByTestId("grouping-tab-custom").should("be.visible")
      .and("have.attr", "data-active", "true");
    cy.findByTestId("grouping-search-input").should("be.visible").and("have.value", "");
    cy.findByTestId("grouping-status-filter").should("be.visible")
      .and("have.attr", "data-value", "all");
    cy.findByTestId("grouping-new-group-btn").should("be.visible");
    return this;
  }

  checkCustomTabIsActive() {
    cy.findByTestId("grouping-tab-custom").should("have.attr", "data-active", "true");
    cy.findByTestId("grouping-tab-medical").should("have.attr", "data-active", "false");
    return this;
  }

  checkSearchResults(match) {
    cy.wait("@icdSearchResults").then(({ response }) => {
      expect(response.statusCode).to.equal(200);
      expect(response.body.ok).to.equal(true);
      const groups = response.body.data;
      expect(groups, "matching ICD Custom Groups").to.have.length.at.least(1);
      groups.forEach((group) => {
        expect(group.groupKind).to.equal("custom");
        expect(group.codeType).to.equal("diagnosis");
        if (match) {
          match(group);
        }
      });
      cy.wrap(groups, { log: false }).as("icdMatchedGroups");
    });
    cy.get('[data-testid="grouping-loading"]').should("not.exist");
    cy.get("@icdMatchedGroups").then((groups) => {
      cy.findByTestId("grouping-table").should(($table) => {
        const rows = $table.find(rowSelector);
        expect(rows.length, "visible search results").to.be.greaterThan(0);
        rows.each((_, row) => {
          const name = row.getAttribute("data-group-name");
          const match = groups.find((group) => group.name === name);
          expect(match, `visible result ${name} belongs to the completed search`).to.exist;
          expect(row.getAttribute("data-group-kind")).to.equal("custom");
          expect(row.getAttribute("data-status")).to.equal(match.status);
        });
      });
    });
    return this;
  }

  checkNameSearchResults() {
    this.checkSearchResults((group) => {
      expect(group.name.toLowerCase()).to.include(existingGroupName.toLowerCase());
    });
    cy.get("@icdMatchedGroups").should((groups) => {
      expect(groups.some((group) => group.name === existingGroupName)).to.equal(true);
    });
    cy.get(`[data-testid="grouping-table"] ${rowSelector}`)
      .filter(`[data-group-name="${existingGroupName}"]`).should("be.visible");
    return this;
  }

  checkCodeSearchResults() {
    this.checkSearchResults();
    cy.get("@icdMatchedGroups").should((groups) => {
      expect(groups.some((group) => group.name === existingGroupName)).to.equal(true);
    });
    // Read-only member lookups verify all returned groups, including results
    // on later UI pages; the search itself is performed through the UI.
    cy.window().then((win) => {
      const token = win.localStorage.getItem("pharma_access");
      return cy.get("@icdMatchedGroups").each((group) => {
        return cy.request({
          method: "GET", url: `/api/v1/groups/${group.id}`,
          headers: { Authorization: `Bearer ${token}` }, log: false,
        }).then(({ status, body }) => {
          expect(status).to.equal(200);
          expect(body.ok).to.equal(true);
          expect(body.data.members.some((member) => member.memberKind === "code" &&
            member.codeType === "diagnosis" && member.codeValue.includes(existingMemberCode)),
          `${group.name} contains a matching ICD member`).to.equal(true);
        });
      });
    });
    return this;
  }

  checkStatusSearchResults() {
    cy.get("@icdSearchQuery").then((query) => {
      cy.wait("@icdSearchResults").then(({ response }) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(true);
        const groups = response.body.data;
        expect(groups, "status text results").to.have.length.at.least(1);
        groups.forEach((group) => {
          expect(group.groupKind).to.equal("custom");
          expect(group.codeType).to.equal("diagnosis");
          expect(group.status.toLowerCase()).to.include(query.toLowerCase());
        });
        cy.get("@icdInitialGroups").then((initialGroups) => {
          const expectedGroups = initialGroups.filter((group) => group.status === query.toLowerCase());
          expect(expectedGroups, "existing groups with the searched status").to.have.length.at.least(1);
          expectedGroups.forEach((group) => {
            expect(groups.some((result) => result.id === group.id),
              `Status search includes existing ${group.status} group ${group.name}`).to.equal(true);
          });
        });
        cy.findByTestId("grouping-table").should(($table) => {
          const rows = $table.find(rowSelector);
          expect(rows.length).to.be.greaterThan(0);
          rows.each((_, row) => {
            expect(row.getAttribute("data-group-kind")).to.equal("custom");
            expect(row.getAttribute("data-status")).to.include(query.toLowerCase());
            expect(groups.some((group) => group.name === row.getAttribute("data-group-name"))).to.equal(true);
          });
        });
      });
    });
    cy.get('[data-testid="grouping-loading"]').should("not.exist");
    cy.findByTestId("grouping-status-filter").should("have.attr", "data-value", "all");
    cy.findByTestId("grouping-status-filter-all").should("have.attr", "aria-pressed", "true");
    return this;
  }

  checkSearchIsEmpty() {
    cy.wait("@icdSearchResults").then(({ response }) => {
      expect(response.statusCode).to.equal(200);
      expect(response.body.ok).to.equal(true);
      expect(response.body.data).to.have.length(0);
    });
    cy.get('[data-testid="grouping-loading"]').should("not.exist");
    cy.findByTestId("grouping-empty").should("be.visible").and("contain.text", "No groups match your search.");
    cy.get(`[data-testid="grouping-table"] ${rowSelector}`).should("not.exist");
    return this;
  }

  checkNormalCustomListReturns() {
    this.checkCustomTabIsActive();
    cy.findByTestId("grouping-search-input").should("have.value", "");
    cy.get('[data-testid="grouping-loading"]').should("not.exist");
    cy.get("@icdInitialGroups").then((groups) => {
      expect(groups, "existing Custom Groups for list restoration").to.have.length.at.least(1);
      cy.findByTestId("grouping-table").should(($table) => {
        const rows = $table.find(rowSelector);
        expect(rows.length).to.be.greaterThan(0);
        rows.each((_, row) => {
          expect(row.getAttribute("data-group-kind")).to.equal("custom");
          expect(groups.some((group) => group.name === row.getAttribute("data-group-name"))).to.equal(true);
        });
      });
    });
    cy.get('[data-testid="grouping-empty"]').should("not.exist");
    return this;
  }

  checkKnownMemberIsVisible() {
    cy.findByTestId("group-view-drawer").should("be.visible");
    cy.get('[data-testid="group-view-loading"]').should("not.exist");
    cy.findByTestId("group-view-title").should("have.text", existingGroupName);
    cy.get(`[data-testid="group-view-code-row"][data-code="${existingMemberCode}"]`)
      .should("be.visible").and("contain.text", existingMemberCode).and("contain.text", "diagnosis");
    return this;
  }

  checkExistingGroupDetails() {
    this.checkKnownMemberIsVisible();
    cy.get("@icdExistingGroup").then((group) => {
      cy.findByTestId("group-view-kind").should("be.visible").and("have.text", "Custom");
      cy.findByTestId("group-view-code-type").should("be.visible").and("have.text", group.codeType);
      cy.findByTestId("group-view-status-chip").should("be.visible").and("contain.text", group.status);
      cy.findByTestId("group-view-member-count").should("be.visible")
        .and("have.attr", "data-count", String(group.members.length));
      cy.findByTestId("group-view-drawer").should(($drawer) => {
        expect($drawer.find('[data-testid="group-view-code-row"]')).to.have.length(
          group.members.filter((member) => member.memberKind === "code").length);
        expect($drawer.find('[data-testid="group-view-nested-row"]')).to.have.length(
          group.members.filter((member) => member.memberKind === "group").length);
      });
      group.members.filter((member) => member.memberKind === "code").forEach((member) => {
        cy.get(`[data-testid="group-view-code-row"][data-code="${member.codeValue}"]`)
          .should("contain.text", member.codeValue).and("contain.text", member.codeType);
      });
    });
    return this;
  }

  checkGroupViewIsClosed() {
    cy.get('[data-testid="group-view-drawer"]').should("not.exist");
    return this;
  }

  checkMedicalTabContent() {
    cy.wait("@icdMedicalGroups").then(({ response }) => {
      expect(response.statusCode).to.equal(200);
      expect(response.body.ok).to.equal(true);
      const groups = response.body.data;
      groups.forEach((group) => {
        expect(group.groupKind).to.equal("medical");
        expect(group.codeType).to.equal("diagnosis");
      });
      if (groups.length === 0) {
        cy.findByTestId("grouping-empty").should("be.visible").and("contain.text", "No medical groups yet.");
        cy.get(`[data-testid="grouping-table"] ${rowSelector}`).should("not.exist");
      } else {
        cy.findByTestId("grouping-table").should(($table) => {
          const rows = $table.find(rowSelector);
          expect(rows.length).to.be.greaterThan(0);
          rows.each((_, row) => {
            expect(row.getAttribute("data-group-kind")).to.equal("medical");
            expect(groups.some((group) => group.name === row.getAttribute("data-group-name"))).to.equal(true);
          });
        });
        cy.get('[data-testid="grouping-empty"]').should("not.exist");
      }
    });
    cy.get('[data-testid="grouping-loading"]').should("not.exist");
    cy.findByTestId("grouping-tab-medical").should("be.visible").and("have.attr", "data-active", "true");
    cy.findByTestId("grouping-tab-custom").should("have.attr", "data-active", "false");
    return this;
  }

  checkCreateFormIsVisible() {
    cy.findByTestId("group-form-drawer").should("be.visible").and("have.attr", "data-mode", "create");
    cy.findByTestId("group-form-title").should("have.text", "New Custom Group");
    ["group-form-name-input", "group-form-description-input", "group-form-members-code-search-input",
      "group-form-members-tab-code", "group-form-members-tab-medical", "group-form-members-tab-custom",
      "group-form-save-btn", "group-form-cancel-btn", "group-form-close-btn"].forEach((testId) => {
      cy.findByTestId(testId).should("be.visible");
    });
    cy.findByTestId("group-form-members").should("be.visible").and("have.attr", "data-code-type", "diagnosis");
    cy.findByTestId("group-form-members-tab-code").should("have.attr", "data-active", "true").and("contain.text", "ICD Code");
    return this;
  }

  checkCreateFormIsReset() {
    this.checkCreateFormIsVisible();
    cy.findByTestId("group-form-name-input").should("have.value", "");
    cy.findByTestId("group-form-description-input").should("have.value", "");
    this.checkNoMembersSelected();
    cy.get('[data-testid="group-form-error"]').should("not.exist");
    return this;
  }

  checkNoMembersSelected() {
    cy.get('[data-testid="group-form-members-chip"]').should("not.exist");
    cy.findByTestId("group-form-members-empty").should("be.visible");
    return this;
  }

  checkGroupFormIsClosed() {
    cy.get('[data-testid="group-form-drawer"]').should("not.exist");
    return this;
  }

  checkNameMinimumLengthError() {
    cy.findByTestId("group-form-error").should("be.visible")
      .and("have.text", "Group name must be at least 2 characters");
    return this;
  }

  checkRequiredMemberError() {
    cy.findByTestId("group-form-error").should("be.visible")
      .and("have.text", "At least one code or active group is required to add this group.");
    return this;
  }

  checkNoDataWasSaved() {
    cy.get("@icdUnexpectedWrites").should("have.length", 0);
    return this;
  }

  checkMemberTabIsActive(tab) {
    cy.findByTestId("group-form-members").should("have.attr", "data-code-type", "diagnosis");
    cy.findByTestId(`group-form-members-tab-${tab}`).should("have.attr", "data-active", "true");
    return this;
  }

  checkDiscoveredReferenceResults() {
    cy.get("@icdReferenceQuery").then((query) => {
      cy.wait("@icdReferenceSearch").then(({ request, response }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get("type"), "reference request uses diagnosis").to.equal("diagnosis");
        expect(params.get("q")).to.equal(query);
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(true);
        const results = response.body.data;
        cy.get("@icdReference").then((reference) => {
          expect(results.some((item) => item.code === reference.code && item.primary === reference.primary),
            "discovered code and description are returned").to.equal(true);
          cy.get(codeOption(reference.code)).should("be.visible")
            .find('[data-testid="group-form-members-code-option-code"]').should("have.text", reference.code);
          cy.get(codeOption(reference.code))
            .find('[data-testid="group-form-members-code-option-primary"]')
            .should("have.attr", "title", reference.primary);
        });
        cy.findByTestId("group-form-members-code-result-count")
          .should("have.attr", "data-count", String(results.length));
      });
    });
    cy.get('[data-testid="group-form-members-code-spinner"]').should("not.exist");
    this.checkMemberTabIsActive("code");
    return this;
  }

  checkDiscoveredCodeIsSelected() {
    cy.get("@icdReference").then((reference) => {
      cy.get(codeOption(reference.code)).should("have.attr", "data-selected", "true");
      cy.get(codeChip(reference.code)).should("have.length", 1).and("be.visible")
        .and("have.attr", "data-kind", "drug_code").and("contain.text", reference.code)
        .and("contain.text", reference.primary);
    });
    cy.get(memberChips).should("have.length", 1);
    cy.findByTestId("group-form-members-selection").should("have.attr", "data-count", "1");
    return this;
  }

  checkDiscoveredCodeIsUnselected() {
    cy.get("@icdReference").then((reference) => {
      cy.get(codeOption(reference.code)).should("have.attr", "data-selected", "false");
      cy.get(codeChip(reference.code)).should("not.exist");
    });
    this.checkNoMembersSelected();
    cy.findByTestId("group-form-members-selection").should("have.attr", "data-count", "0");
    return this;
  }

  checkReferenceSearchIsCleared() {
    cy.findByTestId("group-form-members-code-search-input").should("have.value", "");
    // Retry against the debounced UI state before searching the same code again.
    cy.get('[data-testid="group-form-members-code-results"]').should("not.exist");
    cy.get(memberCodeOptions).should("not.exist");
    return this;
  }

  checkNoReferenceResults() {
    cy.get("@icdReferenceQuery").then((query) => {
      cy.wait("@icdReferenceSearch").then(({ request, response }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get("type")).to.equal("diagnosis");
        expect(params.get("q")).to.equal(query);
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(true);
        expect(response.body.data).to.have.length(0);
      });
      cy.findByTestId("group-form-members-code-no-results").should("be.visible")
        .and("contain.text", "No matches for").and("contain.text", query);
    });
    cy.get(memberCodeOptions).should("not.exist");
    cy.findByTestId("group-form-members-code-result-count").should("have.attr", "data-count", "0");
    cy.get('[data-testid="group-form-members-code-spinner"]').should("not.exist");
    return this;
  }

  checkNestedGroupOption() {
    this.checkMemberTabIsActive("custom");
    cy.get("@icdNestedGroup").then((group) => {
      cy.findByTestId("group-form-members-group-search-input").should("have.value", group.name);
      cy.get(customGroupOption(group)).should("be.visible")
        .and("have.attr", "data-group-name", group.name).and("have.attr", "data-selected", "false");
    });
    return this;
  }

  checkNestedGroupIsSelected() {
    cy.get("@icdNestedGroup").then((group) => {
      cy.get(customGroupOption(group)).should("have.attr", "data-selected", "true");
      cy.get(customGroupChip(group)).should("have.length", 1).and("be.visible")
        .and("have.attr", "data-kind", "custom_group").and("contain.text", group.name);
    });
    cy.get(memberChips).should("have.length", 1);
    cy.findByTestId("group-form-members-selection").should("have.attr", "data-count", "1");
    return this;
  }

  checkNestedGroupIsRemoved() {
    cy.get("@icdNestedGroup").then((group) => {
      cy.get(customGroupOption(group)).should("have.attr", "data-selected", "false");
      cy.get(customGroupChip(group)).should("not.exist");
    });
    this.checkNoMembersSelected();
    cy.findByTestId("group-form-members-selection").should("have.attr", "data-count", "0");
    return this;
  }

  checkCapturedGroupSearch(purpose) {
    cy.get(`@icd${purpose}Baseline`).then((baseline) => {
      cy.wait("@icdCapturedGroupSearch").then(({ request, response }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get("codeType")).to.equal("diagnosis");
        expect(params.get("kind")).to.equal("custom");
        expect(params.get("q")).to.equal(baseline.name);
        expect(response.statusCode).to.equal(200);
        expect(response.body.ok).to.equal(true);
        expect(response.body.data.some((group) => group.id === baseline.id && group.name === baseline.name),
          "captured group identity appears in search").to.equal(true);
      });
    });
    cy.get('[data-testid="grouping-loading"]').should("not.exist");
    return this;
  }

  checkCapturedGroupView(purpose) {
    cy.get(`@icd${purpose}Baseline`).then((baseline) => {
      cy.findByTestId("group-view-drawer").should("be.visible").and("have.attr", "data-group-id", baseline.id);
      cy.findByTestId("group-view-title").should("have.text", baseline.name);
      cy.findByTestId("group-view-kind").should("have.text", "Custom");
      cy.findByTestId("group-view-code-type").should("have.text", "diagnosis");
      cy.findByTestId("group-view-status-chip").should("contain.text", baseline.status);
      if (baseline.description) {
        cy.findByTestId("group-view-description").should("have.text", baseline.description);
      } else {
        cy.get('[data-testid="group-view-description"]').should("not.exist");
      }
      cy.findByTestId("group-view-member-count").should("have.attr", "data-count", String(baseline.members.length));
      cy.findByTestId("group-view-drawer").should(($drawer) => {
        const codes = $drawer.find('[data-testid="group-view-code-row"]').toArray()
          .map((row) => row.getAttribute("data-code")).sort();
        const nested = $drawer.find('[data-testid="group-view-nested-row"]').toArray()
          .map((row) => row.getAttribute("data-group-name")).sort();
        expect(codes).to.deep.equal(baseline.members.filter((member) => member.memberKind === "code")
          .map((member) => member.codeValue).sort());
        expect(nested).to.deep.equal(baseline.members.filter((member) => member.memberKind === "group")
          .map((member) => member.childGroupName ?? "").sort());
      });
    });
    cy.get('[data-testid="group-view-loading"]').should("not.exist");
    return this;
  }

  checkEditPrepopulation() {
    cy.findByTestId("group-form-drawer").should("be.visible").and("have.attr", "data-mode", "edit");
    cy.findByTestId("group-form-title").should("have.text", "Edit Custom Group");
    cy.findByTestId("group-form-members").should("have.attr", "data-code-type", "diagnosis");
    cy.get("@icdEditBaseline").then((baseline) => {
      cy.findByTestId("group-form-name-input").should("have.value", baseline.name);
      cy.findByTestId("group-form-description-input").should("have.value", baseline.description ?? "");
      cy.findByTestId("group-form-members-selection").should("have.attr", "data-count", String(baseline.members.length));
      cy.get(memberChips).should(($chips) => {
        const actual = $chips.toArray().map((chip) => ({ kind: chip.getAttribute("data-kind"), label: chip.getAttribute("data-label") }));
        const expected = baseline.members.map((member) => member.memberKind === "code"
          ? { kind: "drug_code", label: member.codeValue }
          : { kind: "custom_group", label: member.childGroupName ?? "group" });
        expect(actual).to.have.deep.members(expected);
        expect(actual).to.have.length(expected.length);
      });
    });
    return this;
  }

  checkUnsavedEditChanges() {
    cy.get("@icdEditBaseline").then((baseline) => {
      expect(unsavedEditDescription, "temporary description differs from persisted description").not.to.equal(baseline.description);
      cy.findByTestId("group-form-name-input").should("have.value", baseline.name);
      cy.findByTestId("group-form-description-input").should("have.value", unsavedEditDescription);
      cy.findByTestId("group-form-members-selection").should("have.attr", "data-count", String(baseline.members.length - 1));
      cy.findByTestId("group-form-members-selection").should(($selection) => {
        expect($selection.find(memberChips)).to.have.length(baseline.members.length - 1);
      });
    });
    cy.get("@icdEditMember").then((member) => { cy.get(codeChip(member.codeValue)).should("not.exist"); });
    return this;
  }

  checkStatusFilterResults(status) {
    const value = status.toLowerCase();
    cy.wait("@icdStatusFilterResponse").then(({ request, response }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get("kind")).to.equal("custom");
      expect(params.get("codeType")).to.equal("diagnosis");
      expect(params.get("status")).to.equal(value);
      expect(params.has("q")).to.equal(false);
      expect(response.statusCode).to.equal(200);
      expect(response.body.ok).to.equal(true);
      const groups = response.body.data;
      groups.forEach((group) => {
        expect(group.groupKind).to.equal("custom");
        expect(group.codeType).to.equal("diagnosis");
        expect(group.status).to.equal(value);
      });
      if (groups.length === 0) {
        cy.findByTestId("grouping-empty").should("be.visible")
          .and("contain.text", `No ${value} custom groups.`);
        cy.get(`[data-testid="grouping-table"] ${rowSelector}`).should("not.exist");
        cy.log(`${status}: valid empty state; positive-row coverage absent`);
      } else {
        cy.findByTestId("grouping-table").should(($table) => {
          const rows = $table.find(rowSelector);
          expect(rows.length, "visible status-filtered rows").to.be.greaterThan(0);
          rows.each((_, row) => {
            expect(row.getAttribute("data-group-kind")).to.equal("custom");
            expect(row.getAttribute("data-status")).to.equal(value);
            expect(groups.some((group) => row.getAttribute("data-testid") === `group-row-${group.id}`)).to.equal(true);
          });
        });
        cy.get('[data-testid="grouping-empty"]').should("not.exist");
      }
      cy.writeFile(`cypress/myReport/icdGrouping/batch2/status-${value}.json`, {
        status: value, resultCount: groups.length, positiveRowCoverage: groups.length > 0,
      }, { log: false });
    });
    cy.get('[data-testid="grouping-loading"]').should("not.exist");
    cy.findByTestId("grouping-status-filter").should("have.attr", "data-value", value);
    cy.findByTestId(`grouping-status-filter-${value}`).should("have.attr", "data-active", "true")
      .and("have.attr", "aria-pressed", "true");
    return this;
  }

  checkAllFilterRestored() {
    cy.wait("@icdRestoredAllResponse").then(({ request, response }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get("codeType")).to.equal("diagnosis");
      expect(params.get("kind")).to.equal("custom");
      expect(params.has("status"), "All removes the status parameter").to.equal(false);
      expect(params.has("q")).to.equal(false);
      expect(response.statusCode).to.equal(200);
      expect(response.body.ok).to.equal(true);
      cy.get("@icdInitialGroups").then((initial) => {
        expect(response.body.data.map((group) => group.id).sort(), "restored unfiltered identities")
          .to.deep.equal(initial.map((group) => group.id).sort());
      });
    });
    cy.findByTestId("grouping-status-filter").should("have.attr", "data-value", "all");
    cy.findByTestId("grouping-status-filter-all").should("have.attr", "data-active", "true")
      .and("have.attr", "aria-pressed", "true");
    this.checkNormalCustomListReturns();
    return this;
  }

  checkDeleteConfirmation() {
    cy.get("@icdDeleteBaseline").then((baseline) => {
      cy.findByTestId("group-delete-modal").should("be.visible");
      cy.findByTestId("group-delete-modal-title").should("be.visible")
        .and("have.text", `Delete \u201c${baseline.name}\u201d?`);
      cy.findByTestId("group-delete-modal").find("p").should("be.visible").and("have.text", deleteWarning);
    });
    cy.findByTestId("group-delete-cancel-btn").should("be.visible").and("have.text", "Cancel");
    cy.findByTestId("group-delete-confirm-btn").should("be.visible").and("have.text", "Delete group");
    return this;
  }

  checkDeleteWasCanceled() {
    cy.get('[data-testid="group-delete-modal"]').should("not.exist");
    cy.get("@icdDeleteBaseline").then((baseline) => {
      cy.get(capturedGroupRow(baseline)).should("be.visible")
        .and("have.attr", "data-group-name", baseline.name).and("have.attr", "data-status", baseline.status);
    });
    return this;
  }
}

export default icdGroupingAssertions;
