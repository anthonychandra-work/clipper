export const state = {};

const listeners = [];

export function subscribe(listener) {
  listeners.push(listener);
}

export function update(change) {
  change(state);
  refresh();
}

export function refresh() {
  listeners.forEach((listener) => listener());
}
