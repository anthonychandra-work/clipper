const TEXT_ENTRY_TYPES = new Set(['text', 'textarea', 'url', 'password', 'search']);

export function rememberFocus() {
  const element = document.activeElement;
  if (!element || !element.id) return null;
  return {
    id: element.id,
    selectionStart: TEXT_ENTRY_TYPES.has(element.type) ? element.selectionStart : null,
    selectionEnd: TEXT_ENTRY_TYPES.has(element.type) ? element.selectionEnd : null,
  };
}

export function restoreFocus(remembered) {
  const element = remembered && document.getElementById(remembered.id);
  if (!element) return;
  element.focus({ preventScroll: true });
  if (remembered.selectionStart !== null) {
    element.setSelectionRange(remembered.selectionStart, remembered.selectionEnd);
  }
}
