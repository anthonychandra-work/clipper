import { Icon } from '@/shared/ui';

interface ClipFlagProps {
  note: string;
  onStartEarlier?: () => void;
}

export function ClipFlag({ note, onStartEarlier }: ClipFlagProps) {
  return (
    <div className="group flag" role="note">
      <Icon name="warning" />
      <p className="flag__message">{note}</p>
      {onStartEarlier === undefined ? null : (
        <button type="button" className="button" id="flag-fix" onClick={onStartEarlier}>
          Start One Sentence Earlier
        </button>
      )}
    </div>
  );
}
