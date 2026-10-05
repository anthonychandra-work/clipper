import { update } from '../app-state.js';

const DISMISS_DISTANCE = 96;

export const shellDrags = {
  'dismiss-sheet': (event, grabber) => beginSheetDrag(event, grabber),
};

function beginSheetDrag(event, grabber) {
  const sheet = document.getElementById('sheet');
  const startY = event.clientY;
  grabber.setPointerCapture(event.pointerId);
  grabber.onpointermove = (move) => {
    sheet.style.transform = `translateY(${Math.max(0, move.clientY - startY)}px)`;
  };
  grabber.onpointerup = (release) => endSheetDrag(sheet, release.clientY - startY);
  grabber.onpointercancel = () => endSheetDrag(sheet, 0);
}

function endSheetDrag(sheet, distance) {
  sheet.style.transform = '';
  if (distance < DISMISS_DISTANCE) return;
  update((state) => {
    state.sheet = null;
  });
}
