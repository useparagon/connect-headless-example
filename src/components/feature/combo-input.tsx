import {
  SidebarInputType,
  type SerializedConnectInput,
} from '@useparagon/connect';

import { useComboInputOptions, useFieldOptions } from '@/lib/hooks';
import { ComboboxField } from '../form/combobox-field';
import { useMemo, useState } from 'react';

type Props = {
  integration: string;
  field: SerializedConnectInput<SidebarInputType.ComboInput>;
  required: boolean;
  value: string;
  onChange: (value: string | null) => void;
};

export function ComboInputField(props: Props) {
  const [search, setSearch] = useState('');

  const { data: options } = useComboInputOptions(
    props.integration,
    props.field.sourceType as string
  );

  const { data: mainInputOptions, isFetching: isFetchingMainInput } =
    useFieldOptions({
      integration: props.integration,
      sourceType: options?.mainInputSource.cacheKey as string,
    });

  const selectedMainOption = useMemo(
    () => mainInputOptions.data.find((option) => option.value === props.value),
    [mainInputOptions.data, props.value]
  );

  const { data: dependentInputOptions } = useFieldOptions({
    integration: props.integration,
    sourceType: options?.dependentInputSource.cacheKey as string,
    parameters: [
      {
        key: options?.mainInputSource.cacheKey as string,
        source: {
          type: 'VALUE',
          value: 'PARA',
        },
      },
    ],
  });

  console.log('dependentInputOptions', dependentInputOptions);

  return (
    <div className="w-full flex gap-4">
      <ComboboxField
        key={props.field.id}
        id={props.field.id}
        title={props.field.title}
        required={props.required}
        value={props.value ?? null}
        placeholder={selectedMainOption?.label ?? null}
        onSelect={props.onChange}
        isFetching={isFetchingMainInput}
        onDebouncedChange={setSearch}
        allowClear
      >
        {mainInputOptions.data.map((option) => {
          return (
            <ComboboxField.Item
              key={option.value}
              value={option.value}
              label={option.label}
            />
          );
        })}
      </ComboboxField>
      <ComboboxField
        key={props.field.id}
        id={props.field.id}
        title={props.field.title}
        required={props.required}
        value={props.value ?? null}
        placeholder={'placeholder'}
        onSelect={props.onChange}
        isFetching={isFetchingMainInput}
        onDebouncedChange={setSearch}
        disabled
        allowClear
      >
        <ComboboxField.Item key="key" value="value" label="label" />
      </ComboboxField>
    </div>
  );
}
