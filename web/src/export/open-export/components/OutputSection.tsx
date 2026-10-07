import type { ExportLook } from '../../export.types';
import { describeLook, FORMAT_LINE } from '../lib/describe-output';

export function OutputSection({ look }: { look: ExportLook }) {
  return (
    <section className="group-section">
      <h2 className="list-header">Output</h2>
      <dl className="group divided">
        <div className="row">
          <dt className="row__label">Look</dt>
          <dd className="row__value">{describeLook(look)}</dd>
        </div>
        <div className="row">
          <dt className="row__label">Format</dt>
          <dd className="row__value">{FORMAT_LINE}</dd>
        </div>
      </dl>
      <p className="list-footer">Change the look on the Review tab.</p>
    </section>
  );
}
