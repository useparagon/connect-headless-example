import { useAuthenticatedUser, useIntegrationMetadata } from '@/lib/hooks';
import {
  AuthenticatedConnectUser,
  IIntegrationMetadata,
} from '@useparagon/connect';

import { IntegrationCard } from './integration-card';

export function IntegrationList() {
  const { data: user, refetch: refetchUser } = useAuthenticatedUser();
  const {
    data: integrations,
    isLoading: isLoadingIntegrations,
    refetch: refetchIntegrations,
  } = useIntegrationMetadata();

  if (!user || isLoadingIntegrations || !integrations) {
    return <div>Loading...</div>;
  }

  const sortedIntegrations = integrations.sort(byEnabledOnTop(user));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-medium mb-4">Integrations</h2>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {sortedIntegrations.map((integration) => {
            const integrationInfo = user.integrations[integration.type];

            if (!integrationInfo) {
              return null;
            }

            return (
              <li key={integration.type}>
                <IntegrationCard
                  integration={integration.type}
                  name={integration.name}
                  icon={integration.icon}
                  status={integrationInfo.credentialStatus}
                  onInstall={() => {
                    refetchIntegrations();
                    refetchUser();
                  }}
                  onUninstall={() => {
                    refetchIntegrations();
                    refetchUser();
                  }}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function byEnabledOnTop(user: AuthenticatedConnectUser) {
  return function (a: IIntegrationMetadata, b: IIntegrationMetadata) {
    const aEnabled = user.integrations[a.type]?.enabled;
    const bEnabled = user.integrations[b.type]?.enabled;
    return aEnabled ? -1 : bEnabled ? 1 : 0;
  };
}
