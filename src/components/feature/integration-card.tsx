import { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';

import {
  ConnectInputValue,
  IntegrationSharedInputStateMap,
  IntegrationWorkflowMeta,
  IntegrationWorkflowStateMap,
  paragon,
  SerializedConnectInput,
  SidebarInputType,
} from '@useparagon/connect';

import { TextInputField } from '@/components/form/text-input-field';
import { BooleanField } from '@/components/form/boolean-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SelectField } from '@/components/form/select-field';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntegrationConfig } from '@/lib/hooks';
import { cn } from '@/lib/utils';

type Props = {
  type: string;
  name: string;
  icon: string;
  enabled: boolean;
};

export function IntegrationCard(props: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                type={props.type}
                name={props.name}
                icon={props.icon}
                enabled={props.enabled}
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
    props.type
  );

  if (isLoading) {
    return null;
  }

  if (!integrationConfig) {
    throw new Error(`Integration config not found for ${props.type}`);
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
              onClick={() => {}}
            >
              {props.enabled ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        </DialogHeader>
        <div className="pt-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-[250px] grid grid-cols-2">
              <TabsTrigger className="cursor-pointer" value="overview">
                Overview
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="configuration">
                Configuration
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="overview"
              className="w-full overflow-y-auto max-h-[70dvh]"
            >
              <div className="p-6">
                <pre className="text-sm text-wrap text-black/70 font-sans">
                  {integrationConfig.longDescription?.replaceAll('\n\n', '\n')}
                </pre>
              </div>
            </TabsContent>
            <TabsContent
              value="configuration"
              className="w-full overflow-y-auto max-h-[70dvh]"
            >
              <div className="p-6 flex flex-col gap-6">
                <IntegrationConfiguration type={props.type} />
                <IntegrationWorkflow type={props.type} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function IntegrationConfiguration(props: { type: string }) {
  const settings =
    paragon.getIntegrationConfig(props.type).availableUserSettings ?? [];

  if (!settings || settings.length === 0) {
    return null;
  }

  const user = paragon.getUser();

  if (!user.authenticated) {
    throw new Error('User is not authenticated');
  }

  const integration = user.integrations[props.type];

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
          type={props.type}
          settings={settings}
          settingsState={sharedSettings}
        />
      </fieldset>
    </div>
  );
}

function IntegrationSettings(props: {
  type: string;
  settings: SerializedConnectInput[];
  settingsState: IntegrationSharedInputStateMap;
}) {
  const { settings, settingsState } = props;
  const [formState, setFormState] = useState<Record<string, ConnectInputValue>>(
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
      .updateIntegrationUserSettings(props.type, formState)
      .catch((error) => {
        console.error('Failed to update integration user settings', error);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div className="flex flex-col gap-6">
      {settings?.map((setting) => {
        const required = setting.required ?? true;

        if (setting.type === SidebarInputType.BooleanInput) {
          return (
            <BooleanField
              key={setting.id}
              id={setting.id}
              title={setting.title}
              required={required}
              value={Boolean(formState[setting.id] ?? false)}
              tooltip={setting.tooltip}
              onChange={(value) => updateField(setting.id, value)}
              disabled={isSaving}
            />
          );
        }

        if (setting.type === SidebarInputType.ValueText) {
          return (
            <TextInputField
              key={setting.id}
              type="text"
              id={setting.id}
              title={setting.title}
              required={required}
              tooltip={setting.tooltip}
              value={String(formState[setting.id] ?? '')}
              onChange={(value) => updateField(setting.id, value)}
              disabled={isSaving}
            />
          );
        }

        if (setting.type === SidebarInputType.Number) {
          return (
            <TextInputField
              key={setting.id}
              type="number"
              id={setting.id}
              title={setting.title}
              required={required}
              tooltip={setting.tooltip}
              value={String(formState[setting.id] ?? '')}
              onChange={(value) => updateField(setting.id, value)}
              disabled={isSaving}
            />
          );
        }

        if (setting.type === SidebarInputType.Email) {
          return (
            <TextInputField
              key={setting.id}
              type="email"
              id={setting.id}
              title={setting.title}
              required={required}
              tooltip={setting.tooltip}
              value={String(formState[setting.id] ?? '')}
              onChange={(value) => updateField(setting.id, value)}
              disabled={isSaving}
            />
          );
        }

        if (setting.type === SidebarInputType.Password) {
          return (
            <TextInputField
              key={setting.id}
              type="password"
              id={setting.id}
              title={setting.title}
              required={required}
              value={String(formState[setting.id] ?? '')}
              tooltip={setting.tooltip}
              onChange={(value) => updateField(setting.id, value)}
              disabled={isSaving}
            />
          );
        }

        if (setting.type === SidebarInputType.URL) {
          return (
            <TextInputField
              key={setting.id}
              type="url"
              id={setting.id}
              title={setting.title}
              required={required}
              value={String(formState[setting.id] ?? '')}
              tooltip={setting.tooltip}
              onChange={(value) => updateField(setting.id, value)}
              disabled={isSaving}
            />
          );
        }

        if (setting.type === SidebarInputType.CustomDropdown) {
          const options = setting.customDropdownOptions ?? [];

          return (
            <SelectField
              id={setting.id}
              title={setting.title}
              required={required}
              value={(formState[setting.id] as string) ?? null}
              onChange={(value) => updateField(setting.id, value ?? undefined)}
              allowClear
            >
              {options.map((option) => (
                <SelectField.Item key={option.value} value={option.value}>
                  {option.label}
                </SelectField.Item>
              ))}
            </SelectField>
          );
        }

        return (
          <div key={setting.id} className="text-orange-600">
            <div>
              <span className="font-semibold">Title:</span>{' '}
              <span className="font-mono">{setting.title}</span>
              {required ? <span className="text-red-600"> *</span> : null}
            </div>
            {setting.tooltip ? (
              <div>
                <span className="font-semibold">Tooltip:</span>{' '}
                <span className="font-mono">{setting.tooltip}</span>
              </div>
            ) : null}
            <div>
              <span className="font-semibold">Field type:</span>{' '}
              <span className="font-mono">{setting.type}</span>
            </div>
            <div>
              <span className="font-semibold">Current value:</span>{' '}
              <span className="font-mono">{String(formState[setting.id])}</span>
            </div>
          </div>
        );
      })}
      <div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}

function IntegrationWorkflow(props: { type: string }) {
  const workflows =
    paragon.getIntegrationConfig(props.type).availableWorkflows ?? [];

  if (!workflows || workflows.length === 0) {
    return null;
  }

  const user = paragon.getUser();

  if (!user.authenticated) {
    throw new Error('User is not authenticated');
  }

  const integration = user.integrations[props.type];

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
        <div className="flex flex-col gap-6">
          <Workflows
            type={props.type}
            workflows={workflows}
            workflowSettings={workflowSettings}
          />
        </div>
      </fieldset>
    </div>
  );
}

function Workflows(props: {
  type: string;
  workflows: Omit<IntegrationWorkflowMeta, 'order' | 'permissions'>[];
  workflowSettings: IntegrationWorkflowStateMap;
}) {
  const { workflowSettings, workflows } = props;
  const [isSaving, setIsSaving] = useState(false);
  const [workflowsState, setWorkflowsState] = useState<Record<string, boolean>>(
    Object.fromEntries(
      Object.entries(workflowSettings).map(([key, value]) => [
        key,
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

  return workflows.map((workflow) => {
    const hasInputs = workflow.inputs.length > 0;
    const isEnabled = workflowsState[workflow.id] ?? false;

    return (
      <div key={workflow.id}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="font-medium">{workflow.description}</div>
            {workflow.infoText ? (
              <div className="text-sm text-gray-500">{workflow.infoText}</div>
            ) : null}
          </div>
          <Switch
            id={workflow.id}
            checked={isEnabled}
            disabled={isSaving}
            onCheckedChange={(value) => updateWorkflowState(workflow.id, value)}
          />
        </div>
        <WorkflowFields
          type={props.type}
          workflow={workflow}
          workflowSettings={workflowSettings}
          isEnabled={isEnabled}
          hasInputs={hasInputs}
        />
      </div>
    );
  });
}

function WorkflowFields(props: {
  type: string;
  workflow: IntegrationWorkflowMeta;
  workflowSettings: IntegrationWorkflowStateMap;
  isEnabled: boolean;
  hasInputs: boolean;
}) {
  const { workflow, isEnabled, hasInputs, workflowSettings } = props;
  const [formState, setFormState] = useState<Record<string, ConnectInputValue>>(
    Object.fromEntries(
      workflow.inputs.map((input) => [
        input.id,
        workflowSettings[workflow.id]?.settings[input.id],
      ])
    )
  );

  // Create a debounced save function
  const debouncedSave = useCallback(
    debounce(async (id: string, value: ConnectInputValue) => {
      try {
        await paragon.updateWorkflowUserSettings(props.type, workflow.id, {
          [id]: value,
        });
      } catch (error) {
        console.error('Failed to update workflow settings', error);
      }
    }, 500),
    [props.type, workflow.id]
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
    <div className="flex flex-col gap-6">
      {workflow.inputs.map((input) => {
        const currentValue = formState[input.id];
        const required = input.required ?? true;

        if (input.type === SidebarInputType.ValueText) {
          return (
            <TextInputField
              key={input.id}
              id={input.id}
              type="text"
              title={input.title}
              tooltip={input.tooltip}
              required={required}
              value={String(currentValue ?? '')}
              onChange={(value) => updateField(input.id, value)}
            />
          );
        }

        if (input.type === SidebarInputType.Number) {
          return (
            <TextInputField
              key={input.id}
              id={input.id}
              type="number"
              title={input.title}
              tooltip={input.tooltip}
              required={required}
              value={String(currentValue ?? '')}
              onChange={(value) => updateField(input.id, value)}
            />
          );
        }

        return (
          <div key={input.id} className="text-orange-600">
            <div className="font-mono">
              Title: {input.title}
              {input.required ? <span className="text-red-600"> *</span> : null}
            </div>
            {input.tooltip ? (
              <div className="font-mono">Tooltip: {input.tooltip}</div>
            ) : null}
            <div className="font-mono">Type: {input.type}</div>
            <div className="font-mono">
              Current value: {String(currentValue)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
