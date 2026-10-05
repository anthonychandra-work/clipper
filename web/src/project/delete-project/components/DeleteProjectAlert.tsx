'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { type Project, refreshProjects } from '@/library';
import { readProblem } from '@/shared/lib/read-problem';
import { Sheet, showToast, useDismissSheet } from '@/shell';

import { deleteProject } from '../api/delete-project';

const LIBRARY_ADDRESS = '/';

interface DeleteProjectAlertProps {
  project: Project;
  onClose: () => void;
}

export function DeleteProjectAlert({ project, onClose }: DeleteProjectAlertProps) {
  return (
    <Sheet onDismiss={onClose}>
      <DeleteQuestion project={project} onClose={onClose} />
    </Sheet>
  );
}

function DeleteQuestion({ project, onClose }: DeleteProjectAlertProps) {
  const router = useRouter();
  const cancel = useDismissSheet();
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteForGood() {
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      showToast('Project deleted');
      router.replace(LIBRARY_ADDRESS);
    } catch (error) {
      showToast(readProblem(error).message);
    }
    await refreshProjects();
    onClose();
  }

  return (
    <div className="alert">
      <h2 className="alert__title" id="sheet-title">
        Delete “{project.title}”?
      </h2>
      <p className="alert__message">
        This removes the video, its clips and its exports from this Mac. It cannot be undone.
      </p>
      <div className="alert__actions">
        <button type="button" className="button" id="delete-cancel" onClick={cancel}>
          Cancel
        </button>
        <button
          type="button"
          className="button button--destructive"
          id="delete-confirm"
          disabled={isDeleting}
          onClick={deleteForGood}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
