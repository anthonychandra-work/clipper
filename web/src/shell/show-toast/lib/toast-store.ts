const TOAST_VISIBLE_MS = 3500;

type ToastListener = () => void;

const listeners = new Set<ToastListener>();
let shownMessage: string | null = null;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

export function showToast(message: string): void {
  clearTimeout(hideTimer);
  setShownMessage(message);
  hideTimer = setTimeout(() => setShownMessage(null), TOAST_VISIBLE_MS);
}

export function readToast(): string | null {
  return shownMessage;
}

export function watchToast(listener: ToastListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setShownMessage(message: string | null): void {
  shownMessage = message;
  listeners.forEach((listener) => listener());
}
