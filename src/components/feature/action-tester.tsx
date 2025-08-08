import { useState } from 'react';
import { ComboboxField } from '../form/combobox-field';
import { useAuthenticatedUser, useIntegrationMetadata } from '@/lib/hooks';
import { Button } from '../ui/button';
import { Check } from 'lucide-react';
import { paragon, SidebarInputType } from '@useparagon/connect';
import { IntegrationModal } from './integration/integration-modal/integration-modal';
import { useQuery } from '@tanstack/react-query';
import { config } from '@/main';
import { SerializedConnectInputPicker } from './serialized-connect-input-picker';
import inputsMapping from '@/lib/inputsMapping.json';

const IntegrationTitle = ({ integration }: { integration: string | null }) => {
  const { data: integrations, isLoading: isLoadingIntegrations } =
    useIntegrationMetadata();

  const integrationMetadata = integrations?.find((i) => i.type === integration);
  if (!integrationMetadata) {
    return null;
  }

  return (
    <div className="flex gap-2 items-center">
      <img
        className="h-4 w-4"
        src={integrationMetadata.icon}
        alt={integrationMetadata.name}
      />
      <p>{integrationMetadata.name}</p>
    </div>
  );
};

export default function ActionTester() {
  const [integration, setIntegration] = useState<string | null>(null);
  const { data: user, refetch: refetchUser } = useAuthenticatedUser();
  const {
    data: integrations,
    isLoading: isLoadingIntegrations,
    refetch: refetchIntegrations,
  } = useIntegrationMetadata();
  const integrationMetadata = integrations?.find((i) => i.type === integration);
  const actions = useQuery({
    queryKey: ['actions', integration],
    queryFn: async () => {
      if (!integration || !user?.integrations[integration]?.enabled) {
        return [];
      }
      const response = await fetch(
        `https://actionkit.useparagon.com/projects/${config.VITE_PARAGON_PROJECT_ID}/actions?integrations=${integration}&format=paragon`,
        {
          headers: {
            Authorization: `Bearer ${config.VITE_PARAGON_JWT_TOKEN}`,
          },
        },
      );
      const data = await response.json();
      return (integration && data.actions[integration]) ?? [];
    },
  });
  const [action, setAction] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user || isLoadingIntegrations || !integrations) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex gap-4 h-min-screen">
      <div className="flex-1 border border-neutral-200 dark:border-neutral-800 rounded-md p-8">
        <h1 className="text-xl font-bold mb-4">Actions</h1>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <ComboboxField
              id="integration"
              title="Integration"
              value={integration}
              placeholder="Select an integration"
              allowClear
              required
              isFetching={false}
              onSelect={(value) => setIntegration(value ?? null)}
              onDebouncedChange={() => {}}
              renderValue={(value) => <IntegrationTitle integration={value} />}
            >
              {integrations
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((integration) => (
                  <ComboboxField.Item
                    key={integration.name}
                    value={integration.type}
                  >
                    <IntegrationTitle integration={integration.type} />
                  </ComboboxField.Item>
                ))}
            </ComboboxField>
            {integration && (
              <div>
                {user.integrations[integration]?.enabled ? (
                  <div className="flex gap-2 items-center">
                    <Check className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Connected
                    </p>
                    <Button
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() => {
                        paragon.uninstallIntegration(integration);
                        refetchUser();
                      }}
                    >
                      Disconnect account
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsModalOpen(true)}>
                    Connect an account
                  </Button>
                )}
              </div>
            )}
          </div>
          <ComboboxField
            id="action"
            title="Action"
            value={action}
            placeholder="Select an Action"
            allowClear
            required
            isFetching={actions.isLoading}
            disabled={!integration || !user.integrations[integration]?.enabled}
            onSelect={(value) => setAction(value ?? null)}
            onDebouncedChange={() => {}}
            renderValue={(value) => (
              <p>{actions.data?.find((a: any) => a.name === value)?.title}</p>
            )}
          >
            {actions.data?.map((action: any) => (
              <ComboboxField.Item key={action.name} value={action.name}>
                <p>{action.title}</p>
              </ComboboxField.Item>
            ))}
          </ComboboxField>
          {action &&
            actions.data
              ?.find((a: any) => a.name === action)
              ?.inputs.map((input: any) => (
                <SerializedConnectInputPicker
                  key={input.id}
                  integration={integration!}
                  field={overrideInput(integration!, input)}
                  value={input.value}
                  onChange={() => {}}
                />
                // <div key={input.id} className="text-sm">
                //   <p className="font-medium">{input.title}</p>
                //   <p className="text-neutral-500 dark:text-neutral-400">
                //     {input.subtitle}
                //   </p>
                // </div>
              ))}
        </div>
      </div>
      <div className="w-[400px] border border-neutral-200 dark:border-neutral-800 rounded-md p-4">
        <h1>Output</h1>
      </div>
      {isModalOpen && (
        <IntegrationModal
          onOpenChange={setIsModalOpen}
          integration={integration!}
          name={integrationMetadata?.name ?? ''}
          icon={integrationMetadata?.icon ?? ''}
          status={undefined}
          onInstall={() => {
            refetchUser();
            setIsModalOpen(false);
          }}
          onUninstall={() => {
            refetchUser();
          }}
        />
      )}
    </div>
  );
}

function overrideInput(integration: string, input: any) {
  const sourceType =
    // @ts-ignore
    inputsMapping?.[integration as keyof typeof inputsMapping]?.[input.id];
  if (sourceType) {
    return {
      ...input,
      type: SidebarInputType.DynamicEnum,
      sourceType,
    };
  }
  return input;
}
