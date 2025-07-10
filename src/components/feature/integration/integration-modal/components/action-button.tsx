import { CredentialStatus } from '@useparagon/connect';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';

type ActionButtonProps = {
  status: CredentialStatus | undefined;
  isInstalling: boolean;
  installationError: string | null;
  onDisconnect: () => void;
  onConnect: () => void;
};

export function ActionButton(props: ActionButtonProps) {
  const text = useMemo(() => {
    if (props.isInstalling) {
      return 'Installing...';
    }

    if (props.status === CredentialStatus.VALID) {
      return 'Disconnect';
    }

    if (props.status === CredentialStatus.INVALID) {
      return 'Reconnect';
    }

    return 'Connect';
  }, [props.status, props.isInstalling]);

  const variant =
    props.status === CredentialStatus.VALID ? 'destructive' : 'default';
  const onClick =
    props.status === CredentialStatus.VALID
      ? props.onDisconnect
      : props.onConnect;

  return (
    <Button
      className="cursor-pointer"
      variant={variant}
      onClick={onClick}
      disabled={props.isInstalling}
    >
      {text}
    </Button>
  );
}
