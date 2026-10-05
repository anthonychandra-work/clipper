export function renderProgress({ name, percent, label }) {
  return `
    <span class="progress" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100"
      aria-valuenow="${Math.round(percent)}">
      <span data-progress="${name}" style="width:${percent.toFixed(1)}%"></span>
    </span>`;
}

export function paintProgress(name, percent) {
  document.querySelectorAll(`[data-progress="${name}"]`).forEach((bar) => {
    bar.style.width = `${percent.toFixed(1)}%`;
    bar.parentElement.setAttribute('aria-valuenow', Math.round(percent));
  });
}
