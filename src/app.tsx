import { Header } from '@/components/layout/header';
import { paragon } from '@useparagon/connect';
import { useQuery } from '@tanstack/react-query';

import { getAppConfig } from '@/lib/config';
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

  await paragon.authenticate(
    config.data.VITE_PARAGON_PROJECT_ID,
    config.data.VITE_PARAGON_JWT_TOKEN
  );
  paragon.setHeadless(true);

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
