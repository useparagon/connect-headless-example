import { ReactNode } from 'react';

import { Input } from '@/components/ui/input';
import { FieldLabel } from './field-label';

type Props = {
  id: string;
  title: string;
  required: boolean;
  value: string;
  type: 'text' | 'number' | 'email' | 'password' | 'url';
  tooltip?: ReactNode;
};

export function IntegrationTextInputField(props: Props) {
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
        // WIP: add onChange handler
        onChange={() => {}}
        disabled
      />
    </div>
  );
}
