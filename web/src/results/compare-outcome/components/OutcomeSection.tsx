import type { ResultClip } from '../../results.types';
import { type Outcome, rankOutcome } from '../lib/rank-outcome';

const SHARE_DECIMALS = 1;

export function OutcomeSection({ clips }: { clips: readonly ResultClip[] }) {
  const outcome = rankOutcome(clips);
  return (
    <section className="group-section">
      <h2 className="list-header">Ranking Against Outcome</h2>
      <div className="group group--padded" id="outcome">
        {outcome === null ? (
          <p className="list-footer">Enter views for at least two clips.</p>
        ) : (
          <RankedClips outcome={outcome} />
        )}
      </div>
    </section>
  );
}

function RankedClips({ outcome }: { outcome: Outcome }) {
  return (
    <>
      <p>{outcome.sentence}</p>
      <ol className="outcome">
        {outcome.rows.map((row) => (
          <li className="outcome__row" key={row.id}>
            <div className="outcome__head">
              <span>{row.title}</span>
              <span className="numeric">{row.views}</span>
            </div>
            <div className="outcome__track">
              <span className="outcome__fill" style={{ width: `${row.sharePercent.toFixed(SHARE_DECIMALS)}%` }} />
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
