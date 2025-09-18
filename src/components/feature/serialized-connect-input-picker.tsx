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
import { ScopesSelectField } from '../form/scopes-select-field';
import { FileUploadField } from '../form/file-upload-field';

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
