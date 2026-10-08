export const memberCodeOptions = '[data-testid="group-form-members-code-option"]';
export const memberChips = '[data-testid="group-form-members-chip"]';

export function codeOption(code) {
  return `${memberCodeOptions}[data-code="${CSS.escape(code)}"]`;
}

export function codeChip(code) {
  const chip = `${memberChips}[data-kind="drug_code"]`;
  return `${chip}[data-label="${CSS.escape(code)}"], ${chip}[data-label^="${CSS.escape(`${code} \u00b7 `)}"]`;
}

export function customGroupOption(group) {
  return `[data-testid="group-form-members-group-option"][data-group-id="${CSS.escape(group.id)}"]`;
}

export function customGroupChip(group) {
  return `${memberChips}[data-kind="custom_group"][data-label^="${CSS.escape(`${group.name} \u00b7 `)}"]`;
}

export function capturedGroupRow(group) {
  return `[data-testid="group-row-${CSS.escape(group.id)}"][data-group-name="${CSS.escape(group.name)}"][data-group-kind="custom"]`;
}
