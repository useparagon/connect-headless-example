import { ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CircleAlert, Info, TriangleAlert } from 'lucide-react';

type Props = {
  id: string;
  children: ReactNode;
  required: boolean;
  tooltip?: ReactNode;
  warning?: ReactNode;
};

export function FieldLabel(props: Props) {
  return (
    <Label htmlFor={props.id} className="flex items-center">
      {props.children}
      {props.required ? (
        <Tooltip>
          <TooltipTrigger>
            <CircleAlert size={16} className="text-red-700" />
          </TooltipTrigger>
          <TooltipContent>This field is required</TooltipContent>
        </Tooltip>
      ) : null}
      {props.tooltip ? (
        <Tooltip>
          <TooltipTrigger>
            <Info size={16} />
          </TooltipTrigger>
          <TooltipContent>{props.tooltip}</TooltipContent>
        </Tooltip>
      ) : null}
      {props.warning ? (
        <Tooltip>
          <TooltipTrigger>
            <TriangleAlert size={16} className="text-amber-300" />
          </TooltipTrigger>
          <TooltipContent className="max-w-96">{props.warning}</TooltipContent>
        </Tooltip>
      ) : null}
    </Label>
  );
}
