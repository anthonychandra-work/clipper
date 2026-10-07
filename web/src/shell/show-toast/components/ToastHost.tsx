'use client';

import { useToast } from '../hooks/use-toast';

export function ToastHost() {
  const message = useToast();
  return (
    <div id="toast" className="toast" role="status" aria-live="polite" hidden={message === null}>
      {message}
    </div>
  );
}
