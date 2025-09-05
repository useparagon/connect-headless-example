import {
  ComboInputDataSource,
  SidebarInputType,
  type SerializedConnectInput,
} from '@useparagon/connect';
import { useMemo, useState } from 'react';

import { ComboboxField } from '@/components/form/combobox-field';
import { useDataSourceOptions, useFieldOptions } from '@/lib/hooks';

export type ComboInputValue = {
  mainInput: string | undefined;
  dependentInput: string | undefined;
};

type Props = {
  integration: string;
  field: SerializedConnectInput<SidebarInputType.ComboInput>;
  required: boolean;
  value: ComboInputValue;
  onChange: (value: ComboInputValue) => void;
};

export function ComboInputField(props: Props) {
  const [mainInputSearch, setMainInputSearch] = useState('');
  const [dependentInputSearch, setDependentInputSearch] = useState('');

  const { data: options } = useDataSourceOptions<ComboInputDataSource>(
    props.integration,
    props.field.sourceType as string,
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
        (option) => option.value === props.value.mainInput,
      ),
    [mainInputOptions.data, props.value],
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
        (option) => option.value === props.value.dependentInput,
      ),
    [dependentInputOptions.data, props.value],
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
              dependentInput: undefined,
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
    </>
  );
}
