import { useEffect, useMemo, useState } from 'react';
import { ComboboxField } from '../form/combobox-field';
import { useAuthenticatedUser, useIntegrationMetadata } from '@/lib/hooks';
import { Button } from '../ui/button';
import { Check, Loader2, Play, XCircle } from 'lucide-react';
import {
  paragon,
  SidebarInputType,
  type ConnectInputValue,
  type SerializedConnectInput,
} from '@useparagon/connect';
import { IntegrationModal } from './integration/integration-modal/integration-modal';
import { useMutation, useQuery } from '@tanstack/react-query';
import { config } from '@/main';
import { SerializedConnectInputPicker } from './serialized-connect-input-picker';
import inputsMapping from '@/lib/inputsMapping.json';

const IntegrationTitle = ({ integration }: { integration: string | null }) => {
  const { data: integrations } = useIntegrationMetadata();

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

type ParagonAction = {
  name: string;
  title: string;
  description?: string;
  inputs?: SerializedConnectInput[];
};

export default function ActionTester() {
  const [integration, setIntegration] = useState<string | null>(null);
  const { data: user, refetch: refetchUser } = useAuthenticatedUser();
  const { data: integrations, isLoading: isLoadingIntegrations } =
    useIntegrationMetadata();
  const integrationMetadata = integrations?.find((i) => i.type === integration);
  const [integrationQuery, setIntegrationQuery] = useState('');


  const actions = useQuery<ParagonAction[]>({
    queryKey: ['actions', integration],
    queryFn: async () => {
      if (!integration || !user?.integrations[integration]?.enabled) {
        return [] as ParagonAction[];
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
       return ((integration && data.actions[integration]) ?? []) as ParagonAction[];
    },
  });
  const [action, setAction] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<
    Record<string, ConnectInputValue>
  >({});
  const [actionQuery, setActionQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedAction: ParagonAction | null = useMemo(() => {
    return actions.data?.find((a) => a.name === action) ?? null;
  }, [actions.data, action]);

  const filteredIntegrations = useMemo(() => {
    const query = integrationQuery.trim().toLowerCase();
    if (!integrations) return [];
    if (!query) return integrations;
    return integrations.filter(
      (i) =>
        (i.name ?? '').toLowerCase().includes(query) ||
        (i.type ?? '').toLowerCase().includes(query),
    );
  }, [integrations, integrationQuery]);

  const filteredActions = useMemo(() => {
    const list = actions.data ?? [];
    const query = actionQuery.trim().toLowerCase();
    if (!query) return list;
    return list.filter((a) => {
      const title = (a.title ?? '').toLowerCase();
      const name = (a.name ?? '').toLowerCase();
      return title.includes(query) || name.includes(query);
    });
  }, [actions.data, actionQuery]);

  useEffect(() => {
    if (!selectedAction) {
      setInputValues({});
      return;
    }
    const initial: Record<string, ConnectInputValue> = {};
    for (const input of selectedAction.inputs ?? []) {
      type ExtendedSerializedConnectInput = SerializedConnectInput & {
        value?: unknown;
      };
      const withValue = input as ExtendedSerializedConnectInput;
      if (withValue.value !== undefined) {
        initial[input.id] = withValue.value as ConnectInputValue;
      }
    }
    setInputValues(initial);
  }, [selectedAction]);

  useEffect(() => {
    setIsModalOpen(false);
  }, [integration]);

  const runAction = useMutation({
    mutationFn: async () => {
      if (!selectedAction) {
        throw new Error('No action selected');
      }
      const response = await fetch(
        `https://actionkit.useparagon.com/projects/${config.VITE_PARAGON_PROJECT_ID}/actions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.VITE_PARAGON_JWT_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: selectedAction.name,
            parameters: inputValues,
          }),
        },
      );
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      const data = await response.json();
      return data;
    },
  });

  const [isDisconnecting, setIsDisconnecting] = useState(false);

  if (!user || isLoadingIntegrations || !integrations) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex gap-4 h-min-screen relative">
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
              onSelect={(value) => {
                setIntegration(value ?? null);
              }}
              onOpenChange={(open) => {
                if (!open) {
                  setIntegrationQuery('');
                }
              }}
              onDebouncedChange={setIntegrationQuery}
              renderValue={(value) => <IntegrationTitle integration={value} />}
            >
              {filteredIntegrations
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
                        paragon.uninstallIntegration(integration).then(() => {
                          refetchUser();
                          setIsDisconnecting(false);
                        });
                        setIsDisconnecting(true);
                      }}
                    >
                      Disconnect account{' '}
                      {isDisconnecting && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-4 items-center mt-2">
                    <Button
                      size="sm"
                      className="bg-indigo-500 hover:bg-indigo-600 text-white"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Connect to {integrationMetadata?.name}
                    </Button>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Connect an account to test Actions.
                    </p>
                  </div>
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
            onOpenChange={(open) => {
              if (!open) {
                setActionQuery('');
              }
            }}
            onDebouncedChange={setActionQuery}
            renderValue={(value) => (
              <p>{actions.data?.find((a) => a.name === value)?.title}</p>
            )}
          >
            {filteredActions.map((action) => (
              <ComboboxField.Item key={action.name} value={action.name}>
                <p>{action.title}</p>
              </ComboboxField.Item>
            ))}
          </ComboboxField>
          {selectedAction &&
            selectedAction.inputs?.map((input: SerializedConnectInput) => (
              <SerializedConnectInputPicker
                key={input.id}
                integration={integration!}
                field={overrideInput(integration!, input)}
                value={inputValues[input.id]}
                onChange={(v) =>
                  setInputValues((prev) => ({ ...prev, [input.id]: v }))
                }
              />
            ))}
          <div>
            <Button
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
              disabled={!selectedAction || runAction.isLoading}
              onClick={() => runAction.mutate()}
            >
              <Play className="size-3 mr-1 fill-white" /> Run Action{' '}
              {runAction.isLoading && (
                <Loader2 className="size-4 animate-spin" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="w-[40%] max-h-[calc(100dvh-10rem)] border border-neutral-200 dark:border-neutral-800 rounded-md p-8 px-6 sticky top-22">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Output</h1>
          <div className="flex gap-2 items-center">
            {runAction.isSuccess && <Check className="size-5 text-green-600" />}
            {runAction.isError && (
              <XCircle className="size-5 fill-red-500 text-white" />
            )}
            {runAction.isLoading && <Loader2 className="size-4 animate-spin" />}
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-500">
              {runAction.isSuccess
                ? 'Success'
                : runAction.isError
                ? 'Error'
                : runAction.isLoading
                ? 'Running...'
                : ''}
            </p>
          </div>
        </div>
        {runAction.data || runAction.error ? (
          <div className="flex flex-col gap-2 h-full pb-4">
            <pre className="text-xs p-2 bg-neutral-100 dark:bg-neutral-900 rounded-md overflow-x-scroll">
              {runAction.data
                ? JSON.stringify(runAction.data, null, 2)
                : runAction.error
                ? JSON.stringify(runAction.error, null, 2)
                : ''}
            </pre>
          </div>
        ) : (
          <div className="flex flex-col gap-2 border border-neutral-200 dark:border-neutral-800 rounded-md p-4">
            <p className="text-center text-neutral-500 dark:text-neutral-400 text-sm">
              {runAction.isLoading
                ? 'Running...'
                : 'Run an Action to see the output here.'}
            </p>
          </div>
        )}
      </div>
      {isModalOpen &&
        integration &&
        !user.integrations[integration]?.enabled && (
          <IntegrationModal
            onOpenChange={setIsModalOpen}
            integration={integration!}
            name={integrationMetadata?.name ?? ''}
            icon={integrationMetadata?.icon ?? ''}
            status={undefined}
            onInstall={() => {
              refetchUser().then(() => {
                actions.refetch();
              }); 
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

function overrideInput(
  integration: string,
  input: SerializedConnectInput,
) {
  const mapping =
    (inputsMapping as unknown as Record<string, Record<string, string>>) ||
    ({} as Record<string, Record<string, string>>);
  const sourceType = mapping[integration]?.[input.id as string];
  if (sourceType) {
    return {
      ...(input as SerializedConnectInput<SidebarInputType.DynamicEnum>),
      type: SidebarInputType.DynamicEnum,
      sourceType,
    } as SerializedConnectInput;
  }
  return input;
}
