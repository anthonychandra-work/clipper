const EXIT_MS = 180;

let shownHtml = '';
let openerId = null;

export function presentSheet(html, focused) {
  const sheet = document.getElementById('sheet');
  const wasShown = Boolean(shownHtml);
  if (html && html !== shownHtml) sheet.innerHTML = html;
  shownHtml = html;
  if (html && !wasShown) return openSheet(sheet, focused);
  if (!html && wasShown) closeSheet(sheet);
}

export function watchSheet(dismiss) {
  const sheet = document.getElementById('sheet');
  sheet.addEventListener('cancel', (event) => {
    event.preventDefault();
    dismiss();
  });
  sheet.addEventListener('click', (event) => {
    if (event.target === sheet) dismiss();
  });
}

function openSheet(sheet, focused) {
  openerId = focused?.id ?? null;
  sheet.classList.remove('is-closing');
  if (!sheet.open) sheet.showModal();
}

function closeSheet(sheet) {
  sheet.classList.add('is-closing');
  setTimeout(() => finishClosing(sheet), EXIT_MS);
}

function finishClosing(sheet) {
  if (shownHtml) return;
  sheet.classList.remove('is-closing');
  sheet.removeAttribute('style');
  sheet.close();
  sheet.innerHTML = '';
  document.getElementById(openerId)?.focus();
}
