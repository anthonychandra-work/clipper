import { PagePane } from '@/shared/ui';

export function EmptyReview() {
  return (
    <PagePane name="clips">
      <section className="group-section" aria-labelledby="candidates-heading">
        <h2 className="list-header" id="candidates-heading">
          Candidates
        </h2>
        <ol className="group divided">
          <li className="row candidate-list__empty">No clips in this group.</li>
        </ol>
      </section>
    </PagePane>
  );
}
