import { ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = {
  id: string;
  children: ReactNode;
  required: boolean;
  tooltip?: ReactNode;
};

export function FieldLabel(props: Props) {
  return (
    <Label htmlFor={props.id}>
      {props.children}
      {!props.required ? (
        <p className="text-xs text-muted-foreground">(optional)</p>
      ) : null}
      {props.tooltip ? (
        <Tooltip>
          <TooltipTrigger> ℹ️</TooltipTrigger>
          <TooltipContent>{props.tooltip}</TooltipContent>
        </Tooltip>
      ) : null}
    </Label>
  );
}
