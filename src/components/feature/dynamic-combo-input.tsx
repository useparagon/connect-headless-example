import {
  SidebarInputType,
  type DefaultFieldValueSources,
  type SerializedConnectInput,
} from '@useparagon/connect';
import { useState } from 'react';
import { omit } from 'lodash';

import {
  PaginatedCombobox,
  StaticComboDropdown,
} from '@/components/form/paginated-combobox';
import { hasSourcePagination, useSourcesForInput } from '@/lib/hooks';

import { VariableInput } from './variable-input';

type VariableInputValue = Record<string, string | string[] | undefined>;

export type DynamicComboInputValue = {
  mainInput: string | undefined;
  dependentInput: string | undefined;
  variableInput?: VariableInputValue;
};

type Props = {
  integration: string;
  field: SerializedConnectInput<SidebarInputType.DynamicComboInput>;
  required: boolean;
  value: DynamicComboInputValue;
  onChange: (value: DynamicComboInputValue) => void;
};

export function DynamicComboInputField(props: Props) {
  const [mainInputSearch, setMainInputSearch] = useState('');
  const [dependentInputSearch, setDependentInputSearch] = useState('');

  const sources = useSourcesForInput(
    props.integration,
    props.field.sourceType as string,
    props.field,
  );

  const comboSources =
    sources?.kind === 'defaultFieldValue'
      ? (sources as DefaultFieldValueSources)
      : null;

  const mainInputMeta = comboSources?.mainInputSource;
  const dependentInputMeta = comboSources?.dependentInputSource;

  if (!mainInputMeta || !dependentInputMeta) {
    return null;
  }

  const MainDropdown = hasSourcePagination(mainInputMeta)
    ? PaginatedCombobox
    : StaticComboDropdown;

  const DependentDropdown = hasSourcePagination(dependentInputMeta)
    ? PaginatedCombobox
    : StaticComboDropdown;

  return (
    <>
      <div className="w-full flex gap-4">
        <MainDropdown
          id={props.field.id}
          title={mainInputMeta.title}
          required={props.required}
          value={props.value.mainInput ?? null}
          onSelect={(value) =>
            props.onChange({
              mainInput: value ?? undefined,
              dependentInput: value ? props.value.dependentInput : undefined,
            })
          }
          search={mainInputSearch}
          onSearchChange={setMainInputSearch}
          integration={props.integration}
          source={mainInputMeta}
          allowClear
        />
        <DependentDropdown
          id={props.field.id}
          title={dependentInputMeta.title}
          required={props.required}
          value={props.value.dependentInput ?? null}
          onSelect={(value) =>
            props.onChange({
              mainInput: props.value.mainInput,
              dependentInput: value ?? undefined,
            })
          }
          search={dependentInputSearch}
          onSearchChange={setDependentInputSearch}
          integration={props.integration}
          source={dependentInputMeta}
          parameters={[
            {
              cacheKey: mainInputMeta.cacheKey as string,
              value: props.value.mainInput,
            },
          ]}
          enabled={Boolean(props.value.mainInput)}
          disabled={!props.value.mainInput}
          allowClear
        />
      </div>
      {props.value.mainInput &&
        props.value.dependentInput &&
        comboSources?.variableInputSource &&
        comboSources?.mainInputSource &&
        comboSources?.dependentInputSource && (
          <VariableInput
            integration={props.integration}
            variableInputSource={comboSources.variableInputSource}
            mainInputSource={comboSources.mainInputSource}
            dependantInputSource={comboSources.dependentInputSource}
            mainInputValue={props.value.mainInput}
            dependantInputValue={props.value.dependentInput}
            variableInputsValues={props.value.variableInput || {}}
            onVariableInputsValuesChange={(value) => {
              props.onChange({
                mainInput: props.value.mainInput,
                dependentInput: props.value.dependentInput,
                variableInput: { ...props.value.variableInput, ...value },
              });
            }}
            onDeleteVariableInput={(fieldId) => {
              const newVariableInput = omit(props.value.variableInput, fieldId);

              props.onChange({
                mainInput: props.value.mainInput,
                dependentInput: props.value.dependentInput,
                variableInput: newVariableInput,
              });
            }}
          />
        )}
    </>
  );
}
