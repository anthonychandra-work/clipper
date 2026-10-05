import { state } from './app-state.js';
import { isCompact, isSidebarDocked } from './read-layout.js';
import { moveMenuFocus } from './shell/index.js';

const ARROW_STEPS = { ArrowLeft: -1, ArrowRight: 1 };
const MENU_CLOSING_KEYS = ['Escape', 'Tab'];

let handlers = { actions: {}, inputs: {}, drags: {} };

export function routeEvents(registered) {
  handlers = registered;
  document.addEventListener('click', runAction);
  document.addEventListener('input', runInput);
  document.addEventListener('submit', runSubmit);
  document.addEventListener('pointerdown', runDrag);
  document.addEventListener('keydown', runKey);
  window.addEventListener('resize', dismissMenu);
}

function runAction(event) {
  const trigger = event.target.closest('[data-action]');
  if (state.menu && !event.target.closest('#menu, [data-menu]')) dismissMenu();
  if (!trigger || trigger.disabled) return;
  handlers.actions[trigger.dataset.action](trigger.dataset);
  document.getElementById(trigger.id)?.classList.add('is-fresh');
}

function runInput(event) {
  const field = event.target.closest('[data-input]');
  if (field) handlers.inputs[field.dataset.input](field);
}

function runSubmit(event) {
  event.preventDefault();
  handlers.actions[event.target.dataset.submit](event.target.dataset);
}

function runDrag(event) {
  const handle = event.target.closest('[data-drag]');
  if (handle) handlers.drags[handle.dataset.drag](event, handle);
}

function runKey(event) {
  if (state.menu && MENU_CLOSING_KEYS.includes(event.key)) return dismissMenu();
  if (event.key === 'Escape') return hideOverlaidSidebar();
  if (event.target.closest('[role="menu"]')) return moveMenuFocus(event);
  const step = ARROW_STEPS[event.key];
  const stepper = step && event.target.closest('[data-step-action]');
  if (!stepper) return;
  event.preventDefault();
  handlers.actions[stepper.dataset.stepAction]({ ...stepper.dataset, step });
}

function dismissMenu() {
  if (state.menu) handlers.actions['close-menu']();
}

function hideOverlaidSidebar() {
  const isOverlaid = state.isSidebarOpen && !isCompact() && !isSidebarDocked() && !state.sheet;
  if (isOverlaid) handlers.actions['toggle-sidebar']();
}
