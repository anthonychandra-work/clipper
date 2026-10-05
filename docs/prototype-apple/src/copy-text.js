import { showToast } from './show-toast.js';

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied');
  } catch {
    showToast('Copying is blocked here. Select the text and copy it.');
  }
}
