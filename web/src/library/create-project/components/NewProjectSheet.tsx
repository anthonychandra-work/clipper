'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';

import { Sheet, SheetGrabber, useDismissSheet, useShell } from '@/shell';

const LIBRARY_ADDRESS = '/';

export function NewProjectSheet() {
  const router = useRouter();
  const { previousAddress } = useShell();

  function returnToWhereTheUserWas() {
    if (previousAddress === null) router.replace(LIBRARY_ADDRESS);
    else router.back();
  }

  return (
    <Sheet onDismiss={returnToWhereTheUserWas}>
      <form className="sheet__form" noValidate onSubmit={keepThePage}>
        <SheetBar />
        <div className="sheet__body" />
      </form>
    </Sheet>
  );
}

function SheetBar() {
  const dismiss = useDismissSheet();
  return (
    <header className="sheet__bar">
      <SheetGrabber />
      <button type="button" className="bar-button" id="sheet-cancel" onClick={dismiss}>
        Cancel
      </button>
      <h2 className="sheet__title" id="sheet-title">
        New Project
      </h2>
      <button type="submit" className="bar-button bar-button--tinted" id="sheet-confirm">
        Find Clips
      </button>
    </header>
  );
}

function keepThePage(event: FormEvent<HTMLFormElement>): void {
  event.preventDefault();
}
