import { ReactNode } from 'react';

import { Input } from '@/components/ui/input';
import { FieldLabel } from './field-label';

type Props = {
  id: string;
  title: string;
  subtitle?: ReactNode;
  required: boolean;
  type: 'text' | 'number' | 'email' | 'password' | 'url';
  tooltip?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
};

export function TextInputField(props: Props) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <FieldLabel
        id={props.id}
        required={props.required}
        tooltip={props.tooltip}
      >
        {props.title}
      </FieldLabel>
      {props.subtitle ? (
        <p className="text-sm text-gray-500">{props.subtitle}</p>
      ) : null}
      <Input
        id={props.id}
        type={props.type}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        disabled={props.disabled}
        readOnly={props.readOnly}
        placeholder={props.placeholder}
        required={props.required}
      />
    </div>
  );
}
