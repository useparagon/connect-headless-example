import { Header } from '@/components/layout/header';
import { IntegrationCard } from '@/components/feature/integration-card';
import { useAuthenticatedUser, useIntegrationMetadata } from '@/lib/hooks';
import { IIntegrationMetadata } from 'node_modules/@useparagon/connect/dist/src/entities/integration.interface';

export function App() {
  return (
    <div>
      <Header />

      <div className="py-4 px-8">
        <IntegrationList />
      </div>
    </div>
  );
}

function IntegrationList() {
  const { data: user } = useAuthenticatedUser();
  const { data: integrations, isLoading: isLoadingIntegrations } =
    useIntegrationMetadata();

  if (!user || isLoadingIntegrations || !integrations) {
    return <div>Loading...</div>;
  }

  const [connectedIntegrations, notConnectedIntegrations] = integrations.reduce(
    (acc, integration) => {
      const integrationInfo = user.integrations[integration.type];
      if (integrationInfo?.enabled) {
        acc[0].push(integration);
      } else {
        acc[1].push(integration);
      }

      return acc;
    },
    [[], []] as [IIntegrationMetadata[], IIntegrationMetadata[]]
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-medium mb-4">Connected Integrations</h2>
        <ul className="flex flex-wrap gap-4">
          {connectedIntegrations.map((integration) => {
            const integrationInfo = user.integrations[integration.type];

            if (!integrationInfo) {
              return null;
            }

            return (
              <li key={integration.type}>
                <IntegrationCard
                  key={integration.type}
                  type={integration.type}
                  name={integration.name}
                  icon={integration.icon}
                  enabled={integrationInfo.enabled}
                />
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-medium mb-4">Disconnected Integrations</h2>
        <ul className="flex flex-wrap gap-4">
          {notConnectedIntegrations.map((integration) => {
            const integrationInfo = user.integrations[integration.type];

            if (!integrationInfo) {
              return null;
            }

            return (
              <li key={integration.type}>
                <IntegrationCard
                  key={integration.type}
                  type={integration.type}
                  name={integration.name}
                  icon={integration.icon}
                  enabled={integrationInfo.enabled}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
