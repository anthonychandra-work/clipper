import { renderSegmented, renderSwitch } from '../../controls/index.js';

const CAPTION_STYLES = [
  { value: 'keyword', label: 'Keyword' },
  { value: 'pop', label: 'Each Word' },
  { value: 'clean', label: 'Plain' },
];

const LAYOUTS = [
  { value: 'follow', label: 'Speaker' },
  { value: 'stacked', label: 'Stacked' },
  { value: 'fit', label: 'Full Frame' },
];

const LOOK_TOGGLES = [
  { option: 'showHookTitle', label: 'Hook Title' },
  { option: 'showSafeZones', label: 'Platform Safe Zones' },
];

export function renderLookControls(look) {
  const captions = renderSegmented({
    name: 'captions', label: 'Caption style', action: 'set-caption-style', selected: look.captions, options: CAPTION_STYLES,
  });
  const framing = renderSegmented({
    name: 'framing', label: 'Framing', action: 'set-layout', selected: look.layout, options: LAYOUTS,
  });
  return `
    <div class="group-section">
      <h2 class="list-header">Look</h2>
      <div class="group divided">
        <div class="row row--stack"><span class="row__label">Captions</span>${captions}</div>
        <div class="row row--stack"><span class="row__label">Framing</span>${framing}</div>
        ${LOOK_TOGGLES.map((toggle) => renderLookToggle(toggle, look)).join('')}
      </div>
    </div>`;
}

export function describeLook(look) {
  const captions = CAPTION_STYLES.find((style) => style.value === look.captions).label;
  const layout = LAYOUTS.find((option) => option.value === look.layout).label;
  return `${captions} captions, ${layout.toLowerCase()} framing, hook title ${look.showHookTitle ? 'on' : 'off'}`;
}

function renderLookToggle(toggle, look) {
  const control = renderSwitch({
    id: `look-${toggle.option}`,
    action: 'toggle-look',
    value: toggle.option,
    isOn: look[toggle.option],
  });
  return `
    <label class="row" for="look-${toggle.option}">
      <span class="row__label">${toggle.label}</span>
      ${control}
    </label>`;
}
