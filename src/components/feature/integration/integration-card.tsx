import { useMemo, useState } from 'react';
import { CredentialStatus, SDKIntegration } from '@useparagon/connect';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { IntegrationModal } from './integration-modal/integration-modal';
import { ButtonGroupRadioDropdown } from '@/components/ui/button-group-radio-dropdown';
import { Button } from '@/components/ui/button';
import { GlowingBadge } from '@/components/ui/glowing-badge';

const IS_MULTI_CREDENTIAL = true;

type Props = {
  type: string;
  name: string;
  icon: string;
  integrationInfo: SDKIntegration;
};

export function IntegrationCard(props: Props) {
  const { integrationInfo: integration } = props;
  const [modal, setModal] = useState<{
    credentialId: null | string;
    open: boolean;
  }>({ credentialId: null, open: false });
  const [selectedCredentialId, setSelectedCredentialId] = useState<
    string | undefined
  >(integration.allCredentials.at(0)?.id);
  const selectedCredential = useMemo(() => {
    return integration.allCredentials.find(
      (credential) => credential.id === selectedCredentialId,
    );
  }, [integration.allCredentials, selectedCredentialId]);
  const selectedCredentialStatus = useMemo(() => {
    return selectedCredential?.status ?? integration.credentialStatus;
  }, [selectedCredential, integration.credentialStatus]);

  const openModal = (credentialId: null | string) => {
    setModal({ credentialId, open: true });
  };

  return (
    <Card
      className={cn(
        'hover:shadow-xs transition-shadow h-full w-full',
        !selectedCredentialStatus && 'border-dashed shadow-none',
      )}
    >
      <CardContent className="flex flex-col items-center justify-center h-full">
        <CardTitle className="w-full">
          <div className="flex flex-col gap-5 items-center justify-center">
            <div className="flex flex-col gap-2 items-center">
              <img src={props.icon} width={30} />
              {props.name}
            </div>
            <InstallButton
              integration={integration}
              selectedCredentialId={selectedCredentialId}
              selectedCredentialStatus={selectedCredentialStatus}
              onSelectCredentialId={setSelectedCredentialId}
              onClick={openModal}
            />
            {modal.open && (
              <IntegrationModal
                onOpenChange={(open) => setModal({ ...modal, open })}
                onComplete={(credentialId) => {
                  setSelectedCredentialId(credentialId);
                  setModal({ credentialId: credentialId, open: true });
                }}
                onDisconnect={(credentialId) => {
                  setSelectedCredentialId(
                    integration.allCredentials.find(
                      (c) => c.id !== credentialId,
                    )?.id,
                  );
                  setModal({ credentialId: null, open: false });
                }}
                integration={props.type}
                name={props.name}
                icon={props.icon}
                status={
                  modal.credentialId ? selectedCredentialStatus : undefined
                }
                selectedCredentialId={modal.credentialId ?? undefined}
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
    <Card className="animate-pulse h-full w-full">
      <CardContent className="flex flex-col items-center justify-center h-full">
        <CardTitle className="w-full">
          <div className="flex flex-col gap-3 items-center justify-center">
            <div className="flex flex-col gap-2 items-center">
              <div className="w-[30px] h-[30px] bg-border rounded-full"></div>
              <div className="w-20 h-4 bg-border rounded"></div>
            </div>
          </div>
        </CardTitle>
      </CardContent>
    </Card>
  );
}

function InstallButton({
  integration,
  selectedCredentialId,
  selectedCredentialStatus,
  onSelectCredentialId,
  onClick,
}: {
  integration: SDKIntegration;
  selectedCredentialId: string | undefined;
  selectedCredentialStatus: CredentialStatus | undefined;
  onSelectCredentialId: (credentialId: string) => void;
  onClick: (credentialId: null | string) => void;
}) {
  return (
    <ButtonGroupRadioDropdown
      showDropdown={
        IS_MULTI_CREDENTIAL && integration.allCredentials.length > 0
      }
      trigger={
        <Button
          variant="outline"
          onClick={() => onClick(selectedCredentialId ?? null)}
        >
          {selectedCredentialStatus ? 'Manage' : 'Start'}
        </Button>
      }
    >
      <ButtonGroupRadioDropdown.Label>
        Available Credentials
      </ButtonGroupRadioDropdown.Label>
      <ButtonGroupRadioDropdown.Separator />
      <ButtonGroupRadioDropdown.Group
        value={selectedCredentialId}
        onValueChange={onSelectCredentialId}
      >
        {integration.allCredentials.map((credential) => (
          <ButtonGroupRadioDropdown.RadioItem
            key={credential.id}
            value={credential.id}
            className="font-mono"
          >
            <div className="flex gap-3 items-center">
              <div className="flex flex-col gap-1">
                <div className="flex gap-3 items-center">{credential.id}</div>
                <span className="text-xs text-muted-foreground">
                  Last refreshed:{' '}
                  {new Date(credential.dateRefreshed).toUTCString()}
                </span>
              </div>
              <GlowingBadge status={credential.status} />
            </div>
          </ButtonGroupRadioDropdown.RadioItem>
        ))}
      </ButtonGroupRadioDropdown.Group>
      <ButtonGroupRadioDropdown.Separator />
      <ButtonGroupRadioDropdown.Item onClick={() => onClick(null)}>
        Connect New Credential
      </ButtonGroupRadioDropdown.Item>
    </ButtonGroupRadioDropdown>
  );
}
