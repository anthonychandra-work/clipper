'use client';

import { useDiskLine } from '../hooks/use-projects';
import { ProjectRows } from './ProjectRows';

export function SidebarProjects() {
  return (
    <>
      <h2 className="list-header">Projects</h2>
      <ProjectRows isGrouped={false} />
    </>
  );
}

export function SidebarDiskLine() {
  return <p className="sidebar__disk numeric">{useDiskLine()}</p>;
}
