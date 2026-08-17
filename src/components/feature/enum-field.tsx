import {
  DataSourceType,
  SidebarInputType,
  type DynamicDataSource,
  type StaticEnumDataSource,
} from '@useparagon/connect';

import { SelectField } from '../form/select-field';
import { DynamicEnumField } from './dynamic-enum';
import { UnsupportedField } from './unsupported-field';
import {
  flattenFieldOptions,
  getFieldOptionSections,
} from '@/lib/field-options';
import { useDataSourceOptions } from '@/lib/hooks';

// The SDK's SerializedConnectInput union omits Enum inputs even though they are
// delivered at runtime (e.g. HubSpot dealStages shared settings), so the shape
// is declared here from BaseInput plus the serialized sourceType reference.
export type SerializedEnumInput = {
  id: string;
  title: string;
  type: SidebarInputType.Enum;
  required?: boolean;
  sourceType?: string;
  tooltip?: string;
};

type Props = {
  integration: string;
  field: SerializedEnumInput;
  required: boolean;
  value: string | null;
  onChange: (value: string | null | undefined) => void;
};

export function EnumField(props: Props) {
  const { field, integration } = props;

  const { data: source, isLoading } = useDataSourceOptions<
    StaticEnumDataSource | DynamicDataSource<unknown> | undefined
  >(integration, field.sourceType ?? '', Boolean(field.sourceType));

  if (isLoading) {
    return (
      <SelectField
        id={field.id}
        title={field.title}
        required={props.required}
        tooltip={field.tooltip}
        value={props.value}
        onChange={() => {}}
        disabled
        fullWidth
      >
        {null}
      </SelectField>
    );
  }

  if (source?.type === DataSourceType.DYNAMIC) {
    return (
      <DynamicEnumField
        integration={integration}
        field={{ ...field, type: SidebarInputType.DynamicEnum }}
        required={props.required}
        value={props.value ?? ''}
        onChange={props.onChange}
      />
    );
  }

  if (source?.type !== DataSourceType.STATIC_ENUM) {
    return <UnsupportedField field={field} />;
  }

  const options = Array.isArray(source.values) ? source.values : [];
  const sections = getFieldOptionSections(options);

  if (!options.length) {
    return <UnsupportedField field={field} />;
  }

  if (sections) {
    return (
      <SelectField
        id={field.id}
        title={field.title}
        required={props.required}
        tooltip={field.tooltip}
        value={props.value}
        onChange={(value) => props.onChange(value ?? undefined)}
        groups={sections}
        allowClear
        fullWidth
      />
    );
  }

  return (
    <SelectField
      id={field.id}
      title={field.title}
      required={props.required}
      tooltip={field.tooltip}
      value={props.value}
      onChange={(value) => props.onChange(value ?? undefined)}
      allowClear
      fullWidth
    >
      {flattenFieldOptions(options).map((option) => (
        <SelectField.Item key={option.value} value={option.value}>
          {option.label}
        </SelectField.Item>
      ))}
    </SelectField>
  );
}
