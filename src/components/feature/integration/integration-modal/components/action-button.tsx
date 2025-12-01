import { CredentialStatus } from '@useparagon/connect';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { ButtonGroupRadioDropdown } from '@/components/ui/button-group-radio-dropdown';

type ActionButtonProps = {
  status: CredentialStatus | undefined;
  isInstalling: boolean;
  onDisconnect: () => void;
  onConnect: () => void;
};

export function ActionButton(props: ActionButtonProps) {
  const text = useMemo(() => {
    if (props.isInstalling) {
      return 'Installing...';
    }

    switch (props.status) {
      case CredentialStatus.VALID:
      case CredentialStatus.INVALID:
      case CredentialStatus.PENDING:
        return 'Reconnect';
      default:
        return 'Connect';
    }
  }, [props.status, props.isInstalling]);

  return (
    <ButtonGroupRadioDropdown
      showDropdown={props.status !== undefined}
      trigger={
        <Button
          className="cursor-pointer"
          variant="outline"
          onClick={props.onConnect}
          disabled={props.isInstalling}
        >
          {text}
        </Button>
      }
    >
      <ButtonGroupRadioDropdown.Group>
        <ButtonGroupRadioDropdown.Item
          onClick={props.onDisconnect}
          variant="destructive"
        >
          Disconnect
        </ButtonGroupRadioDropdown.Item>
      </ButtonGroupRadioDropdown.Group>
    </ButtonGroupRadioDropdown>
  );
}
