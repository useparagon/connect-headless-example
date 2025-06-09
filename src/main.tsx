import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { paragon } from '@useparagon/connect';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { z } from 'zod';

import { App } from '@/app';

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const config = z
  .object({
    VITE_PARAGON_PROJECT_ID: z.string(),
    VITE_PARAGON_JWT_TOKEN: z.string(),
  })
  .parse(import.meta.env);

async function main() {
  window.paragon = paragon;

  paragon.setHeadless(true);

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  try {
    await paragon.authenticate(
      config.VITE_PARAGON_PROJECT_ID,
      config.VITE_PARAGON_JWT_TOKEN
    );
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
