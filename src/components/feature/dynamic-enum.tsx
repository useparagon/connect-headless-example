import {
  SidebarInputType,
  type DynamicDataSource,
  type SingleSource,
  type SerializedConnectInput,
} from '@useparagon/connect';
import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';

import { ComboboxField } from '@/components/form/combobox-field';
import { PaginatedCombobox } from '@/components/form/paginated-combobox';
import {
  hasSourcePagination,
  useFieldOptions,
  useSourcesForInput,
} from '@/lib/hooks';

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
  const sources = useSourcesForInput(
    props.integration,
    sourceType,
    props.field,
  );

  const dynamicSource =
    sources?.kind === 'single'
      ? ((sources as SingleSource).source as DynamicDataSource<unknown>)
      : undefined;

  const supportPagination = dynamicSource
    ? hasSourcePagination(dynamicSource)
    : false;

  if (supportPagination) {
    return (
      <PaginatedCombobox
        id={props.field.id}
        title={props.field.title}
        required={props.required}
        value={props.value ?? null}
        onSelect={props.onChange}
        onSearchChange={setSearch}
        integration={props.integration}
        source={dynamicSource}
        search={search}
        allowClear
      />
    );
  }

  return (
    <StaticDynamicEnum
      {...props}
      search={search}
      onSearchChange={setSearch}
      dynamicSource={dynamicSource}
    />
  );
}

function StaticDynamicEnum(
  props: Props & {
    search: string;
    onSearchChange: (value: string) => void;
    dynamicSource?: DynamicDataSource<unknown>;
  },
) {
  const { data: options, isFetching } = useFieldOptions({
    integration: props.integration,
    source: props.dynamicSource,
  });

  const filteredOptions = useMemo(
    () => filterOptions(options?.data ?? [], props.search),
    [options?.data, props.search],
  );

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
      onDebouncedChange={props.onSearchChange}
      allowClear
    >
      {filteredOptions.map((option) => (
        <ComboboxField.Item key={option.value} value={option.value}>
          {option.label}
        </ComboboxField.Item>
      ))}
    </ComboboxField>
  );
}
