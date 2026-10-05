export function renderPage(name, content) {
  return `
    <div class="pane pane--page" data-keep-scroll="${name}">
      <div class="page-column">${content}</div>
    </div>`;
}
