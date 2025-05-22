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

type Props = {
  integration: string;
  field: SerializedConnectInput;
  value: ConnectInputValue;
  onChange: (value: ConnectInputValue) => void;
};

export function SerializedConnectInputPicker(props: Props) {
  const { field, value, onChange } = props;
  const required = field.required ?? true;

  if (field.type === SidebarInputType.BooleanInput) {
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

  return (
    <div key={field.id} className="text-orange-600">
      <div>
        <span className="font-semibold">Title:</span>{' '}
        <span className="font-mono">{field.title}</span>
        {required ? <span className="text-red-600"> *</span> : null}
      </div>
      {field.tooltip ? (
        <div>
          <span className="font-semibold">Tooltip:</span>{' '}
          <span className="font-mono">{field.tooltip}</span>
        </div>
      ) : null}
      <div>
        <span className="font-semibold">Field type:</span>{' '}
        <span className="font-mono">{field.type}</span>
      </div>
      <div>
        <span className="font-semibold">Current value:</span>{' '}
        <span className="font-mono">{String(value)}</span>
      </div>
    </div>
  );
}
