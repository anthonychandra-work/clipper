import { Icon } from '@/shared/ui';

export function ClipFlag({ note }: { note: string }) {
  return (
    <div className="group flag" role="note">
      <Icon name="warning" />
      <p className="flag__message">{note}</p>
    </div>
  );
}
