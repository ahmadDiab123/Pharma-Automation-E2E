export const existingGroupName = "Cholera Care";
export const existingMemberCode = "A00.0";

export const unsavedEditDescription = "Temporary ICD Batch 2 description; discard without saving.";
export const deleteWarning = "The group is removed from this table. It is a soft delete, so the row stays in the database and can be restored by a developer, but it can no longer be used anywhere.";

// Returns a Cypress chain, rather than a POM instance, for resolved data callbacks.
export function readIcdApi(url, qs = {}) {
  return cy.window().then((win) => {
    const token = win.localStorage.getItem("pharma_access");
    expect(token, "authenticated ICD discovery token").to.be.a("string").and.not.be.empty;
    return cy.request({
      method: "GET", url, qs,
      headers: { Authorization: `Bearer ${token}` }, log: false,
    });
  }).then(({ status, body }) => {
    expect(status).to.equal(200);
    expect(body.ok, "read-only ICD lookup succeeded").to.equal(true);
    return body.data;
  });
}

class icdGroupingTestData {
  verifyExistingGroup() {
    cy.window().then((win) => {
      const token = win.localStorage.getItem("pharma_access");
      expect(token, "authenticated read-only discovery token").to.be.a("string").and.not.be.empty;
      return cy.request({
        method: "GET",
        url: "/api/v1/groups",
        qs: { kind: "custom", codeType: "diagnosis", q: existingGroupName },
        headers: { Authorization: `Bearer ${token}` },
        log: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(200);
        expect(body.ok, "ICD discovery succeeded").to.equal(true);
        const matches = body.data.filter((group) => group.name === existingGroupName);
        expect(matches, `Required existing ICD Custom Group: ${existingGroupName}`).to.have.length(1);
        const group = matches[0];
        expect(group.groupKind).to.equal("custom");
        expect(group.codeType).to.equal("diagnosis");
        return cy.request({
          method: "GET",
          url: `/api/v1/groups/${group.id}`,
          headers: { Authorization: `Bearer ${token}` },
          log: false,
        });
      });
    }).then(({ status, body }) => {
      expect(status).to.equal(200);
      expect(body.ok).to.equal(true);
      const group = body.data;
      expect(group.name).to.equal(existingGroupName);
      expect(group.groupKind).to.equal("custom");
      expect(group.codeType).to.equal("diagnosis");
      expect(group.status).to.be.oneOf(["active", "inactive"]);
      expect(group.members.some((member) => member.memberKind === "code" &&
        member.codeType === "diagnosis" && member.codeValue === existingMemberCode),
      `${existingMemberCode} belongs to ${existingGroupName}`).to.equal(true);
      cy.wrap(group, { log: false }).as("icdExistingGroup");
    });
    return this;
  }

  discoverDiagnosisReference() {
    readIcdApi("/api/v1/reference/search", { type: "diagnosis", q: existingMemberCode })
      .then((references) => {
        const reference = references.find((item) => item.code === existingMemberCode &&
          typeof item.primary === "string" && item.primary.trim().length > 0);
        expect(reference, `Unmet prerequisite: diagnosis reference ${existingMemberCode} with a description`).to.exist;
        const discovered = { ...reference, descriptionQuery: reference.primary.trim().split(/\s+/).slice(0, 3).join(" ") };
        cy.wrap(discovered, { log: false }).as("icdReference");
        cy.writeFile("cypress/myReport/icdGrouping/batch2/reference.json", discovered, { log: false });
      });
    return this;
  }

  discoverActiveNestedGroup() {
    cy.get("@icdInitialGroups").then((groups) => {
      const group = groups.find((item) => item.groupKind === "custom" &&
        item.codeType === "diagnosis" && item.status === "active" && !item.isSystemDefined);
      expect(group, "Unmet prerequisite: an existing active diagnosis Custom Group for nesting").to.exist;
      return readIcdApi(`/api/v1/groups/${group.id}`).then((details) => {
        expect(details.id).to.equal(group.id);
        expect(details.name).to.equal(group.name);
        expect(details.groupKind).to.equal("custom");
        expect(details.codeType).to.equal("diagnosis");
        expect(details.status).to.equal("active");
        cy.wrap({ ...group, members: details.members }, { log: false }).as("icdNestedGroup");
        cy.writeFile("cypress/myReport/icdGrouping/batch2/nested-group.json", {
          id: group.id, name: group.name, codeType: group.codeType, status: group.status,
          memberCount: group.memberCount,
        }, { log: false });
      });
    });
    return this;
  }

  captureExistingGroupBaseline(purpose) {
    if (!["Edit", "Delete"].includes(purpose)) {
      throw new Error(`Unsupported ICD baseline purpose: ${purpose}`);
    }
    // Reuses the Batch 1 GET-only prerequisite check and keeps its behavior intact.
    this.verifyExistingGroup();
    cy.get("@icdExistingGroup").then((group) => {
      expect(group.isSystemDefined, "editable/deletable Custom Group").not.to.equal(true);
      const baseline = Cypress._.cloneDeep(group);
      if (purpose === "Edit") {
        const member = baseline.members.find((item) => item.memberKind === "code" && item.codeType === "diagnosis");
        expect(member, "Unmet prerequisite: a direct ICD member for unsaved Edit removal").to.exist;
        cy.wrap(member, { log: false }).as("icdEditMember");
      }
      cy.wrap(baseline, { log: false }).as(`icd${purpose}Baseline`);
      cy.writeFile(`cypress/myReport/icdGrouping/batch2/${purpose.toLowerCase()}-baseline.json`, baseline, { log: false });
    });
    return this;
  }

  verifyCapturedGroupUnchanged(purpose) {
    cy.get(`@icd${purpose}Baseline`).then((baseline) => {
      return readIcdApi(`/api/v1/groups/${baseline.id}`).then((current) => {
        expect(current.id, "same existing group identity").to.equal(baseline.id);
        const fields = ["id", "name", "description", "groupKind", "codeType", "status", "isSystemDefined", "members"];
        expect(Cypress._.pick(current, fields), "persisted group remains equal to its independent baseline")
          .to.deep.equal(Cypress._.pick(baseline, fields));
        cy.wrap(current, { log: false }).as(`icd${purpose}Current`);
      });
    });
    return this;
  }
}

export default icdGroupingTestData;
