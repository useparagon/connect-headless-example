import { ReactNode, useCallback, useMemo, useReducer, useState } from 'react';
import type { TriggerDefinition } from '@useparagon/connect';

import { useTriggerTypes } from '@/lib/hooks';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/form/select-field';
import { TriggerParameterField } from './trigger-parameter-input';
import { TriggerFormProvider } from './trigger-form-context';

// -- Reducer ------------------------------------------------------------------

export type TriggerFormState = {
  triggerType: string | null;
  parameters: Record<string, unknown>;
};

type FormAction =
  | { type: 'SET_TRIGGER_TYPE'; payload: string }
  | { type: 'SET_PARAMETER'; payload: { key: string; value: unknown } }
  | { type: 'RESET'; payload?: TriggerFormState };

const EMPTY_STATE: TriggerFormState = { triggerType: null, parameters: {} };

function formReducer(
  state: TriggerFormState,
  action: FormAction,
): TriggerFormState {
  switch (action.type) {
    case 'SET_TRIGGER_TYPE':
      return { triggerType: action.payload, parameters: {} };
    case 'SET_PARAMETER':
      return {
        ...state,
        parameters: {
          ...state.parameters,
          [action.payload.key]: action.payload.value,
        },
      };
    case 'RESET':
      return action.payload ?? EMPTY_STATE;
  }
}

// -- Modal --------------------------------------------------------------------

type Props = {
  integration: string;
  selectedCredentialId?: string;
  trigger: ReactNode;
  initialData?: TriggerFormState;
};

export function TriggerSubscriptionModal({
  integration,
  selectedCredentialId,
  trigger,
  initialData,
}: Props) {
  const isEditMode = !!initialData;
  const [open, setOpen] = useState(false);
  const [state, dispatch] = useReducer(formReducer, initialData ?? EMPTY_STATE);

  const { data: triggerTypes, isLoading } = useTriggerTypes(
    integration,
    selectedCredentialId,
  );

  const triggerDefinitions = useMemo<TriggerDefinition[]>(() => {
    if (!triggerTypes?.triggers) return [];
    return Object.values(triggerTypes.triggers).flat();
  }, [triggerTypes]);

  const selectedTrigger = useMemo(
    () => triggerDefinitions.find((t) => t.type === state.triggerType),
    [triggerDefinitions, state.triggerType],
  );

  /**
   * NOTE: Can be used when implementing the submit functionality.

  const canSubmit = useMemo(() => {
    if (!state.triggerType || !selectedTrigger) return false;
    if (!selectedTrigger.parameters?.length) return true;
    return selectedTrigger.parameters.every(
      (p) => !p.required || !!state.parameters[p.id],
    );
  }, [state, selectedTrigger]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    console.log('state', state);
  }, [canSubmit, state]);

  */

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        dispatch({ type: 'RESET', payload: initialData });
      }
    },
    [initialData],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[90dvw] max-w-[700px] min-h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? 'Edit Trigger Subscription'
              : 'New Trigger Subscription'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the parameters for this trigger subscription.'
              : 'Select a trigger type and configure its parameters.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4 flex-1">
          <SelectField
            id="trigger-type"
            title="Trigger type"
            required
            disabled={isLoading || triggerDefinitions.length === 0}
            value={state.triggerType}
            onChange={(value) => {
              if (value) dispatch({ type: 'SET_TRIGGER_TYPE', payload: value });
            }}
          >
            {triggerDefinitions.map((def) => (
              <SelectField.Item key={def.type} value={def.type}>
                {def.title}
              </SelectField.Item>
            ))}
          </SelectField>

          <TriggerFormProvider>
            {selectedTrigger?.parameters?.map((param) => (
              <TriggerParameterField
                key={param.id}
                integration={integration}
                param={param}
                value={state.parameters[param.id]}
                onChange={(value) =>
                  dispatch({
                    type: 'SET_PARAMETER',
                    payload: { key: param.id, value },
                  })
                }
              />
            ))}
          </TriggerFormProvider>
        </div>

        <DialogFooter className="mt-auto">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
