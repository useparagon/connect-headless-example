import { useState, useEffect, useMemo } from 'react';
import debounce from 'lodash/debounce';
import {
  ConnectInputValue,
  CredentialStatus,
  IntegrationSharedInputStateMap,
  IntegrationWorkflowMeta,
  IntegrationWorkflowStateMap,
  paragon,
  SerializedConnectInput,
} from '@useparagon/connect';
import { AlertTriangleIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntegrationConfig } from '@/lib/hooks';
import { cn } from '@/lib/utils';

import { SerializedConnectInputPicker } from './serialized-connect-input-picker';

type InstallFlowStage = ReturnType<typeof paragon.installFlow.next>;

type Props = {
  integration: string;
  name: string;
  icon: string;
  status: CredentialStatus | undefined;
  onInstall: () => void;
  onUninstall: () => void;
};

export function IntegrationCard(props: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Card
      className={cn(
        'hover:shadow-xs transition-shadow',
        !props.status && 'border-dashed shadow-none'
      )}
    >
      <CardContent>
        <CardTitle>
          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-2 items-center">
              <img src={props.icon} width={30} />
              {props.name}
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                className="relative"
                onClick={() => setIsModalOpen(true)}
              >
                {props.status ? 'Manage' : 'Start'}
                {props.status && (
                  <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2">
                    <GlowingBadge status={props.status} />
                  </div>
                )}
              </Button>
            </div>
            {isModalOpen && (
              <IntegrationModal
                onOpenChange={setIsModalOpen}
                integration={props.integration}
                name={props.name}
                icon={props.icon}
                status={props.status}
                onInstall={() => {
                  props.onInstall();
                }}
                onUninstall={() => {
                  props.onUninstall();
                }}
              />
            )}
          </div>
        </CardTitle>
      </CardContent>
    </Card>
  );
}

