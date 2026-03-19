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
import {
  PaginatedCombobox,
  StaticComboDropdown,
} from '../form/paginated-combobox';
import { useSourcesForInput } from '@/lib/hooks';
type OptionItem = { label: string; value: string };
type OptionGroup = { title: string; items: OptionItem[] };

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

function isGroupedOptions(options: unknown[]): options is OptionGroup[] {
  return options.length > 0 && 'items' in (options[0] as object);
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
  const isStatic = singleSource?.source.type === DataSourceType.STATIC_ENUM;
  const isDynamic = singleSource?.source.type === DataSourceType.DYNAMIC;

  const staticOptions = useMemo(
    () =>
      isStatic ? (singleSource!.source as StaticEnumDataSource).values : [],
    [isStatic, singleSource],
  );

  const dynamicSource = useMemo(
    () =>
      isDynamic
        ? (singleSource!.source as DynamicDataSource<unknown>)
        : undefined,
    [isDynamic, singleSource],
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
    const Dropdown = dynamicSource ? PaginatedCombobox : StaticComboDropdown;

    return (
      <Dropdown
        id={props.field.id}
        title={props.field.title}
        required={props.required}
        value={props.value}
        onSelect={props.onChange}
        onSearchChange={setSearch}
        integration={props.integration}
        source={dynamicSource}
        search={search}
        allowClear
      />
    );
  }

  if (Array.isArray(staticOptions) && isGroupedOptions(staticOptions)) {
    return (
      <SelectField
        id={props.field.id}
        title={props.field.title}
        required={props.required}
        value={props.value}
        onChange={(value) => props.onChange(value ?? undefined)}
        groups={staticOptions}
        allowClear
      />
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
