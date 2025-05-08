import { Fragment, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntegrationConfig } from '@/lib/hooks';
import { paragon, SupportedConnectInputType } from '@useparagon/connect';

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
  const settings = paragon
    .getIntegrationConfig(props.type)
    .availableUserSettings?.map((s) => {
      return {
        ...s,
        id: s.id as string,
        title: s.title as string,
        required: s.required as boolean,
        tooltip: s.tooltip as string | undefined,
        type: s.type as SupportedConnectInputType,
      };
    });

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
      <p className="text-lg font-bold mb-4">User integration settings:</p>
      {settings?.map((s) => {
        return (
          <Fragment key={s.id}>
            <div key={s.id}>
              <span className="font-semibold">Title:</span>{' '}
              <span className="font-mono">{s.title}</span>
              {s.required ? <span className="text-red-600"> *</span> : null}
            </div>
            {s.tooltip ? (
              <div>
                <span className="font-semibold">Tooltip:</span>{' '}
                <span className="font-mono">{s.tooltip}</span>
              </div>
            ) : null}
            <div>
              <span className="font-semibold">Field type:</span>{' '}
              <span className="font-mono">{s.type}</span>
            </div>
            <div>
              <span className="font-semibold">Current value:</span>{' '}
              <span className="font-mono">
                {sharedSettings[s.id]?.toString()}
              </span>
            </div>
            <div className="h-[1px] w-full bg-black/10" />
          </Fragment>
        );
      })}
    </div>
  );
}
