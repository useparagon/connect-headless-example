import { type DynamicDataSource } from '@useparagon/connect';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { ComboboxField } from '@/components/form/combobox-field';
import { useFieldOptions, useInfiniteFieldOptions } from '@/lib/hooks';

export type ComboDropdownProps = {
  id: string;
  title?: string;
  required: boolean;
  value: string | null;
  onSelect: (value: string | null) => void;
  onSearchChange: (value: string) => void;
  integration: string;
  source?: DynamicDataSource<unknown>;
  search: string;
  parameters?: { cacheKey: string; value: string | undefined }[];
  enabled?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
};

export function PaginatedCombobox(props: ComboDropdownProps) {
  const { ref, inView } = useInView();

  const {
    data: allOptions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteFieldOptions({
    integration: props.integration,
    source: props.source,
    search: props.search || undefined,
    parameters: props.parameters,
    enabled: props.enabled,
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
      id={props.id}
      title={props.title}
      required={props.required}
      value={props.value}
      placeholder={selectedOption?.label ?? 'Select an option...'}
      onSelect={props.onSelect}
      isFetching={isFetching && !isFetchingNextPage}
      onDebouncedChange={props.onSearchChange}
      disabled={props.disabled}
      allowClear={props.allowClear}
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

export function StaticComboDropdown(props: ComboDropdownProps) {
  const { data: options, isFetching } = useFieldOptions({
    integration: props.integration,
    source: props.source,
    parameters: props.parameters,
    enabled: props.enabled,
    search: props.search,
  });

  const selectedOption = useMemo(
    () => options.data.find((option) => option.value === props.value),
    [options.data, props.value],
  );

  return (
    <ComboboxField
      id={props.id}
      title={props.title}
      required={props.required}
      value={props.value}
      placeholder={selectedOption?.label ?? 'Select an option...'}
      onSelect={props.onSelect}
      isFetching={isFetching}
      onDebouncedChange={props.onSearchChange}
      disabled={props.disabled}
      allowClear={props.allowClear}
    >
      {options.data.map((option) => (
        <ComboboxField.Item key={option.value} value={option.value}>
          {option.label}
        </ComboboxField.Item>
      ))}
    </ComboboxField>
  );
}
