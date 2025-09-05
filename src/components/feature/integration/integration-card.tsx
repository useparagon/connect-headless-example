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
              />
            )}
          </div>
        </CardTitle>
      </CardContent>
    </Card>
  );
}

IntegrationCard.Skeleton = Skeleton;

function Skeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent>
        <CardTitle>
          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-2 items-center">
              <div className="w-[30px] h-[30px] bg-border rounded-full"></div>
              <div className="w-20 h-4 bg-border rounded"></div>
            </div>
          </div>
        </CardTitle>
      </CardContent>
    </Card>
  );
}
