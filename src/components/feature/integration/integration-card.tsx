import { useState } from 'react';
import { CredentialStatus } from '@useparagon/connect';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GlowingBadge } from '@/components/ui/glowing-badge';
import { IntegrationModal } from './integration-modal/integration-modal';

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
        !props.status && 'border-dashed shadow-none',
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
