import { useState } from 'react';
import {
  InstallFlowError,
  CredentialStatus,
  InstallFlowStage,
  paragon,
} from '@useparagon/connect';
import { AlertTriangleIcon } from 'lucide-react';

import { useIntegrationConfig } from '@/lib/hooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tabs } from '@/components/ui/tabs';
import { IntegrationInstallFlowForm } from '@/components/feature/integration/integration-install-flow-form';

import { ActionButton } from './components/action-button';
import { WorkflowSection } from './components/workflows';
import { IntegrationSettingsSection } from './components/integration-settings';
import { ErrorMessage } from '../error-message';

const globalInstallationErrors = new Set<InstallFlowError['name']>([
  'OAuthBlockedError',
  'OAuthTimeoutError',
  'UserNotAuthenticatedError',
  'NoActiveInstallFlowError',
  'HeadlessModeNotEnabledError',
  'IntegrationNotFoundError',
]);

type Props = {
  integration: string;
  name: string;
  icon: string;
  status: CredentialStatus | undefined;
  onOpenChange: (open: boolean) => void;
};

export function IntegrationModal(props: Props) {
  const { data: integrationConfig, isLoading } = useIntegrationConfig(
    props.integration,
  );
  const [showFlowForm, setShowFlowForm] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [tab, setTab] = useState<'overview' | 'configuration' | (string & {})>(
    'overview',
  );
  const [installFlowStage, setInstallFlowStage] =
    useState<null | InstallFlowStage>(null);
  const [installationError, setInstallationError] = useState<{
    stage?: InstallFlowStage['stage'];
    error: InstallFlowError;
  } | null>(null);
  const isConnected = props.status === CredentialStatus.VALID;
  const configurationTabDisabled =
    !isConnected || props.status === CredentialStatus.INVALID;
  const showGlobalInstallationError =
    installationError &&
    (!installationError.stage ||
      globalInstallationErrors.has(installationError.error.name));
  const showStageError =
    installationError?.stage &&
    !globalInstallationErrors.has(installationError.error.name);

  const doEnable = async () => {
    setInstallationError(null);
    setIsInstalling(true);
    paragon.installFlow.start(props.integration, {
      oauthTimeout: 45_000,
      onNext: (next) => {
        setShowFlowForm(!next.done);
        setInstallFlowStage(next);
      },
      onComplete: () => {
        setIsInstalling(false);
        setTab('configuration');
        setInstallFlowStage(null);
      },
      onError: (error, errorContext) => {
        setIsInstalling(false);
        setInstallationError({
          stage: errorContext?.stage,
          error,
        });
      },
    });
  };

  const doDisable = () => {
    paragon
      .uninstallIntegration(props.integration)
      .then(() => {
        setTab('overview');
      })
      .catch((error) => {
        console.error(
          'error uninstalling integration:',
          props.integration,
          error,
        );
      });
  };

  if (isLoading) {
    return null;
  }

  if (!integrationConfig) {
    throw new Error(`Integration config not found for ${props.integration}`);
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
            <ActionButton
              status={props.status}
              isInstalling={isInstalling}
              onDisconnect={doDisable}
              onConnect={doEnable}
            />
          </div>
        </DialogHeader>
        <div className="pt-6 px-1 overflow-y-auto max-h-[70dvh]">
          {showGlobalInstallationError && (
            <div className="text-sm bg-destructive/10 p-2 rounded-md border border-destructive/20 text-destructive mb-6 flex gap-2 items-center">
              <AlertTriangleIcon className="size-5" />
              <p>{installationError.error.message}</p>
            </div>
          )}
          {props.status === CredentialStatus.INVALID && !isInstalling && (
            <div className="text-sm bg-amber-500/10 p-2 rounded-md border border-amber-500/20 text-amber-500 mb-6 flex gap-2 items-center">
              <AlertTriangleIcon className="size-5" />
              <p>
                Your {props.name} account is currently unreachable, and your
                integration may not work as expected. <br /> Please reconnect
                your account above.
              </p>
            </div>
          )}
          {showFlowForm && installFlowStage ? (
            <div className="flex flex-col gap-4">
              <IntegrationInstallFlowForm
                integration={props.integration}
                installFlowStage={installFlowStage}
                onSelectAccount={(accountId) => {
                  paragon.installFlow.setAccountType(accountId);
                }}
                onFinishPreOptions={(preOptions) => {
                  paragon.installFlow.setPreOptions(preOptions);
                }}
                onFinishPostOptions={(postOptions) => {
                  paragon.installFlow.setPostOptions(postOptions);
                }}
              />
              {showStageError && (
                <ErrorMessage error={installationError.error} />
              )}
            </div>
          ) : (
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="w-[250px] grid grid-cols-2">
                <TabsTrigger className="cursor-pointer" value="overview">
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  className="cursor-pointer"
                  value="configuration"
                  disabled={configurationTabDisabled}
                >
                  Configuration
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="w-full">
                <div className="p-6">
                  <pre className="text-sm text-wrap text-foreground/70 font-sans">
                    {integrationConfig.longDescription?.replaceAll(
                      '\n\n',
                      '\n',
                    )}
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="configuration" className="w-full">
                <div className="p-6 flex flex-col gap-6">
                  <IntegrationSettingsSection integration={props.integration} />
                  <WorkflowSection integration={props.integration} />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
