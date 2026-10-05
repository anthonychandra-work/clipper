'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { readProblem } from '@/shared/lib/read-problem';
import { Sheet, SheetGrabber, showToast, useDismissSheet, useShell } from '@/shell';

import { refreshProjects } from '../../list-projects';
import { startUpload } from '../../upload-video';
import { createProject } from '../api/create-project';
import { type DraftEditor, useDraft } from '../hooks/use-draft';
import { findDraftProblem } from '../lib/find-draft-problem';
import { BriefSection } from './BriefSection';
import { ClipLengthSection } from './ClipLengthSection';
import { PlatformsSection } from './PlatformsSection';
import { SourceSection } from './SourceSection';

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
      <NewProjectForm />
    </Sheet>
  );
}

function NewProjectForm() {
  const router = useRouter();
  const editor = useDraft();
  const [isSending, setIsSending] = useState(false);

  async function findClips(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = findDraftProblem(editor.draft);
    if (problem) return editor.showProblem(problem);
    setIsSending(true);
    const openedAddress = await sendDraft(editor);
    setIsSending(false);
    if (openedAddress !== null) router.replace(openedAddress);
  }

  return (
    <form className="sheet__form" noValidate onSubmit={findClips}>
      <SheetBar isSending={isSending} />
      <div className="sheet__body">
        <SourceSection editor={editor} />
        <ClipLengthSection editor={editor} />
        <PlatformsSection editor={editor} />
        <BriefSection editor={editor} />
      </div>
    </form>
  );
}

async function sendDraft(editor: DraftEditor): Promise<string | null> {
  const { draft } = editor;
  try {
    const project = await createProject(draft);
    if (draft.sourceKind === 'file' && draft.file !== null) startUpload(project.id, draft.file);
    await refreshProjects();
    return `/projects/${project.id}`;
  } catch (error) {
    const problem = readProblem(error);
    if (problem.section === null) showToast(problem.message);
    else editor.showProblem(problem);
    return null;
  }
}

function SheetBar({ isSending }: { isSending: boolean }) {
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
      <button type="submit" className="bar-button bar-button--tinted" id="sheet-confirm" disabled={isSending}>
        Find Clips
      </button>
    </header>
  );
}
