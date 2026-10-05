import { REJECT_REASONS } from '../lib/setting-options';

const NOTHING_LEARNED_YET = 0;

export function SelectorMemorySection() {
  return (
    <section className="group-section">
      <h2 className="list-header">What the Selector Has Learned</h2>
      <ul className="group divided">
        {REJECT_REASONS.map((reason) => (
          <li className="row" key={reason.value}>
            <span className="row__label">{reason.label}</span>
            <span className="memory-count numeric">{NOTHING_LEARNED_YET}</span>
          </li>
        ))}
        <li>
          <button
            type="button"
            className="row__action row__action--destructive"
            id="forget-preferences"
            disabled
          >
            Forget All of It
          </button>
        </li>
      </ul>
      <p className="list-footer">Rejections you gave a reason for. They steer the picks on your next video.</p>
    </section>
  );
}
