let shownHtml = '';
let openerId = null;

export function presentSheet(html, focused) {
  const sheet = document.getElementById('sheet');
  if (html !== shownHtml) sheet.innerHTML = html;
  shownHtml = html;
  if (html && !sheet.open) return openSheet(sheet, focused);
  if (!html && sheet.open) closeSheet(sheet);
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
  sheet.showModal();
}

function closeSheet(sheet) {
  sheet.close();
  document.getElementById(openerId)?.focus();
}
