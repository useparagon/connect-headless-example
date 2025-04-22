import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { paragon } from '@useparagon/connect';

import { App } from './app';

if (typeof window !== 'undefined') {
  window.paragon = paragon;
}

function main() {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

main();
