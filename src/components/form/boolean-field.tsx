import { ReactNode } from 'react';

import { Switch } from '@/components/ui/switch';
import { FieldLabel } from './field-label';

type Props = {
  id: string;
  title: string;
  tooltip?: ReactNode;
  required: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export function BooleanField(props: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel
        id={props.id}
        required={props.required}
        tooltip={props.tooltip}
      >
        {props.title}
      </FieldLabel>
      <Switch
        id={props.id}
        checked={props.value}
        onCheckedChange={props.onChange}
        disabled={props.disabled}
      />
    </div>
  );
}
