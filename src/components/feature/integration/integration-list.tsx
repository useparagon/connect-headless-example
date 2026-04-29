import { useAuthenticatedUser, useIntegrationMetadata } from '@/lib/hooks';
import {
  AuthenticatedConnectUser,
  IntegrationMetadata,
  SDK_EVENT,
  paragon,
} from '@useparagon/connect';

import { Input } from '@/components/ui/input';
import { IntegrationCard } from './integration-card';
import { useEffect, useMemo, useState } from 'react';

export function IntegrationList() {
  const { data: user, refetch: refetchUser } = useAuthenticatedUser();
  const {
    data: integrations,
    isLoading: isLoadingIntegrations,
    refetch: refetchIntegrations,
  } = useIntegrationMetadata();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const updateUser = () => {
      refetchUser();
      refetchIntegrations();
    };

    paragon.subscribe(SDK_EVENT.ON_INTEGRATION_INSTALL, updateUser);
    paragon.subscribe(SDK_EVENT.ON_INTEGRATION_UNINSTALL, updateUser);

    return () => {
      paragon.unsubscribe(SDK_EVENT.ON_INTEGRATION_INSTALL, updateUser);
      paragon.unsubscribe(SDK_EVENT.ON_INTEGRATION_UNINSTALL, updateUser);
    };
  }, [refetchUser, refetchIntegrations]);

  const filteredIntegrations = useMemo(() => {
    if (!integrations || !user) {
      return [];
    }

    const sorted = [...integrations].sort(byEnabledOnTop(user));
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return sorted;
    }

    return sorted.filter(
      (integration) =>
        integration.name.toLowerCase().includes(query) ||
        integration.type.toLowerCase().includes(query),
    );
  }, [integrations, user, searchQuery]);

  if (!user || isLoadingIntegrations || !integrations) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-medium mb-4">Integrations</h2>
        <Input
          type="search"
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="mb-4 max-w-sm"
        />
        {filteredIntegrations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No integrations match your search.
          </p>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 items-stretch">
            {filteredIntegrations.map((integration) => {
              const integrationInfo = user.integrations[integration.type];

              if (!integrationInfo) {
                return null;
              }

              return (
                <li key={integration.type} className="flex w-full">
                  <IntegrationCard
                    type={integration.type}
                    name={integration.name}
                    icon={integration.icon}
                    integrationInfo={integrationInfo}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function byEnabledOnTop(user: AuthenticatedConnectUser) {
  return function (a: IntegrationMetadata, b: IntegrationMetadata) {
    const aEnabled = user.integrations[a.type]?.enabled;
    const bEnabled = user.integrations[b.type]?.enabled;
    return aEnabled ? -1 : bEnabled ? 1 : 0;
  };
}
