import {
  SidebarInputType,
  type SerializedConnectInput,
} from '@useparagon/connect';
import { useMemo, useState } from 'react';

import { ComboboxField } from '@/components/form/combobox-field';
import { useFieldOptions } from '@/lib/hooks';

type Props = {
  integration: string;
  field: SerializedConnectInput<SidebarInputType.DynamicEnum>;
  required: boolean;
  value: string;
  onChange: (value: string | null) => void;
};

export function DynamicEnumField(props: Props) {
  const [search, setSearch] = useState('');
  const { data: options, isFetching } = useFieldOptions({
    integration: props.integration,
    sourceType: props.field.sourceType as string,
    search: search || undefined,
  });
  const selectedOption = useMemo(
    () => options.data.find((option) => option.value === props.value),
    [options.data, props.value],
  );

  return (
    <ComboboxField
      id={props.field.id}
      title={props.field.title}
      required={props.required}
      value={props.value ?? null}
      placeholder={selectedOption?.label ?? 'Select an option...'}
      onSelect={props.onChange}
      isFetching={isFetching}
      onDebouncedChange={setSearch}
      allowClear
    >
      {options.data.map((option) => {
        return (
          <ComboboxField.Item key={option.value} value={option.value}>
            {option.label}
          </ComboboxField.Item>
        );
      })}
    </ComboboxField>
  );
}
