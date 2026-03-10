import {
  SidebarInputType,
  type DynamicDataSource,
  type SingleSource,
  type SerializedConnectInput,
} from '@useparagon/connect';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import Fuse from 'fuse.js';

import { ComboboxField } from '@/components/form/combobox-field';
import {
  useFieldOptions,
  useInfiniteFieldOptions,
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

  const supportPagination =
    (
      dynamicSource as DynamicDataSource<unknown> & {
        supportPagination?: boolean;
      }
    )?.supportPagination ?? false;

  if (supportPagination) {
    return (
      <PaginatedDynamicEnum
        {...props}
        search={search}
        onSearchChange={setSearch}
        dynamicSource={dynamicSource}
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

function PaginatedDynamicEnum(
  props: Props & {
    search: string;
    onSearchChange: (value: string) => void;
    dynamicSource?: DynamicDataSource<unknown>;
  },
) {
  const { ref, inView } = useInView();

  const {
    data: allOptions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteFieldOptions({
    integration: props.integration,
    source: props.dynamicSource,
    search: props.search || undefined,
  });

  useEffect(() => {
    if (!inView || !hasNextPage || isFetchingNextPage) {
      return;
    }
    fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const selectedOption = useMemo(
    () => allOptions.find((option) => option.value === props.value),
    [allOptions, props.value],
  );

  return (
    <ComboboxField
      id={props.field.id}
      title={props.field.title}
      required={props.required}
      value={props.value ?? null}
      placeholder={selectedOption?.label ?? 'Select an option...'}
      onSelect={props.onChange}
      isFetching={isFetching && !isFetchingNextPage}
      onDebouncedChange={props.onSearchChange}
      allowClear
      listFooter={
        hasNextPage ? (
          <div
            ref={ref}
            className="flex items-center justify-center py-2 text-sm text-muted-foreground"
          >
            {isFetchingNextPage && (
              <div className="flex items-center gap-2">
                <LoaderCircle className="size-4 animate-spin" />
                Loading more...
              </div>
            )}
          </div>
        ) : undefined
      }
    >
      {allOptions.map((option) => (
        <ComboboxField.Item key={option.value} value={option.value}>
          {option.label}
        </ComboboxField.Item>
      ))}
    </ComboboxField>
  );
}
