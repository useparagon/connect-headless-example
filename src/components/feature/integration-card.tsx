import { ReactNode, useState } from 'react';

import {
  paragon,
  SidebarInputType,
  SupportedConnectInputType,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIntegrationConfig } from '@/lib/hooks';

type Props = {
  type: string;
  name: string;
  icon: string;
  enabled: boolean;
};

export function IntegrationCard(props: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Card className="min-w-[300px] hover:shadow-sm transition-shadow">
      <CardContent>
        <CardTitle>
          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-2 items-center">
              <img src={props.icon} width={30} />
              {props.name}
            </div>
            <Button
              className="cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              {props.enabled ? 'Manage' : 'Enable'}
            </Button>
            {isModalOpen && (
              <IntegrationModal onOpenChange={setIsModalOpen} {...props} />
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
    return <div>Loading...</div>;
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

  const userSettings = settings.map((setting) => {
    return {
      ...setting,
      id: setting.id as string,
      title: setting.title as string,
      required: setting.required as boolean,
      tooltip: setting.tooltip,
      type: setting.type as SupportedConnectInputType,
      currentValue: sharedSettings[setting.id],
    };
  });

  return (
    <div>
      <fieldset className="border border-gray-200 rounded-md p-4">
        <legend className="text-lg font-bold px-2">
          User integration settings:
        </legend>
        <div className="flex flex-col gap-6">
          {userSettings?.map((setting) => {
            if (setting.type === SidebarInputType.BooleanInput) {
              return (
                <IntegrationConfigurationBooleanField
                  key={setting.id}
                  id={setting.id}
                  title={setting.title}
                  required={setting.required}
                  value={(setting.currentValue as boolean) ?? false}
                  tooltip={setting.tooltip}
                />
              );
            }

            if (setting.type === SidebarInputType.ValueText) {
              return (
                <IntegrationConfigurationTextInputField
                  key={setting.id}
                  type="text"
                  id={setting.id}
                  title={setting.title}
                  required={setting.required}
                  value={(setting.currentValue as string) ?? ''}
                  tooltip={setting.tooltip}
                />
              );
            }

            if (setting.type === SidebarInputType.Number) {
              return (
                <IntegrationConfigurationTextInputField
                  key={setting.id}
                  type="number"
                  id={setting.id}
                  title={setting.title}
                  required={setting.required}
                  value={(setting.currentValue as string) ?? ''}
                  tooltip={setting.tooltip}
                />
              );
            }

            if (setting.type === SidebarInputType.Email) {
              return (
                <IntegrationConfigurationTextInputField
                  key={setting.id}
                  type="email"
                  id={setting.id}
                  title={setting.title}
                  required={setting.required}
                  value={(setting.currentValue as string) ?? ''}
                  tooltip={setting.tooltip}
                />
              );
            }

            if (setting.type === SidebarInputType.Password) {
              return (
                <IntegrationConfigurationTextInputField
                  key={setting.id}
                  type="password"
                  id={setting.id}
                  title={setting.title}
                  required={setting.required}
                  value={(setting.currentValue as string) ?? ''}
                  tooltip={setting.tooltip}
                />
              );
            }

            if (setting.type === SidebarInputType.URL) {
              return (
                <IntegrationConfigurationTextInputField
                  key={setting.id}
                  type="url"
                  id={setting.id}
                  title={setting.title}
                  required={setting.required}
                  value={(setting.currentValue as string) ?? ''}
                  tooltip={setting.tooltip}
                />
              );
            }

            return (
              <div key={setting.id} className="text-orange-600">
                <div>
                  <span className="font-semibold">Title:</span>{' '}
                  <span className="font-mono">{setting.title}</span>
                  {setting.required ? (
                    <span className="text-red-600"> *</span>
                  ) : null}
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
                  <span className="font-mono">
                    {setting.currentValue?.toString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

function IntegrationConfigurationBooleanField(props: {
  id: string;
  title: string;
  required: boolean;
  value: boolean;
  tooltip?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel
        id={props.id}
        required={props.required}
        tooltip={props.tooltip}
      >
        {props.title}
      </FieldLabel>
      <Switch
        id={props.id}
        checked={props.value}
        // WIP: add onChange handler
        onCheckedChange={() => {}}
        disabled
      />
    </div>
  );
}

function IntegrationConfigurationTextInputField(props: {
  id: string;
  title: string;
  required: boolean;
  value: string;
  type: 'text' | 'number' | 'email' | 'password' | 'url';
  tooltip?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel
        id={props.id}
        required={props.required}
        tooltip={props.tooltip}
      >
        {props.title}
      </FieldLabel>
      <Input
        id={props.id}
        type={props.type}
        value={props.value}
        // WIP: add onChange handler
        onChange={() => {}}
        disabled
      />
    </div>
  );
}

function FieldLabel(props: {
  id: string;
  children: ReactNode;
  required: boolean;
  tooltip?: ReactNode;
}) {
  return (
    <Label htmlFor={props.id}>
      {props.children}
      {props.required ? (
        <Tooltip>
          <TooltipTrigger> 🚩</TooltipTrigger>
          <TooltipContent>This field is required</TooltipContent>
        </Tooltip>
      ) : null}
      {props.tooltip ? (
        <Tooltip>
          <TooltipTrigger> ℹ️</TooltipTrigger>
          <TooltipContent>{props.tooltip}</TooltipContent>
        </Tooltip>
      ) : null}
    </Label>
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
          User workflow settings:
        </legend>
        <div className="flex flex-col gap-6">
          {workflows.map((workflow) => {
            const hasInputs = workflow.inputs.length > 0;
            const isEnabled = workflowSettings[workflow.id]?.enabled;

            return (
              <div key={workflow.id}>
                <div className="flex justify-between items-center mb-4">
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
                    // WIP: add onChange handler
                    onCheckedChange={() => {}}
                    disabled
                  />
                </div>

                {isEnabled && hasInputs ? (
                  <div>
                    {workflow.inputs.map((input) => {
                      const currentValue =
                        workflowSettings[workflow.id]?.settings[input.id];

                      if (input.type === SidebarInputType.ValueText) {
                        return (
                          <IntegrationConfigurationTextInputField
                            key={input.id}
                            id={input.id}
                            type={input.type}
                            title={input.title}
                            tooltip={input.tooltip}
                            required={input.required}
                            value={String(currentValue ?? '')}
                          />
                        );
                      }

                      return (
                        <div key={input.id} className="text-orange-600">
                          <div className="font-mono">
                            Title: {input.title}
                            {input.required ? (
                              <span className="text-red-600"> *</span>
                            ) : null}
                          </div>
                          {input.tooltip ? (
                            <div className="font-mono">
                              Tooltip: {input.tooltip}
                            </div>
                          ) : null}
                          <div className="font-mono">Type: {input.type}</div>
                          <div className="font-mono">
                            Current value:{' '}
                            {String(
                              workflowSettings[workflow.id]?.settings[
                                input.id
                              ] ?? ''
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
