export const COPIED = 'Copied';
export const COPYING_BLOCKED = 'Copying is blocked here. Select the text and copy it.';

const COPY_FIELD_CLASS = 'copy-field';

export interface CopyingPage {
  writeToClipboard: ((text: string) => Promise<void>) | null;
  rememberSelection: () => () => void;
  selectInField: (text: string) => () => void;
  copySelection: () => boolean;
}

export async function copyText(text: string, page: CopyingPage): Promise<string> {
  if (page.writeToClipboard !== null && (await hasWritten(page.writeToClipboard, text))) return COPIED;
  return copyBySelecting(text, page) ? COPIED : COPYING_BLOCKED;
}

async function hasWritten(write: (text: string) => Promise<void>, text: string): Promise<boolean> {
  try {
    await write(text);
    return true;
  } catch {
    return false;
  }
}

function copyBySelecting(text: string, page: CopyingPage): boolean {
  const putSelectionBack = page.rememberSelection();
  const removeField = page.selectInField(text);
  try {
    return page.copySelection();
  } catch {
    return false;
  } finally {
    removeField();
    putSelectionBack();
  }
}

// A page opened at the Mac's network address is not a secure one and has no clipboard interface.
export function describeBrowserPage(): CopyingPage {
  const clipboard: Clipboard | undefined = navigator.clipboard;
  return {
    writeToClipboard: clipboard === undefined ? null : (text) => clipboard.writeText(text),
    rememberSelection,
    selectInField,
    copySelection: () => document.execCommand('copy'),
  };
}

function rememberSelection(): () => void {
  const selection = document.getSelection();
  const ranges = Array.from({ length: selection?.rangeCount ?? 0 }, (_, place) => selection?.getRangeAt(place));
  const focused = document.activeElement;
  return () => {
    selection?.removeAllRanges();
    ranges.forEach((range) => range && selection?.addRange(range));
    if (focused instanceof HTMLElement) focused.focus({ preventScroll: true });
  };
}

function selectInField(text: string): () => void {
  const field = document.createElement('textarea');
  field.className = COPY_FIELD_CLASS;
  field.value = text;
  field.readOnly = true;
  field.setAttribute('aria-hidden', 'true');
  document.body.append(field);
  field.select();
  field.setSelectionRange(0, text.length);
  return () => field.remove();
}
