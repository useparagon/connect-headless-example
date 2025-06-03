import { useState, useEffect, useMemo } from 'react';
import debounce from 'lodash/debounce';
import {
  ConnectInputValue,
  IntegrationSharedInputStateMap,
  IntegrationWorkflowMeta,
  IntegrationWorkflowStateMap,
  paragon,
  SerializedConnectInput,
} from '@useparagon/connect';

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
  enabled: boolean;
};

export function IntegrationCard(props: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connected, setConnected] = useState(props.enabled);

  return (
    <Card
      className={cn(
        'min-w-[300px] hover:shadow-xs transition-shadow',
        !props.enabled && 'border-dashed shadow-none'
      )}
    >
      <CardContent>
        <CardTitle>
          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-2 items-center">
              <img src={props.icon} width={30} />
              {props.name}
            </div>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              Manage
            </Button>
            {isModalOpen && (
              <IntegrationModal
                onOpenChange={setIsModalOpen}
                integration={props.integration}
                name={props.name}
                icon={props.icon}
                enabled={connected}
                onConnect={() => setConnected(true)}
                onDisconnect={() => setConnected(false)}
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
    onConnect: () => void;
    onDisconnect: () => void;
  }
) {
  const { data: integrationConfig, isLoading } = useIntegrationConfig(
    props.integration
  );
  const [showFlowForm, setShowFlowForm] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [tab, setTab] = useState<'overview' | 'configuration' | (string & {})>(
    'overview'
  );
  const [installFlowStage, setInstallFlowStage] =
    useState<null | InstallFlowStage>(null);

  const doEnable = async () => {
    setIsInstalling(true);
    await paragon.installFlow.start(props.integration, {
      onNext: (next) => {
        setShowFlowForm(!next.done);
        setInstallFlowStage(next);
      },
      onComplete: () => {
        props.onConnect();
        setTab('configuration');
        setIsInstalling(false);
        setInstallFlowStage(null);
      },
    });
  };

  const doDisable = () => {
    paragon
      .uninstallIntegration(props.integration)
      .then(() => {
        props.onDisconnect();
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
            <Button
              className="cursor-pointer"
              variant={props.enabled ? 'destructive' : 'default'}
              onClick={props.enabled ? doDisable : doEnable}
              disabled={isInstalling}
            >
              {isInstalling
                ? 'Installing...'
                : props.enabled
                ? 'Disconnect'
                : 'Connect'}
            </Button>
          </div>
        </DialogHeader>
        <div className="pt-6">
          {showFlowForm && installFlowStage ? (
            <FlowForm
              integration={props.integration}
              installFlowStage={installFlowStage}
              onSelectAccount={(accountId) => {
                paragon.installFlow.setAccountType(accountId, (error) => {
                  console.error('oauth flow error', error);
                });
              }}
              onFinishPreOptions={(preOptions) => {
                paragon.installFlow.setPreOptions(preOptions, (error) => {
                  console.error('pre options error', error);
                });
              }}
              onFinishPostOptions={(postOptions) => {
                paragon.installFlow.setPostOptions(postOptions, (error) => {
                  console.error('post options error', error);
                });
              }}
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
                  disabled={!props.enabled}
                >
                  Configuration
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="overview"
                className="w-full overflow-y-auto max-h-[70dvh]"
              >
                <div className="p-6">
                  <pre className="text-sm text-wrap text-black/70 font-sans">
                    {integrationConfig.longDescription?.replaceAll(
                      '\n\n',
                      '\n'
                    )}
                  </pre>
                </div>
              </TabsContent>
              <TabsContent
                value="configuration"
                className="w-full overflow-y-auto max-h-[70dvh]"
              >
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

function FlowForm(props: {
  integration: string;
  installFlowStage: InstallFlowStage;
  onSelectAccount: (accountId: string) => void;
  onFinishPreOptions: (preOptions: Record<string, ConnectInputValue>) => void;
  onFinishPostOptions: (postOptions: Record<string, ConnectInputValue>) => void;
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
