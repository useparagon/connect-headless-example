import { useEffect, useState, useMemo } from 'react';
import {
  ConnectInputValue,
  IntegrationWorkflowMeta,
  IntegrationWorkflowStateMap,
  paragon,
} from '@useparagon/connect';
import debounce from 'lodash/debounce';

import { Switch } from '@/components/ui/switch';
import { SerializedConnectInputPicker } from '@/components/feature/serialized-connect-input-picker';

export function WorkflowSection(props: {
  integration: string;
  selectedCredentialId: string;
}) {
  const workflows =
    paragon.getIntegrationConfig(props.integration).availableWorkflows ?? [];

  const workflowSettings = useMemo(() => {
    const user = paragon.getUser();

    if (!user.authenticated) {
      throw new Error('User is not authenticated');
    }

    const integration = user.integrations[props.integration];

    if (!integration) {
      throw new Error('Integration not found');
    }

    if (!props.selectedCredentialId) {
      return integration.workflowSettings ?? {};
    }

    const credential = integration.allCredentials.find(
      (credential) => credential.id === props.selectedCredentialId,
    );

    if (!credential) {
      throw new Error('Credential not found');
    }

    return credential.configurations.at(0)?.workflowSettings ?? {};
  }, [props.integration, props.selectedCredentialId]);

  if (!workflows || workflows.length === 0) {
    return null;
  }

  return (
    <div>
      <fieldset className="border rounded-md p-4">
        <legend className="text-lg font-bold px-2">
          User workflow settings
        </legend>
        <Workflows
          integration={props.integration}
          workflows={workflows}
          workflowSettings={workflowSettings}
          selectedCredentialId={props.selectedCredentialId}
        />
      </fieldset>
    </div>
  );
}

function Workflows(props: {
  integration: string;
  workflows: Omit<IntegrationWorkflowMeta, 'order' | 'permissions'>[];
  workflowSettings: IntegrationWorkflowStateMap;
  selectedCredentialId: string;
}) {
  const { workflowSettings, workflows } = props;
  const [isSaving, setIsSaving] = useState(false);
  const [workflowsState, setWorkflowsState] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        Object.entries(workflowSettings).map(([id, value]) => [
          id,
          value?.enabled ?? false,
        ]),
      ),
  );

  const localUpdateWorkflowState = (workflowId: string, enabled: boolean) => {
    setWorkflowsState((current) => ({
      ...current,
      [workflowId]: enabled,
    }));
  };

  const updateWorkflowState = (workflowId: string, enabled: boolean) => {
    setIsSaving(true);
    localUpdateWorkflowState(workflowId, enabled);
    paragon
      .updateWorkflowState(
        {
          [workflowId]: enabled,
        },
        { selectedCredentialId: props.selectedCredentialId },
      )
      .catch((error) => {
        console.error('Failed to update workflow', error);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div>
      {workflows.map((workflow, index) => {
        const isEnabled = workflowsState[workflow.id] ?? false;
        const isNotLast = index < workflows.length - 1;

        return (
          <div key={workflow.id}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{workflow.description}</div>
                {workflow.infoText ? (
                  <div className="text-sm text-gray-500">
                    {workflow.infoText}
                  </div>
                ) : null}
              </div>
              <Switch
                id={workflow.id}
                checked={isEnabled}
                disabled={isSaving}
                onCheckedChange={(value) =>
                  updateWorkflowState(workflow.id, value)
                }
              />
            </div>
            <WorkflowFields
              integration={props.integration}
              workflow={workflow}
              workflowSettings={workflowSettings}
              isEnabled={isEnabled}
              selectedCredentialId={props.selectedCredentialId}
            />
            {isNotLast && <hr className="my-4 border-dashed border-border" />}
          </div>
        );
      })}
    </div>
  );
}

function WorkflowFields(props: {
  integration: string;
  workflow: IntegrationWorkflowMeta;
  workflowSettings: IntegrationWorkflowStateMap;
  isEnabled: boolean;
  selectedCredentialId: string;
}) {
  const { workflow, isEnabled, workflowSettings } = props;
  const [formState, setFormState] = useState<Record<string, ConnectInputValue>>(
    () =>
      Object.fromEntries(
        workflow.inputs.map((input) => [
          input.id,
          workflowSettings[workflow.id]?.settings[input.id],
        ]),
      ),
  );
  const hasInputs = workflow.inputs.length > 0;

  const debouncedSave = useMemo(
    () =>
      debounce(async (id: string, value: ConnectInputValue) => {
        try {
          await paragon.updateWorkflowUserSettings(
            props.integration,
            workflow.id,
            {
              [id]: value,
            },
            { selectedCredentialId: props.selectedCredentialId },
          );
        } catch (error) {
          console.error('Failed to update workflow settings', error);
        }
      }, 500),
    [props.integration, workflow.id, props.selectedCredentialId],
  );

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const updateField = (id: string, value: ConnectInputValue) => {
    setFormState((current) => ({
      ...current,
      [id]: value,
    }));

    debouncedSave(id, value);
  };

  if (!isEnabled || !hasInputs) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 mt-4">
      {workflow.inputs.map((input) => (
        <SerializedConnectInputPicker
          key={input.id}
          integration={props.integration}
          field={input}
          value={formState[input.id]}
          onChange={(value) => updateField(input.id, value)}
        />
      ))}
    </div>
  );
}
