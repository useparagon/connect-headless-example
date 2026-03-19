import { Header } from '@/components/layout/header';
import { paragon } from '@useparagon/connect';
import { useQuery } from '@tanstack/react-query';

import { getAppConfig } from '@/lib/config';
import { setupMockDataSources } from '@/lib/mock-data-sources';
import { ThemeProvider } from '@/lib/themes/theme-provider';
import { IntegrationList } from '@/components/feature/integration/integration-list';
import { IntegrationCard } from '@/components/feature/integration/integration-card';
import { ErrorCard } from '@/components/ui/error-card';

export function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div>
        <Header />
        <div className="container mx-auto py-4 px-8">
          <AuthenticatedApp />
        </div>
      </div>
    </ThemeProvider>
  );
}

async function authenticate() {
  const config = getAppConfig();

  if (!config.success) {
    throw config.error;
  }

  paragon.configureGlobal(
    { host: 'https://staging.paragonsandbox.com' },
    {
      CONNECT_PUBLIC_URL: 'https://staging-connect.paragonsandbox.com',
      DASHBOARD_PUBLIC_URL: 'https://staging.paragonsandbox.com',
      WORKER_PROXY_PUBLIC_URL: 'https://staging-proxy.paragonsandbox.com',
      ZEUS_PUBLIC_URL: 'https://staging-zeus.paragonsandbox.com',
      CDN_PUBLIC_URL:
        'https://staging-cdn.paragonsandbox.com/2024.1113.1547-5202e3b3/dashboard/public',
      HERMES_PUBLIC_URL: 'https://staging-hermes.paragonsandbox.com',
    },
  );

  await paragon.authenticate(
    config.data.VITE_PARAGON_PROJECT_ID,
    config.data.VITE_PARAGON_JWT_TOKEN,
  );
  paragon.setHeadless(true);

  setupMockDataSources();

  return null;
}

function AuthenticatedApp() {
  const {
    isLoading,
    error,
    refetch: reauthenticate,
  } = useQuery({
    queryKey: ['authentication'],
    queryFn: authenticate,
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-medium mb-4">Integrations</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          <IntegrationCard.Skeleton />
          <IntegrationCard.Skeleton />
          <IntegrationCard.Skeleton />
          <IntegrationCard.Skeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorCard error={error} onRetry={reauthenticate} />;
  }

  return <IntegrationList />;
}
