import {
  SidebarInputType,
  DataSourceType,
  type ConnectInputValue,
  type SerializedConnectInput,
  type SingleSource,
  type StaticEnumDataSource,
  type DynamicDataSource,
} from '@useparagon/connect';
import { useMemo, useState } from 'react';
import { TextInputField } from '../form/text-input-field';
import { BooleanField } from '../form/boolean-field';
import { SelectField } from '../form/select-field';
import { DynamicEnumField } from './dynamic-enum';
import { ComboInputField, ComboInputValue } from './combo-input';
import { FieldMapperField, FieldMappingsInputValue } from './field-mapper';
import { CopyableInput } from '../form/copyable-input';
import { DynamicComboInputField } from './dynamic-combo-input';
import { ScopesSelectField } from '../form/scopes-select-field';
import { FileUploadField } from '../form/file-upload-field';
import { ComboboxField } from '../form/combobox-field';
import { useFieldOptions, useSourcesForInput } from '@/lib/hooks';

type Props = {
  integration: string;
  field: SerializedConnectInput;
  value: ConnectInputValue;
  onChange: (value: ConnectInputValue) => void;
};

export function SerializedConnectInputPicker(props: Props) {
  const { field, value, onChange } = props;
  const required = field.required ?? true;

  if (
    field.type === SidebarInputType.BooleanInput ||
    field.type === SidebarInputType.Switch
  ) {
    return (
      <BooleanField
        id={field.id}
        title={field.title}
        required={required}
        value={Boolean(value ?? false)}
        tooltip={field.tooltip}
        onChange={(value) => onChange(value)}
      />
    );
  }

  if (field.type === SidebarInputType.CopyableButtonInput) {
    return (
      <CopyableInput
        id={field.id}
        title={field.title}
        value={String(value ?? '')}
      />
    );
  }

  if (field.type === SidebarInputType.ValueText) {
    return (
      <TextInputField
        type="text"
        id={field.id}
        title={field.title}
        required={required}
        tooltip={field.tooltip}
        value={String(value ?? '')}
        onChange={(value) => onChange(value)}
      />
    );
  }

  if (field.type === SidebarInputType.Number) {
    return (
      <TextInputField
        type="number"
        id={field.id}
        title={field.title}
        required={required}
        tooltip={field.tooltip}
        value={String(value ?? '')}
        onChange={(value) => onChange(value)}
      />
    );
  }

  if (field.type === SidebarInputType.Email) {
    return (
      <TextInputField
        type="email"
        id={field.id}
        title={field.title}
        required={required}
        tooltip={field.tooltip}
        value={String(value ?? '')}
        onChange={(value) => onChange(value)}
      />
    );
  }

  if (field.type === SidebarInputType.Password) {
    return (
      <TextInputField
        type="password"
        id={field.id}
        title={field.title}
        required={required}
        value={String(value ?? '')}
        tooltip={field.tooltip}
        onChange={(value) => onChange(value)}
      />
    );
  }

  if (field.type === SidebarInputType.URL) {
    return (
      <TextInputField
        type="url"
        id={field.id}
        title={field.title}
        required={required}
        value={String(value ?? '')}
        tooltip={field.tooltip}
        onChange={(value) => onChange(value)}
      />
    );
  }

  if (field.type === SidebarInputType.CustomDropdown) {
    return (
      <CustomDropdownInput
        integration={props.integration}
        field={field}
        required={required}
        value={(value as string) ?? null}
        onChange={(value) => onChange(value ?? undefined)}
      />
    );
  }

  if (field.type === SidebarInputType.DynamicEnum) {
    return (
      <DynamicEnumField
        integration={props.integration}
        field={field}
        required={required}
        value={value as string}
        onChange={(value) => props.onChange(value ?? undefined)}
      />
    );
  }

  if (field.type === SidebarInputType.ComboInput) {
    const currentValue: ComboInputValue = (value as ComboInputValue) ?? {
      mainInput: undefined,
      dependentInput: undefined,
    };

    return (
      <ComboInputField
        integration={props.integration}
        field={field}
        required={required}
        value={currentValue}
        onChange={(value) => props.onChange(value ?? undefined)}
      />
    );
  }

  if (field.type === SidebarInputType.DynamicComboInput) {
    const currentValue: ComboInputValue = (value as ComboInputValue) ?? {
      mainInput: undefined,
      dependentInput: undefined,
      variableInput: {},
    };

    return (
      <DynamicComboInputField
        integration={props.integration}
        field={field}
        required={required}
        value={currentValue}
        onChange={(value) => props.onChange(value ?? undefined)}
      />
    );
  }

  if (field.type === SidebarInputType.FieldMapper) {
    const currentValue: FieldMappingsInputValue =
      (value as FieldMappingsInputValue) ?? {
        mainInput: undefined,
        dependentInput: undefined,
        fieldMappings: {},
      };

    return (
      <FieldMapperField
        integration={props.integration}
        field={field}
        required={required}
        value={currentValue}
        onChange={(value) => props.onChange(value ?? undefined)}
      />
    );
  }

  if (field.type === SidebarInputType.Permission) {
    const currentValue = (value as string)?.split(' ') ?? [];

    return (
      <ScopesSelectField
        required={required}
        id={field.id}
        title={field.title}
        tooltip={field.tooltip}
        value={currentValue}
        onChange={(value) => props.onChange(value.join(' '))}
        field={field}
      />
    );
  }

  if (field.type === SidebarInputType.File) {
    return (
      <FileUploadField
        id={field.id}
        title={field.title}
        value={(value as File) ?? null}
        tooltip={field.tooltip}
        onChange={async (value) => {
          if (value) {
            props.onChange((await value.text()) ?? undefined);
          } else {
            props.onChange(undefined);
          }
        }}
        required={required}
      />
    );
  }

  return (
    <div>
      <p>Field not supported:</p>
      <pre className="max-w-full max-h-[150px] text-sm overflow-auto bg-card p-2 rounded-md border border-border">
        {JSON.stringify(field, null, 2)}
      </pre>
    </div>
  );
}

