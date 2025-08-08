import { useEffect, useRef, useState } from 'react';
import { CredentialStatus, paragon } from '@useparagon/connect';
import { AlertTriangleIcon } from 'lucide-react';

import { useIntegrationConfig } from '@/lib/hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IntegrationInstallFlowForm } from '@/components/feature/integration/integration-install-flow-form';

// Removed ActionButton, Workflows, and Settings — we only render when user input is needed

type InstallFlowStage = ReturnType<typeof paragon.installFlow.next>;

type Props = {
  integration: string;
  name: string;
  icon: string;
  status: CredentialStatus | undefined;
  onOpenChange: (open: boolean) => void;
  onInstall: () => void;
  onUninstall: () => void;
};

export function IntegrationModal(props: Props) {
  const { data: integrationConfig, isLoading } = useIntegrationConfig(
    props.integration
  );
  const [showFlowForm, setShowFlowForm] = useState(false);
  const [flowFormError, setFlowFormError] = useState<Error | null>(null);
  const [installFlowStage, setInstallFlowStage] =
    useState<null | InstallFlowStage>(null);
  const [installationError, setInstallationError] = useState<string | null>(
    null
  );
  const isConnected = props.status === CredentialStatus.VALID;
  const [autoStarted, setAutoStarted] = useState(false);
  const latestIntegrationRef = useRef(props.integration);

  // Reset install flow state when integration changes
  useEffect(() => {
    latestIntegrationRef.current = props.integration;
    setShowFlowForm(false);
    setInstallFlowStage(null);
    setFlowFormError(null);
    setInstallationError(null);
    setAutoStarted(false);
  }, [props.integration]);

  const doEnable = async () => {
    setInstallationError(null);
    const integrationAtStart = props.integration;
    await paragon.installFlow
      .start(integrationAtStart, {
        onNext: (next) => {
          if (latestIntegrationRef.current !== integrationAtStart) return;
          setShowFlowForm(!next.done);
          setInstallFlowStage(next);
        },
        onComplete: () => {
          if (latestIntegrationRef.current !== integrationAtStart) return;
          props.onInstall();
          setInstallFlowStage(null);
          setShowFlowForm(false);
          props.onOpenChange(false);
        },
      })
      .catch((error) => {
        setInstallationError(
          error?.message ??
            'Something went wrong while installing the integration'
        );
      });
  };

  // Auto-start the connect flow on mount if not already connected
  useEffect(() => {
    if (!autoStarted && !isConnected) {
      setAutoStarted(true);
      void doEnable();
    }
  }, [autoStarted, isConnected]);

  if (isLoading) {
    return null;
  }

  if (!integrationConfig) {
    throw new Error(`Integration config not found for ${props.integration}`);
  }

  // Only render the modal when user input is required (account type or options)
  if (!(showFlowForm && installFlowStage)) {
    return null;
  }

  return (
    <Dialog onOpenChange={props.onOpenChange} open>
      <DialogContent className="w-[90dvw] max-w-[800px] max-h-[90dvh]">
        <DialogHeader>
          <div className="flex gap-4 items-center">
            <img src={props.icon} width={32} />
            <DialogTitle>Connect {props.name}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="pt-4 px-1 overflow-y-auto max-h-[70dvh]">
          {installationError && (
            <div className="text-sm bg-destructive/10 p-2 rounded-md border border-destructive/20 text-destructive mb-4 flex gap-2 items-center">
              <AlertTriangleIcon className="size-5" />
              <p>{installationError}</p>
            </div>
          )}
          <IntegrationInstallFlowForm
            integration={props.integration}
            installFlowStage={installFlowStage}
            onSelectAccount={(accountId) => {
              paragon.installFlow.setAccountType(accountId, (error) => {
                setFlowFormError(error as Error);
              });
            }}
            onFinishPreOptions={(preOptions) => {
              paragon.installFlow.setPreOptions(preOptions, (error) => {
                setFlowFormError(error as Error);
              });
            }}
            onFinishPostOptions={(postOptions) => {
              paragon.installFlow.setPostOptions(postOptions, (error) => {
                setFlowFormError(error as Error);
              });
            }}
            error={flowFormError}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
