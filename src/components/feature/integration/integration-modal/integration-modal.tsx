import { useState } from 'react';
import { CredentialStatus, paragon } from '@useparagon/connect';
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
import { FlowForm } from '@/components/feature/integration/integration-install-flow-form';

import { ActionButton } from './components/action-button';
import { WorkflowSection } from './components/workflows';
import { IntegrationSettingsSection } from './components/integration-settings';

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
  const [isInstalling, setIsInstalling] = useState(false);
  const [tab, setTab] = useState<'overview' | 'configuration' | (string & {})>(
    'overview'
  );
  const [installFlowStage, setInstallFlowStage] =
    useState<null | InstallFlowStage>(null);
  const [installationError, setInstallationError] = useState<string | null>(
    null
  );
  const isConnected = props.status === CredentialStatus.VALID;
  const configurationTabDisabled =
    !isConnected || props.status === CredentialStatus.INVALID;

  const doEnable = async () => {
    setIsInstalling(true);
    await paragon.installFlow
      .start(props.integration, {
        onNext: (next) => {
          setShowFlowForm(!next.done);
          setInstallFlowStage(next);
        },
        onComplete: () => {
          props.onInstall();
          setTab('configuration');
          setIsInstalling(false);
          setInstallFlowStage(null);
        },
      })
      .catch((error) => {
        setIsInstalling(false);
        setInstallationError(
          error?.message ??
            'Something went wrong while installing the integration'
        );
      });
  };

  const doDisable = () => {
    paragon
      .uninstallIntegration(props.integration)
      .then(() => {
        props.onUninstall();
        setTab('overview');
      })
      .catch((error) => {
        console.error(
          'error uninstalling integration:',
          props.integration,
          error
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
              installationError={installationError}
              onDisconnect={doDisable}
              onConnect={doEnable}
            />
          </div>
        </DialogHeader>
        <div className="pt-6 px-1 overflow-y-auto max-h-[70dvh]">
          {installationError && (
            <div className="text-sm bg-red-50 p-2 rounded-md border border-red-200 text-red-500 mb-6 flex gap-2 items-center">
              <AlertTriangleIcon className="size-5" />
              <p>{installationError}</p>
            </div>
          )}
          {props.status === CredentialStatus.INVALID && !isInstalling && (
            <div className="text-sm bg-red-50 p-2 rounded-md border border-red-200 text-red-500 mb-6 flex gap-2 items-center">
              <AlertTriangleIcon className="size-5" />
              <p>
                Your {props.name} account is currently unreachable, and your
                integration may not work as expected. <br /> Please reconnect
                your account above.
              </p>
            </div>
          )}
          {showFlowForm && installFlowStage ? (
            <FlowForm
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
                      '\n'
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