function CustomDropdownInput(props: {
  integration: string;
  field: SerializedConnectInput<SidebarInputType.CustomDropdown>;
  required: boolean;
  value: string | null;
  onChange: (value: string | null | undefined) => void;
}) {
  const [search, setSearch] = useState('');

  const sources = useSourcesForInput(
    props.integration,
    props.field.key ?? props.field.id,
    props.field,
  );

  const singleSource =
    sources?.kind === 'single' ? (sources as SingleSource) : null;
  const isStatic =
    singleSource?.source.type === DataSourceType.STATIC_ENUM;
  const isDynamic =
    singleSource?.source.type === DataSourceType.DYNAMIC;

  const staticOptions = isStatic
    ? (singleSource!.source as StaticEnumDataSource).values
    : [];

  const { data: dynamicOptions, isFetching } = useFieldOptions({
    enabled: isDynamic,
    integration: props.integration,
    source: isDynamic
      ? (singleSource!.source as DynamicDataSource<any>)
      : undefined,
    search: search || undefined,
  });

  const dynamicItems = dynamicOptions?.data ?? [];
  const selectedDynamicOption = useMemo(
    () => dynamicItems.find((option) => option.value === props.value),
    [dynamicItems, props.value],
  );

  const flatOptions = useMemo(() => {
    if (!Array.isArray(staticOptions)) {
      return [];
    }

    return staticOptions.flatMap((item) =>
      'items' in item ? item.items : [item],
    );
  }, [staticOptions]);

  if (isDynamic) {
    return (
      <ComboboxField
        id={props.field.id}
        title={props.field.title}
        required={props.required}
        value={props.value}
        placeholder={selectedDynamicOption?.label ?? 'Select an option...'}
        onSelect={props.onChange}
        isFetching={isFetching}
        onDebouncedChange={setSearch}
        allowClear
      >
        {dynamicItems.map((option) => (
          <ComboboxField.Item key={option.value} value={option.value}>
            {option.label}
          </ComboboxField.Item>
        ))}
      </ComboboxField>
    );
  }

  return (
    <SelectField
      id={props.field.id}
      title={props.field.title}
      required={props.required}
      value={props.value}
      onChange={(value) => props.onChange(value ?? undefined)}
      allowClear
    >
      {flatOptions.map((option) => (
        <SelectField.Item key={option.value} value={option.value}>
          {option.label}
        </SelectField.Item>
      ))}
    </SelectField>
  );
}
