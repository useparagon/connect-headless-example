import { useFieldOptions } from '@/lib/hooks';
import { ComboboxField } from '../form/combobox-field';
import {
  ConnectInputValue,
  SidebarInputType,
  type SerializedConnectInput,
} from '@useparagon/connect';

type Props = {
  integration: string;
  field: SerializedConnectInput<SidebarInputType.DynamicEnum>;
  required: boolean;
  value: string;
  onChange: (value: ConnectInputValue) => void;
};

export function DynamicEnumField(props: Props) {
  const { data: options, isFetching } = useFieldOptions(
    props.integration,
    props.field.sourceType,
  );
  const selectedOption = options.data.find(
    (option) => option.value === props.value,
  );

  return (
    <ComboboxField
      key={props.field.id}
      id={props.field.id}
      title={props.field.title}
      required={props.required}
      value={(props.value as string) ?? null}
      placeholder={selectedOption?.label ?? null}
      onSelect={props.onChange}
      isFetching={isFetching}
      allowClear
    >
      {options.data.map((option) => {
        return (
          <ComboboxField.Item
            key={option.value}
            value={option.value}
            label={option.label}
          />
        );
      })}
    </ComboboxField>
  );
}
