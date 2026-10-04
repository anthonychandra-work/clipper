const TOAST_VISIBLE_MS = 2600;

let hideTimer = null;

export function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    toast.hidden = true;
  }, TOAST_VISIBLE_MS);
}
