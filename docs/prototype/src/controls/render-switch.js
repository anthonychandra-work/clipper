export function renderSwitch({ id, action, value, isOn }) {
  return `
    <input type="checkbox" role="switch" class="switch" id="${id}" data-action="${action}"
      data-value="${value}" ${isOn ? 'checked' : ''}>`;
}