function IntegrationModal(
  props: Props & {
    onOpenChange: (open: boolean) => void;
  }
) {
  const { data: integrationConfig, isLoading } = useIntegrationConfig(
    props.integration
  );
  const [showFlowForm, setShowFlowForm] = useState(false);
  const [flowFormError, setFlowFormError] = useState<Error | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [tab, setTab] = useState<'overview' | 'configuration' | (string & {})>(
    'overview'
  );
  const [installFlowStage, setInstallFlowStage] =
    useState<null | InstallFlowStage>(null);
  const [installationError, setInstallationError] = useState<string | null>(
    null
  );
  const isConnected = props.status === CredentialStatus.VALID;
  const configurationTabDisabled =
    !isConnected || props.status === CredentialStatus.INVALID;

  const doEnable = async () => {
    setIsInstalling(true);
    await paragon.installFlow
      .start(props.integration, {
        onNext: (next) => {
          setShowFlowForm(!next.done);
          setInstallFlowStage(next);
        },
        onComplete: () => {
          props.onInstall();
          setTab('configuration');
          setIsInstalling(false);
          setInstallFlowStage(null);
        },
      })
      .catch((error) => {
        setIsInstalling(false);
        setInstallationError(
          error?.message ??
            'Something went wrong while installing the integration'
        );
      });
  };

  const doDisable = () => {
    paragon
      .uninstallIntegration(props.integration)
      .then(() => {
        props.onUninstall();
        setTab('overview');
      })
      .catch((error) => {
        console.error(
          'error uninstalling integration:',
          props.integration,
          error
        );
      });
  };

  if (isLoading) {
    return null;
  }

  if (!integrationConfig) {
    throw new Error(`Integration config not found for ${props.integration}`);
  }

  return (
    <Dialog onOpenChange={props.onOpenChange} open>
      <DialogContent className="w-[90dvw] max-w-[800px] min-h-[500px] max-h-[90dvh]">
        <DialogHeader>
          <div className="flex gap-2 justify-between items-center">
            <div className="flex gap-4 items-center">
              <img src={props.icon} width={45} />
              <div className="flex flex-col items-start gap-1">
                <DialogTitle>{props.name}</DialogTitle>
                <DialogDescription className="text-left">
                  {integrationConfig.shortDescription}
                </DialogDescription>
              </div>
            </div>
            <ActionButton
              status={props.status}
              isInstalling={isInstalling}
              installationError={installationError}
              onDisconnect={doDisable}
              onConnect={doEnable}
            />
          </div>
        </DialogHeader>
        <div className="pt-6 px-1 overflow-y-auto max-h-[70dvh]">
          {installationError && (
            <div className="text-sm bg-red-50 p-2 rounded-md border border-red-200 text-red-500 mb-6 flex gap-2 items-center">
              <AlertTriangleIcon className="size-5" />
              <p>{installationError}</p>
            </div>
          )}
          {props.status === CredentialStatus.INVALID && !isInstalling && (
            <div className="text-sm bg-red-50 p-2 rounded-md border border-red-200 text-red-500 mb-6 flex gap-2 items-center">
              <AlertTriangleIcon className="size-5" />
              <p>
                Your {props.name} account is currently unreachable, and your
                integration may not work as expected. <br /> Please reconnect
                your account above.
              </p>
            </div>
          )}
          {showFlowForm && installFlowStage ? (
            <FlowForm
              integration={props.integration}
              installFlowStage={installFlowStage}
              onSelectAccount={(accountId) => {
                paragon.installFlow.setAccountType(accountId, (error) => {
                  setFlowFormError(error as Error);
                });
              }}
              onFinishPreOptions={(preOptions) => {
                paragon.installFlow.setPreOptions(preOptions, (error) => {
                  setFlowFormError(error as Error);
                });
              }}
              onFinishPostOptions={(postOptions) => {
                paragon.installFlow.setPostOptions(postOptions, (error) => {
                  setFlowFormError(error as Error);
                });
              }}
              error={flowFormError}
            />
          ) : (
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="w-[250px] grid grid-cols-2">
                <TabsTrigger className="cursor-pointer" value="overview">
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  className="cursor-pointer"
                  value="configuration"
                  disabled={configurationTabDisabled}
                >
                  Configuration
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="w-full">
                <div className="p-6">
                  <pre className="text-sm text-wrap text-foreground/70 font-sans">
                    {integrationConfig.longDescription?.replaceAll(
                      '\n\n',
                      '\n'
                    )}
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="configuration" className="w-full">
                <div className="p-6 flex flex-col gap-6">
                  <IntegrationConfiguration integration={props.integration} />
                  <IntegrationWorkflow integration={props.integration} />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ActionButtonProps = {
  status: CredentialStatus | undefined;
  isInstalling: boolean;
  installationError: string | null;
  onDisconnect: () => void;
  onConnect: () => void;
};

function ActionButton(props: ActionButtonProps) {
  const text = useMemo(() => {
    if (props.isInstalling) {
      return 'Installing...';
    }

    if (props.status === CredentialStatus.VALID) {
      return 'Disconnect';
    }

    if (props.status === CredentialStatus.INVALID) {
      return 'Reconnect';
    }

    return 'Connect';
  }, [props.status, props.isInstalling]);

  const variant =
    props.status === CredentialStatus.VALID ? 'destructive' : 'default';
  const onClick =
    props.status === CredentialStatus.VALID
      ? props.onDisconnect
      : props.onConnect;

  return (
    <Button
      className="cursor-pointer"
      variant={variant}
      onClick={onClick}
      disabled={props.isInstalling || Boolean(props.installationError)}
    >
      {text}
    </Button>
  );
}

function FlowForm(props: {
  integration: string;
  installFlowStage: InstallFlowStage;
  onSelectAccount: (accountId: string) => void;
  onFinishPreOptions: (preOptions: Record<string, ConnectInputValue>) => void;
  onFinishPostOptions: (postOptions: Record<string, ConnectInputValue>) => void;
  error: Error | null;
}) {
  const [preOptions, setPreOptions] = useState<
    Record<string, ConnectInputValue>
  >({});
  const [postOptions, setPostOptions] = useState<
    Record<string, ConnectInputValue>
  >({});

  if (props.installFlowStage.stage === 'accountType') {
    return (
      <div>
        <div>
          <h2>Select an account</h2>
          <div className="flex flex-col gap-2 items-start">
            {props.installFlowStage.options.map((option) => (
              <Button
                key={option.id}
                type="button"
                onClick={() => {
                  props.onSelectAccount(option.id);
                }}
              >
                {option.accountDescription}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (props.installFlowStage.stage === 'preOptions') {
    return (
      <div className="flex flex-col gap-4">
        {props.installFlowStage.options.map((option) => (
          <SerializedConnectInputPicker
            key={option.id}
            integration={props.integration}
            field={option as SerializedConnectInput}
            value={preOptions[option.id]}
            onChange={(value) => {
              setPreOptions((current) => ({
                ...current,
                [option.id]: value,
              }));
            }}
          />
        ))}
        <Button
          onClick={() => {
            props.onFinishPreOptions(preOptions);
          }}
        >
          Next
        </Button>
        {props.error ? (
          <div className="flex flex-col gap-2">
            <p className="font-medium">Something went wrong</p>
            <pre className="text-red-500 max-w-full text-sm bg-red-50 p-2 rounded-md border border-red-200">
              {JSON.stringify(JSON.parse(props.error.message), null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    );
  }

  if (props.installFlowStage.stage === 'postOptions') {
    return (
      <div className="flex flex-col gap-4">
        {props.installFlowStage.options.map((option) => (
          <SerializedConnectInputPicker
            key={option.id}
            integration={props.integration}
            field={option as SerializedConnectInput}
            value={postOptions[option.id]}
            onChange={(value) => {
              setPostOptions((current) => ({
                ...current,
                [option.id]: value,
              }));
            }}
          />
        ))}
        <Button
          onClick={() => {
            props.onFinishPostOptions(postOptions);
          }}
        >
          Finish
        </Button>
      </div>
    );
  }

  return null;
}

function IntegrationConfiguration(props: { integration: string }) {
  const settings =
    paragon.getIntegrationConfig(props.integration).availableUserSettings ?? [];

  if (!settings || settings.length === 0) {
    return null;
  }

  const user = paragon.getUser();

  if (!user.authenticated) {
    throw new Error('User is not authenticated');
  }

  const integration = user.integrations[props.integration];

  if (!integration) {
    throw new Error('Integration not found');
  }

  const sharedSettings = integration.sharedSettings ?? {};

  return (
    <div>
      <fieldset className="border border-gray-200 rounded-md p-4">
        <legend className="text-lg font-bold px-2">
          User integration settings
        </legend>
        <IntegrationSettings
          integration={props.integration}
          settings={settings}
          settingsState={sharedSettings}
        />
      </fieldset>
    </div>
  );
}

function IntegrationSettings(props: {
  integration: string;
  settings: SerializedConnectInput[];
  settingsState: IntegrationSharedInputStateMap;
}) {
  const { settings, settingsState } = props;
  const [formState, setFormState] = useState<Record<string, ConnectInputValue>>(
    () =>
      Object.fromEntries(
        settings.map((setting) => [setting.id, settingsState[setting.id]])
      )
  );
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (id: string, value: ConnectInputValue) => {
    setFormState((current) => ({
      ...current,
      [id]: value,
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    paragon
      .updateIntegrationUserSettings(props.integration, formState)
      .catch((error) => {
        console.error('Failed to update integration user settings', error);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div className="flex flex-col gap-6">
      {settings?.map((setting) => (
        <SerializedConnectInputPicker
          key={setting.id}
          integration={props.integration}
          field={setting}
          value={formState[setting.id]}
          onChange={(value) => updateField(setting.id, value)}
        />
      ))}
      <div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}

function IntegrationWorkflow(props: { integration: string }) {
  const workflows =
    paragon.getIntegrationConfig(props.integration).availableWorkflows ?? [];

  if (!workflows || workflows.length === 0) {
    return null;
  }

  const user = paragon.getUser();

  if (!user.authenticated) {
    throw new Error('User is not authenticated');
  }

  const integration = user.integrations[props.integration];

  if (!integration) {
    throw new Error('Integration not found');
  }

  const workflowSettings = integration.workflowSettings ?? {};

  return (
    <div>
      <fieldset className="border border-gray-200 rounded-md p-4">
        <legend className="text-lg font-bold px-2">
          User workflow settings
        </legend>
        <Workflows
          integration={props.integration}
          workflows={workflows}
          workflowSettings={workflowSettings}
        />
      </fieldset>
    </div>
  );
}

function Workflows(props: {
  integration: string;
  workflows: Omit<IntegrationWorkflowMeta, 'order' | 'permissions'>[];
  workflowSettings: IntegrationWorkflowStateMap;
}) {
  const { workflowSettings, workflows } = props;
  const [isSaving, setIsSaving] = useState(false);
  const [workflowsState, setWorkflowsState] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        Object.entries(workflowSettings).map(([id, value]) => [
          id,
          value?.enabled ?? false,
        ])
      )
  );

  const localUpdateWorkflowState = (workflowId: string, enabled: boolean) => {
    setWorkflowsState((current) => ({
      ...current,
      [workflowId]: enabled,
    }));
  };

  const updateWorkflowState = (workflowId: string, enabled: boolean) => {
    setIsSaving(true);
    localUpdateWorkflowState(workflowId, enabled);
    paragon
      .updateWorkflowState({
        [workflowId]: enabled,
      })
      .catch((error) => {
        console.error('Failed to update workflow', error);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div>
      {workflows.map((workflow, index) => {
        const isEnabled = workflowsState[workflow.id] ?? false;
        const isNotLast = index < workflows.length - 1;

        return (
          <div key={workflow.id}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{workflow.description}</div>
                {workflow.infoText ? (
                  <div className="text-sm text-gray-500">
                    {workflow.infoText}
                  </div>
                ) : null}
              </div>
              <Switch
                id={workflow.id}
                checked={isEnabled}
                disabled={isSaving}
                onCheckedChange={(value) =>
                  updateWorkflowState(workflow.id, value)
                }
              />
            </div>
            <WorkflowFields
              integration={props.integration}
              workflow={workflow}
              workflowSettings={workflowSettings}
              isEnabled={isEnabled}
            />
            {isNotLast && <hr className="my-4 border-dashed border-gray-200" />}
          </div>
        );
      })}
    </div>
  );
}

function WorkflowFields(props: {
  integration: string;
  workflow: IntegrationWorkflowMeta;
  workflowSettings: IntegrationWorkflowStateMap;
  isEnabled: boolean;
}) {
  const { workflow, isEnabled, workflowSettings } = props;
  const [formState, setFormState] = useState<Record<string, ConnectInputValue>>(
    () =>
      Object.fromEntries(
        workflow.inputs.map((input) => [
          input.id,
          workflowSettings[workflow.id]?.settings[input.id],
        ])
      )
  );
  const hasInputs = workflow.inputs.length > 0;

  const debouncedSave = useMemo(
    () =>
      debounce(async (id: string, value: ConnectInputValue) => {
        try {
          await paragon.updateWorkflowUserSettings(
            props.integration,
            workflow.id,
            {
              [id]: value,
            }
          );
        } catch (error) {
          console.error('Failed to update workflow settings', error);
        }
      }, 500),
    [props.integration, workflow.id]
  );

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const updateField = (id: string, value: ConnectInputValue) => {
    setFormState((current) => ({
      ...current,
      [id]: value,
    }));

    debouncedSave(id, value);
  };

  if (!isEnabled || !hasInputs) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 mt-4">
      {workflow.inputs.map((input) => (
        <SerializedConnectInputPicker
          key={input.id}
          integration={props.integration}
          field={input}
          value={formState[input.id]}
          onChange={(value) => updateField(input.id, value)}
        />
      ))}
    </div>
  );
}

type GlowingBadgeProps = {
  status: CredentialStatus;
};

function GlowingBadge(props: GlowingBadgeProps) {
  const lightColor =
    props.status === CredentialStatus.VALID ? 'bg-green-300' : 'bg-red-300';
  const darkColor =
    props.status === CredentialStatus.VALID ? 'bg-green-400' : 'bg-red-400';

  return (
    <span className="relative flex size-3">
      <span
        className={cn(
          'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 shadow-sm',
          lightColor
        )}
      ></span>
      <span
        className={cn(
          'relative inline-flex size-3 rounded-full shadow-sm',
          darkColor
        )}
      ></span>
    </span>
  );
}
