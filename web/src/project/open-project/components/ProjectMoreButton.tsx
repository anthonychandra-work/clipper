'use client';

import { useCallback, useState } from 'react';

import type { Project } from '@/library';
import { Icon } from '@/shared/ui';
import { Menu, MenuItem } from '@/shell';

import { DeleteProjectAlert } from '../../delete-project';

const MORE_BUTTON_ID = 'project-more';

type Presented = 'menu' | 'delete-alert' | null;

export function ProjectMoreButton({ project }: { project: Project }) {
  const [presented, setPresented] = useState<Presented>(null);
  const close = useCallback(() => setPresented(null), []);

  return (
    <>
      <button
        type="button"
        className="bar-button bar-button--icon"
        id={MORE_BUTTON_ID}
        aria-haspopup="menu"
        aria-expanded={presented === 'menu'}
        aria-label="More"
        onClick={() => setPresented(presented === 'menu' ? null : 'menu')}
      >
        <Icon name="ellipsis" />
      </button>
      {presented === 'menu' ? (
        <Menu label="Project" anchorId={MORE_BUTTON_ID} onClose={close}>
          <MenuItem id="project-delete" isDestructive onSelect={() => setPresented('delete-alert')}>
            Delete Project…
          </MenuItem>
        </Menu>
      ) : null}
      {presented === 'delete-alert' ? <DeleteProjectAlert project={project} onClose={close} /> : null}
    </>
  );
}
