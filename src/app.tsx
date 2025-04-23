import { useQuery } from '@tanstack/react-query';
import { paragon } from '@useparagon/connect';

import { Header } from '@/components/layout/header';
import { IntegrationCard } from '@/components/feature/integration-card';

export function App() {
  const user = paragon.getUser();
  const { data: integrations, isLoading } = useIntegrationMetadata();

  if (isLoading || !integrations) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />

      <div className="py-4 px-8">
        <h1 className="text-2xl font-medium mb-4">Integrations</h1>
        <ul className="flex flex-wrap gap-4">
          {integrations.map((integration) => {
            const integrationEnabled =
              user.authenticated &&
              user.integrations[integration.type]?.enabled;

            return (
              <li key={integration.type}>
                <IntegrationCard
                  key={integration.type}
                  type={integration.type}
                  name={integration.name}
                  icon={integration.icon}
                  enabled={integrationEnabled ?? false}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function useIntegrationMetadata() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: () => {
      return paragon.getIntegrationMetadata();
    },
  });
}
