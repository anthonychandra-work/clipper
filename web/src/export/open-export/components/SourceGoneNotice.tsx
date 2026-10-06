import { Icon } from '@/shared/ui';

export function SourceGoneNotice() {
  return (
    <div className="group flag" role="note">
      <Icon name="warning" />
      <p className="flag__message">
        The source video was deleted to free space. Finished exports are still here. New clips cannot be rendered.
      </p>
    </div>
  );
}
