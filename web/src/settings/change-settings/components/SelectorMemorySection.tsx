import { listLearnedRows, type Rejections } from '../lib/setting-options';

interface SelectorMemorySectionProps {
  rejections: Rejections;
  forgetHistory: () => void;
}

export function SelectorMemorySection({ rejections, forgetHistory }: SelectorMemorySectionProps) {
  return (
    <section className="group-section">
      <h2 className="list-header">What the Selector Has Learned</h2>
      <ul className="group divided">
        {listLearnedRows(rejections).map((row) => (
          <li className="row" key={row.reason}>
            <span className="row__label">{row.label}</span>
            <span className="memory-count numeric">{row.count}</span>
          </li>
        ))}
        <li>
          <button
            type="button"
            className="row__action row__action--destructive"
            id="forget-preferences"
            onClick={forgetHistory}
          >
            Forget All of It
          </button>
        </li>
      </ul>
      <p className="list-footer">Rejections you gave a reason for. They steer the picks on your next video.</p>
    </section>
  );
}
