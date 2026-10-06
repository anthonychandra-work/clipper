import { Icon } from '@/shared/ui';

export function SourceGoneNotice() {
  return (
    <section className="preview preview--gone" aria-label="Clip preview">
      <div className="player player--gone">
        <Icon name="film" />
        <p>Preview unavailable. The source video was deleted to free space.</p>
      </div>
    </section>
  );
}
