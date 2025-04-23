import { paragon } from '@useparagon/connect';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app';

function main() {
  window.paragon = paragon;

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

main();
