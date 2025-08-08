import {
  DynamicComboInputDataSource,
  SidebarInputType,
  type SerializedConnectInput,
} from '@useparagon/connect';
import { useMemo, useState } from 'react';

import { ComboboxField } from '@/components/form/combobox-field';
import { useDataSourceOptions, useFieldOptions } from '@/lib/hooks';

import { VariableInput } from './variable-input';
import { omit } from 'lodash';

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
  type DynamicComboField = SerializedConnectInput<
    SidebarInputType.DynamicComboInput
  > & { sourceType: string };

  const [mainInputSearch, setMainInputSearch] = useState('');
  const [dependentInputSearch, setDependentInputSearch] = useState('');

  const { data: options } = useDataSourceOptions<DynamicComboInputDataSource>(
    props.integration,
    (props.field as DynamicComboField).sourceType
  );

  const { data: mainInputOptions, isFetching: isFetchingMainInput } =
    useFieldOptions({
      integration: props.integration,
      sourceType: options?.mainInputSource.cacheKey as string,
      search: mainInputSearch,
    });

  const selectedMainOption = useMemo(
    () =>
      mainInputOptions.data.find(
        (option) => option.value === props.value.mainInput
      ),
    [mainInputOptions.data, props.value]
  );

  const { data: dependentInputOptions, isFetching: isFetchingDependentInput } =
    useFieldOptions({
      enabled: Boolean(props.value.mainInput),
      integration: props.integration,
      sourceType: options?.dependentInputSource.cacheKey as string,
      parameters: [
        {
          cacheKey: options?.mainInputSource.cacheKey as string,
          value: props.value.mainInput,
        },
      ],
      search: dependentInputSearch,
    });

  const selectedDependentInputOption = useMemo(
    () =>
      dependentInputOptions.data.find(
        (option) => option.value === props.value.dependentInput
      ),
    [dependentInputOptions.data, props.value]
  );

  const mainInputMeta = options?.mainInputSource;
  const dependentInputMeta = options?.dependentInputSource;

  if (!mainInputMeta || !dependentInputMeta) {
    return null;
  }

  return (
    <>
      <div className="w-full flex gap-4">
        <ComboboxField
          id={props.field.id}
          title={mainInputMeta.title}
          required={props.required}
          value={props.value.mainInput ?? null}
          placeholder={selectedMainOption?.label ?? 'Select an option...'}
          onSelect={(value) =>
            props.onChange({
              mainInput: value ?? undefined,
              dependentInput: value ? props.value.dependentInput : undefined,
            })
          }
          isFetching={isFetchingMainInput}
          onDebouncedChange={setMainInputSearch}
          allowClear
        >
          {mainInputOptions.data.map((option) => {
            return (
              <ComboboxField.Item key={option.value} value={option.value}>
                {option.label}
              </ComboboxField.Item>
            );
          })}
        </ComboboxField>
        <ComboboxField
          id={props.field.id}
          title={dependentInputMeta.title}
          required={props.required}
          value={props.value.dependentInput ?? null}
          placeholder={
            selectedDependentInputOption?.label ?? 'Select an option...'
          }
          onSelect={(value) =>
            props.onChange({
              mainInput: props.value.mainInput,
              dependentInput: value ?? undefined,
            })
          }
          isFetching={isFetchingDependentInput}
          onDebouncedChange={setDependentInputSearch}
          disabled={!props.value.mainInput}
          allowClear
        >
          {dependentInputOptions.data.map((option) => {
            return (
              <ComboboxField.Item key={option.value} value={option.value}>
                {option.label}
              </ComboboxField.Item>
            );
          })}
        </ComboboxField>
      </div>
      {props.value.mainInput &&
        props.value.dependentInput &&
        options?.variableInputSource?.cacheKey &&
        options?.mainInputSource?.cacheKey &&
        options?.dependentInputSource?.cacheKey && (
          <VariableInput
            integration={props.integration}
            sourceType={options?.variableInputSource?.cacheKey}
            mainInputKey={options?.mainInputSource.cacheKey}
            dependantInputKey={options?.dependentInputSource.cacheKey}
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
