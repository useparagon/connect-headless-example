import {
  ConnectInputValue,
  CustomDropdownInput,
  CustomDropdownOptions,
} from '@useparagon/connect';
import { ComboboxField } from '../form/combobox-field';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { LoaderCircle } from 'lucide-react';

type Props = {
  field: CustomDropdownInput;
  required: boolean;
  value: ConnectInputValue;
  onChange: (value: ConnectInputValue) => void;
  customDropdownLoader: CustomDropdownOptions['loadOptions'];
};

export function DynamicCustomDropdownField(props: Props) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['dynamicCustomDrodpownOptions', props.field.key, searchQuery],
      queryFn: ({ pageParam = undefined }) =>
        props.customDropdownLoader(pageParam, searchQuery || undefined),
      getNextPageParam: (lastPage) => lastPage.nextPageCursor ?? undefined,
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const options = data?.pages.flatMap((page) => page.options) ?? [];

  const selectedOption = options.find((option) => option.value === props.value);

  const { data: selectedOptionData } = useQuery({
    queryKey: [
      'dynamicCustomDropdownSelectedOption',
      props.field.key,
      props.value,
    ],
    queryFn: () => props.customDropdownLoader(undefined, props.value as string),
    enabled: !!props.value && !selectedOption,
  });

  const selectedFromQuery = selectedOptionData?.options.find(
    (option) => option.value === props.value,
  );

  const finalSelectedOption = selectedOption ?? selectedFromQuery;
  const displayValue = finalSelectedOption?.label ?? (props.value as string);

  const allOptions =
    finalSelectedOption && !selectedOption
      ? [finalSelectedOption, ...options]
      : options;

  return (
    <div className="flex flex-col gap-1.5">
      <ComboboxField
        id={props.field.key}
        required={props.required}
        value={displayValue}
        title={props.field.title}
        isFetching={isFetching && !isFetchingNextPage}
        onDebouncedChange={setSearchQuery}
        onSelect={(value) => {
          const selectedOption = allOptions.find((opt) => opt.label === value);
          props.onChange(selectedOption?.value ?? undefined);
        }}
        allowClear
      >
        {allOptions.map((option) => (
          <ComboboxField.Item key={option.value} value={option.label}>
            {option.label}
          </ComboboxField.Item>
        ))}
        {hasNextPage && (
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
        )}
      </ComboboxField>
    </div>
  );
}
