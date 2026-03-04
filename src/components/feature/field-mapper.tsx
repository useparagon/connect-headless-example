import { MoveHorizontal } from 'lucide-react';
import {
  SidebarInputType,
  type FieldMapperSources,
  type SerializedConnectInput,
} from '@useparagon/connect';
import { useMemo, useState } from 'react';

import { ComboboxField } from '@/components/form/combobox-field';
import { useFieldOptions, useSourcesForInput } from '@/lib/hooks';
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

  const sources = useSourcesForInput(
    props.integration,
    props.field.sourceType as string,
    props.field,
  );

  const fieldMapperSources =
    sources?.kind === 'fieldMapper' ? (sources as FieldMapperSources) : null;

  const { data: mainInputOptions, isFetching: isFetchingMainInput } =
    useFieldOptions({
      integration: props.integration,
      source: fieldMapperSources?.recordSource,
      search: mainInputSearch,
    });

  const selectedMainOption = useMemo(() => {
    const flatResult = mainInputOptions.data.find(
      (option) => option.value === props.value.mainInput,
    );

    if (flatResult) {
      return flatResult;
    }

    for (const group of mainInputOptions.nestedData ?? []) {
      const nestedResult = group.items.find(
        (option) => option.value === props.value.mainInput,
      );

      if (nestedResult) {
        return nestedResult;
      }
    }

    return undefined;
  }, [mainInputOptions, props.value]);

  const { data: dependentInputOptions, isFetching: isFetchingDependentInput } =
    useFieldOptions({
      enabled: Boolean(props.value.mainInput),
      integration: props.integration,
      source: fieldMapperSources?.dependentInputSource,
      parameters: [
        {
          cacheKey: fieldMapperSources?.recordSource.cacheKey as string,
          value: props.value.mainInput,
        },
      ],
      search: dependentInputSearch,
    });

  const selectedDependentInputOption = useMemo(
    () =>
      dependentInputOptions?.data.find(
        (option) => option.value === props.value.dependentInput,
      ),
    [dependentInputOptions?.data, props.value],
  );

  const fieldParameters = useMemo(() => {
    const params = [
      {
        cacheKey: fieldMapperSources?.recordSource.cacheKey as string,
        value: props.value.mainInput,
      },
    ];

    if (fieldMapperSources?.dependentInputSource) {
      params.push({
        cacheKey: fieldMapperSources.dependentInputSource.cacheKey as string,
        value: props.value.dependentInput,
      });
    }

    return params;
  }, [fieldMapperSources, props.value]);

  const { data: fieldInputOptions, isFetching: isFetchingFieldInput } =
    useFieldOptions({
      enabled: Boolean(
        props.value.mainInput &&
          (!fieldMapperSources?.dependentInputSource ||
            props.value.dependentInput),
      ),
      integration: props.integration,
      source: fieldMapperSources?.fieldSource,
      parameters: fieldParameters,
      search: fieldInputSearch,
    });

  const selectedFieldInputOptions = useMemo(() => {
    const result: Record<string, { label: string; value: string }> = {};
    if (!props.value.fieldMappings) {
      return result;
    }

    for (const [key, value] of Object.entries(props.value.fieldMappings)) {
      const option = fieldInputOptions.data.find(
        (option) => option.value === value,
      );

      if (!option) {
        continue;
      }

      result[key] = option;
    }
    return result;
  }, [fieldInputOptions?.data, props.value.fieldMappings]);

  const fieldMappingEntries = useMemo(() => {
    if (!fieldMapperSources?.mapObjectFieldOptions) {
      return props.field.savedFieldMappings;
    }

    const options = fieldMapperSources.mapObjectFieldOptions;
    if (Array.isArray(options)) {
      return options;
    }

    return options.fields;
  }, [fieldMapperSources?.mapObjectFieldOptions, props.field.savedFieldMappings]);

  const mainInputMeta = fieldMapperSources?.recordSource;
  const dependentInputMeta = fieldMapperSources?.dependentInputSource;

  function renderMainInputOptions() {
    if (mainInputOptions.nestedData.length) {
      return mainInputOptions.nestedData.map((category) => (
        <CommandGroup key={category.title} heading={category.title}>
          {category.items.map((option) => (
            <ComboboxField.Item key={option.value} value={option.value}>
              {option.label}
            </ComboboxField.Item>
          ))}
        </CommandGroup>
      ));
    }

    return mainInputOptions.data.map((option) => (
      <ComboboxField.Item key={option.value} value={option.value}>
        {option.label}
      </ComboboxField.Item>
    ));
  }

  return (
    <div className="flex flex-col gap-4">
      {props.field.title && (
        <FieldLabel id={props.field.id} required={props.required}>
          {props.field.title}
        </FieldLabel>
      )}
      <div className="flex w-full gap-4">
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
          {renderMainInputOptions()}
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
      {fieldMappingEntries.map((fieldMap) => {
        const placeholder = selectedFieldInputOptions[fieldMap.label];

        return (
          <div key={fieldMap.label} className="flex items-center gap-3">
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
              disabled={Boolean(
                !props.value.mainInput ||
                  (fieldMapperSources?.dependentInputSource &&
                    !props.value.dependentInput),
              )}
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
