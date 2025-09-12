import { FieldLabel } from './field-label';
import { MultiSelect } from '../ui/multi-select';
import { ReactNode } from 'react';
import { PermissionInput } from '@useparagon/connect';

type Props = {
  id: string;
  title: string;
  tooltip?: ReactNode;
  value: string[];
  onChange: (value: string[]) => void;
  field: PermissionInput & {
    tooltip?: string;
  };
  required: boolean;
};

export function ScopesSelectField(props: Props) {
  const { value, onChange, field, required, id, title, tooltip } = props;

  const descriptionByScope = field.scopes.values.reduce(
    (acc, scope) => {
      acc[scope.name] = scope.description;
      return acc;
    },
    {} as Record<string, string>,
  );

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <FieldLabel id={id} required={required} tooltip={tooltip}>
        {title}
      </FieldLabel>
      <MultiSelect
        options={field.scopes.values
          .filter((scope) => !field.requiredScopes.includes(scope.name))
          .map((scope) => ({
            label: scope.name,
            value: scope.name,
            description: descriptionByScope[scope.name],
          }))}
        requiredOptions={field.requiredScopes.map((scope) => ({
          label: scope,
          value: scope,
          description: descriptionByScope[scope],
        }))}
        value={value}
        onValueChange={onChange}
        modalPopover
      />
    </div>
  );
}
