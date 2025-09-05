import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { paragon } from '@useparagon/connect';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

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

async function main() {
  window.paragon = paragon;

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  );
}

main();
