import { MoveHorizontal } from 'lucide-react';
import {
  FieldMapperDataSource,
  SidebarInputType,
  type SerializedConnectInput,
} from '@useparagon/connect';
import { useMemo, useState } from 'react';

import { ComboboxField } from '@/components/form/combobox-field';
import { useDataSourceOptions, useFieldOptions } from '@/lib/hooks';
import { Label } from '../ui/label';
import { CommandGroup } from '../ui/command';
import { FieldLabel } from '../form/field-label';

export type FieldMappingsInputValue = {
  mainInput: string | undefined;
  dependentInput: string | undefined;
  fieldMappings: Record<string, string | undefined> | undefined;
};

type Props = {
  integration: string;
  field: SerializedConnectInput<SidebarInputType.FieldMapper>;
  required: boolean;
  value: FieldMappingsInputValue;
  onChange: (value: FieldMappingsInputValue) => void;
};

export function FieldMapperField(props: Props) {
  const [mainInputSearch, setMainInputSearch] = useState('');
  const [dependentInputSearch, setDependentInputSearch] = useState('');
  const [fieldInputSearch, setFieldInputSearch] = useState('');

  const { data: options } = useDataSourceOptions<FieldMapperDataSource>(
    props.integration,
    props.field.sourceType as string
  );

  const { data: mainInputOptions, isFetching: isFetchingMainInput } =
    useFieldOptions({
      integration: props.integration,
      sourceType: options?.recordSource.cacheKey as string,
      search: mainInputSearch,
    });

  const selectedMainOption = useMemo(() => {
    let result;

    result = mainInputOptions.data.find(
      (option) => option.value === props.value.mainInput
    );

    if (result) {
      return result;
    }

    for (let index = 0; index < mainInputOptions.nestedData?.length; index++) {
      const group = mainInputOptions.nestedData[index];

      result = group.items.find(
        (option) => option.value === props.value.mainInput
      );

      if (result) {
        break;
      }
    }

    return result;
  }, [mainInputOptions, props.value]);

  const { data: dependentInputOptions, isFetching: isFetchingDependentInput } =
    useFieldOptions({
      enabled: Boolean(props.value.mainInput),
      integration: props.integration,
      sourceType: options?.dependentInputSource?.cacheKey as string,
      parameters: [
        {
          cacheKey: options?.recordSource.cacheKey as string,
          value: props.value.mainInput,
        },
      ],
      search: dependentInputSearch,
    });

  const selectedDependentInputOption = useMemo(
    () =>
      dependentInputOptions?.data.find(
        (option) => option.value === props.value.dependentInput
      ),
    [dependentInputOptions?.data, props.value]
  );

  const parameters = useMemo(() => {
    const params = [
      {
        cacheKey: options?.recordSource.cacheKey as string,
        value: props.value.mainInput,
      },
    ];

    if (options?.dependentInputSource) {
      params.push({
        cacheKey: options?.dependentInputSource.cacheKey as string,
        value: props.value.dependentInput,
      });
    }

    return params;
  }, [options, props.value]);

  const { data: fieldInputOptions, isFetching: isFetchingFieldInput } =
    useFieldOptions({
      enabled: Boolean(props.value.mainInput && props.value.dependentInput),
      integration: props.integration,
      sourceType: options?.fieldSource.cacheKey as string,
      parameters,
      search: fieldInputSearch,
    });

  const selectedFieldInputOptions = useMemo(() => {
    const result: Record<string, { label: string; value: string }> = {};
    if (props.value.fieldMappings) {
      for (const [key, value] of Object.entries(props.value.fieldMappings)) {
        const option = fieldInputOptions.data.find(
          (option) => option.value === value
        );

        if (!option) {
          continue;
        }

        result[key] = option;
      }
    }
    return result;
  }, [fieldInputOptions?.data, props.value.fieldMappings]);

  const mainInputMeta = options?.recordSource;
  const dependentInputMeta = options?.dependentInputSource;

  return (
    <div className="flex flex-col gap-4">
      {props.field.title && (
        <FieldLabel id={props.field.id} required={props.required}>
          {props.field.title}
        </FieldLabel>
      )}
      <div className="w-full flex gap-4">
        <ComboboxField
          id={props.field.id}
          title={mainInputMeta?.title}
          required={props.required}
          value={props.value.mainInput ?? null}
          placeholder={selectedMainOption?.label ?? 'Select an option...'}
          onSelect={(value) => {
            props.onChange({
              mainInput: value ?? undefined,
              dependentInput: undefined,
              fieldMappings: {},
            });
          }}
          isFetching={isFetchingMainInput}
          onDebouncedChange={setMainInputSearch}
          allowClear
        >
          {mainInputOptions.nestedData &&
            mainInputOptions.nestedData.map((category) => {
              return (
                <CommandGroup key={category.title} heading={category.title}>
                  {category.items.map((option) => {
                    return (
                      <ComboboxField.Item
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </ComboboxField.Item>
                    );
                  })}
                </CommandGroup>
              );
            })}
          {mainInputOptions.data &&
            mainInputOptions.data.map((option) => {
              return (
                <ComboboxField.Item key={option.value} value={option.value}>
                  {option.label}
                </ComboboxField.Item>
              );
            })}
          {mainInputOptions.nestedData
            ? mainInputOptions.nestedData.map((category) => {
                return (
                  <CommandGroup key={category.title} heading={category.title}>
                    {category.items.map((option) => {
                      return (
                        <ComboboxField.Item
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </ComboboxField.Item>
                      );
                    })}
                  </CommandGroup>
                );
              })
            : mainInputOptions.data.map((option) => {
                return (
                  <ComboboxField.Item key={option.value} value={option.value}>
                    {option.label}
                  </ComboboxField.Item>
                );
              })}
        </ComboboxField>
        {dependentInputMeta && (
          <ComboboxField
            id={props.field.id}
            title={dependentInputMeta?.title}
            required={props.required}
            value={props.value.dependentInput ?? null}
            placeholder={
              selectedDependentInputOption?.label ?? 'Select an option...'
            }
            onSelect={(value) => {
              props.onChange({
                mainInput: props.value.mainInput,
                dependentInput: value ?? undefined,
                fieldMappings: value ? props.value.fieldMappings : {},
              });
            }}
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
        )}
      </div>
      {props.field.savedFieldMappings.map((fieldMap) => {
        const placeholder = selectedFieldInputOptions[fieldMap.label];

        return (
          <div key={fieldMap.label} className="flex gap-3 items-center">
            <ComboboxField
              id={props.field.id}
              required={props.required}
              value={props.value.fieldMappings?.[fieldMap.label] ?? null}
              placeholder={placeholder?.label ?? 'Select an option...'}
              onSelect={(value) => {
                props.onChange({
                  mainInput: props.value.mainInput,
                  dependentInput: props.value.dependentInput,
                  fieldMappings: {
                    ...props.value.fieldMappings,
                    [fieldMap.label]: value ?? undefined,
                  },
                });
              }}
              isFetching={isFetchingFieldInput}
              onDebouncedChange={setFieldInputSearch}
              size="sm"
              disabled={!props.value.mainInput || !props.value.dependentInput}
              allowClear
            >
              {fieldInputOptions.data.map((option) => {
                return (
                  <ComboboxField.Item key={option.value} value={option.value}>
                    {option.label}
                  </ComboboxField.Item>
                );
              })}
            </ComboboxField>
            <MoveHorizontal className="h-4 w-4 shrink-0 opacity-50" />
            <Label>{fieldMap.label}</Label>
          </div>
        );
      })}
    </div>
  );
}
