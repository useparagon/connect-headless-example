import { BellIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  TriggerSubscriptionModal,
  type TriggerFormState,
} from '@/components/feature/trigger/trigger-subscription-modal';

export function TriggerSection(props: {
  integration: string;
  selectedCredentialId?: string;
}) {
  const handleSubmit = async (data: TriggerFormState) => {
    console.log('Trigger subscription created:', data);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
        <BellIcon className="size-6 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">No trigger subscriptions</p>
        <p className="text-sm text-muted-foreground">
          Subscribe to events from this integration to get notified when things
          happen.
        </p>
      </div>
      <TriggerSubscriptionModal
        integration={props.integration}
        selectedCredentialId={props.selectedCredentialId}
        onSubmit={handleSubmit}
        trigger={
          <Button variant="outline" size="sm">
            <PlusIcon />
            New Subscription
          </Button>
        }
      />
    </div>
  );
}
