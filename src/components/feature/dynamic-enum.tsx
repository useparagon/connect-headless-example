import {
  SidebarInputType,
  type DynamicDataSource,
  type SingleSource,
  type SerializedConnectInput,
} from '@useparagon/connect';
import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';

import { ComboboxField } from '@/components/form/combobox-field';
import { ComboboxOptions } from '@/components/form/combobox-options';
import { PaginatedCombobox } from '@/components/form/paginated-combobox';
import {
  findFieldOption,
  flattenFieldOptions,
} from '@/lib/field-options';
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

  const sources = useSourcesForInput(props.integration, props.field);

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

  const rawData = useMemo(() => options?.data ?? [], [options?.data]);
  const flatOptions = useMemo(() => flattenFieldOptions(rawData), [rawData]);

  // Preserve section grouping at rest, but collapse to a flat fuse-filtered
  // result list while the user is actively searching.
  const isSearching = Boolean(props.search.trim());
  const filteredOptions = useMemo(
    () => (isSearching ? filterOptions(flatOptions, props.search) : []),
    [isSearching, flatOptions, props.search],
  );

  const selectedOption = useMemo(
    () => findFieldOption(rawData, props.value),
    [rawData, props.value],
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
      {isSearching ? (
        <ComboboxOptions data={filteredOptions} />
      ) : (
        <ComboboxOptions data={rawData} />
      )}
    </ComboboxField>
  );
}
