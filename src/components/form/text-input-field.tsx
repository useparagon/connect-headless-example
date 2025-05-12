import { ReactNode } from 'react';

import { Input } from '@/components/ui/input';
import { FieldLabel } from './field-label';

type Props = {
  id: string;
  title: string;
  required: boolean;
  type: 'text' | 'number' | 'email' | 'password' | 'url';
  tooltip?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function TextInputField(props: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel
        id={props.id}
        required={props.required}
        tooltip={props.tooltip}
      >
        {props.title}
      </FieldLabel>
      <Input
        id={props.id}
        type={props.type}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        disabled={props.disabled}
      />
    </div>
  );
}
