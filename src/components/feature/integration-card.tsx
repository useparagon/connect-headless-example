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
import { useIntegrationConfig } from '@/lib/hooks';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

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
              <div className="p-6">
                <IntegrationConfiguration type={props.type} />
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

  const userSettings = settings.map((s) => {
    return {
      ...s,
      id: s.id as string,
      title: s.title as string,
      required: s.required as boolean,
      tooltip: s.tooltip as string | undefined,
      type: s.type as SupportedConnectInputType,
      currentValue: sharedSettings[s.id],
    };
  });

  return (
    <div>
      <p className="text-lg font-bold mb-4">User integration settings:</p>
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
