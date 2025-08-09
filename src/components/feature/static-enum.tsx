import { SidebarInputType } from '@useparagon/connect';

import { SelectField } from '@/components/form/select-field';

type EnumOption = { value: string; label: string };

type Props = {
  field: {
    id: string;
    title: string;
    type?: SidebarInputType;
    subtitle?: string;
    enumOptions?: EnumOption[];
    options?: EnumOption[];
    values?: string[] | EnumOption[];
    defaultValue?: string;
  };
  required: boolean;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
};

export function StaticEnumField(props: Props) {
  const formatLabel = (raw: string): string => {
    const lower = raw.toLowerCase();
    if (lower === 'true') return 'Yes';
    if (lower === 'false') return 'No';
    if (lower === 'default') return 'Default';
    return raw
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const options: EnumOption[] = (
    props.field?.enumOptions ??
    props.field?.options ??
    ((props.field?.values ?? []) as Array<string | EnumOption>).map((v) => {
      if (typeof v === 'string') {
        return { value: String(v), label: formatLabel(String(v)) };
      }
      const optionValue = v.value;
      const optionLabel = v.label ?? formatLabel(String(optionValue));
      return { value: String(optionValue), label: optionLabel };
    })
  ) as EnumOption[];

  return (
    <SelectField
      id={props.field.id}
      title={props.field.title}
      subtitle={props.field.subtitle}
      required={props.required}
      value={(props.value as string) ?? null}
      onChange={props.onChange}
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


