import { ReactNode } from 'react';

import { Switch } from '@/components/ui/switch';
import { FieldLabel } from './field-label';

type Props = {
  id: string;
  title: string;
  required: boolean;
  value: boolean;
  tooltip?: ReactNode;
};

export function IntegrationBooleanField(props: Props) {
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
        // WIP: add onChange handler
        onCheckedChange={() => {}}
        disabled
      />
    </div>
  );
}
