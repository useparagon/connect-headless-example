import { paragon } from '@useparagon/connect';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app';

const projectId = import.meta.env.VITE_PARAGON_PROJECT_ID;
const jwtToken = import.meta.env.VITE_PARAGON_JWT_TOKEN;

async function main() {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  try {
    await paragon.authenticate(projectId, jwtToken);
    console.log('Successfully authenticated!');
  } catch (error) {
    throw new Error(`Failed to authenticate with Paragon: ${error}`);
  }

  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

main();
