import { paragon } from '@useparagon/connect';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { App } from '@/app';

const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_PARAGON_PROJECT_ID;
const jwtToken = import.meta.env.VITE_PARAGON_JWT_TOKEN;

async function main() {
  window.paragon = paragon;

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
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
}

main();
