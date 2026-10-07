'use client';

import { showToast } from '@/shell';

export function PhoneAccessSection({ phoneAddress }: { phoneAddress: string }) {
  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(phoneAddress);
      showToast('Copied');
    } catch {
      showToast('Copying is blocked here. Select the text and copy it.');
    }
  }

  return (
    <section className="group-section">
      <h2 className="list-header">Open on Your Phone</h2>
      <div className="group">
        <div className="row">
          <span className="address">{phoneAddress}</span>
          <button type="button" className="button" id="copy-phone-address" onClick={copyAddress}>
            Copy
          </button>
        </div>
      </div>
      <p className="list-footer">The phone and this Mac must be on the same Wi-Fi.</p>
    </section>
  );
}
