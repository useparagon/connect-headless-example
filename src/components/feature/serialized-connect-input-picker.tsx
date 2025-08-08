import {
  SidebarInputType,
  type ConnectInputValue,
  type SerializedConnectInput,
} from '@useparagon/connect';
import { TextInputField } from '../form/text-input-field';
import { BooleanField } from '../form/boolean-field';
import { SelectField } from '../form/select-field';
import { DynamicEnumField } from './dynamic-enum';
import { ComboInputField, ComboInputValue } from './combo-input';
import { FieldMapperField, FieldMappingsInputValue } from './field-mapper';
import { CopyableInput } from '../form/copyable-input';
import { DynamicComboInputField } from './dynamic-combo-input';
import { CodeInputField } from '../form/code-input-field';
import { StaticEnumField } from './static-enum';
import { ConditionalInputField } from './conditional-input';

type Props = {
  integration: string;
  field: SerializedConnectInput;
  value: ConnectInputValue;
  onChange: (value: ConnectInputValue) => void;
};

export function SerializedConnectInputPicker(props: Props) {
  const { field, value, onChange } = props;
  const required = field.required ?? true;

  const getRawType = (f: SerializedConnectInput): string | SidebarInputType => {
    // Some inputs use additional string identifiers not present in the SDK type
    const t = (f as unknown as { type: string | SidebarInputType }).type;
    return t;
  };

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

  if (
    field.type === SidebarInputType.ValueText ||
    getRawType(field) === SidebarInputType.TextArea ||
    getRawType(field) === SidebarInputType.Text
  ) {
    return (
      <TextInputField
        type="text"
        id={field.id}
        title={field.title}
        subtitle={field.subtitle}
        required={required}
        tooltip={field.tooltip}
        value={String(value ?? '')}
        onChange={(value) => onChange(value)}
        placeholder={field.placeholder}
      />
    );
  }

  if (getRawType(field) === SidebarInputType.Code) {
    type WithPlaceholder = { placeholder?: string };
    const f = field as unknown as SerializedConnectInput & WithPlaceholder;
    return (
      <CodeInputField
        id={f.id}
        title={f.title}
        subtitle={f.subtitle}
        required={required}
        tooltip={f.tooltip}
        value={String(value ?? '')}
        onChange={(value) => onChange(value)}
        placeholder={f.placeholder}
      />
    );
  }

  if (field.type === SidebarInputType.Number) {
    return (
      <TextInputField
        type="number"
        id={field.id}
        title={field.title}
        subtitle={field.subtitle}
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
        subtitle={field.subtitle}
        required={required}
        value={String(value ?? '')}
        tooltip={field.tooltip}
        onChange={(value) => onChange(value)}
        placeholder={field.placeholder}
      />
    );
  }

  if (field.type === SidebarInputType.CustomDropdown) {
    const options = field.customDropdownOptions ?? [];

    return (
      <SelectField
        id={field.id}
        title={field.title}
        required={required}
        value={(value as string) ?? null}
        onChange={(value) => onChange(value ?? undefined)}
        allowClear
      >
        {options.map((option) => (
          <SelectField.Item key={option.value} value={option.value}>
            {option.label}
          </SelectField.Item>
        ))}
      </SelectField>
    );
  }

  if (getRawType(field) === SidebarInputType.Enum) {
    type EnumOption = { value: string; label: string };
    const f = field as unknown as {
      id: string;
      title: string;
      type?: SidebarInputType;
      subtitle?: string;
      enumOptions?: Array<EnumOption>;
      options?: Array<EnumOption>;
      values?: Array<EnumOption> | Array<string>;
      defaultValue?: string;
    };
    return (
      <StaticEnumField
        field={f}
        required={required}
        value={(value as string) ?? f.defaultValue ?? null}
        onChange={(v) => onChange(v ?? undefined)}
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

  if (getRawType(field) === 'CONDITIONAL') {
    const f = field as unknown as {
      id: string;
      title: string;
      subtitle?: string;
      supportedKeys: string[];
      supportedOperators: string[];
    };
    return (
      <ConditionalInputField
        field={f}
        required={required}
        value={value as unknown as any}
        onChange={(v) => onChange(v as unknown as ConnectInputValue)}
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

  return (
    <div>
      <p>Field not supported:</p>
      <pre className="max-w-full max-h-[150px] text-sm overflow-auto bg-gray-50 p-2 rounded-md border border-gray-200">
        {JSON.stringify(field, null, 2)}
      </pre>
    </div>
  );
}
