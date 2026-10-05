export function rememberScroll() {
  const panes = document.querySelectorAll('[data-keep-scroll]');
  return Array.from(panes, (pane) => ({ name: pane.dataset.keepScroll, top: pane.scrollTop }));
}

export function restoreScroll(remembered) {
  remembered.forEach(({ name, top }) => {
    const pane = document.querySelector(`[data-keep-scroll="${name}"]`);
    if (pane) pane.scrollTop = top;
  });
}
