import { useState } from 'react';

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
      <DialogContent className="w-[90dvw] max-w-[800px] min-h-[500px]">
        <DialogHeader>
          <div className="flex gap-2 justify-between items-center">
            <div className="flex gap-4 items-center">
              <img src={props.icon} width={45} />
              <div className="flex flex-col items-start gap-1">
                <DialogTitle>{props.name}</DialogTitle>
                <DialogDescription>
                  {integrationConfig.shortDescription}
                </DialogDescription>
              </div>
            </div>
            <Button className="cursor-pointer" onClick={() => {}}>
              Connect
            </Button>
          </div>
          <div className="w-full h-[1px] border-b border-border my-4" />
        </DialogHeader>
        <div>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-[250px] grid grid-cols-2">
              <TabsTrigger className="cursor-pointer" value="overview">
                Overview
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="configuration">
                Configuration
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="w-full">
              <div className="p-6">
                <pre className="text-sm text-wrap text-black/70 font-sans">
                  {/* oi */}
                  {integrationConfig.longDescription?.replaceAll('\n\n', '\n')}
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="configuration">
              <div className="p-6">WIP</div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
