import {
  SidebarInputType,
  type DynamicDataSource,
  type SingleSource,
  type SerializedConnectInput,
} from '@useparagon/connect';
import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';

import { ComboboxField } from '@/components/form/combobox-field';
import { useFieldOptions, useSourcesForInput } from '@/lib/hooks';

type Props = {
  integration: string;
  field: SerializedConnectInput<SidebarInputType.DynamicEnum>;
  required: boolean;
  value: string;
  onChange: (value: string | null) => void;
};

function filterOptions<T extends { label: string; value: string }>(
  items: T[],
  searchString: string,
): T[] {
  if (!searchString.trim()) {
    return items;
  }

  const fuse = new Fuse(items, {
    keys: ['label'],
    threshold: 0.45,
  });

  return fuse.search(searchString.trim()).map((result) => result.item);
}

export function DynamicEnumField(props: Props) {
  const [search, setSearch] = useState('');

  const sourceType = props.field.sourceType as string;
  const sources = useSourcesForInput(props.integration, sourceType, props.field);

  const dynamicSource =
    sources?.kind === 'single'
      ? (sources as SingleSource).source as DynamicDataSource<any>
      : undefined;

  const supportPagination =
    (dynamicSource as DynamicDataSource<any> & { supportPagination?: boolean })
      ?.supportPagination ?? false;

  const { data: options, isFetching } = useFieldOptions({
    integration: props.integration,
    source: dynamicSource,
    search: supportPagination ? search || undefined : undefined,
  });

  const filteredOptions = supportPagination
    ? (options?.data ?? [])
    : filterOptions(options?.data ?? [], search);

  const selectedOption = useMemo(
    () => filteredOptions.find((option) => option.value === props.value),
    [filteredOptions, props.value],
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
      {filteredOptions.map((option) => {
        return (
          <ComboboxField.Item key={option.value} value={option.value}>
            {option.label}
          </ComboboxField.Item>
        );
      })}
    </ComboboxField>
  );
}
